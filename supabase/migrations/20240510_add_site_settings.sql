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

-- Add RLS policies for site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read site settings
DROP POLICY IF EXISTS "Allow anonymous read access to site_settings" ON site_settings;
CREATE POLICY "Allow anonymous read access to site_settings"
  ON site_settings
  FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users to read site settings
DROP POLICY IF EXISTS "Allow authenticated read access to site_settings" ON site_settings;
CREATE POLICY "Allow authenticated read access to site_settings"
  ON site_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role to manage site settings
DROP POLICY IF EXISTS "Allow service role full access to site_settings" ON site_settings;
CREATE POLICY "Allow service role full access to site_settings"
  ON site_settings
  FOR ALL
  TO service_role
  USING (true);

-- Insert default settings
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
