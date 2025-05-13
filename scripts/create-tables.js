// Script to create the required tables in Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

// Function to execute a raw SQL query
async function executeRawQuery(query) {
  try {
    const { data, error } = await supabase.rpc('pgexecute', { query });

    if (error) {
      console.error('Error executing raw query:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error executing raw query:', error);
    return { success: false, error };
  }
}

// Function to create tables
async function createTables() {
  console.log('Creating tables...');

  // Create categories table
  console.log('Creating categories table...');
  const createCategoriesResult = await executeRawQuery(`
    CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  if (!createCategoriesResult.success) {
    console.error('Error creating categories table:', createCategoriesResult.error);
  } else {
    console.log('Categories table created successfully!');
  }

  // Create news_articles table
  console.log('Creating news_articles table...');
  const createNewsArticlesResult = await executeRawQuery(`
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
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      tags TEXT[] DEFAULT '{}'
    );
  `);

  if (!createNewsArticlesResult.success) {
    console.error('Error creating news_articles table:', createNewsArticlesResult.error);
  } else {
    console.log('News articles table created successfully!');
  }

  // Create ads table
  console.log('Creating ads table...');
  const createAdsResult = await executeRawQuery(`
    CREATE TABLE IF NOT EXISTS ads (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      text_content TEXT,
      image_url TEXT,
      video_url TEXT,
      video_type VARCHAR(50),
      link_url TEXT,
      frequency INTEGER DEFAULT 5,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  if (!createAdsResult.success) {
    console.error('Error creating ads table:', createAdsResult.error);
  } else {
    console.log('Ads table created successfully!');
  }

  // Create site_settings table
  console.log('Creating site_settings table...');
  const createSiteSettingsResult = await executeRawQuery(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key VARCHAR(255) PRIMARY KEY,
      value TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  if (!createSiteSettingsResult.success) {
    console.error('Error creating site_settings table:', createSiteSettingsResult.error);
  } else {
    console.log('Site settings table created successfully!');
  }

  // Create comments table
  console.log('Creating comments table...');
  const createCommentsResult = await executeRawQuery(`
    CREATE TABLE IF NOT EXISTS comments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
      user_id UUID,
      user_name VARCHAR(255),
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  if (!createCommentsResult.success) {
    console.error('Error creating comments table:', createCommentsResult.error);
  } else {
    console.log('Comments table created successfully!');
  }

  // Enable RLS on all tables
  console.log('Enabling Row Level Security on all tables...');
  
  const enableRLSCategories = await executeRawQuery(`
    ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
  `);
  
  const enableRLSNewsArticles = await executeRawQuery(`
    ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
  `);
  
  const enableRLSAds = await executeRawQuery(`
    ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
  `);
  
  const enableRLSSiteSettings = await executeRawQuery(`
    ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
  `);
  
  const enableRLSComments = await executeRawQuery(`
    ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
  `);

  // Create RLS policies
  console.log('Creating RLS policies...');
  
  // Categories policies
  await executeRawQuery(`
    CREATE POLICY "Allow full access to all users" ON categories FOR ALL USING (true);
  `);
  
  // News articles policies
  await executeRawQuery(`
    CREATE POLICY "Allow full access to all users" ON news_articles FOR ALL USING (true);
  `);
  
  // Ads policies
  await executeRawQuery(`
    CREATE POLICY "Allow full access to all users" ON ads FOR ALL USING (true);
  `);
  
  // Site settings policies
  await executeRawQuery(`
    CREATE POLICY "Allow full access to all users" ON site_settings FOR ALL USING (true);
  `);
  
  // Comments policies
  await executeRawQuery(`
    CREATE POLICY "Allow full access to all users" ON comments FOR ALL USING (true);
  `);

  console.log('All tables created successfully!');
}

// Function to insert default categories
async function insertDefaultCategories() {
  console.log('Inserting default categories...');
  
  const result = await executeRawQuery(`
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
    ('అంతర్జాతీయం', 'international')
    ON CONFLICT (slug) DO NOTHING
    RETURNING id, name, slug;
  `);
  
  if (!result.success) {
    console.error('Error inserting default categories:', result.error);
  } else {
    console.log('Default categories inserted successfully!');
    console.log('Categories:', result.data);
  }
}

// Function to insert default site settings
async function insertDefaultSiteSettings() {
  console.log('Inserting default site settings...');
  
  const result = await executeRawQuery(`
    INSERT INTO site_settings (key, value) VALUES
    ('site_name', 'FlipNEWS'),
    ('site_description', 'Your source for the latest news in Telugu'),
    ('items_per_page', '10'),
    ('enable_comments', 'true'),
    ('maintenance_mode', 'false')
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    RETURNING key, value;
  `);
  
  if (!result.success) {
    console.error('Error inserting default site settings:', result.error);
  } else {
    console.log('Default site settings inserted successfully!');
    console.log('Settings:', result.data);
  }
}

// Main function
async function main() {
  console.log('Setting up Supabase database...');

  // Check connection to Supabase
  try {
    const { data, error } = await supabase.rpc('pgexecute', { 
      query: 'SELECT version()' 
    });
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      process.exit(1);
    }
    console.log('Successfully connected to Supabase!');
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
    process.exit(1);
  }

  // Create tables
  await createTables();

  // Insert default categories
  await insertDefaultCategories();

  // Insert default site settings
  await insertDefaultSiteSettings();

  console.log('Database setup completed!');
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
