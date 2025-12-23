CREATE TABLE "categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" varchar NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0,
	"icon" text,
	"translations" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dishes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"image" text,
	"ingredients" text[],
	"nutrition" jsonb,
	"tags" text[],
	"translations" jsonb,
	"available" boolean DEFAULT true,
	"is_favorite" boolean DEFAULT false,
	"is_hidden" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"image_generations_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"email" text,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"photos" text[],
	"status" text DEFAULT 'open' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"browser_info" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"city" text,
	"phone" text,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"language" text DEFAULT 'ru' NOT NULL,
	"target_languages" text[] DEFAULT ARRAY['en', 'de']::text[],
	"slug" text,
	"ai_provider" text DEFAULT 'openai',
	"ai_token" text,
	"ai_model" text,
	"favorites_title" text DEFAULT 'Избранное',
	"logo" text,
	"banner" text,
	"design" jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "restaurants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "translation_cache" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_hash" text NOT NULL,
	"source_lang" text NOT NULL,
	"target_lang" text NOT NULL,
	"source_text" text NOT NULL,
	"translated_text" text NOT NULL,
	"field_type" text NOT NULL,
	"usage_count" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text,
	"email_verified" boolean DEFAULT false,
	"email_verification_token" text,
	"email_verification_expires" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "categories_restaurant_id_idx" ON "categories" USING btree ("restaurant_id");--> statement-breakpoint
CREATE INDEX "categories_sort_order_idx" ON "categories" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "dishes_category_id_idx" ON "dishes" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "dishes_sort_order_idx" ON "dishes" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "dishes_is_favorite_idx" ON "dishes" USING btree ("is_favorite");--> statement-breakpoint
CREATE INDEX "dishes_is_hidden_idx" ON "dishes" USING btree ("is_hidden");--> statement-breakpoint
CREATE INDEX "dishes_available_idx" ON "dishes" USING btree ("available");--> statement-breakpoint
CREATE INDEX "feedback_user_id_idx" ON "feedback" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "feedback_type_idx" ON "feedback" USING btree ("type");--> statement-breakpoint
CREATE INDEX "feedback_status_idx" ON "feedback" USING btree ("status");--> statement-breakpoint
CREATE INDEX "feedback_created_at_idx" ON "feedback" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "restaurants_user_id_idx" ON "restaurants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "restaurants_slug_idx" ON "restaurants" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "translation_cache_hash_lang_type_idx" ON "translation_cache" USING btree ("content_hash","target_lang","field_type");--> statement-breakpoint
CREATE INDEX "translation_cache_content_hash_idx" ON "translation_cache" USING btree ("content_hash");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_email_verification_token_idx" ON "users" USING btree ("email_verification_token");