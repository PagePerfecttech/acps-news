# ACPS News Setup Instructions

## 🚀 Quick Setup Guide

### 1. Database Setup (Supabase)

**Step 1:** Go to your Supabase dashboard: https://lrntbetnasmuhozmieik.supabase.co

**Step 2:** Navigate to the SQL Editor and run the complete database setup:

**Option A: Use the provided SQL file**
- Copy the contents of `database-setup.sql` file
- Paste and run in Supabase SQL Editor

**Option B: Run the SQL script below:**

```sql
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

-- Create RLS policies (optional - for security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_feed_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON news_articles FOR SELECT USING (published = true);
CREATE POLICY "Allow public read access" ON ads FOR SELECT USING (active = true);
CREATE POLICY "Allow public read access" ON comments FOR SELECT USING (approved = true);
CREATE POLICY "Allow public read access" ON site_settings FOR SELECT USING (true);

-- Allow authenticated users full access (for admin operations)
CREATE POLICY "Allow authenticated full access" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access" ON news_articles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access" ON ads FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access" ON comments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access" ON users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access" ON site_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access" ON rss_feeds FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access" ON rss_feed_items FOR ALL USING (auth.role() = 'authenticated');
```

### 2. Add Sample Data (Optional)

**Step 1:** Run the sample data script:
- Copy contents of `add-sample-data.sql`
- Run in Supabase SQL Editor
- This adds sample reporters, news articles, and ads

### 3. Create Admin User

**Step 1:** In Supabase dashboard, go to Authentication > Users

**Step 2:** Click "Add User" and create:
- Email: `admin@acpsnews.com`
- Password: `admin123`
- Email Confirm: ✅ (check this)

**Step 3:** Create additional reporter accounts (optional):
- `reporter1@acpsnews.com` / `reporter123`
- `editor@acpsnews.com` / `editor123`

### 4. Run the Project

```bash
cd acps-news
npm run dev
```

### 5. Access Admin Panel

1. Open: http://localhost:3000/admin/login
2. Login with: admin@acpsnews.com / admin123

### 6. Manage Users/Reporters

Once logged in, you can:
- Go to **Admin > Users** to manage reporters
- Add new reporters with different roles (reporter, editor, admin)
- Assign articles to specific reporters
- Manage user permissions and access

## 🔧 Troubleshooting

### Reporter Login Not Working?

The login system uses Supabase Authentication. Make sure:

1. ✅ Admin user is created in Supabase Auth
2. ✅ Email is confirmed in Supabase
3. ✅ Environment variables are set correctly
4. ✅ Database tables are created

### Common Issues:

**Issue:** "Could not find table" errors
**Solution:** Run the SQL script in Supabase SQL Editor

**Issue:** Login fails
**Solution:** Check if user exists in Supabase Auth dashboard

**Issue:** Build errors
**Solution:** Run `npm install` again and check for TypeScript errors

## 📁 Project Structure

```
acps-news/
├── app/
│   ├── admin/           # Admin panel pages
│   ├── api/             # API routes
│   ├── components/      # React components
│   └── lib/             # Utilities and services
├── public/              # Static assets
├── scripts/             # Database setup scripts
└── supabase/           # Database schemas
```

## 🎯 Next Steps

1. **Customize Categories:** Edit categories in admin panel
2. **Add News Articles:** Use admin panel to create content
3. **Upload Media:** Configure Cloudflare R2 for images/videos
4. **Deploy:** Push to GitHub and deploy on Vercel

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify Supabase connection in Network tab
3. Ensure all environment variables are set
4. Check Supabase logs for database errors
