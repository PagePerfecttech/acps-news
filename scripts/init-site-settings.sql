-- Initialize site_settings table with default values
-- Run this script after creating the table to populate it with default settings

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
