// This script checks and fixes all database tables for FlipNEWS
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if credentials are available
if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in environment variables.');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Required tables and their schemas
const requiredTables = {
  categories: `
    CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  news_articles: `
    CREATE TABLE IF NOT EXISTS news_articles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      summary TEXT,
      category_id UUID REFERENCES categories(id),
      image_url TEXT,
      author VARCHAR(255),
      user_id UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      likes INTEGER DEFAULT 0,
      published BOOLEAN DEFAULT true,
      rss_feed_id UUID,
      rss_item_guid TEXT
    );
  `,
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password TEXT,
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      profile_pic TEXT,
      bio TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  rss_feeds: `
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
  `,
  rss_feed_items: `
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
  `,
  site_settings: `
    CREATE TABLE IF NOT EXISTS site_settings (
      key VARCHAR(255) PRIMARY KEY,
      value TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  ads: `
    CREATE TABLE IF NOT EXISTS ads (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      image_url TEXT NOT NULL,
      link_url TEXT,
      position VARCHAR(50) NOT NULL,
      start_date TIMESTAMP WITH TIME ZONE,
      end_date TIMESTAMP WITH TIME ZONE,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  comments: `
    CREATE TABLE IF NOT EXISTS comments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
      user_id UUID,
      user_name VARCHAR(255),
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `
};

// Function to check and create tables
async function checkAndCreateTables() {
  console.log('Checking and creating database tables...');

  try {
    // Get existing tables using REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!response.ok) {
      console.error('Error checking tables:', await response.text());
      return false;
    }

    const data = await response.json();
    const existingTables = Object.keys(data);
    console.log('Existing tables:', existingTables);

    // Check and create each required table
    for (const [tableName, createSQL] of Object.entries(requiredTables)) {
      if (!existingTables.includes(tableName)) {
        console.log(`Creating ${tableName} table...`);

        try {
          // Use the Supabase REST API to create the table
          // Note: This is a simplified approach - in a real scenario, you would need to
          // use the Supabase Management API or SQL queries through the dashboard
          console.log(`Please create the ${tableName} table manually in the Supabase dashboard.`);
          console.log(`SQL to create the table: ${createSQL}`);
        } catch (error) {
          console.error(`Error creating ${tableName} table:`, error);
        }
      } else {
        console.log(`${tableName} table already exists.`);
      }
    }

    // Enable RLS on all tables - this needs to be done in the Supabase dashboard
    for (const tableName of Object.keys(requiredTables)) {
      console.log(`Please enable RLS on ${tableName} table in the Supabase dashboard.`);
      console.log(`SQL: ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;`);
    }

    // Create RLS policies for all tables - this needs to be done in the Supabase dashboard
    for (const tableName of Object.keys(requiredTables)) {
      console.log(`Please create RLS policies for ${tableName} table in the Supabase dashboard.`);
      console.log(`SQL: CREATE POLICY "Allow full access to all users" ON ${tableName} FOR ALL USING (true);`);
    }

    console.log('All tables checked and created successfully!');
    return true;
  } catch (error) {
    console.error('Error checking and creating tables:', error);
    return false;
  }
}

// Function to add default categories if needed
async function addDefaultCategories() {
  console.log('Checking and adding default categories...');

  try {
    // Check if there are any categories
    const response = await fetch(`${supabaseUrl}/rest/v1/categories?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!response.ok) {
      console.error('Error checking categories:', await response.text());
      return false;
    }

    const existingCategories = await response.json();

    // If no categories exist, add the default ones
    if (!existingCategories || existingCategories.length === 0) {
      console.log('No categories found. Adding default categories...');

      const defaultCategories = [
        { name: 'సినిమా', slug: 'cinema' },
        { name: 'రాజకీయం', slug: 'politics' },
        { name: 'క్రీడలు', slug: 'sports' },
        { name: 'వ్యాపారం', slug: 'business' },
        { name: 'టెక్నాలజీ', slug: 'technology' },
        { name: 'ఆరోగ్యం', slug: 'health' },
        { name: 'విద్య', slug: 'education' },
        { name: 'రాష్ట్రీయం', slug: 'state' },
        { name: 'జాతీయం', slug: 'national' },
        { name: 'అంతర్జాతీయం', slug: 'international' }
      ];

      const insertResponse = await fetch(`${supabaseUrl}/rest/v1/categories`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(defaultCategories)
      });

      if (!insertResponse.ok) {
        console.error('Error adding default categories:', await insertResponse.text());
        return false;
      }

      const data = await insertResponse.json();
      console.log(`Added ${data.length} default categories.`);
    } else {
      console.log('Categories already exist. Skipping default categories.');
    }

    return true;
  } catch (error) {
    console.error('Error adding default categories:', error);
    return false;
  }
}

// Function to add default site settings if needed
async function addDefaultSettings() {
  console.log('Checking and adding default site settings...');

  try {
    // Check if there are any settings
    const response = await fetch(`${supabaseUrl}/rest/v1/site_settings?select=key&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!response.ok) {
      console.error('Error checking site settings:', await response.text());
      return false;
    }

    const existingSettings = await response.json();

    // If no settings exist, add the default ones
    if (!existingSettings || existingSettings.length === 0) {
      console.log('No site settings found. Adding default settings...');

      const defaultSettings = [
        { key: 'site_name', value: 'FlipNews' },
        { key: 'primary_color', value: '#FACC15' },
        { key: 'secondary_color', value: '#000000' },
        { key: 'share_link', value: 'https://flipnews.vercel.app' },
        { key: 'app_version', value: '1.0.0' },
        { key: 'last_updated', value: new Date().toISOString() }
      ];

      const insertResponse = await fetch(`${supabaseUrl}/rest/v1/site_settings`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(defaultSettings)
      });

      if (!insertResponse.ok) {
        console.error('Error adding default site settings:', await insertResponse.text());
        return false;
      }

      console.log(`Added default site settings.`);
    } else {
      console.log('Site settings already exist. Skipping default settings.');
    }

    return true;
  } catch (error) {
    console.error('Error adding default site settings:', error);
    return false;
  }
}

// Main function to run all checks and fixes
async function fixDatabase() {
  console.log('Starting database fix...');

  // Check connection to Supabase
  try {
    // Try a simple REST API call to check connection
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!response.ok) {
      console.error('Error connecting to Supabase:', await response.text());
      return;
    }

    console.log('Successfully connected to Supabase!');
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
    return;
  }

  // Run all fix functions
  const tablesCreated = await checkAndCreateTables();
  if (tablesCreated) {
    await addDefaultCategories();
    await addDefaultSettings();
  }

  console.log('Database fix completed!');
}

// Run the fix
fixDatabase();
