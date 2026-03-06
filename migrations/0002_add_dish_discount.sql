ALTER TABLE "dishes" ADD COLUMN "discount_enabled" boolean DEFAULT false;
ALTER TABLE "dishes" ADD COLUMN "discount_price" numeric(10, 2);
