# FlipNEWS Database Fix Guide

This guide will help you fix the database issues with your FlipNEWS application. The issues are related to missing or improperly configured tables in your Supabase database.

## Issue Summary

The following features are not working properly because of database issues:
- Creating categories
- Saving settings
- RSS feeds
- Author creation
- Ads

## Solution

### 1. Create Required Tables

You need to create the following tables in your Supabase database:

#### Categories Table
```sql
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### News Articles Table
```sql
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  category_id UUID REFERENCES categories(id),
  image_url TEXT,
  author VARCHAR(255),
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  rss_feed_id UUID,
  rss_item_guid TEXT
);
```

#### Users Table
```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password TEXT,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  profile_pic TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### RSS Feeds Table
```sql
CREATE TABLE IF NOT EXISTS rss_feeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES categories(id),
  user_id UUID,
  active BOOLEAN DEFAULT true,
  last_fetched TIMESTAMP WITH TIME ZONE,
  fetch_frequency INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### RSS Feed Items Table
```sql
CREATE TABLE IF NOT EXISTS rss_feed_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_id UUID REFERENCES rss_feeds(id) ON DELETE CASCADE,
  guid TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  link TEXT,
  pub_date TIMESTAMP WITH TIME ZONE,
  news_article_id UUID REFERENCES news_articles(id),
  imported BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a unique constraint on feed_id and guid
CREATE UNIQUE INDEX IF NOT EXISTS rss_feed_items_feed_guid_idx ON rss_feed_items (feed_id, guid);
```

#### Site Settings Table
```sql
CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Ads Table
```sql
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  position VARCHAR(50) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Comments Table
```sql
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
  user_id UUID,
  user_name VARCHAR(255),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Enable Row Level Security (RLS)

For each table, enable Row Level Security:

```sql
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
```

### 3. Create RLS Policies

For each table, create a policy that allows full access:

```sql
CREATE POLICY "Allow full access to all users" ON categories FOR ALL USING (true);
CREATE POLICY "Allow full access to all users" ON news_articles FOR ALL USING (true);
CREATE POLICY "Allow full access to all users" ON users FOR ALL USING (true);
CREATE POLICY "Allow full access to all users" ON rss_feeds FOR ALL USING (true);
CREATE POLICY "Allow full access to all users" ON rss_feed_items FOR ALL USING (true);
CREATE POLICY "Allow full access to all users" ON site_settings FOR ALL USING (true);
CREATE POLICY "Allow full access to all users" ON ads FOR ALL USING (true);
CREATE POLICY "Allow full access to all users" ON comments FOR ALL USING (true);
```

### 4. Add Default Categories

If you don't have any categories, add these default ones:

```sql
INSERT INTO categories (name, slug) VALUES
('సినిమా', 'cinema'),
('రాజకీయం', 'politics'),
('క్రీడలు', 'sports'),
('వ్యాపారం', 'business'),
('టెక్నాలజీ', 'technology'),
('ఆరోగ్యం', 'health'),
('విద్య', 'education'),
('రాష్ట్రీయం', 'state'),
('జాతీయం', 'national'),
('అంతర్జాతీయం', 'international');
```

### 5. Add Default Site Settings

If you don't have any site settings, add these default ones:

```sql
INSERT INTO site_settings (key, value) VALUES
('site_name', 'FlipNews'),
('primary_color', '#FACC15'),
('secondary_color', '#000000'),
('share_link', 'https://flipnews.vercel.app'),
('app_version', '1.0.0'),
('last_updated', CURRENT_TIMESTAMP);
```

## How to Execute These SQL Commands

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/tnaqvbrflguwpeafwclz/editor
2. Click on the "SQL Editor" tab
3. Create a new query
4. Copy and paste each SQL block above and run them one by one
5. Check that the tables are created by going to the "Table Editor" tab

## Verifying the Fix

After creating the tables and adding the default data, your FlipNEWS application should be able to:
- Create and manage categories
- Save site settings
- Add and process RSS feeds
- Create and manage authors
- Create and display ads

If you continue to experience issues, please check the browser console for error messages and ensure that your Supabase connection is properly configured.

## Automatic Fix Script

We've also created a script that outputs the necessary SQL commands. You can run it with:

```
node scripts/fix-database.js
```

This script will check your database and tell you which tables need to be created.
