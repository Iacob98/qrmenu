import { type User, type InsertUser, type Restaurant, type InsertRestaurant, type Category, type InsertCategory, type Dish, type InsertDish, type RestaurantWithCategories, type PublicMenu, users, restaurants, categories, dishes } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, or, ilike } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
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

  // Complex queries
  getRestaurantWithCategories(restaurantId: string): Promise<RestaurantWithCategories | undefined>;
  getPublicMenu(restaurantSlug: string): Promise<PublicMenu | undefined>;
  searchDishes(restaurantId: string, query: string, tags?: string[]): Promise<Dish[]>;
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

  // Restaurant operations
  async getRestaurant(id: string): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return restaurant || undefined;
  }

  async getRestaurantBySlug(slug: string): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.slug, slug));
    return restaurant || undefined;
  }

  async getRestaurantsByUserId(userId: string): Promise<Restaurant[]> {
    return await db.select().from(restaurants).where(eq(restaurants.userId, userId));
  }

  async createRestaurant(restaurantData: InsertRestaurant & { userId: string }): Promise<Restaurant> {
    // Generate slug from restaurant name
    const slug = this.generateSlug(restaurantData.name);
    
    const [restaurant] = await db
      .insert(restaurants)
      .values({
        ...restaurantData,
        slug,
      })
      .returning();
    return restaurant;
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
      .set(restaurantData)
      .where(eq(restaurants.id, id))
      .returning();
    return restaurant;
  }

  async deleteRestaurant(id: string): Promise<void> {
    await db.delete(restaurants).where(eq(restaurants.id, id));
  }

  // Category operations
  async getCategoriesByRestaurantId(restaurantId: string): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.restaurantId, restaurantId));
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

  // Dish operations
  async getDishesByCategoryId(categoryId: string): Promise<Dish[]> {
    return await db.select().from(dishes).where(eq(dishes.categoryId, categoryId));
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

  // Complex queries
  async getRestaurantWithCategories(restaurantId: string): Promise<RestaurantWithCategories | undefined> {
    const restaurant = await this.getRestaurant(restaurantId);
    if (!restaurant) return undefined;

    const categoriesData = await this.getCategoriesByRestaurantId(restaurantId);
    const categoriesWithDishes = await Promise.all(
      categoriesData.map(async (category) => ({
        ...category,
        dishes: await this.getDishesByCategoryId(category.id),
      }))
    );

    return {
      ...restaurant,
      categories: categoriesWithDishes,
    };
  }

  async getPublicMenu(restaurantSlug: string): Promise<PublicMenu | undefined> {
    const restaurant = await this.getRestaurantBySlug(restaurantSlug);
    if (!restaurant) return undefined;

    const categoriesData = await this.getCategoriesByRestaurantId(restaurant.id);
    const categoriesWithDishes = await Promise.all(
      categoriesData.map(async (category) => {
        // Get all dishes for category and filter out hidden ones for public view
        const allDishes = await this.getDishesByCategoryId(category.id);
        const visibleDishes = allDishes.filter(dish => !dish.isHidden);
        return {
          ...category,
          dishes: visibleDishes,
        };
      })
    );

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
      },
      categories: categoriesWithDishes,
    };
  }

  async searchDishes(restaurantId: string, query: string, tags?: string[]): Promise<Dish[]> {
    // This is a simplified search - in production you'd want full-text search
    let whereCondition = eq(dishes.categoryId, restaurantId);
    
    if (query) {
      whereCondition = and(
        whereCondition,
        or(
          ilike(dishes.name, `%${query}%`),
          ilike(dishes.description, `%${query}%`)
        )
      ) as any;
    }

    return await db.select().from(dishes).where(whereCondition);
  }
}

export const storage = new DatabaseStorage();
