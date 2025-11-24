CREATE TABLE "ads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"text_content" text,
	"image_url" text,
	"video_url" text,
	"video_type" varchar(50),
	"link_url" text,
	"frequency" integer DEFAULT 5,
	"active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "news_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"summary" text,
	"category_id" varchar(255),
	"image_url" text,
	"video_url" text,
	"video_type" varchar(50),
	"author" varchar(255),
	"likes" integer DEFAULT 0,
	"views" integer DEFAULT 0,
	"published" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"tags" text[],
	"rss_feed_id" uuid,
	"rss_item_guid" text
);
--> statement-breakpoint
CREATE TABLE "rss_feed_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feed_id" uuid,
	"guid" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"link" text,
	"pub_date" timestamp with time zone,
	"news_article_id" uuid,
	"imported" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rss_feeds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"category_id" uuid,
	"user_id" uuid,
	"active" boolean DEFAULT true,
	"last_fetched" timestamp with time zone,
	"fetch_frequency" integer DEFAULT 60,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "rss_feeds_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" varchar(255) PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text,
	"role" varchar(50) DEFAULT 'user' NOT NULL,
	"profile_pic" text,
	"bio" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_rss_feed_id_rss_feeds_id_fk" FOREIGN KEY ("rss_feed_id") REFERENCES "public"."rss_feeds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rss_feed_items" ADD CONSTRAINT "rss_feed_items_feed_id_rss_feeds_id_fk" FOREIGN KEY ("feed_id") REFERENCES "public"."rss_feeds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rss_feed_items" ADD CONSTRAINT "rss_feed_items_news_article_id_news_articles_id_fk" FOREIGN KEY ("news_article_id") REFERENCES "public"."news_articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rss_feeds" ADD CONSTRAINT "rss_feeds_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;