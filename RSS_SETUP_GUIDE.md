# FlipNews RSS Feed Setup Guide

This guide will help you set up the RSS feed functionality in your FlipNews application.

## Prerequisites

1. Make sure you have set up your Supabase environment variables in a `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. Make sure you have installed all dependencies:
   ```
   npm install
   ```

## Setup Steps

### 1. Initialize the Database

Run the database initialization script to create the necessary tables:

```bash
npm run init-db
```

This script will:
- Create the `rss_feeds` table if it doesn't exist
- Add `rss_feed_id` and `rss_item_guid` columns to the `news_articles` table if they don't exist

### 2. Set Up RSS Functionality

Run the RSS setup script to create a default system user and RSS category:

```bash
npm run setup-rss
```

This script will:
- Create a system user for automated RSS feed processing
- Create an RSS category for categorizing RSS feed articles

### 3. Or Run Both Scripts at Once

You can run both scripts with a single command:

```bash
npm run setup
```

## Using RSS Feeds

Once the setup is complete, you can use the RSS feed functionality:

1. Go to the Admin panel at `/admin`
2. Navigate to the RSS Feeds section at `/admin/rss`
3. Click "Add New Feed" to add a new RSS feed
4. Fill in the required information:
   - Feed Name: A descriptive name for the feed
   - RSS URL: The URL of the RSS feed
   - Category: Select a category for the articles
   - Author: Select a user who will be shown as the author of the articles
   - Fetch Frequency: How often to check for new articles (in minutes)
   - Active: Whether to automatically fetch and import articles

5. Click "Save Feed" to add the feed

## Troubleshooting

If you encounter any issues:

1. **Database Connection Issues**:
   - Make sure your Supabase environment variables are correctly set
   - Check if your Supabase project is active and accessible

2. **RSS Feed Not Working**:
   - Verify that the RSS feed URL is valid and accessible
   - Check if the feed is in a supported format (RSS 2.0, Atom, etc.)

3. **Images Not Displaying**:
   - Make sure your Supabase storage buckets are properly configured
   - Check if the image URLs in the RSS feed are accessible

4. **Category Issues**:
   - Make sure you have created categories in the admin panel
   - If using the default RSS category, make sure it was created by the setup script

## Manual Database Setup

If the automatic setup scripts don't work, you can manually set up the database:

1. Create the `rss_feeds` table:
   ```sql
   CREATE TABLE IF NOT EXISTS rss_feeds (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name VARCHAR(255) NOT NULL,
     url TEXT NOT NULL,
     category_id UUID REFERENCES categories(id),
     user_id UUID,
     active BOOLEAN DEFAULT true,
     auto_fetch BOOLEAN DEFAULT true,
     last_fetched TIMESTAMP WITH TIME ZONE,
     fetch_interval INTEGER DEFAULT 60,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. Add columns to the `news_articles` table:
   ```sql
   ALTER TABLE news_articles 
   ADD COLUMN IF NOT EXISTS rss_feed_id UUID REFERENCES rss_feeds(id);
   
   ALTER TABLE news_articles 
   ADD COLUMN IF NOT EXISTS rss_item_guid TEXT;
   ```

3. Create a system user:
   ```sql
   INSERT INTO users (name, email, role, profile_pic, bio)
   VALUES (
     'System',
     'system@flipnews.app',
     'system',
     '/images/system-avatar.png',
     'System user for automated tasks'
   );
   ```

4. Create an RSS category:
   ```sql
   INSERT INTO categories (name, slug)
   VALUES ('RSS', 'rss');
   ```
