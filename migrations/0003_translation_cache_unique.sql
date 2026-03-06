-- Drop existing non-unique index and recreate as unique
-- First deduplicate any existing rows (keep the one with highest usage_count)
DELETE FROM "translation_cache" a
  USING "translation_cache" b
  WHERE a.id < b.id
    AND a.content_hash = b.content_hash
    AND a.target_lang = b.target_lang
    AND a.field_type = b.field_type;

DROP INDEX IF EXISTS "translation_cache_hash_lang_type_idx";
CREATE UNIQUE INDEX "translation_cache_hash_lang_type_idx" ON "translation_cache" ("content_hash", "target_lang", "field_type");
