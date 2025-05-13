// Script to update the news_articles table schema in Supabase using direct SQL
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tnaqvbrflguwpeafwclz.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuYXF2YnJmbGd1d3BlYWZ3Y2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NzE3NDIsImV4cCI6MjA2MjU0Nzc0Mn0.wosmLe8bA0LOJQttRD03c7tIa8woLbFNSVWuc0ntcME';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to check if a column exists in a table
async function checkColumnExists(tableName, columnName) {
  try {
    console.log(`Checking if column ${columnName} exists in table ${tableName}...`);
    
    // Try to select the column from the table
    const { data, error } = await supabase
      .from(tableName)
      .select(columnName)
      .limit(1);
    
    if (error) {
      // If the error message contains the column name, it means the column doesn't exist
      if (error.message.includes(columnName)) {
        console.log(`Column ${columnName} does not exist in table ${tableName}`);
        return false;
      }
      
      console.error(`Error checking if column ${columnName} exists in table ${tableName}:`, error);
      return false;
    }
    
    console.log(`Column ${columnName} exists in table ${tableName}`);
    return true;
  } catch (error) {
    console.error(`Error checking if column ${columnName} exists in table ${tableName}:`, error);
    return false;
  }
}

// Function to add a column to a table
async function addColumn(tableName, columnName, columnType) {
  try {
    console.log(`Adding column ${columnName} to table ${tableName}...`);
    
    // Use the Supabase SQL API to add the column
    const { error } = await supabase.rpc('pgexecute', {
      query: `ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${columnName} ${columnType};`
    });
    
    if (error) {
      console.error(`Error adding column ${columnName} to table ${tableName}:`, error);
      return false;
    }
    
    console.log(`Column ${columnName} added to table ${tableName} successfully`);
    return true;
  } catch (error) {
    console.error(`Error adding column ${columnName} to table ${tableName}:`, error);
    return false;
  }
}

// Function to check if a table exists
async function checkTableExists(tableName) {
  try {
    console.log(`Checking if table ${tableName} exists...`);
    
    // Try to select from the table
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      // If the error message contains the table name, it means the table doesn't exist
      if (error.message.includes(tableName)) {
        console.log(`Table ${tableName} does not exist`);
        return false;
      }
      
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
    
    console.log(`Table ${tableName} exists with ${count} rows`);
    return true;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

// Function to update the news_articles table schema
async function updateNewsArticlesTable() {
  try {
    console.log('Updating news_articles table schema...');
    
    // Check if the table exists
    const tableExists = await checkTableExists('news_articles');
    if (!tableExists) {
      console.error('news_articles table does not exist');
      return false;
    }
    
    // Check if video_type column exists
    const videoTypeExists = await checkColumnExists('news_articles', 'video_type');
    if (!videoTypeExists) {
      console.log('video_type column does not exist, adding it...');
      const columnAdded = await addColumn('news_articles', 'video_type', 'VARCHAR(50)');
      if (!columnAdded) {
        console.error('Failed to add video_type column');
        return false;
      }
    } else {
      console.log('video_type column already exists');
    }
    
    // Check if tags column exists
    const tagsExists = await checkColumnExists('news_articles', 'tags');
    if (!tagsExists) {
      console.log('tags column does not exist, adding it...');
      const columnAdded = await addColumn('news_articles', 'tags', 'TEXT[] DEFAULT \'{}\'');
      if (!columnAdded) {
        console.error('Failed to add tags column');
        return false;
      }
    } else {
      console.log('tags column already exists');
    }
    
    // Check if views column exists
    const viewsExists = await checkColumnExists('news_articles', 'views');
    if (!viewsExists) {
      console.log('views column does not exist, adding it...');
      const columnAdded = await addColumn('news_articles', 'views', 'INTEGER DEFAULT 0');
      if (!columnAdded) {
        console.error('Failed to add views column');
        return false;
      }
    } else {
      console.log('views column already exists');
    }
    
    console.log('news_articles table schema updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating news_articles table schema:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Updating news_articles table schema in Supabase...');
  
  // Update the news_articles table schema
  const updated = await updateNewsArticlesTable();
  if (!updated) {
    console.error('Failed to update news_articles table schema');
    process.exit(1);
  }
  
  console.log('news_articles table schema updated successfully!');
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
