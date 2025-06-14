-- RSS Feed tables for Vizag News

-- RSS Feed sources table
CREATE TABLE rss_feeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES categories(id),
  user_id UUID REFERENCES users(id),
  active BOOLEAN DEFAULT true,
  last_fetched TIMESTAMP WITH TIME ZONE,
  fetch_frequency INTEGER DEFAULT 60, -- minutes between fetches
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RSS Feed items table (to track which items have been imported)
CREATE TABLE rss_feed_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_id UUID REFERENCES rss_feeds(id) ON DELETE CASCADE,
  guid TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  link TEXT,
  pub_date TIMESTAMP WITH TIME ZONE,
  news_article_id UUID REFERENCES news_articles(id),
  imported BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a unique constraint on feed_id and guid
CREATE UNIQUE INDEX rss_feed_items_feed_guid_idx ON rss_feed_items (feed_id, guid);

-- Enable RLS on RSS feed tables
ALTER TABLE rss_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_feed_items ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (admins)
CREATE POLICY "Allow full access to authenticated users" ON rss_feeds
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow full access to authenticated users" ON rss_feed_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for anonymous users (public)
CREATE POLICY "Allow read access to anonymous users" ON rss_feeds
  FOR SELECT USING (active = true);

CREATE POLICY "Allow read access to anonymous users" ON rss_feed_items
  FOR SELECT USING (true);

-- Add a column to news_articles to track RSS source
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS rss_feed_id UUID REFERENCES rss_feeds(id);
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS rss_item_guid TEXT;
