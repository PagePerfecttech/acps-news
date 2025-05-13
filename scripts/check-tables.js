// Script to check if the required tables exist in Supabase
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

// Function to check if a table exists
async function checkTableExists(tableName) {
  try {
    // Use pgexecute to run a SQL query to check if the table exists
    const { data, error } = await supabase.rpc('pgexecute', {
      query: `
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = '${tableName}'
        );
      `
    });

    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }

    return data && data.length > 0 && data[0].exists;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

// Function to check table structure
async function checkTableStructure(tableName) {
  try {
    // Use pgexecute to run a SQL query to get the table structure
    const { data, error } = await supabase.rpc('pgexecute', {
      query: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = '${tableName}'
        ORDER BY ordinal_position;
      `
    });

    if (error) {
      console.error(`Error checking table structure for ${tableName}:`, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Error checking table structure for ${tableName}:`, error);
    return null;
  }
}

// Function to check if a table has any rows
async function checkTableHasRows(tableName) {
  try {
    // Use pgexecute to run a SQL query to count rows
    const { data, error } = await supabase.rpc('pgexecute', {
      query: `SELECT COUNT(*) FROM ${tableName};`
    });

    if (error) {
      console.error(`Error checking if table ${tableName} has rows:`, error);
      return false;
    }

    return data && data.length > 0 && parseInt(data[0].count) > 0;
  } catch (error) {
    console.error(`Error checking if table ${tableName} has rows:`, error);
    return false;
  }
}

// Function to create a test news article
async function createTestNewsArticle() {
  try {
    // Use pgexecute to run a SQL query to insert a test article
    const { data, error } = await supabase.rpc('pgexecute', {
      query: `
        INSERT INTO news_articles (
          title,
          content,
          summary,
          author,
          published
        ) VALUES (
          'Test Article',
          'This is a test article created by the check-tables.js script.',
          'Test article summary',
          'Test Author',
          true
        )
        RETURNING id, title;
      `
    });

    if (error) {
      console.error('Error creating test news article:', error);
      return false;
    }

    console.log('Test news article created successfully:', data);
    return true;
  } catch (error) {
    console.error('Error creating test news article:', error);
    return false;
  }
}

// Function to execute a raw SQL query
async function executeRawQuery(query) {
  try {
    const { data, error } = await supabase.rpc('pgexecute', { query });

    if (error) {
      console.error('Error executing raw query:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error executing raw query:', error);
    return null;
  }
}

// Main function
async function main() {
  console.log('Checking Supabase tables...');

  // Check connection to Supabase
  try {
    // Try to get the server version as a simple connection test
    const { data, error } = await supabase.rpc('pgexecute', {
      query: 'SELECT version()'
    });

    if (error) {
      console.error('Error connecting to Supabase:', error);
      process.exit(1);
    }
    console.log('Successfully connected to Supabase!');
    console.log('Server version:', data);
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
    process.exit(1);
  }

  // Check if news_articles table exists
  const newsArticlesExists = await checkTableExists('news_articles');
  console.log(`news_articles table exists: ${newsArticlesExists}`);

  if (newsArticlesExists) {
    // Check news_articles table structure
    const newsArticlesStructure = await checkTableStructure('news_articles');
    console.log('news_articles table structure:');
    console.log(newsArticlesStructure);

    // Check if news_articles table has any rows
    const newsArticlesHasRows = await checkTableHasRows('news_articles');
    console.log(`news_articles table has rows: ${newsArticlesHasRows}`);

    if (!newsArticlesHasRows) {
      // Create a test news article
      console.log('Creating a test news article...');
      const testArticleCreated = await createTestNewsArticle();
      console.log(`Test news article created: ${testArticleCreated}`);
    }
  } else {
    console.log('news_articles table does not exist. Please create it using the SQL script in scripts/create_tables.sql');
  }

  // Check if categories table exists
  const categoriesExists = await checkTableExists('categories');
  console.log(`categories table exists: ${categoriesExists}`);

  if (categoriesExists) {
    // Check if categories table has any rows
    const categoriesHasRows = await checkTableHasRows('categories');
    console.log(`categories table has rows: ${categoriesHasRows}`);
  }

  // Check if ads table exists
  const adsExists = await checkTableExists('ads');
  console.log(`ads table exists: ${adsExists}`);

  // Check if site_settings table exists
  const siteSettingsExists = await checkTableExists('site_settings');
  console.log(`site_settings table exists: ${siteSettingsExists}`);

  console.log('Table check completed!');
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
