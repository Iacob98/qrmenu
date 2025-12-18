import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, boolean, integer, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Translation types for menu content
export type DishTranslations = {
  [lang: string]: {
    name?: string;
    description?: string;
    ingredients?: string[];
  };
};

export type CategoryTranslations = {
  [lang: string]: {
    name?: string;
  };
};

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationExpires: timestamp("email_verification_expires"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  emailVerificationTokenIdx: index("users_email_verification_token_idx").on(table.emailVerificationToken),
}));

export const restaurants = pgTable("restaurants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  city: text("city"),
  phone: text("phone"),
  currency: text("currency").notNull().default("EUR"),
  language: text("language").notNull().default("ru"),
  targetLanguages: text("target_languages").array().default(sql`ARRAY['en', 'de']::text[]`), // Languages to translate menu into
  slug: text("slug").unique(),
  aiProvider: text("ai_provider").default("openai"), // "openai" or "openrouter"
  aiToken: text("ai_token"),
  aiModel: text("ai_model"), // For OpenRouter custom models
  favoritesTitle: text("favorites_title").default("Избранное"),
  logo: text("logo"),
  banner: text("banner"),
  design: jsonb("design"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("restaurants_user_id_idx").on(table.userId),
  slugIdx: index("restaurants_slug_idx").on(table.slug),
}));

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").default(0),
  icon: text("icon"),
  translations: jsonb("translations").$type<CategoryTranslations>(), // { [lang]: { name } }
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  restaurantIdIdx: index("categories_restaurant_id_idx").on(table.restaurantId),
  sortOrderIdx: index("categories_sort_order_idx").on(table.sortOrder),
}));

export const dishes = pgTable("dishes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image"),
  ingredients: text("ingredients").array(),
  nutrition: jsonb("nutrition"), // { protein: number, fat: number, carbs: number, calories: number }
  tags: text("tags").array(), // ["spicy", "vegetarian", "gluten-free", etc.]
  translations: jsonb("translations").$type<DishTranslations>(), // { [lang]: { name, description, ingredients } }
  available: boolean("available").default(true),
  isFavorite: boolean("is_favorite").default(false),
  isHidden: boolean("is_hidden").default(false),
  sortOrder: integer("sort_order").default(0),
  imageGenerationsCount: integer("image_generations_count").default(0), // Track image generation count
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  categoryIdIdx: index("dishes_category_id_idx").on(table.categoryId),
  sortOrderIdx: index("dishes_sort_order_idx").on(table.sortOrder),
  isFavoriteIdx: index("dishes_is_favorite_idx").on(table.isFavorite),
  isHiddenIdx: index("dishes_is_hidden_idx").on(table.isHidden),
  availableIdx: index("dishes_available_idx").on(table.available),
}));

// Global translation cache for cross-restaurant translation reuse
export const translationCache = pgTable("translation_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentHash: text("content_hash").notNull(), // SHA-256 hash of normalized source text + field type
  sourceLang: text("source_lang").notNull(),
  targetLang: text("target_lang").notNull(),
  sourceText: text("source_text").notNull(), // Original text for debugging
  translatedText: text("translated_text").notNull(),
  fieldType: text("field_type").notNull(), // 'dish_name' | 'dish_description' | 'ingredient' | 'category_name'
  usageCount: integer("usage_count").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Unique constraint for hash + target language + field type
  contentHashLangTypeIdx: index("translation_cache_hash_lang_type_idx").on(table.contentHash, table.targetLang, table.fieldType),
  contentHashIdx: index("translation_cache_content_hash_idx").on(table.contentHash),
}));

// Feedback and bug reports table
export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }), // Optional, can be anonymous
  email: text("email"), // For contact back
  type: text("type").notNull(), // "bug" | "suggestion" | "feature_request"
  title: text("title").notNull(),
  description: text("description").notNull(),
  photos: text("photos").array(), // Array of photo URLs
  status: text("status").notNull().default("open"), // "open" | "in_progress" | "resolved" | "closed"
  priority: text("priority").notNull().default("medium"), // "low" | "medium" | "high" | "critical"
  browserInfo: jsonb("browser_info"), // User agent, viewport, etc.
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("feedback_user_id_idx").on(table.userId),
  typeIdx: index("feedback_type_idx").on(table.type),
  statusIdx: index("feedback_status_idx").on(table.status),
  createdAtIdx: index("feedback_created_at_idx").on(table.createdAt),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertRestaurantSchema = createInsertSchema(restaurants).omit({
  id: true,
  userId: true,
  slug: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertDishSchema = createInsertSchema(dishes).omit({
  id: true,
  createdAt: true,
}).extend({
  price: z.coerce.string(),
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Dish = typeof dishes.$inferSelect;
export type InsertDish = z.infer<typeof insertDishSchema>;

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

export type TranslationCache = typeof translationCache.$inferSelect;

// Extended types for API responses
export type RestaurantWithCategories = Restaurant & {
  categories: (Category & {
    dishes: Dish[];
  })[];
};

export type PublicMenu = {
  restaurant: Pick<Restaurant, 'name' | 'city' | 'phone' | 'currency' | 'language' | 'logo' | 'design' | 'banner' | 'favoritesTitle' | 'targetLanguages'>;
  categories: (Category & {
    dishes: Dish[];
  })[];
};
