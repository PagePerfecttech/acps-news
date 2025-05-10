-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create site_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index on key for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

-- Create ads table if it doesn't exist
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  video_url TEXT,
  video_type TEXT,
  text_content TEXT,
  link_url TEXT,
  frequency INTEGER DEFAULT 5,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tables
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow anonymous read access to site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated read access to site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow service role full access to site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow anonymous read access to active ads" ON ads;
DROP POLICY IF EXISTS "Allow authenticated read access to all ads" ON ads;
DROP POLICY IF EXISTS "Allow service role full access to ads" ON ads;

-- Create policies for site_settings
CREATE POLICY "Allow anonymous read access to site_settings"
  ON site_settings
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated read access to site_settings"
  ON site_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role full access to site_settings"
  ON site_settings
  FOR ALL
  TO service_role
  USING (true);

-- Create policies for ads
CREATE POLICY "Allow anonymous read access to active ads"
  ON ads
  FOR SELECT
  TO anon
  USING (active = true);

CREATE POLICY "Allow authenticated read access to all ads"
  ON ads
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role full access to ads"
  ON ads
  FOR ALL
  TO service_role
  USING (true);

-- Insert default settings if they don't exist
INSERT INTO site_settings (key, value, description)
VALUES
  ('app_name', '"FlipNEWS"', 'Application name'),
  ('app_description', '"FlipNEWS is your source for the latest Telugu news with an interactive flip experience"', 'Application description'),
  ('theme_primary_color', '"#FFCC00"', 'Primary theme color'),
  ('theme_secondary_color', '"#333333"', 'Secondary theme color'),
  ('max_articles_per_page', '10', 'Maximum number of articles to show per page'),
  ('enable_comments', 'true', 'Whether to enable comments on articles'),
  ('enable_likes', 'true', 'Whether to enable likes on articles'),
  ('enable_sharing', 'true', 'Whether to enable sharing of articles'),
  ('maintenance_mode', 'false', 'Whether the site is in maintenance mode'),
  ('version', '"1.0.0"', 'Application version')
ON CONFLICT (key) DO NOTHING;

-- Insert default ads if they don't exist
INSERT INTO ads (id, title, description, image_url, link_url, active)
VALUES
  (uuid_generate_v4(), 'FlipNEWS Premium', 'Get unlimited access to all articles and features', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1470&auto=format&fit=crop', 'https://flip-news.vercel.app/premium', true),
  (uuid_generate_v4(), 'Download Our App', 'Get the latest news on your mobile device', 'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1374&auto=format&fit=crop', 'https://flip-news.vercel.app/app', true),
  (uuid_generate_v4(), 'Subscribe to Newsletter', 'Stay updated with our weekly newsletter', 'https://images.unsplash.com/photo-1583912086096-8c60d75a13f5?q=80&w=1374&auto=format&fit=crop', 'https://flip-news.vercel.app/newsletter', true)
ON CONFLICT DO NOTHING;
