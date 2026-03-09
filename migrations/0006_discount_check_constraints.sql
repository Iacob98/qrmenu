-- Ensure discount_price is positive when set
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_discount_price_positive"
  CHECK ("discount_price" IS NULL OR "discount_price" > 0);

-- Ensure discount_price is less than regular price
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_discount_price_less_than_price"
  CHECK ("discount_price" IS NULL OR "discount_price" < "price");
