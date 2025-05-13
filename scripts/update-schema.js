// Script to update the database schema
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

// Function to check if a column exists
async function columnExists(tableName, columnName) {
  try {
    const result = await executeRawQuery(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = '${tableName}'
        AND column_name = '${columnName}'
      );
    `);

    if (!result.success) {
      console.error(`Error checking if column ${columnName} exists in table ${tableName}:`, result.error);
      return false;
    }

    return result.data && result.data.length > 0 && result.data[0].exists;
  } catch (error) {
    console.error(`Error checking if column ${columnName} exists in table ${tableName}:`, error);
    return false;
  }
}

// Function to add the tags column to the news_articles table
async function addTagsColumn() {
  console.log('Checking if tags column exists in news_articles table...');

  const tagsColumnExists = await columnExists('news_articles', 'tags');
  if (tagsColumnExists) {
    console.log('Tags column already exists in news_articles table.');
    return true;
  }

  console.log('Adding tags column to news_articles table...');

  const result = await executeRawQuery(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'news_articles'
        AND column_name = 'tags'
      ) THEN
        ALTER TABLE news_articles
        ADD COLUMN tags TEXT[] DEFAULT '{}';
      END IF;
    END $$;
  `);

  if (!result.success) {
    console.error('Error adding tags column to news_articles table:', result.error);
    return false;
  }

  console.log('Tags column added to news_articles table successfully!');
  return true;
}

// Function to add the rss_feed_id column to the news_articles table
async function addRssFeedIdColumn() {
  console.log('Checking if rss_feed_id column exists in news_articles table...');

  const rssFeedIdColumnExists = await columnExists('news_articles', 'rss_feed_id');
  if (rssFeedIdColumnExists) {
    console.log('rss_feed_id column already exists in news_articles table.');
    return true;
  }

  console.log('Adding rss_feed_id column to news_articles table...');

  const result = await executeRawQuery(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'news_articles'
        AND column_name = 'rss_feed_id'
      ) THEN
        ALTER TABLE news_articles
        ADD COLUMN rss_feed_id UUID;
      END IF;
    END $$;
  `);

  if (!result.success) {
    console.error('Error adding rss_feed_id column to news_articles table:', result.error);
    return false;
  }

  console.log('rss_feed_id column added to news_articles table successfully!');
  return true;
}

// Function to add the rss_item_guid column to the news_articles table
async function addRssItemGuidColumn() {
  console.log('Checking if rss_item_guid column exists in news_articles table...');

  const rssItemGuidColumnExists = await columnExists('news_articles', 'rss_item_guid');
  if (rssItemGuidColumnExists) {
    console.log('rss_item_guid column already exists in news_articles table.');
    return true;
  }

  console.log('Adding rss_item_guid column to news_articles table...');

  const result = await executeRawQuery(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'news_articles'
        AND column_name = 'rss_item_guid'
      ) THEN
        ALTER TABLE news_articles
        ADD COLUMN rss_item_guid TEXT;
      END IF;
    END $$;
  `);

  if (!result.success) {
    console.error('Error adding rss_item_guid column to news_articles table:', result.error);
    return false;
  }

  console.log('rss_item_guid column added to news_articles table successfully!');
  return true;
}

// Main function
async function main() {
  console.log('Updating database schema...');

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

  // Add tags column to news_articles table
  const tagsColumnAdded = await addTagsColumn();
  if (!tagsColumnAdded) {
    console.error('Failed to add tags column to news_articles table.');
    process.exit(1);
  }

  // Add rss_feed_id column to news_articles table
  const rssFeedIdColumnAdded = await addRssFeedIdColumn();
  if (!rssFeedIdColumnAdded) {
    console.error('Failed to add rss_feed_id column to news_articles table.');
    process.exit(1);
  }

  // Add rss_item_guid column to news_articles table
  const rssItemGuidColumnAdded = await addRssItemGuidColumn();
  if (!rssItemGuidColumnAdded) {
    console.error('Failed to add rss_item_guid column to news_articles table.');
    process.exit(1);
  }

  console.log('Database schema updated successfully!');
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
