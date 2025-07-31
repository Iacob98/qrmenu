import type { Express } from "express";
import express from "express";
import path from "path";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertRestaurantSchema, insertCategorySchema, insertDishSchema, type Dish } from "@shared/schema";
import { createAIService } from "./services/ai";
import { qrService } from "./services/qr";
import { upload, saveUploadedImage, deleteUploadedFile, saveImageFromURL } from "./middleware/upload";
import bcrypt from "bcrypt";
import session from "express-session";
import MemoryStore from "memorystore";

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

const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: { 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true, // Secure cookies
      sameSite: 'lax' // Allow same-site cookies
    }
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
      });

      // Set session
      req.session.userId = user.id;
      
      // Save session and respond
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: "Session save failed" });
        }
        res.json({ user: { id: user.id, email: user.email, name: user.name } });
      });
    } catch (error) {
      res.status(400).json({ message: handleError(error) });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
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
          console.error('Session save error:', err);
          return res.status(500).json({ message: "Session save failed" });
        }
        res.json({ user: { id: user.id, email: user.email, name: user.name } });
      });
    } catch (error) {
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
      
      res.json({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
      res.status(500).json({ message: handleError(error) });
    }
  });

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

      const updatedRestaurant = await storage.updateRestaurant(req.params.id, req.body);
      res.json(updatedRestaurant);
    } catch (error) {
      res.status(400).json({ message: handleError(error) });
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
      res.json(updatedCategory);
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

      const updatedCategory = await storage.updateCategory(req.params.id, req.body);
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
      };

      console.log('[Dish Update] Request body:', JSON.stringify(req.body, null, 2));
      console.log('[Dish Update] Update data:', JSON.stringify(updateData, null, 2));

      const updatedDish = await storage.updateDish(req.params.id, updateData);
      console.log('[Dish Update] Updated dish:', JSON.stringify(updatedDish, null, 2));
      
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

  app.post("/api/ai/analyze-pdf", requireAuth, async (req, res) => {
    try {
      const { restaurantId, base64Data } = req.body;
      
      const restaurant = await storage.getRestaurant(restaurantId);
      if (!restaurant || restaurant.userId !== req.session.userId) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      if (!restaurant.aiToken) {
        return res.status(400).json({ message: "AI token not configured" });
      }

      const aiService = createAIService(restaurant.aiToken, restaurant.aiProvider || 'openai', restaurant.aiModel || undefined);
      const dishes = await aiService.analyzePDF(base64Data);
      
      res.json({ dishes });
    } catch (error) {
      res.status(500).json({ message: handleError(error) });
    }
  });

  app.post("/api/ai/analyze-photo", requireAuth, async (req, res) => {
    try {
      const { restaurantId, base64Image } = req.body;
      
      const restaurant = await storage.getRestaurant(restaurantId);
      if (!restaurant || restaurant.userId !== req.session.userId) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      if (!restaurant.aiToken) {
        return res.status(400).json({ message: "AI token not configured" });
      }

      const aiService = createAIService(restaurant.aiToken, restaurant.aiProvider || 'openai', restaurant.aiModel || undefined);
      const dishes = await aiService.analyzePhoto(base64Image);
      
      res.json({ dishes });
    } catch (error) {
      res.status(500).json({ message: handleError(error) });
    }
  });

  // File upload routes
  app.post("/api/upload/image", requireAuth, upload.single('image'), async (req, res) => {
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

  app.post("/api/upload/logo", requireAuth, upload.single('logo'), async (req, res) => {
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

  app.post("/api/upload/banner", requireAuth, upload.single('banner'), async (req, res) => {
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

  app.post("/api/ai/analyze-text", requireAuth, async (req, res) => {
    try {
      const { restaurantId, text } = req.body;
      
      const restaurant = await storage.getRestaurant(restaurantId);
      if (!restaurant || restaurant.userId !== req.session.userId) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      if (!restaurant.aiToken) {
        return res.status(400).json({ message: "AI token not configured" });
      }

      const aiService = createAIService(restaurant.aiToken, restaurant.aiProvider || 'openai', restaurant.aiModel || undefined);
      const dishes = await aiService.analyzeText(text);
      
      res.json({ dishes });
    } catch (error) {
      res.status(500).json({ message: handleError(error) });
    }
  });

  app.post("/api/ai/generate-image", requireAuth, async (req, res) => {
    try {
      const { restaurantId, dishName, description, ingredients, tags } = req.body;
      
      if (!restaurantId || !dishName) {
        return res.status(400).json({ message: "Missing required fields: restaurantId, dishName" });
      }
      
      const restaurant = await storage.getRestaurant(restaurantId);
      if (!restaurant || restaurant.userId !== req.session.userId) {
        return res.status(404).json({ message: "Restaurant not found" });
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
        tags || []
      );
      
      console.log(`[AI Image] Generated successfully, downloading: ${temporaryImageUrl}`);
      
      // Download and save the image locally to avoid expiration
      const localImageUrl = await saveImageFromURL(temporaryImageUrl, {
        width: 1024,
        height: 1024,
        quality: 85
      });
      
      console.log(`[AI Image] Saved locally: ${localImageUrl}`);
      res.json({ imageUrl: localImageUrl });
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

  // Public menu route (no auth required)
  app.get("/api/public/menu/:slug", async (req, res) => {
    try {
      const menu = await storage.getPublicMenu(req.params.slug);
      if (!menu) {
        return res.status(404).json({ message: "Menu not found" });
      }
      res.json(menu);
    } catch (error) {
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

  const httpServer = createServer(app);
  return httpServer;
}
