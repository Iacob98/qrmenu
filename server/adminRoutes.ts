import type { Express } from "express";
import { db } from "./db";
import { users, restaurants, aiUsageLogs, feedback, categories, dishes } from "@shared/schema";
import { eq, desc, sql, count, sum, and, gte, lte, or, ilike } from "drizzle-orm";
import { requireAdmin } from "./middleware/adminAuth";
import { z } from "zod";

const VALID_FEEDBACK_STATUS = ["open", "in_progress", "resolved", "closed"] as const;
const VALID_FEEDBACK_PRIORITY = ["low", "medium", "high", "critical"] as const;

// Pricing per 1M tokens (USD)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  // OpenAI
  "gpt-4o": { input: 2.50, output: 10.00 },
  "gpt-4o-mini": { input: 0.15, output: 0.60 },
  "gpt-4-turbo": { input: 10.00, output: 30.00 },
  "gpt-4": { input: 30.00, output: 60.00 },
  "gpt-3.5-turbo": { input: 0.50, output: 1.50 },
  // OpenRouter defaults
  "default": { input: 2.50, output: 10.00 },
};

function estimateCost(model: string | null, promptTokens: number, completionTokens: number): number {
  const pricing = MODEL_PRICING[model || ""] || MODEL_PRICING["default"];
  return (promptTokens * pricing.input + completionTokens * pricing.output) / 1_000_000;
}

const updateFeedbackSchema = z.object({
  status: z.enum(VALID_FEEDBACK_STATUS).optional(),
  priority: z.enum(VALID_FEEDBACK_PRIORITY).optional(),
}).refine(data => data.status || data.priority, { message: "At least one of status or priority is required" });

export function registerAdminRoutes(app: Express) {
  // GET /api/admin/stats — platform-wide overview
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const [[{ totalUsers }], [{ totalRestaurants }], [{ totalDishes }], [{ totalAiRequests }], [{ totalTokens }]] = await Promise.all([
        db.select({ totalUsers: count() }).from(users),
        db.select({ totalRestaurants: count() }).from(restaurants),
        db.select({ totalDishes: count() }).from(dishes),
        db.select({ totalAiRequests: count() }).from(aiUsageLogs),
        db.select({ totalTokens: sql<number>`COALESCE(SUM(total_tokens), 0)` }).from(aiUsageLogs),
      ]);

      // Tokens per request type
      const tokensByType = await db
        .select({
          requestType: aiUsageLogs.requestType,
          count: count(),
          totalTokens: sql<number>`COALESCE(SUM(total_tokens), 0)`,
          promptTokens: sql<number>`COALESCE(SUM(prompt_tokens), 0)`,
          completionTokens: sql<number>`COALESCE(SUM(completion_tokens), 0)`,
        })
        .from(aiUsageLogs)
        .groupBy(aiUsageLogs.requestType)
        .orderBy(desc(sql`COALESCE(SUM(total_tokens), 0)`));

      // Cost by model
      const costByModel = await db
        .select({
          model: aiUsageLogs.model,
          promptTokens: sql<number>`COALESCE(SUM(prompt_tokens), 0)`,
          completionTokens: sql<number>`COALESCE(SUM(completion_tokens), 0)`,
        })
        .from(aiUsageLogs)
        .groupBy(aiUsageLogs.model);

      const totalEstimatedCost = costByModel.reduce(
        (sum, row) => sum + estimateCost(row.model, Number(row.promptTokens), Number(row.completionTokens)),
        0,
      );

      const tokensByTypeWithCost = tokensByType.map(row => ({
        ...row,
        estimatedCost: estimateCost(null, Number(row.promptTokens), Number(row.completionTokens)),
      }));

      // New users last 30 days (daily)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const newUsersDaily = await db
        .select({
          date: sql<string>`DATE(created_at)`,
          count: count(),
        })
        .from(users)
        .where(gte(users.createdAt, thirtyDaysAgo))
        .groupBy(sql`DATE(created_at)`)
        .orderBy(sql`DATE(created_at)`);

      // AI requests last 30 days
      const aiRequestsDaily = await db
        .select({
          date: sql<string>`DATE(created_at)`,
          count: count(),
          tokens: sql<number>`COALESCE(SUM(total_tokens), 0)`,
        })
        .from(aiUsageLogs)
        .where(gte(aiUsageLogs.createdAt, thirtyDaysAgo))
        .groupBy(sql`DATE(created_at)`)
        .orderBy(sql`DATE(created_at)`);

      res.json({
        totals: {
          users: Number(totalUsers),
          restaurants: Number(totalRestaurants),
          dishes: Number(totalDishes),
          aiRequests: Number(totalAiRequests),
          tokens: Number(totalTokens),
          estimatedCost: Math.round(totalEstimatedCost * 10000) / 10000,
        },
        tokensByType: tokensByTypeWithCost,
        newUsersDaily,
        aiRequestsDaily,
      });
    } catch (error) {
      console.error("[Admin] Stats error:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // GET /api/admin/users — list all users with restaurant count and token usage
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const page = parseInt(String(req.query.page || "1"), 10);
      const limit = 50;
      const offset = (page - 1) * limit;
      const search = String(req.query.search || "");

      const baseQuery = db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          isAdmin: users.isAdmin,
          emailVerified: users.emailVerified,
          onboarded: users.onboarded,
          createdAt: users.createdAt,
          restaurantCount: sql<number>`COUNT(DISTINCT ${restaurants.id})`,
          totalTokens: sql<number>`COALESCE(SUM(${aiUsageLogs.totalTokens}), 0)`,
          aiRequestCount: sql<number>`COUNT(DISTINCT ${aiUsageLogs.id})`,
        })
        .from(users)
        .leftJoin(restaurants, eq(restaurants.userId, users.id))
        .leftJoin(aiUsageLogs, eq(aiUsageLogs.userId, users.id))
        .groupBy(users.id)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);

      const searchCondition = search
        ? or(ilike(users.email, `%${search}%`), ilike(users.name, `%${search}%`))
        : undefined;

      const [allUsers, [{ total }]] = await Promise.all([
        searchCondition ? baseQuery.where(searchCondition) : baseQuery,
        searchCondition
          ? db.select({ total: count() }).from(users).where(searchCondition)
          : db.select({ total: count() }).from(users),
      ]);

      res.json({
        users: allUsers,
        pagination: { page, limit, total: Number(total), pages: Math.ceil(Number(total) / limit) },
      });
    } catch (error) {
      console.error("[Admin] Users error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // GET /api/admin/users/:id — user detail with restaurants and AI logs
  app.get("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;

      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          isAdmin: users.isAdmin,
          emailVerified: users.emailVerified,
          onboarded: users.onboarded,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, id));

      if (!user) return res.status(404).json({ message: "User not found" });

      const [userRestaurants, recentLogs, [{ totalTokens, totalRequests, totalPromptTokens, totalCompletionTokens }]] = await Promise.all([
        db
          .select({
            id: restaurants.id,
            name: restaurants.name,
            city: restaurants.city,
            aiProvider: restaurants.aiProvider,
            createdAt: restaurants.createdAt,
            categoryCount: sql<number>`(SELECT COUNT(*) FROM categories WHERE categories.restaurant_id = ${restaurants.id})`,
            dishCount: sql<number>`(SELECT COUNT(*) FROM dishes d JOIN categories c ON d.category_id = c.id WHERE c.restaurant_id = ${restaurants.id})`,
          })
          .from(restaurants)
          .where(eq(restaurants.userId, id)),

        db
          .select()
          .from(aiUsageLogs)
          .where(eq(aiUsageLogs.userId, id))
          .orderBy(desc(aiUsageLogs.createdAt))
          .limit(20),

        db
          .select({
            totalTokens: sql<number>`COALESCE(SUM(total_tokens), 0)`,
            totalRequests: count(),
            totalPromptTokens: sql<number>`COALESCE(SUM(prompt_tokens), 0)`,
            totalCompletionTokens: sql<number>`COALESCE(SUM(completion_tokens), 0)`,
          })
          .from(aiUsageLogs)
          .where(eq(aiUsageLogs.userId, id)),
      ]);

      const recentLogsWithCost = recentLogs.map(log => ({
        ...log,
        estimatedCost: estimateCost(log.model, Number(log.promptTokens), Number(log.completionTokens)),
      }));

      const userEstimatedCost = estimateCost(null, Number(totalPromptTokens), Number(totalCompletionTokens));

      res.json({ user, restaurants: userRestaurants, recentLogs: recentLogsWithCost, stats: { totalTokens: Number(totalTokens), totalRequests: Number(totalRequests), estimatedCost: Math.round(userEstimatedCost * 10000) / 10000 } });
    } catch (error) {
      console.error("[Admin] User detail error:", error);
      res.status(500).json({ message: "Failed to fetch user details" });
    }
  });

  // PATCH /api/admin/users/:id — toggle admin role
  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { isAdmin: newIsAdmin } = req.body;

      if (typeof newIsAdmin !== "boolean") {
        return res.status(400).json({ message: "isAdmin must be a boolean" });
      }

      if (id === req.session.userId) {
        return res.status(400).json({ message: "Cannot modify your own admin status" });
      }

      // Prevent removing the last admin
      if (!newIsAdmin) {
        const [{ adminCount }] = await db.select({ adminCount: count() }).from(users).where(eq(users.isAdmin, true));
        if (Number(adminCount) <= 1) {
          return res.status(400).json({ message: "Cannot remove the last admin" });
        }
      }

      const [updated] = await db.update(users).set({ isAdmin: newIsAdmin }).where(eq(users.id, id)).returning({ id: users.id });
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("[Admin] Update user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // GET /api/admin/restaurants — list all restaurants
  app.get("/api/admin/restaurants", requireAdmin, async (req, res) => {
    try {
      const page = parseInt(String(req.query.page || "1"), 10);
      const limit = 50;
      const offset = (page - 1) * limit;

      const search = String(req.query.search || "");

      const searchCondition = search
        ? or(ilike(restaurants.name, `%${search}%`), ilike(restaurants.city, `%${search}%`))
        : undefined;

      const baseQuery = db
        .select({
          id: restaurants.id,
          name: restaurants.name,
          city: restaurants.city,
          aiProvider: restaurants.aiProvider,
          aiModel: restaurants.aiModel,
          language: restaurants.language,
          createdAt: restaurants.createdAt,
          ownerEmail: users.email,
          ownerName: users.name,
          userId: restaurants.userId,
          categoryCount: sql<number>`(SELECT COUNT(*) FROM categories WHERE categories.restaurant_id = ${restaurants.id})`,
          dishCount: sql<number>`(SELECT COUNT(*) FROM dishes d JOIN categories c ON d.category_id = c.id WHERE c.restaurant_id = ${restaurants.id})`,
          tokenUsage: sql<number>`COALESCE((SELECT SUM(total_tokens) FROM ai_usage_logs WHERE restaurant_id = ${restaurants.id}), 0)`,
        })
        .from(restaurants)
        .leftJoin(users, eq(users.id, restaurants.userId))
        .orderBy(desc(restaurants.createdAt))
        .limit(limit)
        .offset(offset);

      const [allRestaurants, [{ total }]] = await Promise.all([
        searchCondition ? baseQuery.where(searchCondition) : baseQuery,
        searchCondition
          ? db.select({ total: count() }).from(restaurants).where(searchCondition)
          : db.select({ total: count() }).from(restaurants),
      ]);

      res.json({
        restaurants: allRestaurants,
        pagination: { page, limit, total: Number(total), pages: Math.ceil(Number(total) / limit) },
      });
    } catch (error) {
      console.error("[Admin] Restaurants error:", error);
      res.status(500).json({ message: "Failed to fetch restaurants" });
    }
  });

  // GET /api/admin/restaurants/:id — restaurant detail with categories, dishes, owner, AI stats
  app.get("/api/admin/restaurants/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;

      const [restaurant] = await db
        .select({
          id: restaurants.id,
          name: restaurants.name,
          slug: restaurants.slug,
          city: restaurants.city,
          phone: restaurants.phone,
          currency: restaurants.currency,
          language: restaurants.language,
          targetLanguages: restaurants.targetLanguages,
          logo: restaurants.logo,
          banner: restaurants.banner,
          design: restaurants.design,
          aiProvider: restaurants.aiProvider,
          aiModel: restaurants.aiModel,
          createdAt: restaurants.createdAt,
          userId: restaurants.userId,
          ownerEmail: users.email,
          ownerName: users.name,
        })
        .from(restaurants)
        .leftJoin(users, eq(users.id, restaurants.userId))
        .where(eq(restaurants.id, id));

      if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

      // Fetch categories with dishes (same pattern as getRestaurantWithCategories)
      const [categoryDishRows, [{ totalTokens, totalRequests }]] = await Promise.all([
        db
          .select({
            category: categories,
            dish: dishes,
          })
          .from(categories)
          .leftJoin(dishes, eq(dishes.categoryId, categories.id))
          .where(eq(categories.restaurantId, id))
          .orderBy(categories.sortOrder, dishes.sortOrder),

        db
          .select({
            totalTokens: sql<number>`COALESCE(SUM(total_tokens), 0)`,
            totalRequests: count(),
          })
          .from(aiUsageLogs)
          .where(eq(aiUsageLogs.restaurantId, id)),
      ]);

      // Group results by category
      const categoriesMap = new Map<string, any>();
      for (const row of categoryDishRows) {
        const categoryId = row.category.id;
        if (!categoriesMap.has(categoryId)) {
          categoriesMap.set(categoryId, { ...row.category, dishes: [] });
        }
        if (row.dish) {
          categoriesMap.get(categoryId)!.dishes.push(row.dish);
        }
      }

      res.json({
        restaurant,
        categories: Array.from(categoriesMap.values()),
        aiStats: { totalTokens: Number(totalTokens), totalRequests: Number(totalRequests) },
      });
    } catch (error) {
      console.error("[Admin] Restaurant detail error:", error);
      res.status(500).json({ message: "Failed to fetch restaurant details" });
    }
  });

  // GET /api/admin/ai-logs — AI usage log with filters
  app.get("/api/admin/ai-logs", requireAdmin, async (req, res) => {
    try {
      const page = parseInt(String(req.query.page || "1"), 10);
      const limit = 100;
      const offset = (page - 1) * limit;
      const userId = req.query.userId ? String(req.query.userId) : null;
      const restaurantId = req.query.restaurantId ? String(req.query.restaurantId) : null;
      const requestType = req.query.requestType ? String(req.query.requestType) : null;

      const conditions = [];
      if (userId) conditions.push(eq(aiUsageLogs.userId, userId));
      if (restaurantId) conditions.push(eq(aiUsageLogs.restaurantId, restaurantId));
      if (requestType) conditions.push(eq(aiUsageLogs.requestType, requestType));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [logs, [{ total }]] = await Promise.all([
        db
          .select({
            id: aiUsageLogs.id,
            requestType: aiUsageLogs.requestType,
            model: aiUsageLogs.model,
            provider: aiUsageLogs.provider,
            promptTokens: aiUsageLogs.promptTokens,
            completionTokens: aiUsageLogs.completionTokens,
            totalTokens: aiUsageLogs.totalTokens,
            success: aiUsageLogs.success,
            errorMessage: aiUsageLogs.errorMessage,
            createdAt: aiUsageLogs.createdAt,
            userEmail: users.email,
            restaurantName: restaurants.name,
            userId: aiUsageLogs.userId,
            restaurantId: aiUsageLogs.restaurantId,
          })
          .from(aiUsageLogs)
          .leftJoin(users, eq(users.id, aiUsageLogs.userId))
          .leftJoin(restaurants, eq(restaurants.id, aiUsageLogs.restaurantId))
          .where(whereClause)
          .orderBy(desc(aiUsageLogs.createdAt))
          .limit(limit)
          .offset(offset),

        db.select({ total: count() }).from(aiUsageLogs).where(whereClause),
      ]);

      const logsWithCost = logs.map(log => ({
        ...log,
        estimatedCost: estimateCost(log.model, Number(log.promptTokens), Number(log.completionTokens)),
      }));

      res.json({
        logs: logsWithCost,
        pagination: { page, limit, total: Number(total), pages: Math.ceil(Number(total) / limit) },
      });
    } catch (error) {
      console.error("[Admin] AI logs error:", error);
      res.status(500).json({ message: "Failed to fetch AI logs" });
    }
  });

  // GET /api/admin/feedback — all feedback
  app.get("/api/admin/feedback", requireAdmin, async (req, res) => {
    try {
      const page = parseInt(String(req.query.page || "1"), 10);
      const limit = 50;
      const offset = (page - 1) * limit;

      const status = req.query.status ? String(req.query.status) : null;
      const priority = req.query.priority ? String(req.query.priority) : null;
      const type = req.query.type ? String(req.query.type) : null;

      const conditions = [];
      if (status) conditions.push(eq(feedback.status, status));
      if (priority) conditions.push(eq(feedback.priority, priority));
      if (type) conditions.push(eq(feedback.type, type));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [allFeedback, [{ total }]] = await Promise.all([
        db
          .select({
            id: feedback.id,
            type: feedback.type,
            title: feedback.title,
            description: feedback.description,
            status: feedback.status,
            priority: feedback.priority,
            email: feedback.email,
            createdAt: feedback.createdAt,
            userEmail: users.email,
          })
          .from(feedback)
          .leftJoin(users, eq(users.id, feedback.userId))
          .where(whereClause)
          .orderBy(desc(feedback.createdAt))
          .limit(limit)
          .offset(offset),

        db.select({ total: count() }).from(feedback).where(whereClause),
      ]);

      res.json({
        feedback: allFeedback,
        pagination: { page, limit, total: Number(total), pages: Math.ceil(Number(total) / limit) },
      });
    } catch (error) {
      console.error("[Admin] Feedback error:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  // PATCH /api/admin/feedback/:id — update feedback status
  app.patch("/api/admin/feedback/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const parsed = updateFeedbackSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });
      }

      const updateData: Record<string, string> = {};
      if (parsed.data.status) updateData.status = parsed.data.status;
      if (parsed.data.priority) updateData.priority = parsed.data.priority;

      const [updated] = await db.update(feedback).set(updateData).where(eq(feedback.id, id)).returning({ id: feedback.id });
      if (!updated) {
        return res.status(404).json({ message: "Feedback not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("[Admin] Update feedback error:", error);
      res.status(500).json({ message: "Failed to update feedback" });
    }
  });

  // GET /api/admin/export/users — export all users as CSV
  app.get("/api/admin/export/users", requireAdmin, async (req, res) => {
    try {
      const allUsers = await db
        .select({
          email: users.email,
          name: users.name,
          isAdmin: users.isAdmin,
          emailVerified: users.emailVerified,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt));

      const csvEscape = (val: unknown): string => {
        const str = val == null ? "" : String(val);
        if (str.includes('"') || str.includes(",") || str.includes("\n")) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      };

      const header = "email,name,isAdmin,emailVerified,createdAt";
      const rows = allUsers.map(u =>
        [u.email, u.name, u.isAdmin, u.emailVerified, u.createdAt].map(csvEscape).join(",")
      );
      const csv = [header, ...rows].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="users-export.csv"');
      res.send(csv);
    } catch (error) {
      console.error("[Admin] Export users error:", error);
      res.status(500).json({ message: "Failed to export users" });
    }
  });

  // GET /api/admin/export/ai-logs — export AI usage logs as CSV
  app.get("/api/admin/export/ai-logs", requireAdmin, async (req, res) => {
    try {
      const logs = await db
        .select({
          requestType: aiUsageLogs.requestType,
          model: aiUsageLogs.model,
          provider: aiUsageLogs.provider,
          promptTokens: aiUsageLogs.promptTokens,
          completionTokens: aiUsageLogs.completionTokens,
          totalTokens: aiUsageLogs.totalTokens,
          success: aiUsageLogs.success,
          createdAt: aiUsageLogs.createdAt,
          userEmail: users.email,
        })
        .from(aiUsageLogs)
        .leftJoin(users, eq(users.id, aiUsageLogs.userId))
        .orderBy(desc(aiUsageLogs.createdAt))
        .limit(10000);

      const csvEscape = (val: unknown): string => {
        const str = val == null ? "" : String(val);
        if (str.includes('"') || str.includes(",") || str.includes("\n")) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      };

      const header = "requestType,model,provider,promptTokens,completionTokens,totalTokens,success,createdAt,userEmail";
      const rows = logs.map(l =>
        [l.requestType, l.model, l.provider, l.promptTokens, l.completionTokens, l.totalTokens, l.success, l.createdAt, l.userEmail].map(csvEscape).join(",")
      );
      const csv = [header, ...rows].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="ai-logs-export.csv"');
      res.send(csv);
    } catch (error) {
      console.error("[Admin] Export AI logs error:", error);
      res.status(500).json({ message: "Failed to export AI logs" });
    }
  });

  // GET /api/admin/me — check if current user is admin
  app.get("/api/admin/me", async (req, res) => {
    try {
      if (!req.session.userId) return res.json({ isAdmin: false });
      const [user] = await db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, req.session.userId));
      res.json({ isAdmin: Boolean(user?.isAdmin) });
    } catch (error) {
      console.error("[Admin] Me check error:", error);
      res.json({ isAdmin: false });
    }
  });
}
