-- FlipNews Database Schema
-- This SQL file creates all the necessary tables for the FlipNews application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create news_articles table
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  video_url TEXT,
  video_type VARCHAR(50),
  author VARCHAR(100),
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  rss_feed_id UUID,
  rss_item_guid TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  news_id UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  author_name VARCHAR(100),
  author_ip VARCHAR(50),
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create saved_articles table (for bookmarks)
CREATE TABLE IF NOT EXISTS saved_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  news_id UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, news_id)
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  news_id UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, news_id)
);

-- Create ads table
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  video_url TEXT,
  video_type VARCHAR(50),
  text_content TEXT,
  link_url TEXT,
  frequency INTEGER DEFAULT 5, -- Show ad after every X articles
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create rss_feeds table
CREATE TABLE IF NOT EXISTS rss_feeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL, -- This is a string, not a foreign key
  auto_fetch BOOLEAN DEFAULT true,
  fetch_interval INTEGER DEFAULT 60, -- Minutes
  active BOOLEAN DEFAULT true,
  last_fetched TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample RSS feeds
INSERT INTO rss_feeds (name, url, category, auto_fetch, fetch_interval)
VALUES
  ('BBC News', 'http://feeds.bbci.co.uk/news/rss.xml', 'General', true, 60),
  ('TechCrunch', 'https://techcrunch.com/feed/', 'Technology', true, 60),
  ('ESPN', 'https://www.espn.com/espn/rss/news', 'Sports', true, 60)
ON CONFLICT DO NOTHING;

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name VARCHAR(100) DEFAULT 'FlipNews',
  site_description TEXT DEFAULT 'A modern news aggregator',
  primary_color VARCHAR(20) DEFAULT '#FACC15',
  secondary_color VARCHAR(20) DEFAULT '#000000',
  logo_url TEXT,
  favicon_url TEXT,
  share_link TEXT DEFAULT 'https://flipnews.vercel.app',
  analytics_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default site settings
INSERT INTO site_settings (site_name, site_description, primary_color, secondary_color)
VALUES ('FlipNews', 'A modern news aggregator', '#FACC15', '#000000')
ON CONFLICT DO NOTHING;

-- Insert default categories
INSERT INTO categories (name, slug, description)
VALUES
  ('General', 'general', 'General news articles'),
  ('Technology', 'technology', 'Technology news and updates'),
  ('Business', 'business', 'Business and finance news'),
  ('Entertainment', 'entertainment', 'Entertainment and celebrity news'),
  ('Sports', 'sports', 'Sports news and updates'),
  ('Health', 'health', 'Health and wellness news'),
  ('Science', 'science', 'Science news and discoveries'),
  ('Politics', 'politics', 'Political news and updates'),
  ('RSS', 'rss', 'News from RSS feeds')
ON CONFLICT DO NOTHING;

-- Create RLS policies

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Public users are viewable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert categories" ON categories
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can update categories" ON categories
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can delete categories" ON categories
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- News articles policies
CREATE POLICY "Published news articles are viewable by everyone" ON news_articles
  FOR SELECT USING (published = true);

CREATE POLICY "Admins can view all news articles" ON news_articles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Authors can view their own unpublished articles" ON news_articles
  FOR SELECT USING (
    (published = false AND author_id = auth.uid())
  );

CREATE POLICY "Admins can insert news articles" ON news_articles
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Authors can insert their own news articles" ON news_articles
  FOR INSERT WITH CHECK (
    author_id = auth.uid()
  );

CREATE POLICY "Admins can update news articles" ON news_articles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Authors can update their own news articles" ON news_articles
  FOR UPDATE USING (
    author_id = auth.uid()
  );

CREATE POLICY "Admins can delete news articles" ON news_articles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (approved = true);

CREATE POLICY "Admins can view all comments" ON comments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can insert comments" ON comments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (
    user_id = auth.uid()
  );

CREATE POLICY "Admins can update any comment" ON comments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (
    user_id = auth.uid()
  );

CREATE POLICY "Admins can delete any comment" ON comments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Create functions and triggers for updating likes count

-- Function to update likes count
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE news_articles SET likes = likes + 1 WHERE id = NEW.news_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE news_articles SET likes = likes - 1 WHERE id = OLD.news_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for likes
CREATE TRIGGER update_likes_count_trigger
AFTER INSERT OR DELETE ON likes
FOR EACH ROW
EXECUTE FUNCTION update_likes_count();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_articles_category_id ON news_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_author_id ON news_articles(author_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_created_at ON news_articles(created_at);
CREATE INDEX IF NOT EXISTS idx_news_articles_rss_feed_id ON news_articles(rss_feed_id);
CREATE INDEX IF NOT EXISTS idx_comments_news_id ON comments(news_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_articles_user_id ON saved_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_articles_news_id ON saved_articles(news_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_news_id ON likes(news_id);
