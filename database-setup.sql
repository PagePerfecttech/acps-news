-- ACPS News Database Setup Script
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News articles table
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  category_id UUID REFERENCES categories(id),
  image_url TEXT,
  video_url TEXT,
  video_type VARCHAR(50),
  author VARCHAR(255),
  user_id UUID,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ads table
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  text_content TEXT,
  image_url TEXT,
  video_url TEXT,
  video_type VARCHAR(50),
  link_url TEXT NOT NULL,
  frequency INTEGER DEFAULT 3,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  news_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_ip VARCHAR(50),
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users/Reporters table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'reporter',
  active BOOLEAN DEFAULT true,
  auth_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(255) NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'text',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RSS Feeds table
CREATE TABLE IF NOT EXISTS rss_feeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES categories(id),
  user_id UUID REFERENCES users(id),
  active BOOLEAN DEFAULT true,
  last_fetched TIMESTAMP WITH TIME ZONE,
  fetch_frequency INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RSS Feed Items table
CREATE TABLE IF NOT EXISTS rss_feed_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_id UUID REFERENCES rss_feeds(id) ON DELETE CASCADE,
  guid TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  link TEXT,
  pub_date TIMESTAMP WITH TIME ZONE,
  news_article_id UUID REFERENCES news_articles(id),
  imported BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(feed_id, guid)
);

-- Insert initial categories for ACPS News
INSERT INTO categories (name, slug) VALUES
  ('Education', 'education'),
  ('Sports', 'sports'),
  ('Community', 'community'),
  ('Events', 'events'),
  ('Announcements', 'announcements'),
  ('Technology', 'technology'),
  ('Health', 'health'),
  ('General', 'general')
ON CONFLICT (slug) DO NOTHING;

-- Insert default site settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
  ('site_name', 'ACPS News', 'text', 'Site name displayed in header'),
  ('site_description', 'Your source for educational and community news', 'text', 'Site description for SEO'),
  ('background_logo_url', '', 'text', 'URL for background logo'),
  ('background_logo_opacity', '0.1', 'number', 'Background logo opacity (0.05-0.5)'),
  ('contact_email', 'admin@acpsnews.com', 'email', 'Contact email address'),
  ('social_facebook', '', 'text', 'Facebook page URL'),
  ('social_twitter', '', 'text', 'Twitter profile URL'),
  ('social_instagram', '', 'text', 'Instagram profile URL')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default admin user (this will be linked to Supabase Auth)
INSERT INTO users (email, name, role, active) VALUES
  ('admin@acpsnews.com', 'ACPS Admin', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_feed_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON news_articles FOR SELECT USING (published = true);
CREATE POLICY "Allow public read access" ON ads FOR SELECT USING (active = true);
CREATE POLICY "Allow public read access" ON comments FOR SELECT USING (approved = true);
CREATE POLICY "Allow public read access" ON site_settings FOR SELECT USING (true);

-- Create policies for authenticated users (admin/reporter access)
CREATE POLICY "Allow authenticated full access" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access" ON news_articles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access" ON ads FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access" ON comments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access" ON users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access" ON site_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access" ON rss_feeds FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access" ON rss_feed_items FOR ALL USING (auth.role() = 'authenticated');
