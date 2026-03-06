-- Remove duplicate dishes within the same category (keep the first one by created_at)
DELETE FROM "dishes" a
  USING "dishes" b
  WHERE a.id > b.id
    AND a.category_id = b.category_id
    AND a.name = b.name;

-- Add unique constraint on (category_id, name)
CREATE UNIQUE INDEX IF NOT EXISTS "dishes_category_id_name_idx" ON "dishes" ("category_id", "name");
