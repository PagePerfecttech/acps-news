import { pgTable, uuid, varchar, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const categories = pgTable('categories', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    created_at: timestamp('created_at').defaultNow(),
});

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: text('password'),
    role: varchar('role', { length: 50 }).default('user').notNull(),
    profile_pic: text('profile_pic'),
    bio: text('bio'),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
});

export const rssFeeds = pgTable('rss_feeds', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    url: text('url').notNull().unique(),
    category_id: uuid('category_id').references(() => categories.id),
    user_id: uuid('user_id'), // referencing users.id but maybe nullable
    active: boolean('active').default(true),
    last_fetched: timestamp('last_fetched', { withTimezone: true }),
    fetch_frequency: integer('fetch_frequency').default(60),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const newsArticles = pgTable('news_articles', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content').notNull(),
    summary: text('summary'),
    category_id: varchar('category_id', { length: 255 }), // Keeping as varchar to match existing
    image_url: text('image_url'),
    video_url: text('video_url'),
    video_type: varchar('video_type', { length: 50 }),
    author: varchar('author', { length: 255 }),
    likes: integer('likes').default(0),
    views: integer('views').default(0),
    published: boolean('published').default(true),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    tags: text('tags').array(),
    rss_feed_id: uuid('rss_feed_id').references(() => rssFeeds.id),
    rss_item_guid: text('rss_item_guid'),
});

export const rssFeedItems = pgTable('rss_feed_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    feed_id: uuid('feed_id').references(() => rssFeeds.id, { onDelete: 'cascade' }),
    guid: text('guid').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    link: text('link'),
    pub_date: timestamp('pub_date', { withTimezone: true }),
    news_article_id: uuid('news_article_id').references(() => newsArticles.id),
    imported: boolean('imported').default(false),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const ads = pgTable('ads', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    text_content: text('text_content'),
    image_url: text('image_url'),
    video_url: text('video_url'),
    video_type: varchar('video_type', { length: 50 }),
    link_url: text('link_url'),
    frequency: integer('frequency').default(5),
    active: boolean('active').default(true),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const siteSettings = pgTable('site_settings', {
    key: varchar('key', { length: 255 }).primaryKey(),
    value: text('value').notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
