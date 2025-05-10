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

-- Add RLS policies for ads
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read active ads
CREATE POLICY "Allow anonymous read access to active ads"
  ON ads
  FOR SELECT
  TO anon
  USING (active = true);

-- Allow authenticated users to read all ads
CREATE POLICY "Allow authenticated read access to all ads"
  ON ads
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role to manage ads
CREATE POLICY "Allow service role full access to ads"
  ON ads
  FOR ALL
  TO service_role
  USING (true);

-- Insert default ads
INSERT INTO ads (title, description, image_url, link_url, active)
VALUES
  ('FlipNEWS Premium', 'Get unlimited access to all articles and features', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1470&auto=format&fit=crop', 'https://flip-news.vercel.app/premium', true),
  ('Download Our App', 'Get the latest news on your mobile device', 'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1374&auto=format&fit=crop', 'https://flip-news.vercel.app/app', true),
  ('Subscribe to Newsletter', 'Stay updated with our weekly newsletter', 'https://images.unsplash.com/photo-1583912086096-8c60d75a13f5?q=80&w=1374&auto=format&fit=crop', 'https://flip-news.vercel.app/newsletter', true)
ON CONFLICT (id) DO NOTHING;
