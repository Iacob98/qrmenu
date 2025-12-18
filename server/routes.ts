import type { Express } from "express";
import express from "express";
import path from "path";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertRestaurantSchema, insertCategorySchema, insertDishSchema, insertFeedbackSchema, feedback, type Dish, type Feedback } from "@shared/schema";
import { sql } from "drizzle-orm";
import { createAIService } from "./services/ai";
import { qrService } from "./services/qr";
import { upload, saveUploadedImage, deleteUploadedFile, saveImageFromURL } from "./middleware/upload";
import bcrypt from "bcrypt";
import session from "express-session";
import { RedisStore } from "connect-redis";
import type { MenuWebSocketManager } from "./websocket";
import { storageService } from "./services/storageService";
import { STORAGE_BUCKETS, isSupabaseConfigured } from "./supabase";
import { sendFeedbackToTelegram, testTelegramConnection } from "./telegram";
import { db } from "./db";
import { initRedis, getRedisClient, isRedisConnected, closeRedis } from "./redis";
import { initRateLimiters, getGlobalLimiter, getAuthLimiter, getAiLimiter, getPublicMenuLimiter, getUploadLimiter } from "./middleware/rateLimiter";
import { cacheMiddleware, invalidateCache, CACHE_KEYS } from "./middleware/cache";

// Extend session interface
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

// Helper function for error handling
const handleError = (error: unknown): string => {
  return error instanceof Error ? error.message : "An unexpected error occurred";
};

let menuWebSocketManager: MenuWebSocketManager;

export function setWebSocketManager(wsManager: MenuWebSocketManager) {
  menuWebSocketManager = wsManager;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Redis and rate limiters
  console.log('[Server] Initializing Redis...');
  const redisConnected = await initRedis();
  console.log(`[Server] Redis connected: ${redisConnected}`);

  await initRateLimiters();

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Session configuration with Redis store
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    console.warn('[Security] SESSION_SECRET not set! Using random secret (sessions will not persist across restarts)');
  }

  // Configure session store - use Redis if available, fall back to memory
  let sessionStore;
  const redisClient = await getRedisClient();

  if (redisClient && isRedisConnected()) {
    console.log('[Session] Using Redis store for sessions');
    sessionStore = new RedisStore({
      client: redisClient,
      prefix: 'qrmenu:sess:',
      ttl: 86400, // 24 hours in seconds
    });
  } else {
    console.warn('[Session] Redis not available, using MemoryStore (sessions will not persist across restarts)');
    const MemoryStore = (await import('memorystore')).default(session);
    sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  app.use(session({
    secret: sessionSecret || require('crypto').randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: 'lax'
    }
  }));

  // Apply global rate limiter to all API routes
  app.use('/api', getGlobalLimiter());

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Auth routes (with rate limiting)
  app.post("/api/auth/register", getAuthLimiter(), async (req, res) => {
    try {
      const { email, password, name } = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user (email verification disabled)
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        emailVerified: true, // Auto-verify emails for now
        emailVerificationToken: null,
        emailVerificationExpires: null,
      });

      // Set session (user can use app while unverified)
      req.session.userId = user.id;
      
      // Save session and respond
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: "Session save failed" });
        }
        res.json({ 
          user: { 
            id: user.id, 
            email: user.email, 
            name: user.name,
            emailVerified: user.emailVerified 
          },
          message: "Registration successful! You can now access all features."
        });
      });
    } catch (error) {
      res.status(400).json({ message: handleError(error) });
    }
  });

  app.post("/api/auth/login", getAuthLimiter(), async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;

      // Save session and respond
      req.session.save((err) => {
        if (err) {
          console.error('[Auth] Session save error');
          return res.status(500).json({ message: "Session save failed" });
        }
        res.json({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified
          }
        });
      });
    } catch (error) {
      console.error('[Auth] Login error');
      res.status(400).json({ message: handleError(error) });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {

    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name,
          emailVerified: user.emailVerified 
        } 
      });
    } catch (error) {
      res.status(500).json({ message: handleError(error) });
    }
  });

  // Email verification routes removed - using auto-verification for now

  // Test email route removed - using auto-verification for now

  // Restaurant routes
  app.get("/api/restaurants", requireAuth, async (req, res) => {
    try {
      const restaurants = await storage.getRestaurantsByUserId(req.session.userId!);
      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ message: handleError(error) });
    }
  });

  app.patch("/api/restaurants/:id/favorites-title", requireAuth, async (req, res) => {
    try {
      const { favoritesTitle } = req.body;
      const restaurant = await storage.getRestaurant(req.params.id);
      
      if (!restaurant || restaurant.userId !== req.session.userId) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      const updatedRestaurant = await storage.updateRestaurant(req.params.id, { favoritesTitle });
      
      // Notify WebSocket clients about menu update
      const { wsManager } = await import("./index");
      if (wsManager && restaurant.slug) {
        wsManager.notifyMenuUpdate(restaurant.slug, {
          type: 'favorites_title_updated',
          favoritesTitle
        });
      }
      
      res.json(updatedRestaurant);
    } catch (error) {
      res.status(500).json({ message: handleError(error) });
    }
  });

  app.patch("/api/restaurants/:id/language", requireAuth, async (req, res) => {
    try {
      const { language } = req.body;
      const restaurant = await storage.getRestaurant(req.params.id);

      if (!restaurant || restaurant.userId !== req.session.userId) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      // Validate language
      const validLanguages = ['en', 'de', 'ru'];
      if (!validLanguages.includes(language)) {
        return res.status(400).json({ message: "Invalid language" });
      }

      const updatedRestaurant = await storage.updateRestaurant(req.params.id, { language });
      res.json(updatedRestaurant);
    } catch (error) {
      res.status(500).json({ message: handleError(error) });
    }
  });

  app.post("/api/restaurants", requireAuth, async (req, res) => {
    try {
      // Check if user already has a restaurant
      const existingRestaurants = await storage.getRestaurantsByUserId(req.session.userId!);
      if (existingRestaurants.length >= 1) {
        return res.status(400).json({ message: "Вы можете создать только один ресторан" });
      }

      const restaurantData = insertRestaurantSchema.parse(req.body);
      const restaurant = await storage.createRestaurant({
        ...restaurantData,
        userId: req.session.userId!,
      });
      res.status(201).json(restaurant);
    } catch (error) {
      res.status(400).json({ message: handleError(error) });
    }
  });

  app.get("/api/restaurants/:id", requireAuth, async (req, res) => {
    try {
      const restaurant = await storage.getRestaurantWithCategories(req.params.id);
      if (!restaurant || restaurant.userId !== req.session.userId) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ message: handleError(error) });
    }
  });

  app.put("/api/restaurants/:id", requireAuth, async (req, res) => {
    try {
      const restaurant = await storage.getRestaurant(req.params.id);
      if (!restaurant || restaurant.userId !== req.session.userId) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      // Detect newly added target languages for bulk translation
      const oldTargetLanguages = restaurant.targetLanguages || [];
      const newTargetLanguages = req.body.targetLanguages || oldTargetLanguages;
      const addedLanguages = newTargetLanguages.filter(
        (lang: string) => !oldTargetLanguages.includes(lang)
      );

      console.log(`[Restaurant Update] Received data:`, JSON.stringify(req.body, null, 2));
      const updatedRestaurant = await storage.updateRestaurant(req.params.id, req.body);
      console.log(`[Restaurant Update] Updated result:`, JSON.stringify(updatedRestaurant, null, 2));

      // Invalidate cache for this restaurant's public menu
      if (restaurant.slug) {
        await invalidateCache(`cache:menu:*${encodeURIComponent(restaurant.slug)}*`);
        console.log(`[Cache] Invalidated cache for restaurant: ${restaurant.slug}`);
      }

      // Start bulk translation if new languages were added
      let translationJobId: string | null = null;
      if (addedLanguages.length > 0) {
        try {
          const { translateRestaurantContent } = await import('./services/translationService');
          translationJobId = await translateRestaurantContent(req.params.id, addedLanguages);
          console.log(`[Translation] Started job ${translationJobId} for languages: ${addedLanguages.join(', ')}`);
        } catch (translationError) {
          console.error(`[Translation] Failed to start translation job:`, translationError);
        }
      }

      // Notify WebSocket clients about restaurant updates (including banner, logo, design, etc.)
      if (restaurant.slug) {
        const updateType = req.body.design ? 'design_update' : 'restaurant_update';

        menuWebSocketManager.notifyMenuUpdate(restaurant.slug, {
          type: updateType,
          design: req.body.design,
          banner: req.body.banner,
          logo: req.body.logo,
          name: req.body.name,
          city: req.body.city,
          restaurantSlug: restaurant.slug,
          timestamp: new Date().toISOString()
        });

        console.log(`📡 Sent ${updateType} notification for restaurant: ${restaurant.slug}`);
      }

      // Return updated restaurant with optional translation job ID
      res.json({
        ...updatedRestaurant,
        translationJobId
      });
    } catch (error) {
      res.status(400).json({ message: handleError(error) });
    }
  });

  // Get translation job progress
  app.get("/api/translation-progress/:jobId", requireAuth, async (req, res) => {
    try {
      const { getTranslationProgress } = await import('./services/translationService');
      const progress = getTranslationProgress(req.params.jobId);

      if (!progress) {
        return res.status(404).json({ message: "Translation job not found" });
      }

      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: handleError(error) });
    }
  });

  app.delete("/api/restaurants/:id", requireAuth, async (req, res) => {
    try {
      const restaurant = await storage.getRestaurant(req.params.id);
      if (!restaurant || restaurant.userId !== req.session.userId) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      await storage.deleteRestaurant(req.params.id);
      res.json({ message: "Restaurant deleted" });
    } catch (error) {
      res.status(500).json({ message: handleError(error) });
    }
  });

  // Category routes
  app.post("/api/restaurants/:restaurantId/categories", requireAuth, async (req, res) => {
    try {
      const restaurant = await storage.getRestaurant(req.params.restaurantId);
      if (!restaurant || restaurant.userId !== req.session.userId) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      const categoryData = insertCategorySchema.parse({
        ...req.body,
        restaurantId: req.params.restaurantId,
      });

      const category = await storage.createCategory(categoryData);

      // Auto-translate category name in background
      const targetLangs = restaurant.targetLanguages || ['en', 'de'];
      const sourceLang = restaurant.language || 'ru';

      if (targetLangs.length > 0) {
        const provider = restaurant.aiProvider || (process.env.OPENROUTER_API_KEY ? 'openrouter' : 'openai');
        const apiKey = restaurant.aiToken || (provider === 'openrouter' ? process.env.OPENROUTER_API_KEY : process.env.OPENAI_API_KEY);

        if (apiKey) {
          const model = restaurant.aiModel || (provider === 'openrouter' ? 'anthropic/claude-3.5-sonnet' : 'gpt-4o');
          const aiService = createAIService(apiKey, provider, model);

          aiService.translateCategoryName(category.name, sourceLang, targetLangs)
            .then(async (translations) => {
              if (Object.keys(translations).length > 0) {
                await storage.updateCategory(category.id, { translations });
                console.log(`[Translation] Category "${category.name}" translated to ${Object.keys(translations).join(', ')}`);
              }
            }).catch(err => {
              console.error(`[Translation] Failed to translate category "${category.name}":`, err.message);
            });
        }
      }

      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: handleError(error) });
    }
  });

  app.put("/api/categories/:id", requireAuth, async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const restaurant = await storage.getRestaurant(category.restaurantId);
      if (!restaurant || restaurant.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Validate the update data
      const updateData = {
        name: req.body.name,
        icon: req.body.icon || null,
      };

      const updatedCategory = await storage.updateCategory(req.params.id, updateData);

      // Re-translate if name changed
      if (category.name !== req.body.name) {
        const targetLangs = restaurant.targetLanguages || ['en', 'de'];
        const sourceLang = restaurant.language || 'ru';

        if (targetLangs.length > 0) {
          const provider = restaurant.aiProvider || (process.env.OPENROUTER_API_KEY ? 'openrouter' : 'openai');
          const apiKey = restaurant.aiToken || (provider === 'openrouter' ? process.env.OPENROUTER_API_KEY : process.env.OPENAI_API_KEY);

          if (apiKey) {
            const model = restaurant.aiModel || (provider === 'openrouter' ? 'anthropic/claude-3.5-sonnet' : 'gpt-4o');
            const aiService = createAIService(apiKey, provider, model);

            aiService.translateCategoryName(updatedCategory.name, sourceLang, targetLangs)
              .then(async (translations) => {
                if (Object.keys(translations).length > 0) {
                  await storage.updateCategory(updatedCategory.id, { translations });
                  console.log(`[Translation] Category "${updatedCategory.name}" re-translated to ${Object.keys(translations).join(', ')}`);
                }
              }).catch(err => {
                console.error(`[Translation] Failed to re-translate category "${updatedCategory.name}":`, err.message);
              });
          }
        }
      }

      res.json(updatedCategory);
    } catch (error) {
      res.status(400).json({ message: handleError(error) });
    }
  });

  app.delete("/api/categories/:id", requireAuth, async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const restaurant = await storage.getRestaurant(category.restaurantId);
      if (!restaurant || restaurant.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteCategory(req.params.id);
      res.json({ message: "Category deleted" });
    } catch (error) {
      res.status(500).json({ message: handleError(error) });
    }
  });

  // Dish routes
  app.post("/api/categories/:categoryId/dishes", requireAuth, async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const restaurant = await storage.getRestaurant(category.restaurantId);
      if (!restaurant || restaurant.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const dishData = insertDishSchema.parse({
        ...req.body,
        categoryId: req.params.categoryId,
      });

      const dish = await storage.createDish(dishData);

      // Auto-translate dish content in background
      const targetLangs = restaurant.targetLanguages || ['en', 'de'];
      const sourceLang = restaurant.language || 'ru';

      if (targetLangs.length > 0) {
        // Get AI config
        const provider = restaurant.aiProvider || (process.env.OPENROUTER_API_KEY ? 'openrouter' : 'openai');
        const apiKey = restaurant.aiToken || (provider === 'openrouter' ? process.env.OPENROUTER_API_KEY : process.env.OPENAI_API_KEY);

        if (apiKey) {
          const model = restaurant.aiModel || (provider === 'openrouter' ? 'anthropic/claude-3.5-sonnet' : 'gpt-4o');
          const aiService = createAIService(apiKey, provider, model);

          // Run translation in background (don't block response)
          aiService.translateContent(
            {
              name: dish.name,
              description: dish.description || undefined,
              ingredients: dish.ingredients || undefined
            },
            sourceLang,
            targetLangs
          ).then(async (translations) => {
            if (Object.keys(translations).length > 0) {
              await storage.updateDish(dish.id, { translations });
              console.log(`[Translation] Dish "${dish.name}" translated to ${Object.keys(translations).join(', ')}`);
            }
          }).catch(err => {
            console.error(`[Translation] Failed to translate dish "${dish.name}":`, err.message);
          });
        }
      }

      // Notify WebSocket clients about new dish
      const { wsManager } = await import("./index");
      if (wsManager && restaurant.slug) {
        wsManager.notifyMenuUpdate(restaurant.slug, {
          type: 'dish_created',
          dish: dish
        });
      }

      res.status(201).json(dish);
    } catch (error) {
      res.status(400).json({ message: handleError(error) });
    }
  });

  app.put("/api/dishes/:id", requireAuth, async (req, res) => {
    try {
      const dish = await storage.getDish(req.params.id);
      if (!dish) {
        return res.status(404).json({ message: "Dish not found" });
      }

      const category = await storage.getCategory(dish.categoryId);
      const restaurant = await storage.getRestaurant(category!.restaurantId);
      if (!restaurant || restaurant.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Validate the update data - allow partial updates
      const updateData: Partial<Dish> = {
        name: req.body.name,
        description: req.body.description || null,
        price: req.body.price,
        categoryId: req.body.categoryId,
        ingredients: req.body.ingredients || null,
        tags: req.body.tags || null,
        image: req.body.image || null,
        nutrition: req.body.nutrition || null,
      };

      console.log('[Dish Update] Request body:', JSON.stringify(req.body, null, 2));
      console.log('[Dish Update] Update data:', JSON.stringify(updateData, null, 2));

      const updatedDish = await storage.updateDish(req.params.id, updateData);
      console.log('[Dish Update] Updated dish:', JSON.stringify(updatedDish, null, 2));

      // Check if translatable fields changed and re-translate
      const translatableFieldsChanged =
        dish.name !== req.body.name ||
        dish.description !== req.body.description ||
        JSON.stringify(dish.ingredients) !== JSON.stringify(req.body.ingredients);

      if (translatableFieldsChanged) {
        const targetLangs = restaurant.targetLanguages || ['en', 'de'];
        const sourceLang = restaurant.language || 'ru';

        if (targetLangs.length > 0) {
          const provider = restaurant.aiProvider || (process.env.OPENROUTER_API_KEY ? 'openrouter' : 'openai');
          const apiKey = restaurant.aiToken || (provider === 'openrouter' ? process.env.OPENROUTER_API_KEY : process.env.OPENAI_API_KEY);

          if (apiKey) {
            const model = restaurant.aiModel || (provider === 'openrouter' ? 'anthropic/claude-3.5-sonnet' : 'gpt-4o');
            const aiService = createAIService(apiKey, provider, model);

            // Run translation in background
            aiService.translateContent(
              {
                name: updatedDish.name,
                description: updatedDish.description || undefined,
                ingredients: updatedDish.ingredients || undefined
              },
              sourceLang,
              targetLangs
            ).then(async (translations) => {
              if (Object.keys(translations).length > 0) {
                await storage.updateDish(updatedDish.id, { translations });
                console.log(`[Translation] Dish "${updatedDish.name}" re-translated to ${Object.keys(translations).join(', ')}`);
              }
            }).catch(err => {
              console.error(`[Translation] Failed to re-translate dish "${updatedDish.name}":`, err.message);
            });
          }
        }
      }

      // Notify WebSocket clients about dish update
      const { wsManager } = await import("./index");
      if (wsManager && restaurant.slug) {
        wsManager.notifyMenuUpdate(restaurant.slug, {
          type: 'dish_updated',
          dish: updatedDish
        });
      }

      res.json(updatedDish);
    } catch (error) {
      res.status(400).json({ message: handleError(error) });
    }
  });

  app.delete("/api/dishes/:id", requireAuth, async (req, res) => {
    try {
      const dish = await storage.getDish(req.params.id);
      if (!dish) {
        return res.status(404).json({ message: "Dish not found" });
      }

      const category = await storage.getCategory(dish.categoryId);
      const restaurant = await storage.getRestaurant(category!.restaurantId);
      if (!restaurant || restaurant.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteDish(req.params.id);
      
      // Notify WebSocket clients about dish deletion
      const { wsManager } = await import("./index");
      if (wsManager && restaurant.slug) {
        wsManager.notifyMenuUpdate(restaurant.slug, {
          type: 'dish_deleted',
          dishId: dish.id
        });
      }
      
      res.json({ message: "Dish deleted" });
    } catch (error) {
      res.status(500).json({ message: handleError(error) });
    }
  });

  // Dish favorites and visibility routes
  app.patch("/api/dishes/:id/favorite", requireAuth, async (req, res) => {
    try {
      const { isFavorite } = req.body;
      const dish = await storage.getDish(req.params.id);
      if (!dish) {
        return res.status(404).json({ message: "Dish not found" });
      }

      const category = await storage.getCategory(dish.categoryId);
      const restaurant = await storage.getRestaurant(category!.restaurantId);
      if (!restaurant || restaurant.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedDish = await storage.updateDish(req.params.id, { isFavorite });
      
      // Notify WebSocket clients about menu update
      const { wsManager } = await import("./index");
      if (wsManager && restaurant.slug) {
        console.log(`🚀 Sending WebSocket notification for favorite change: ${dish.id} -> ${isFavorite}`);
        wsManager.notifyMenuUpdate(restaurant.slug, {
          type: 'dish_updated',
          dishId: dish.id,
          changes: { isFavorite }
        });
      } else {
        console.log('⚠️  WebSocket manager not available or restaurant has no slug');
      }
      
      res.json(updatedDish);
    } catch (error) {
      res.status(500).json({ message: handleError(error) });
    }
  });

  app.patch("/api/dishes/:id/visibility", requireAuth, async (req, res) => {
    try {
      const { isHidden } = req.body;
      const dish = await storage.getDish(req.params.id);
      if (!dish) {
        return res.status(404).json({ message: "Dish not found" });
      }

      const category = await storage.getCategory(dish.categoryId);
      const restaurant = await storage.getRestaurant(category!.restaurantId);
      if (!restaurant || restaurant.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedDish = await storage.updateDish(req.params.id, { isHidden });
      
      // Notify WebSocket clients about menu update
      const { wsManager } = await import("./index");
      if (wsManager && restaurant.slug) {
        console.log(`🚀 Sending WebSocket notification for visibility change: ${dish.id} -> hidden:${isHidden}`);
        wsManager.notifyMenuUpdate(restaurant.slug, {
          type: 'dish_updated',
          dishId: dish.id,
          changes: { isHidden }
        });
      } else {
        console.log('⚠️  WebSocket manager not available or restaurant has no slug');
      }
      
      res.json(updatedDish);
    } catch (error) {
      res.status(500).json({ message: handleError(error) });
    }
  });

  // AI routes
  app.post("/api/ai/test-token", requireAuth, async (req, res) => {
    try {
      const { token, provider = 'openai', model } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }

      const aiService = createAIService(token, provider, model);
      
      // Test the token with a simple completion
      const testResponse = await aiService.analyzeText("Test menu: Pizza Margherita - 12.99");
      
      res.json({ 
        valid: true, 
        message: "Token is valid",
        provider,
        model: aiService.model || model
      });
    } catch (error) {
      console.error("Token validation error:", error);
      res.status(400).json({ 
        valid: false, 
        message: `Invalid token: ${handleError(error)}` 
      });
    }
  });

  app.post("/api/ai/test-global-token", requireAuth, async (req, res) => {
    try {
      const { model = 'anthropic/claude-3.5-sonnet' } = req.body;
      
      const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ message: "Global AI tokens not configured" });
      }

      const provider = process.env.OPENROUTER_API_KEY ? 'openrouter' : 'openai';
      const aiService = createAIService(apiKey, provider, model);
      
      // Test the token with a simple completion
      const testResponse = await aiService.analyzeText("Test menu: Pizza Margherita - 12.99");
      
      res.json({ 
        valid: true, 
        message: "Global AI token is working",
        provider,
        model: aiService.model || model
      });
    } catch (error) {
      console.error("Global token validation error:", error);
      res.status(400).json({ 
        valid: false, 
        message: `Global AI token error: ${handleError(error)}` 
      });
    }
  });

  app.post("/api/ai/analyze-pdf", requireAuth, getAiLimiter(), async (req, res) => {
    try {
      const { restaurantId, base64Data } = req.body;
      
      const restaurant = await storage.getRestaurant(restaurantId);
      if (!restaurant || restaurant.userId !== req.session.userId) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      // Determine provider and matching API key
      const provider = restaurant.aiProvider || (process.env.OPENROUTER_API_KEY ? 'openrouter' : 'openai');
      const apiKey = restaurant.aiToken || (provider === 'openrouter' ? process.env.OPENROUTER_API_KEY : process.env.OPENAI_API_KEY);
      if (!apiKey) {
        return res.status(400).json({ message: "AI token not available" });
      }

      const model = restaurant.aiModel || (provider === 'openrouter' ? 'anthropic/claude-3.5-sonnet' : 'gpt-4o');
      const aiService = createAIService(apiKey, provider, model);
      const result = await aiService.analyzePDF(base64Data);
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: handleError(error) });
    }
  });

  app.post("/api/ai/analyze-photo", requireAuth, getAiLimiter(), async (req, res) => {
    try {
      const { restaurantId, base64Image } = req.body;
      
      const restaurant = await storage.getRestaurant(restaurantId);
      if (!restaurant || restaurant.userId !== req.session.userId) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      // Determine provider and matching API key
      const provider = restaurant.aiProvider || (process.env.OPENROUTER_API_KEY ? 'openrouter' : 'openai');
      const apiKey = restaurant.aiToken || (provider === 'openrouter' ? process.env.OPENROUTER_API_KEY : process.env.OPENAI_API_KEY);
      if (!apiKey) {
        return res.status(400).json({ message: "AI token not available" });
      }

      const model = restaurant.aiModel || (provider === 'openrouter' ? 'anthropic/claude-3.5-sonnet' : 'gpt-4o');
      const aiService = createAIService(apiKey, provider, model);
      const result = await aiService.analyzePhoto(base64Image);
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: handleError(error) });
    }
  });

  app.post("/api/ai/analyze-text", requireAuth, getAiLimiter(), async (req, res) => {
    try {
      const { restaurantId, text } = req.body;
      
      const restaurant = await storage.getRestaurant(restaurantId);
      if (!restaurant || restaurant.userId !== req.session.userId) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      // Determine provider and matching API key
      const provider = restaurant.aiProvider || (process.env.OPENROUTER_API_KEY ? 'openrouter' : 'openai');
      const apiKey = restaurant.aiToken || (provider === 'openrouter' ? process.env.OPENROUTER_API_KEY : process.env.OPENAI_API_KEY);
      if (!apiKey) {
        return res.status(400).json({ message: "AI token not available" });
      }

      const model = restaurant.aiModel || (provider === 'openrouter' ? 'anthropic/claude-3.5-sonnet' : 'gpt-4o');
      const aiService = createAIService(apiKey, provider, model);
      const result = await aiService.analyzeText(text);
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: handleError(error) });
    }
  });

  // File upload routes (with rate limiting)
  app.post("/api/upload/image", requireAuth, getUploadLimiter(), upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const imageUrl = await saveUploadedImage(req.file, {
        width: 1024,
        height: 1024,
        quality: 85
      });

      res.json({ 
        url: imageUrl,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: handleError(error) });
    }
  });

  app.post("/api/upload/logo", requireAuth, getUploadLimiter(), upload.single('logo'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No logo file provided" });
      }

      const logoUrl = await saveUploadedImage(req.file, {
        width: 300,
        height: 300,
        quality: 90
      });

      res.json({ 
        url: logoUrl,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error("Logo upload error:", error);
      res.status(500).json({ message: handleError(error) });
    }
  });

  app.post("/api/upload/banner", requireAuth, getUploadLimiter(), upload.single('banner'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No banner file provided" });
      }

      const bannerUrl = await saveUploadedImage(req.file, {
        width: 1200,
        height: 400,
        quality: 85
      });

      res.json({ 
        url: bannerUrl,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error("Banner upload error:", error);
      res.status(500).json({ message: handleError(error) });
    }
  });

  app.delete("/api/upload", requireAuth, async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ message: "File URL is required" });
      }

      await deleteUploadedFile(url);
      res.json({ message: "File deleted successfully" });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ message: handleError(error) });
    }
  });

  app.post("/api/ai/improve-description", requireAuth, getAiLimiter(), async (req, res) => {
    try {
      const { restaurantId, dishName, currentDescription, ingredients, tags } = req.body;
      
      if (!restaurantId || !dishName) {
        return res.status(400).json({ message: "Missing required fields: restaurantId, dishName" });
      }
      
      const restaurant = await storage.getRestaurant(restaurantId);
      if (!restaurant || restaurant.userId !== req.session.userId) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      const apiKey = restaurant.aiToken || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ message: "AI token not configured" });
      }

      console.log(`[AI Description] Improving description for dish: ${dishName}`);
      const aiService = createAIService(apiKey, restaurant.aiProvider || 'openai', restaurant.aiModel || undefined);
      
      // Get restaurant language or default to Russian
      const language = restaurant.language || 'ru';
      
      // Create language-specific prompts
      const prompts = {
        ru: `Улучши описание этого блюда для ресторанного меню. Сделай его более аппетитным и привлекательным, но кратким и информативным.

Название блюда: ${dishName}
Текущее описание: ${currentDescription || "Отсутствует"}
Ингредиенты: ${ingredients ? ingredients.join(", ") : "Не указаны"}
Теги: ${tags ? tags.join(", ") : "Не указаны"}

Напиши новое описание на русском языке. Описание должно быть:
- Аппетитным и привлекательным
- Кратким (1-2 предложения)
- Информативным о вкусе и приготовлении
- Без лишних прилагательных

Верни только улучшенное описание без дополнительного текста.`,

        en: `Improve this dish description for a restaurant menu. Make it more appetizing and attractive, but concise and informative.

Dish name: ${dishName}
Current description: ${currentDescription || "Not provided"}
Ingredients: ${ingredients ? ingredients.join(", ") : "Not specified"}
Tags: ${tags ? tags.join(", ") : "Not specified"}

Write a new description in English. The description should be:
- Appetizing and attractive
- Concise (1-2 sentences)
- Informative about taste and preparation
- Without excessive adjectives

Return only the improved description without additional text.`,

        de: `Verbessere diese Gerichtsbeschreibung für eine Restaurantkarte. Mache sie appetitlicher und attraktiver, aber prägnant und informativ.

Gericht: ${dishName}
Aktuelle Beschreibung: ${currentDescription || "Nicht angegeben"}
Zutaten: ${ingredients ? ingredients.join(", ") : "Nicht angegeben"}
Tags: ${tags ? tags.join(", ") : "Nicht angegeben"}

Schreibe eine neue Beschreibung auf Deutsch. Die Beschreibung sollte:
- Appetitlich und attraktiv sein
- Prägnant (1-2 Sätze)
- Informativ über Geschmack und Zubereitung
- Ohne übermäßige Adjektive

Gib nur die verbesserte Beschreibung ohne zusätzlichen Text zurück.`
      };
      
      const prompt = prompts[language as keyof typeof prompts] || prompts.ru;
      const improvedDescription = await aiService.improveText(prompt);
      
      console.log(`[AI Description] Improved successfully`);
      res.json({ improvedDescription: improvedDescription.trim() });
    } catch (error) {
      console.error('[AI Description] Error:', error);
      res.status(500).json({ message: handleError(error) });
    }
  });

  app.post("/api/ai/generate-image", requireAuth, getAiLimiter(), async (req, res) => {
    try {
      const { restaurantId, dishName, description, ingredients, tags, imagePrompt, dishId } = req.body;
      
      if (!restaurantId || !dishName || !dishId) {
        return res.status(400).json({ message: "Missing required fields: restaurantId, dishName, dishId" });
      }
      
      const restaurant = await storage.getRestaurant(restaurantId);
      if (!restaurant || restaurant.userId !== req.session.userId) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      // Check dish generation limit
      const dish = await storage.getDish(dishId);
      if (!dish || dish.categoryId !== req.body.categoryId) {
        return res.status(404).json({ message: "Dish not found" });
      }

      const generationsCount = dish.imageGenerationsCount || 0;
      const MAX_GENERATIONS = 5;

      if (generationsCount >= MAX_GENERATIONS) {
        return res.status(400).json({ 
          message: `Generation limit reached (${MAX_GENERATIONS}) for this dish`,
          remainingGenerations: 0
        });
      }

      // For image generation, always use any valid token (Replicate will be used regardless)
      const provider = restaurant.aiProvider || 'openai';
      const apiKey = restaurant.aiToken || process.env.OPENAI_API_KEY || process.env.REPLICATE_API_TOKEN;
      
      if (!apiKey) {
        return res.status(400).json({ message: "AI token not configured" });
      }

      console.log(`[AI Image] Generating image for dish: ${dishName} using Replicate Imagen-4`);
      const aiService = createAIService(apiKey, provider, restaurant.aiModel || undefined);
      const temporaryImageUrl = await aiService.generateDishImage(
        dishName, 
        description || "", 
        ingredients || [], 
        tags || [],
        imagePrompt || ""
      );
      
      console.log(`[AI Image] Generated successfully, downloading: ${temporaryImageUrl}`);
      
      // Download and save the image locally to avoid expiration
      const localImageUrl = await saveImageFromURL(temporaryImageUrl, {
        width: 1024,
        height: 1024,
        quality: 85
      });
      
      console.log(`[AI Image] Saved locally: ${localImageUrl}`);
      
      // Increment generation count
      await storage.incrementDishImageGenerations(dishId);
      const updatedGenerationsCount = generationsCount + 1;
      const remainingGenerations = MAX_GENERATIONS - updatedGenerationsCount;
      
      console.log(`[AI Image] Generation count incremented. Used: ${updatedGenerationsCount}/${MAX_GENERATIONS}`);
      res.json({ 
        imageUrl: localImageUrl,
        remainingGenerations,
        totalGenerations: updatedGenerationsCount
      });
    } catch (error) {
      console.error('[AI Image] Error:', error);
      res.status(500).json({ message: handleError(error) });
    }
  });

  // QR Code routes
  app.get("/api/restaurants/:id/qr", requireAuth, async (req, res) => {
    try {
      const restaurant = await storage.getRestaurant(req.params.id);
      if (!restaurant || restaurant.userId !== req.session.userId) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      const qrData = await qrService.generateRestaurantQR(restaurant.slug || restaurant.id);
      res.json(qrData);
    } catch (error) {
      res.status(500).json({ message: handleError(error) });
    }
  });

  // Public menu route (no auth required) - with rate limiting and caching
  app.get("/api/public/menu/:slug", getPublicMenuLimiter(), cacheMiddleware(300, 'cache:menu'), async (req, res) => {
    try {
      // Decode URL-encoded slug
      const decodedSlug = decodeURIComponent(req.params.slug);
      const requestedLang = req.query.lang as string | undefined;
      console.log(`[Public Menu] Requested slug: ${req.params.slug}, decoded: ${decodedSlug}, lang: ${requestedLang}`);

      const menu = await storage.getPublicMenu(decodedSlug);
      if (!menu) {
        console.log(`[Public Menu] Menu not found for slug: ${decodedSlug}`);
        return res.status(404).json({ message: "Menu not found" });
      }

      // If a specific language is requested and it differs from restaurant's source language,
      // overlay translated content where available
      if (requestedLang && requestedLang !== menu.restaurant.language) {
        console.log(`[Public Menu] Applying ${requestedLang} translations`);

        // Overlay category translations
        menu.categories = menu.categories.map(category => {
          const translations = (category as any).translations;
          if (translations && translations[requestedLang]) {
            return {
              ...category,
              name: translations[requestedLang].name || category.name,
            };
          }
          return category;
        });

        // Overlay dish translations
        menu.categories = menu.categories.map(category => ({
          ...category,
          dishes: category.dishes.map(dish => {
            const translations = (dish as any).translations;
            if (translations && translations[requestedLang]) {
              return {
                ...dish,
                name: translations[requestedLang].name || dish.name,
                description: translations[requestedLang].description || dish.description,
                ingredients: translations[requestedLang].ingredients || dish.ingredients,
              };
            }
            return dish;
          })
        }));
      }

      console.log(`[Public Menu] Menu found: ${menu.restaurant.name}`);
      res.json(menu);
    } catch (error) {
      console.error(`[Public Menu] Error:`, error);
      res.status(500).json({ message: handleError(error) });
    }
  });

  // Search dishes
  app.get("/api/restaurants/:id/search", async (req, res) => {
    try {
      const { q: query, tags } = req.query;
      const tagsArray = tags ? (Array.isArray(tags) ? tags : [tags]) : undefined;
      
      const dishes = await storage.searchDishes(req.params.id, query as string, tagsArray as string[]);
      res.json(dishes);
    } catch (error) {
      res.status(500).json({ message: handleError(error) });
    }
  });

  // Storage routes - signed upload URLs
  app.post("/api/storage/signed-url", requireAuth, async (req, res) => {
    try {
      const { bucket = STORAGE_BUCKETS.MENU_IMAGES, filename } = req.body;

      if (!isSupabaseConfigured()) {
        return res.status(400).json({
          error: "Storage not configured",
          message: "Supabase storage is not configured. Use direct upload endpoints instead."
        });
      }

      const result = await storageService.getSignedUploadUrl(bucket, filename);
      res.json(result);
    } catch (error) {
      console.error("[Storage] Error getting signed URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Feedback photo upload URL
  app.post("/api/feedback/upload", requireAuth, async (req, res) => {
    try {
      if (!isSupabaseConfigured()) {
        return res.status(400).json({
          error: "Storage not configured",
          message: "Supabase storage is not configured"
        });
      }

      const result = await storageService.getSignedUploadUrl(STORAGE_BUCKETS.FEEDBACK);
      res.json({ uploadURL: result.uploadUrl, path: result.path });
    } catch (error) {
      console.error("[Storage] Error getting feedback upload URL:", error);
      res.status(500).json({ error: "Failed to get feedback upload URL" });
    }
  });

  // Feedback routes
  app.post("/api/feedback", requireAuth, async (req, res) => {
    try {
      console.log("[Feedback] Received feedback submission:", req.body);
      
      // Get user info for context
      const user = await storage.getUser(req.session.userId!);
      
      // Validate feedback data
      const feedbackData = insertFeedbackSchema.parse({
        ...req.body,
        userId: req.session.userId,
        browserInfo: {
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString(),
        },
      });

      // Save feedback to database
      const [newFeedback] = await db.insert(feedback).values(feedbackData).returning();
      console.log("[Feedback] Saved to database:", newFeedback.id);

      // Send Telegram notification
      const telegramData = {
        type: feedbackData.type as "bug" | "suggestion" | "feature_request",
        title: feedbackData.title,
        description: feedbackData.description,
        email: feedbackData.email || user?.email,
        photos: feedbackData.photos || [],
        browserInfo: feedbackData.browserInfo,
        userId: user?.id,
      };

      const telegramSent = await sendFeedbackToTelegram(telegramData);
      
      if (telegramSent) {
        console.log("[Feedback] Telegram notification sent successfully");
      } else {
        console.log("[Feedback] Failed to send Telegram notification");
      }

      res.json({ 
        success: true, 
        feedbackId: newFeedback.id,
        telegramSent 
      });

    } catch (error) {
      console.error("[Feedback] Error processing feedback:", error);
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Get feedback for admin (optional)
  app.get("/api/feedback", requireAuth, async (req, res) => {
    try {
      // Only allow admin users (you could add role-based access here)
      const allFeedback = await db.select().from(feedback).orderBy(feedback.createdAt);
      res.json(allFeedback);
    } catch (error) {
      console.error("[Feedback] Error fetching feedback:", error);
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Test Telegram connection endpoint
  app.get("/api/test-telegram", requireAuth, async (req, res) => {
    try {
      const result = await testTelegramConnection();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error testing Telegram connection",
        error: handleError(error)
      });
    }
  });

  // Initialization endpoint - check configuration and setup
  app.get("/api/init", async (req, res) => {
    const status = {
      configured: true,
      database: { connected: false, message: "" },
      storage: { configured: false, type: "local", message: "" },
      email: { configured: false, message: "" },
      telegram: { configured: false, message: "" },
      environment: {
        baseUrl: !!process.env.BASE_URL,
        sessionSecret: !!process.env.SESSION_SECRET,
        allowedOrigins: !!process.env.ALLOWED_ORIGINS,
      },
      missingEnvVars: [] as string[],
    };

    // Check database connection
    try {
      await db.execute(sql`SELECT 1 as test`);
      status.database.connected = true;
      status.database.message = "Connected to PostgreSQL";
    } catch (error) {
      status.database.connected = false;
      status.database.message = `Database error: ${handleError(error)}`;
      status.configured = false;
    }

    // Check storage configuration
    if (isSupabaseConfigured()) {
      status.storage.configured = true;
      status.storage.type = "supabase";
      status.storage.message = "Supabase Storage configured";
    } else {
      status.storage.configured = true;
      status.storage.type = "local";
      status.storage.message = "Using local filesystem storage (set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for cloud storage)";
    }

    // Check email configuration
    if (process.env.SENDGRID_API_KEY) {
      status.email.configured = true;
      status.email.message = "SendGrid configured";
    } else {
      status.email.message = "Email not configured (set SENDGRID_API_KEY)";
    }

    // Check Telegram configuration
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      status.telegram.configured = true;
      status.telegram.message = "Telegram notifications configured";
    } else {
      status.telegram.message = "Telegram not configured (set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID)";
    }

    // Check required environment variables
    const requiredEnvVars = [
      { name: "DATABASE_URL", required: true },
      { name: "SESSION_SECRET", required: true },
      { name: "BASE_URL", required: false },
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar.name]) {
        if (envVar.required) {
          status.missingEnvVars.push(envVar.name);
          status.configured = false;
        }
      }
    }

    res.json({
      success: status.configured,
      status,
      message: status.configured
        ? "Application is properly configured"
        : "Application has configuration issues",
      requiredEnvVars: [
        "DATABASE_URL - PostgreSQL connection string (required)",
        "SESSION_SECRET - Secret for session encryption (required)",
        "BASE_URL - Public URL of the application (recommended)",
        "ALLOWED_ORIGINS - Comma-separated list of allowed CORS origins",
        "SUPABASE_URL - Supabase project URL (for cloud storage)",
        "SUPABASE_SERVICE_ROLE_KEY - Supabase service role key (for cloud storage)",
        "SUPABASE_ANON_KEY - Supabase anonymous key (optional)",
        "SENDGRID_API_KEY - SendGrid API key (for email)",
        "TELEGRAM_BOT_TOKEN - Telegram bot token (for notifications)",
        "TELEGRAM_CHAT_ID - Telegram chat ID (for notifications)",
      ]
    });
  });

  // Database migration/push endpoint (protected)
  app.post("/api/init/db-push", requireAuth, async (req, res) => {
    try {
      // This would typically be done via drizzle-kit push
      // For now, just return instructions
      res.json({
        success: true,
        message: "Run 'npm run db:push' to push schema changes to the database",
        instructions: [
          "1. Ensure DATABASE_URL is set",
          "2. Run: npm run db:push",
          "3. This will sync your schema with the database"
        ]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: handleError(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
