// Script to fix the admin panel not displaying news articles
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

// Function to check if a table exists
async function checkTableExists(tableName) {
  try {
    const result = await executeRawQuery(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = '${tableName}'
      );
    `);

    if (!result.success) {
      console.error(`Error checking if table ${tableName} exists:`, result.error);
      return false;
    }

    return result.data && result.data.length > 0 && result.data[0].exists;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

// Function to fix the categories table
async function fixCategoriesTable() {
  console.log('Fixing categories table...');

  // Check if categories table exists
  const categoriesExists = await checkTableExists('categories');
  if (!categoriesExists) {
    console.log('Categories table does not exist. Creating it...');

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
      return false;
    }

    console.log('Categories table created successfully!');
  }

  // Insert default categories
  console.log('Inserting default categories...');

  const insertCategoriesResult = await executeRawQuery(`
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

  if (!insertCategoriesResult.success) {
    console.error('Error inserting default categories:', insertCategoriesResult.error);
    return false;
  }

  console.log('Default categories inserted successfully!');
  return true;
}

// Function to fix the news_articles table
async function fixNewsArticlesTable() {
  console.log('Fixing news_articles table...');

  // Check if news_articles table exists
  const newsArticlesExists = await checkTableExists('news_articles');
  if (!newsArticlesExists) {
    console.log('News articles table does not exist. Creating it...');

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
        tags TEXT[] DEFAULT '{}',
        rss_feed_id UUID,
        rss_item_guid TEXT
      );
    `);

    if (!createNewsArticlesResult.success) {
      console.error('Error creating news_articles table:', createNewsArticlesResult.error);
      return false;
    }

    console.log('News articles table created successfully!');
  }

  // Update existing news articles to have a category_id
  console.log('Updating existing news articles to have a category_id...');

  // First, get a category ID
  const getCategoryResult = await executeRawQuery(`
    SELECT id FROM categories LIMIT 1;
  `);

  if (!getCategoryResult.success) {
    console.error('Error getting a category ID:', getCategoryResult.error);
    return false;
  }

  // If no categories exist, create one
  if (!getCategoryResult.data || getCategoryResult.data.length === 0) {
    console.log('No categories found. Creating a default category...');

    const createCategoryResult = await executeRawQuery(`
      INSERT INTO categories (name, slug)
      VALUES ('Default Category', 'default-category')
      RETURNING id;
    `);

    if (!createCategoryResult.success || !createCategoryResult.data || createCategoryResult.data.length === 0) {
      console.error('Error creating default category:', createCategoryResult.error);
      return false;
    }

    const categoryId = createCategoryResult.data[0].id;
    console.log('Created default category with ID:', categoryId);
    return true;
  }

  const categoryId = getCategoryResult.data[0].id;
  console.log('Using category ID:', categoryId);

  // Update all news articles that have a null category_id
  const updateNewsArticlesResult = await executeRawQuery(`
    UPDATE news_articles
    SET category_id = '${categoryId}'
    WHERE category_id IS NULL;
  `);

  if (!updateNewsArticlesResult.success) {
    console.error('Error updating news articles:', updateNewsArticlesResult.error);
    return false;
  }

  console.log('News articles updated successfully!');
  return true;
}

// Function to fix the admin panel
async function fixAdminPanel() {
  console.log('Fixing admin panel...');

  // Fix categories table
  const categoriesFixed = await fixCategoriesTable();
  if (!categoriesFixed) {
    console.error('Failed to fix categories table.');
    return false;
  }

  // Fix news_articles table
  const newsArticlesFixed = await fixNewsArticlesTable();
  if (!newsArticlesFixed) {
    console.error('Failed to fix news_articles table.');
    return false;
  }

  console.log('Admin panel fixed successfully!');
  return true;
}

// Main function
async function main() {
  console.log('Fixing admin panel issues...');

  // Check connection to Supabase
  try {
    console.log('Testing connection to Supabase...');
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

  // Fix admin panel
  const adminPanelFixed = await fixAdminPanel();
  if (!adminPanelFixed) {
    console.error('Failed to fix admin panel.');
    process.exit(1);
  }

  console.log('Admin panel fixed successfully!');
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
