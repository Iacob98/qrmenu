import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, boolean, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const restaurants = pgTable("restaurants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  city: text("city"),
  phone: text("phone"),
  currency: text("currency").notNull().default("EUR"),
  language: text("language").notNull().default("ru"),
  slug: text("slug").unique(),
  aiProvider: text("ai_provider").default("openai"), // "openai" or "openrouter"
  aiToken: text("ai_token"),
  aiModel: text("ai_model"), // For OpenRouter custom models
  logo: text("logo"),
  banner: text("banner"),
  design: jsonb("design"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").default(0),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow(),
});

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
  available: boolean("available").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

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

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Dish = typeof dishes.$inferSelect;
export type InsertDish = z.infer<typeof insertDishSchema>;

// Extended types for API responses
export type RestaurantWithCategories = Restaurant & {
  categories: (Category & {
    dishes: Dish[];
  })[];
};

export type PublicMenu = {
  restaurant: Pick<Restaurant, 'name' | 'city' | 'phone' | 'currency' | 'language' | 'logo' | 'design' | 'banner'>;
  categories: (Category & {
    dishes: Dish[];
  })[];
};
