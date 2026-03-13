import type { Express } from "express";
import { db } from "../db";
import { users, restaurants, aiUsageLogs, feedback, categories, dishes } from "@shared/schema";
import { eq, desc, sql, count, sum, and, gte, lte } from "drizzle-orm";
import { requireAdmin } from "../middleware/adminAuth";

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
        })
        .from(aiUsageLogs)
        .groupBy(aiUsageLogs.requestType)
        .orderBy(desc(sql`COALESCE(SUM(total_tokens), 0)`));

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
        },
        tokensByType,
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

      const [allUsers, [{ total }]] = await Promise.all([
        search
          ? baseQuery.where(sql`${users.email} ILIKE ${'%' + search + '%'} OR ${users.name} ILIKE ${'%' + search + '%'}`)
          : baseQuery,
        db.select({ total: count() }).from(users),
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

      const [userRestaurants, recentLogs, [{ totalTokens, totalRequests }]] = await Promise.all([
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
          })
          .from(aiUsageLogs)
          .where(eq(aiUsageLogs.userId, id)),
      ]);

      res.json({ user, restaurants: userRestaurants, recentLogs, stats: { totalTokens: Number(totalTokens), totalRequests: Number(totalRequests) } });
    } catch (error) {
      console.error("[Admin] User detail error:", error);
      res.status(500).json({ message: "Failed to fetch user details" });
    }
  });

  // PATCH /api/admin/users/:id — toggle admin role
  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { isAdmin } = req.body;

      if (id === req.session.userId) {
        return res.status(400).json({ message: "Cannot modify your own admin status" });
      }

      await db.update(users).set({ isAdmin: Boolean(isAdmin) }).where(eq(users.id, id));
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

      const [allRestaurants, [{ total }]] = await Promise.all([
        db
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
          .offset(offset),

        db.select({ total: count() }).from(restaurants),
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

      res.json({
        logs,
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
      const allFeedback = await db
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
        .orderBy(desc(feedback.createdAt))
        .limit(200);

      res.json({ feedback: allFeedback });
    } catch (error) {
      console.error("[Admin] Feedback error:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  // PATCH /api/admin/feedback/:id — update feedback status
  app.patch("/api/admin/feedback/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, priority } = req.body;

      const updateData: Record<string, string> = {};
      if (status) updateData.status = status;
      if (priority) updateData.priority = priority;

      await db.update(feedback).set(updateData).where(eq(feedback.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("[Admin] Update feedback error:", error);
      res.status(500).json({ message: "Failed to update feedback" });
    }
  });

  // GET /api/admin/me — check if current user is admin
  app.get("/api/admin/me", async (req, res) => {
    if (!req.session.userId) return res.json({ isAdmin: false });
    const [user] = await db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, req.session.userId));
    res.json({ isAdmin: Boolean(user?.isAdmin) });
  });
}
