// Script to fix the news_articles table columns using direct SQL
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tnaqvbrflguwpeafwclz.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuYXF2YnJmbGd1d3BlYWZ3Y2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NzE3NDIsImV4cCI6MjA2MjU0Nzc0Mn0.wosmLe8bA0LOJQttRD03c7tIa8woLbFNSVWuc0ntcME';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to execute SQL directly
async function executeSql(sql) {
  try {
    console.log('Executing SQL:', sql);
    
    const { data, error } = await supabase.rpc('pgexecute', { query: sql });
    
    if (error) {
      console.error('Error executing SQL:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error executing SQL:', error);
    return { success: false, error };
  }
}

// Function to fix the news_articles table
async function fixNewsArticlesTable() {
  try {
    console.log('Fixing news_articles table...');
    
    // Add all the required columns in one go
    const sql = `
      ALTER TABLE news_articles 
      ADD COLUMN IF NOT EXISTS video_url TEXT,
      ADD COLUMN IF NOT EXISTS video_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS image_url TEXT,
      ADD COLUMN IF NOT EXISTS summary TEXT,
      ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::text[];
    `;
    
    const result = await executeSql(sql);
    
    if (!result.success) {
      console.error('Error fixing news_articles table:', result.error);
      return false;
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
