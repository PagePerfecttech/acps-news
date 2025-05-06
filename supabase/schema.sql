-- Create tables for FlipNews

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News articles table
CREATE TABLE news_articles (
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

-- Tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News-Tags relationship table
CREATE TABLE news_tags (
  news_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (news_id, tag_id)
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  news_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_ip VARCHAR(50),
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ads table
CREATE TABLE ads (
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

-- Insert some initial categories
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

-- Create RLS (Row Level Security) policies
-- This ensures that only authenticated users can modify data

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (admins)
CREATE POLICY "Allow full access to authenticated users" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow full access to authenticated users" ON news_articles
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow full access to authenticated users" ON tags
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow full access to authenticated users" ON news_tags
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow full access to authenticated users" ON comments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow full access to authenticated users" ON ads
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for anonymous users (public)
CREATE POLICY "Allow read access to anonymous users" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to anonymous users" ON news_articles
  FOR SELECT USING (published = true);

CREATE POLICY "Allow read access to anonymous users" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to anonymous users" ON news_tags
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to anonymous users" ON comments
  FOR SELECT USING (approved = true);

CREATE POLICY "Allow read access to anonymous users" ON ads
  FOR SELECT USING (active = true);

-- Allow anonymous users to create comments
CREATE POLICY "Allow anonymous users to create comments" ON comments
  FOR INSERT WITH CHECK (true);

-- Likes table to track user likes
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  news_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on likes table
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (admins) for likes
CREATE POLICY "Allow full access to authenticated users" ON likes
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policy for anonymous users (public) for likes
CREATE POLICY "Allow read access to anonymous users" ON likes
  FOR SELECT USING (true);

-- Allow anonymous users to create likes
CREATE POLICY "Allow anonymous users to create likes" ON likes
  FOR INSERT WITH CHECK (true);

-- Function to increment views
CREATE OR REPLACE FUNCTION increment_views(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE news_articles
  SET views = views + 1
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment likes
CREATE OR REPLACE FUNCTION increment_likes(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE news_articles
  SET likes = likes + 1
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql;

-- Site settings table
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name VARCHAR(255) NOT NULL DEFAULT 'FlipNews',
  primary_color VARCHAR(50) NOT NULL DEFAULT '#FACC15',
  secondary_color VARCHAR(50) NOT NULL DEFAULT '#000000',
  share_link VARCHAR(255) NOT NULL DEFAULT 'https://flipnews.vercel.app',
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on site_settings table
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (admins) for site_settings
CREATE POLICY "Allow full access to authenticated users" ON site_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policy for anonymous users (public) for site_settings
CREATE POLICY "Allow read access to anonymous users" ON site_settings
  FOR SELECT USING (true);

-- Users table (extending Supabase auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  profile_pic TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (admins) for users
CREATE POLICY "Allow full access to authenticated users" ON users
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policy for anonymous users (public) for users
CREATE POLICY "Allow read access to anonymous users" ON users
  FOR SELECT USING (true);

-- Ads table
CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  image_url TEXT,
  link_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on ads table
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (admins) for ads
CREATE POLICY "Allow full access to authenticated users" ON ads
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policy for anonymous users (public) for ads
CREATE POLICY "Allow read access to anonymous users" ON ads
  FOR SELECT USING (active = true);

-- Ad settings table
CREATE TABLE ad_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  frequency INTEGER NOT NULL DEFAULT 5, -- Show an ad after every X news articles
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on ad_settings table
ALTER TABLE ad_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (admins) for ad_settings
CREATE POLICY "Allow full access to authenticated users" ON ad_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policy for anonymous users (public) for ad_settings
CREATE POLICY "Allow read access to anonymous users" ON ad_settings
  FOR SELECT USING (true);

-- Insert default site settings
INSERT INTO site_settings (site_name, primary_color, secondary_color, share_link)
VALUES ('FlipNews', '#FACC15', '#000000', 'https://flipnews.vercel.app');

-- Insert default ad settings
INSERT INTO ad_settings (frequency)
VALUES (5);
