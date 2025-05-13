-- Create UUID extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS ads CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS rss_feed_items CASCADE;
DROP TABLE IF EXISTS rss_feeds CASCADE;
DROP TABLE IF EXISTS news_articles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
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

-- Create news_articles table
CREATE TABLE news_articles (
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

-- Create rss_feeds table
CREATE TABLE rss_feeds (
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

-- Create rss_feed_items table
CREATE TABLE rss_feed_items (
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
CREATE UNIQUE INDEX rss_feed_items_feed_guid_idx ON rss_feed_items (feed_id, guid);

-- Create site_settings table
CREATE TABLE site_settings (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ads table
CREATE TABLE ads (
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

-- Create comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
  user_id UUID,
  user_name VARCHAR(255),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all tables
CREATE POLICY "Allow full access to all users" ON categories FOR ALL USING (true);
CREATE POLICY "Allow full access to all users" ON users FOR ALL USING (true);
CREATE POLICY "Allow full access to all users" ON news_articles FOR ALL USING (true);
CREATE POLICY "Allow full access to all users" ON rss_feeds FOR ALL USING (true);
CREATE POLICY "Allow full access to all users" ON rss_feed_items FOR ALL USING (true);
CREATE POLICY "Allow full access to all users" ON site_settings FOR ALL USING (true);
CREATE POLICY "Allow full access to all users" ON ads FOR ALL USING (true);
CREATE POLICY "Allow full access to all users" ON comments FOR ALL USING (true);

-- Insert default categories
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

-- Insert default site settings
INSERT INTO site_settings (key, value) VALUES
('site_name', 'FlipNews'),
('primary_color', '#FACC15'),
('secondary_color', '#000000'),
('share_link', 'https://flipnews.vercel.app'),
('app_version', '1.0.0'),
('last_updated', CURRENT_TIMESTAMP);
