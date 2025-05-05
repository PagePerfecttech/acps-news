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
