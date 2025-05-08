// This script initializes the database with the required tables for the RSS feed functionality
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function initDatabase() {
  console.log('Initializing database...');

  try {
    // Check if the rss_feeds table exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return;
    }

    const tableNames = tables.map(t => t.table_name);

    // Create rss_feeds table if it doesn't exist
    if (!tableNames.includes('rss_feeds')) {
      console.log('Creating rss_feeds table...');

      const { error: createError } = await supabase.rpc('create_rss_feeds_table');

      if (createError) {
        console.error('Error creating rss_feeds table:', createError);

        // Try direct SQL if RPC fails
        console.log('Trying direct SQL...');
        const { error: sqlError } = await supabase.sql`
          CREATE TABLE IF NOT EXISTS rss_feeds (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            url TEXT NOT NULL UNIQUE,
            category_id UUID REFERENCES categories(id),
            user_id UUID,
            active BOOLEAN DEFAULT true,
            last_fetched TIMESTAMP WITH TIME ZONE,
            fetch_frequency INTEGER DEFAULT 60,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `;

        if (sqlError) {
          console.error('Error creating rss_feeds table with SQL:', sqlError);
          return;
        }
      }

      console.log('RSS feeds table created successfully!');

      // Create RSS feed items table if it doesn't exist
      if (!tableNames.includes('rss_feed_items')) {
        console.log('Creating rss_feed_items table...');

        const { error: itemsError } = await supabase.sql`
          CREATE TABLE IF NOT EXISTS rss_feed_items (
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
          CREATE UNIQUE INDEX IF NOT EXISTS rss_feed_items_feed_guid_idx ON rss_feed_items (feed_id, guid);
        `;

        if (itemsError) {
          console.error('Error creating rss_feed_items table:', itemsError);
          return;
        }

        console.log('RSS feed items table created successfully!');
      } else {
        console.log('RSS feed items table already exists.');
      }
    } else {
      console.log('RSS feeds table already exists.');
    }

    // Check if news_articles table has rss_feed_id column
    if (tableNames.includes('news_articles')) {
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'news_articles')
        .eq('table_schema', 'public');

      if (columnsError) {
        console.error('Error checking columns:', columnsError);
        return;
      }

      const columnNames = columns.map(c => c.column_name);

      // Add rss_feed_id column if it doesn't exist
      if (!columnNames.includes('rss_feed_id')) {
        console.log('Adding rss_feed_id column to news_articles table...');

        const { error: alterError } = await supabase.sql`
          ALTER TABLE news_articles
          ADD COLUMN IF NOT EXISTS rss_feed_id UUID REFERENCES rss_feeds(id);
        `;

        if (alterError) {
          console.error('Error adding rss_feed_id column:', alterError);
          return;
        }

        console.log('rss_feed_id column added successfully!');
      } else {
        console.log('rss_feed_id column already exists.');
      }

      // Add rss_item_guid column if it doesn't exist
      if (!columnNames.includes('rss_item_guid')) {
        console.log('Adding rss_item_guid column to news_articles table...');

        const { error: alterError } = await supabase.sql`
          ALTER TABLE news_articles
          ADD COLUMN IF NOT EXISTS rss_item_guid TEXT;
        `;

        if (alterError) {
          console.error('Error adding rss_item_guid column:', alterError);
          return;
        }

        console.log('rss_item_guid column added successfully!');
      } else {
        console.log('rss_item_guid column already exists.');
      }
    }

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Run the initialization
initDatabase();
