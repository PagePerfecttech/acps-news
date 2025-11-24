-- Migration: Create site_settings table
-- Description: Adds the site_settings table for storing site configuration as key-value pairs
-- This migration is idempotent and can be run multiple times safely

-- Create the site_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS site_settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on updated_at for efficient sorting by recency
CREATE INDEX IF NOT EXISTS idx_site_settings_updated_at ON site_settings(updated_at);

-- Insert default settings if they don't exist
INSERT INTO site_settings (key, value, created_at, updated_at)
VALUES 
    ('site_name', 'ACPS News', NOW(), NOW()),
    ('primary_color', '#FACC15', NOW(), NOW()),
    ('secondary_color', '#000000', NOW(), NOW()),
    ('share_link', 'https://acps-news.vercel.app', NOW(), NOW()),
    ('logo_url', '', NOW(), NOW()),
    ('background_logo_url', '/logo-background.svg', NOW(), NOW()),
    ('background_logo_opacity', '0.1', NOW(), NOW()),
    ('black_strip_text', 'No.1 News Daily', NOW(), NOW()),
    ('admin_email', 'admin@acpsnews.com', NOW(), NOW()),
    ('admin_name', 'Admin', NOW(), NOW()),
    ('app_version', '1.0.0', NOW(), NOW())
ON CONFLICT (key) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Site settings table created successfully!';
END $$;
