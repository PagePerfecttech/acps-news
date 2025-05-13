// Script to add missing columns to the news_articles table in Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tnaqvbrflguwpeafwclz.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuYXF2YnJmbGd1d3BlYWZ3Y2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NzE3NDIsImV4cCI6MjA2MjU0Nzc0Mn0.wosmLe8bA0LOJQttRD03c7tIa8woLbFNSVWuc0ntcME';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

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

// Function to get table columns
async function getTableColumns(tableName) {
  try {
    console.log(`Getting columns for table ${tableName}...`);
    
    const { data, error } = await supabase.rpc('pgexecute', {
      query: `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = '${tableName}'
        ORDER BY ordinal_position;
      `
    });
    
    if (error) {
      console.error(`Error getting columns for table ${tableName}:`, error);
      return null;
    }
    
    console.log(`Retrieved ${data.length} columns for table ${tableName}`);
    return data;
  } catch (error) {
    console.error(`Error getting columns for table ${tableName}:`, error);
    return null;
  }
}

// Function to check if a table exists
async function checkTableExists(tableName) {
  try {
    console.log(`Checking if table ${tableName} exists...`);
    
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
    
    const exists = data && data.length > 0 && data[0].exists;
    console.log(`Table ${tableName} ${exists ? 'exists' : 'does not exist'}`);
    return exists;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

// Function to fix the news_articles table
async function fixNewsArticlesTable() {
  try {
    console.log('Fixing news_articles table...');
    
    // Check if the table exists
    const tableExists = await checkTableExists('news_articles');
    if (!tableExists) {
      console.error('news_articles table does not exist');
      return false;
    }
    
    // Get the current columns
    const columns = await getTableColumns('news_articles');
    if (!columns) {
      console.error('Failed to get columns for news_articles table');
      return false;
    }
    
    // Check which columns we need to add
    const columnNames = columns.map(col => col.column_name);
    console.log('Current columns:', columnNames);
    
    // Define the columns we need
    const requiredColumns = [
      { name: 'video_url', type: 'TEXT' },
      { name: 'video_type', type: 'VARCHAR(50)' },
      { name: 'views', type: 'INTEGER DEFAULT 0' },
      { name: 'tags', type: 'TEXT[] DEFAULT \'{}\'::text[]' },
      { name: 'image_url', type: 'TEXT' },
      { name: 'summary', type: 'TEXT' }
    ];
    
    // Add missing columns
    for (const col of requiredColumns) {
      if (!columnNames.includes(col.name)) {
        console.log(`Column ${col.name} is missing, adding it...`);
        const added = await addColumn('news_articles', col.name, col.type);
        if (!added) {
          console.error(`Failed to add column ${col.name}`);
          // Continue with other columns
        }
      } else {
        console.log(`Column ${col.name} already exists`);
      }
    }
    
    console.log('news_articles table fixed successfully');
    return true;
  } catch (error) {
    console.error('Error fixing news_articles table:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Fixing news_articles table in Supabase...');
  
  // Fix the news_articles table
  const fixed = await fixNewsArticlesTable();
  if (!fixed) {
    console.error('Failed to fix news_articles table');
    process.exit(1);
  }
  
  console.log('news_articles table fixed successfully!');
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
