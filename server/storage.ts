import { type User, type InsertUser, type Restaurant, type InsertRestaurant, type Category, type InsertCategory, type Dish, type InsertDish, type RestaurantWithCategories, type PublicMenu, users, restaurants, categories, dishes } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, or, ilike, asc, sql } from "drizzle-orm";
import { encryptToken, decryptToken } from "./utils/crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User>;

  // Restaurant operations
  getRestaurant(id: string): Promise<Restaurant | undefined>;
  getRestaurantBySlug(slug: string): Promise<Restaurant | undefined>;
  getRestaurantsByUserId(userId: string): Promise<Restaurant[]>;
  createRestaurant(restaurant: InsertRestaurant & { userId: string }): Promise<Restaurant>;
  updateRestaurant(id: string, restaurant: Partial<Restaurant>): Promise<Restaurant>;
  deleteRestaurant(id: string): Promise<void>;

  // Category operations
  getCategoriesByRestaurantId(restaurantId: string): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<Category>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Dish operations
  getDishesByCategoryId(categoryId: string): Promise<Dish[]>;
  getDish(id: string): Promise<Dish | undefined>;
  createDish(dish: InsertDish): Promise<Dish>;
  updateDish(id: string, dish: Partial<Dish>): Promise<Dish>;
  deleteDish(id: string): Promise<void>;
  incrementDishImageGenerations(id: string): Promise<void>;

  // Complex queries
  getRestaurantWithCategories(restaurantId: string): Promise<RestaurantWithCategories | undefined>;
  getPublicMenu(restaurantSlug: string): Promise<PublicMenu | undefined>;
  searchDishes(restaurantId: string, query: string, tags?: string[]): Promise<Dish[]>;
}



// Decrypt aiToken when reading restaurant from DB
function decryptRestaurant<T extends { aiToken?: string | null }>(r: T): T {
  if (r && r.aiToken) {
    return { ...r, aiToken: decryptToken(r.aiToken) };
  }
  return r;
}

// Encrypt aiToken when writing restaurant to DB
function encryptRestaurantData<T extends { aiToken?: string | null }>(data: T): T {
  if (data && data.aiToken) {
    return { ...data, aiToken: encryptToken(data.aiToken) };
  }
  return data;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.emailVerificationToken, token));
    return user || undefined;
  }

  // Restaurant operations
  async getRestaurant(id: string): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return restaurant ? decryptRestaurant(restaurant) : undefined;
  }

  async getRestaurantBySlug(slug: string): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.slug, slug));
    return restaurant ? decryptRestaurant(restaurant) : undefined;
  }

  async getRestaurantsByUserId(userId: string): Promise<Restaurant[]> {
    const results = await db.select().from(restaurants).where(eq(restaurants.userId, userId));
    return results.map(decryptRestaurant);
  }

  async createRestaurant(restaurantData: InsertRestaurant & { userId: string }): Promise<Restaurant> {
    // Generate slug from restaurant name
    const slug = this.generateSlug(restaurantData.name);

    // Set default favoritesTitle based on restaurant language
    const favoritesTitle = restaurantData.favoritesTitle || this.getDefaultFavoritesTitle(restaurantData.language || 'ru');

    const [restaurant] = await db
      .insert(restaurants)
      .values(encryptRestaurantData({
        ...restaurantData,
        slug,
        favoritesTitle,
      }))
      .returning();
    return decryptRestaurant(restaurant);
  }

  private getDefaultFavoritesTitle(language: string): string {
    const titles: Record<string, string> = {
      ru: 'Избранное',
      en: 'Favorites',
      de: 'Favoriten',
      fr: 'Favoris',
      es: 'Favoritos',
      it: 'Preferiti',
      tr: 'Favoriler',
      uk: 'Вибране',
    };
    return titles[language] || titles['en'];
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9а-я]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(2, 8);
  }

  async updateRestaurant(id: string, restaurantData: Partial<Restaurant>): Promise<Restaurant> {
    const [restaurant] = await db
      .update(restaurants)
      .set(encryptRestaurantData(restaurantData))
      .where(eq(restaurants.id, id))
      .returning();
    return decryptRestaurant(restaurant);
  }

  async deleteRestaurant(id: string): Promise<void> {
    await db.delete(restaurants).where(eq(restaurants.id, id));
  }

  // Category operations - Optimized with ordering
  async getCategoriesByRestaurantId(restaurantId: string): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.restaurantId, restaurantId))
      .orderBy(categories.sortOrder);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(categoryData)
      .returning();
    return category;
  }

  async updateCategory(id: string, categoryData: Partial<Category>): Promise<Category> {
    const [category] = await db
      .update(categories)
      .set(categoryData)
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Dish operations - Optimized with ordering
  async getDishesByCategoryId(categoryId: string): Promise<Dish[]> {
    return await db
      .select()
      .from(dishes)
      .where(eq(dishes.categoryId, categoryId))
      .orderBy(dishes.sortOrder);
  }

  async getDish(id: string): Promise<Dish | undefined> {
    const [dish] = await db.select().from(dishes).where(eq(dishes.id, id));
    return dish || undefined;
  }

  async createDish(dishData: InsertDish): Promise<Dish> {
    const [dish] = await db
      .insert(dishes)
      .values(dishData)
      .returning();
    return dish;
  }

  async updateDish(id: string, dishData: Partial<Dish>): Promise<Dish> {
    const [dish] = await db
      .update(dishes)
      .set(dishData)
      .where(eq(dishes.id, id))
      .returning();
    return dish;
  }

  async deleteDish(id: string): Promise<void> {
    await db.delete(dishes).where(eq(dishes.id, id));
  }

  async incrementDishImageGenerations(id: string): Promise<void> {
    await db
      .update(dishes)
      .set({ imageGenerationsCount: sql`COALESCE(image_generations_count, 0) + 1` })
      .where(eq(dishes.id, id));
  }

  // Complex queries - Optimized with JOIN to reduce DB calls
  async getRestaurantWithCategories(restaurantId: string): Promise<RestaurantWithCategories | undefined> {
    const restaurant = await this.getRestaurant(restaurantId);
    if (!restaurant) return undefined;

    // Use single query with join to get all data at once
    const result = await db
      .select({
        category: categories,
        dish: dishes,
      })
      .from(categories)
      .leftJoin(dishes, eq(dishes.categoryId, categories.id))
      .where(eq(categories.restaurantId, restaurantId))
      .orderBy(categories.sortOrder, dishes.sortOrder);

    // Group results by category
    const categoriesMap = new Map<string, any>();
    
    for (const row of result) {
      const categoryId = row.category.id;
      
      if (!categoriesMap.has(categoryId)) {
        categoriesMap.set(categoryId, {
          ...row.category,
          dishes: [],
        });
      }
      
      if (row.dish) {
        categoriesMap.get(categoryId)!.dishes.push(row.dish);
      }
    }

    return {
      ...restaurant,
      categories: Array.from(categoriesMap.values()),
    };
  }

  async getPublicMenu(restaurantSlug: string): Promise<PublicMenu | undefined> {
    const restaurant = await this.getRestaurantBySlug(restaurantSlug);
    if (!restaurant) return undefined;

    // Optimized single query with join and filtering
    const result = await db
      .select({
        category: categories,
        dish: dishes,
      })
      .from(categories)
      .leftJoin(dishes, and(
        eq(dishes.categoryId, categories.id),
        eq(dishes.isHidden, false) // Filter hidden dishes at DB level
      ))
      .where(eq(categories.restaurantId, restaurant.id))
      .orderBy(categories.sortOrder, dishes.sortOrder);

    // Group results by category
    const categoriesMap = new Map<string, any>();
    
    for (const row of result) {
      const categoryId = row.category.id;
      
      if (!categoriesMap.has(categoryId)) {
        categoriesMap.set(categoryId, {
          ...row.category,
          dishes: [],
        });
      }
      
      if (row.dish) {
        categoriesMap.get(categoryId)!.dishes.push(row.dish);
      }
    }

    return {
      restaurant: {
        name: restaurant.name,
        city: restaurant.city,
        phone: restaurant.phone,
        currency: restaurant.currency,
        language: restaurant.language,
        logo: restaurant.logo,
        design: restaurant.design,
        banner: restaurant.banner,
        favoritesTitle: restaurant.favoritesTitle,
        targetLanguages: restaurant.targetLanguages,
      },
      categories: Array.from(categoriesMap.values()),
    };
  }

  async searchDishes(restaurantId: string, query: string, tags?: string[]): Promise<Dish[]> {
    // Get category IDs for this restaurant first
    const restaurantCategories = await this.getCategoriesByRestaurantId(restaurantId);
    if (restaurantCategories.length === 0) return [];

    const categoryIds = restaurantCategories.map(c => c.id);

    // Escape ILIKE wildcards in user input
    const escapeIlike = (str: string) => str.replace(/%/g, '\\%').replace(/_/g, '\\_');
    const safeQuery = escapeIlike(query);

    const results = await db
      .select()
      .from(dishes)
      .where(
        and(
          sql`${dishes.categoryId} IN (${sql.join(categoryIds.map(id => sql`${id}`), sql`, `)})`,
          or(
            ilike(dishes.name, `%${safeQuery}%`),
            ilike(dishes.description, `%${safeQuery}%`)
          )
        )
      );

    return results;
  }
}

export const storage = new DatabaseStorage();
