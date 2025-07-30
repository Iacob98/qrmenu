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

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private restaurants: Map<string, Restaurant> = new Map();
  private categories: Map<string, Category> = new Map();
  private dishes: Map<string, Dish> = new Map();

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      name: insertUser.name || null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updateUser: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...updateUser };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Restaurant operations
  async getRestaurant(id: string): Promise<Restaurant | undefined> {
    return this.restaurants.get(id);
  }

  async getRestaurantBySlug(slug: string): Promise<Restaurant | undefined> {
    return Array.from(this.restaurants.values()).find(restaurant => restaurant.slug === slug);
  }

  async getRestaurantsByUserId(userId: string): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values()).filter(restaurant => restaurant.userId === userId);
  }

  async createRestaurant(data: InsertRestaurant & { userId: string }): Promise<Restaurant> {
    const id = randomUUID();
    const slug = this.generateSlug(data.name);
    const restaurant: Restaurant = { 
      ...data, 
      id, 
      slug,
      createdAt: new Date(),
      city: data.city || null,
      phone: data.phone || null,
      aiToken: data.aiToken || null,
      logo: data.logo || null,
      design: data.design || null,
      currency: data.currency || "EUR",
      language: data.language || "ru"
    };
    this.restaurants.set(id, restaurant);
    return restaurant;
  }

  async updateRestaurant(id: string, updateRestaurant: Partial<Restaurant>): Promise<Restaurant> {
    const restaurant = this.restaurants.get(id);
    if (!restaurant) throw new Error("Restaurant not found");
    
    const updatedRestaurant = { ...restaurant, ...updateRestaurant };
    this.restaurants.set(id, updatedRestaurant);
    return updatedRestaurant;
  }

  async deleteRestaurant(id: string): Promise<void> {
    // Delete all related categories and dishes first
    const categories = await this.getCategoriesByRestaurantId(id);
    for (const category of categories) {
      await this.deleteCategory(category.id);
    }
    this.restaurants.delete(id);
  }

  // Category operations
  async getCategoriesByRestaurantId(restaurantId: string): Promise<Category[]> {
    return Array.from(this.categories.values())
      .filter(category => category.restaurantId === restaurantId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = { 
      ...insertCategory, 
      id, 
      createdAt: new Date(),
      sortOrder: insertCategory.sortOrder || null,
      icon: insertCategory.icon || null
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: string, updateCategory: Partial<Category>): Promise<Category> {
    const category = this.categories.get(id);
    if (!category) throw new Error("Category not found");
    
    const updatedCategory = { ...category, ...updateCategory };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<void> {
    // Delete all dishes in this category first
    const dishes = await this.getDishesByCategoryId(id);
    for (const dish of dishes) {
      this.dishes.delete(dish.id);
    }
    this.categories.delete(id);
  }

  // Dish operations
  async getDishesByCategoryId(categoryId: string): Promise<Dish[]> {
    return Array.from(this.dishes.values())
      .filter(dish => dish.categoryId === categoryId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async getDish(id: string): Promise<Dish | undefined> {
    return this.dishes.get(id);
  }

  async createDish(insertDish: InsertDish): Promise<Dish> {
    const id = randomUUID();
    const dish: Dish = { 
      ...insertDish, 
      id, 
      createdAt: new Date(),
      image: insertDish.image || null,
      description: insertDish.description || null,
      ingredients: insertDish.ingredients || null,
      nutrition: insertDish.nutrition || null,
      tags: insertDish.tags || null,
      available: insertDish.available ?? null,
      sortOrder: insertDish.sortOrder || null
    };
    this.dishes.set(id, dish);
    return dish;
  }

  async updateDish(id: string, updateDish: Partial<Dish>): Promise<Dish> {
    const dish = this.dishes.get(id);
    if (!dish) throw new Error("Dish not found");
    
    const updatedDish = { ...dish, ...updateDish };
    this.dishes.set(id, updatedDish);
    return updatedDish;
  }

  async deleteDish(id: string): Promise<void> {
    this.dishes.delete(id);
  }

  // Complex queries
  async getRestaurantWithCategories(restaurantId: string): Promise<RestaurantWithCategories | undefined> {
    const restaurant = await this.getRestaurant(restaurantId);
    if (!restaurant) return undefined;

    const categories = await this.getCategoriesByRestaurantId(restaurantId);
    const categoriesWithDishes = await Promise.all(
      categories.map(async (category) => ({
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

    const categories = await this.getCategoriesByRestaurantId(restaurant.id);
    const categoriesWithDishes = await Promise.all(
      categories.map(async (category) => ({
        ...category,
        dishes: await this.getDishesByCategoryId(category.id),
      }))
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
      },
      categories: categoriesWithDishes,
    };
  }

  async searchDishes(restaurantId: string, query: string, tags?: string[]): Promise<Dish[]> {
    const categories = await this.getCategoriesByRestaurantId(restaurantId);
    const allDishes: Dish[] = [];
    
    for (const category of categories) {
      const dishes = await this.getDishesByCategoryId(category.id);
      allDishes.push(...dishes);
    }

    let filteredDishes = allDishes;

    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredDishes = filteredDishes.filter(dish =>
        dish.name.toLowerCase().includes(lowerQuery) ||
        dish.description?.toLowerCase().includes(lowerQuery) ||
        dish.ingredients?.some(ingredient => ingredient.toLowerCase().includes(lowerQuery))
      );
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      filteredDishes = filteredDishes.filter(dish =>
        tags.every(tag => dish.tags?.includes(tag))
      );
    }

    return filteredDishes;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9а-я]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(2, 8);
  }
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
      categoriesData.map(async (category) => ({
        ...category,
        dishes: await this.getDishesByCategoryId(category.id),
      }))
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
