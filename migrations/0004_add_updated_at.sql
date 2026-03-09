-- Add updated_at columns to tables that are missing them
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP DEFAULT now();
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP DEFAULT now();
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP DEFAULT now();
ALTER TABLE "dishes" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP DEFAULT now();
