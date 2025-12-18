import { db } from '../db';
import { translationCache } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import crypto from 'crypto';

export type FieldType = 'dish_name' | 'dish_description' | 'ingredient' | 'category_name';

/**
 * Generate consistent SHA-256 hash for source text
 * Normalizes text (lowercase, trim, collapse whitespace) to catch equivalent translations
 */
function generateContentHash(text: string, fieldType: FieldType): string {
  const normalized = text.toLowerCase().trim().replace(/\s+/g, ' ');
  const input = `${fieldType}:${normalized}`;
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

/**
 * Look up cached translation
 * Returns the translated text if found, null otherwise
 */
export async function getCachedTranslation(
  sourceText: string,
  targetLang: string,
  fieldType: FieldType
): Promise<string | null> {
  const hash = generateContentHash(sourceText, fieldType);

  try {
    const [cached] = await db
      .select()
      .from(translationCache)
      .where(and(
        eq(translationCache.contentHash, hash),
        eq(translationCache.targetLang, targetLang),
        eq(translationCache.fieldType, fieldType)
      ))
      .limit(1);

    if (cached) {
      // Increment usage count asynchronously (non-blocking)
      db.update(translationCache)
        .set({
          usageCount: sql`${translationCache.usageCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(translationCache.id, cached.id))
        .catch(err => console.error('[TranslationCache] Usage update error:', err));

      console.log(`[TranslationCache] HIT: "${sourceText.substring(0, 30)}..." -> ${targetLang}`);
      return cached.translatedText;
    }

    console.log(`[TranslationCache] MISS: "${sourceText.substring(0, 30)}..." -> ${targetLang}`);
    return null;
  } catch (error) {
    console.error('[TranslationCache] Lookup error:', error);
    return null;
  }
}

/**
 * Store translation in cache
 */
export async function cacheTranslation(
  sourceText: string,
  sourceLang: string,
  targetLang: string,
  translatedText: string,
  fieldType: FieldType
): Promise<void> {
  const hash = generateContentHash(sourceText, fieldType);

  try {
    await db
      .insert(translationCache)
      .values({
        contentHash: hash,
        sourceLang,
        targetLang,
        sourceText,
        translatedText,
        fieldType,
      })
      .onConflictDoNothing(); // Skip if already exists

    console.log(`[TranslationCache] STORED: "${sourceText.substring(0, 30)}..." -> "${translatedText.substring(0, 30)}..." (${targetLang})`);
  } catch (error) {
    console.error('[TranslationCache] Store error:', error);
  }
}

/**
 * Batch lookup for multiple items at once
 * More efficient than multiple single lookups
 */
export async function getCachedTranslationsBatch(
  items: Array<{ text: string; fieldType: FieldType }>,
  targetLang: string
): Promise<Map<string, string>> {
  const result = new Map<string, string>();

  if (items.length === 0) return result;

  try {
    // Generate hashes for all items
    const hashToText = new Map<string, string>();
    for (const item of items) {
      const hash = generateContentHash(item.text, item.fieldType);
      hashToText.set(hash, item.text);
    }

    const hashes = Array.from(hashToText.keys());

    // Query all at once
    const cached = await db
      .select()
      .from(translationCache)
      .where(and(
        sql`${translationCache.contentHash} IN (${sql.join(hashes.map(h => sql`${h}`), sql`, `)})`,
        eq(translationCache.targetLang, targetLang)
      ));

    // Build result map (sourceText -> translatedText)
    for (const entry of cached) {
      const sourceText = hashToText.get(entry.contentHash);
      if (sourceText) {
        result.set(sourceText, entry.translatedText);
      }
    }

    console.log(`[TranslationCache] Batch lookup: ${result.size}/${items.length} hits for ${targetLang}`);
  } catch (error) {
    console.error('[TranslationCache] Batch lookup error:', error);
  }

  return result;
}

/**
 * Get cache statistics for monitoring
 */
export async function getCacheStats(): Promise<{
  totalEntries: number;
  totalUsages: number;
  byFieldType: Record<string, number>;
  byTargetLang: Record<string, number>;
}> {
  try {
    const [stats] = await db
      .select({
        totalEntries: sql<number>`count(*)`,
        totalUsages: sql<number>`sum(${translationCache.usageCount})`,
      })
      .from(translationCache);

    const byFieldType = await db
      .select({
        fieldType: translationCache.fieldType,
        count: sql<number>`count(*)`
      })
      .from(translationCache)
      .groupBy(translationCache.fieldType);

    const byTargetLang = await db
      .select({
        targetLang: translationCache.targetLang,
        count: sql<number>`count(*)`
      })
      .from(translationCache)
      .groupBy(translationCache.targetLang);

    return {
      totalEntries: Number(stats?.totalEntries || 0),
      totalUsages: Number(stats?.totalUsages || 0),
      byFieldType: Object.fromEntries(byFieldType.map(r => [r.fieldType, Number(r.count)])),
      byTargetLang: Object.fromEntries(byTargetLang.map(r => [r.targetLang, Number(r.count)])),
    };
  } catch (error) {
    console.error('[TranslationCache] Stats error:', error);
    return {
      totalEntries: 0,
      totalUsages: 0,
      byFieldType: {},
      byTargetLang: {},
    };
  }
}
