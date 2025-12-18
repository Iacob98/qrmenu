import { storage } from '../storage';
import { createAIService } from './ai';
import type { Restaurant, Category, Dish } from '@shared/schema';

export interface TranslationProgress {
  total: number;
  completed: number;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  errors: string[];
  startedAt: Date;
  completedAt?: Date;
}

// In-memory job tracking (survives within process lifetime)
const translationJobs = new Map<string, TranslationProgress>();

/**
 * Start bulk translation of all restaurant content for new languages
 * Returns a job ID for tracking progress
 */
export async function translateRestaurantContent(
  restaurantId: string,
  newLanguages: string[]
): Promise<string> {
  const jobId = `trans-${restaurantId}-${Date.now()}`;

  const restaurant = await storage.getRestaurant(restaurantId);
  if (!restaurant) {
    throw new Error('Restaurant not found');
  }

  // Get all categories and dishes
  const categories = await storage.getCategoriesByRestaurantId(restaurantId);
  const allDishes: Dish[] = [];

  for (const category of categories) {
    const dishes = await storage.getDishesByCategoryId(category.id);
    allDishes.push(...dishes);
  }

  const totalItems = categories.length + allDishes.length;

  // Initialize progress tracking
  translationJobs.set(jobId, {
    total: totalItems,
    completed: 0,
    status: 'in_progress',
    errors: [],
    startedAt: new Date(),
  });

  console.log(`[TranslationService] Started job ${jobId}: ${totalItems} items to translate to ${newLanguages.join(', ')}`);

  // Run translation in background (non-blocking)
  translateInBackground(jobId, restaurant, categories, allDishes, newLanguages)
    .catch(err => {
      console.error(`[TranslationService] Job ${jobId} failed:`, err);
      const progress = translationJobs.get(jobId);
      if (progress) {
        progress.status = 'error';
        progress.errors.push(err.message);
      }
    });

  return jobId;
}

/**
 * Background translation worker
 */
async function translateInBackground(
  jobId: string,
  restaurant: Restaurant,
  categories: Category[],
  dishes: Dish[],
  targetLangs: string[]
): Promise<void> {
  const progress = translationJobs.get(jobId)!;
  const sourceLang = restaurant.language || 'ru';

  // Setup AI Service
  const provider = restaurant.aiProvider || (process.env.OPENROUTER_API_KEY ? 'openrouter' : 'openai');
  const apiKey = restaurant.aiToken || (provider === 'openrouter' ? process.env.OPENROUTER_API_KEY : process.env.OPENAI_API_KEY);

  if (!apiKey) {
    progress.status = 'error';
    progress.errors.push('No AI API key configured for this restaurant');
    console.error(`[TranslationService] Job ${jobId}: No AI API key`);
    return;
  }

  const model = restaurant.aiModel || (provider === 'openrouter' ? 'anthropic/claude-3.5-sonnet' : 'gpt-4o');
  const aiService = createAIService(apiKey, provider, model);

  // Translate categories first
  for (const category of categories) {
    try {
      const existingTranslations = category.translations || {};

      // Only translate to languages that don't exist yet
      const missingLangs = targetLangs.filter(lang => !existingTranslations[lang]?.name);

      if (missingLangs.length > 0) {
        console.log(`[TranslationService] Translating category "${category.name}" to ${missingLangs.join(', ')}`);

        const translations = await aiService.translateCategoryName(
          category.name,
          sourceLang,
          missingLangs
        );

        // Merge with existing translations
        await storage.updateCategory(category.id, {
          translations: { ...existingTranslations, ...translations }
        });
      }
    } catch (err) {
      const errorMsg = `Category "${category.name}": ${err instanceof Error ? err.message : 'Unknown error'}`;
      console.error(`[TranslationService] ${errorMsg}`);
      progress.errors.push(errorMsg);
    }

    progress.completed++;
  }

  // Translate dishes (with small delay between to avoid rate limits)
  for (const dish of dishes) {
    try {
      const existingTranslations = dish.translations || {};

      // Only translate to languages that don't have all fields
      const missingLangs = targetLangs.filter(lang => {
        const existing = existingTranslations[lang];
        return !existing?.name; // At minimum need name
      });

      if (missingLangs.length > 0) {
        console.log(`[TranslationService] Translating dish "${dish.name}" to ${missingLangs.join(', ')}`);

        const translations = await aiService.translateContent(
          {
            name: dish.name,
            description: dish.description || undefined,
            ingredients: dish.ingredients || undefined,
          },
          sourceLang,
          missingLangs
        );

        // Merge with existing translations
        await storage.updateDish(dish.id, {
          translations: { ...existingTranslations, ...translations }
        });
      }
    } catch (err) {
      const errorMsg = `Dish "${dish.name}": ${err instanceof Error ? err.message : 'Unknown error'}`;
      console.error(`[TranslationService] ${errorMsg}`);
      progress.errors.push(errorMsg);
    }

    progress.completed++;

    // Small delay between dishes to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  progress.status = 'completed';
  progress.completedAt = new Date();

  const duration = (progress.completedAt.getTime() - progress.startedAt.getTime()) / 1000;
  console.log(`[TranslationService] Job ${jobId} completed: ${progress.completed}/${progress.total} items in ${duration.toFixed(1)}s (${progress.errors.length} errors)`);
}

/**
 * Get progress of a translation job
 */
export function getTranslationProgress(jobId: string): TranslationProgress | null {
  return translationJobs.get(jobId) || null;
}

/**
 * Cleanup old completed jobs (call periodically)
 */
export function cleanupOldJobs(maxAgeMinutes: number = 60): void {
  const now = Date.now();

  for (const [jobId, progress] of translationJobs.entries()) {
    if (progress.status === 'completed' || progress.status === 'error') {
      const jobAge = now - progress.startedAt.getTime();
      if (jobAge > maxAgeMinutes * 60 * 1000) {
        translationJobs.delete(jobId);
        console.log(`[TranslationService] Cleaned up old job ${jobId}`);
      }
    }
  }
}
