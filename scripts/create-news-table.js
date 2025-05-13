// Script to create the news_articles table in Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tnaqvbrflguwpeafwclz.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuYXF2YnJmbGd1d3BlYWZ3Y2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NzE3NDIsImV4cCI6MjA2MjU0Nzc0Mn0.wosmLe8bA0LOJQttRD03c7tIa8woLbFNSVWuc0ntcME';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

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

// Function to create the news_articles table
async function createNewsArticlesTable() {
  try {
    console.log('Creating news_articles table...');
    
    // Check if the table already exists
    const tableExists = await checkTableExists('news_articles');
    if (tableExists) {
      console.log('news_articles table already exists');
      return true;
    }
    
    // Create the table using SQL
    const { error } = await supabase.rpc('pgexecute', {
      query: `
        CREATE TABLE IF NOT EXISTS news_articles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          summary TEXT,
          category_id VARCHAR(255),
          image_url TEXT,
          video_url TEXT,
          video_type VARCHAR(50),
          author VARCHAR(255),
          likes INTEGER DEFAULT 0,
          views INTEGER DEFAULT 0,
          published BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          tags TEXT[] DEFAULT '{}'::text[]
        );
      `
    });
    
    if (error) {
      console.error('Error creating news_articles table:', error);
      return false;
    }
    
    console.log('news_articles table created successfully');
    
    // Enable RLS and create a policy
    const { error: rlsError } = await supabase.rpc('pgexecute', {
      query: `
        ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow full access to all users" ON news_articles FOR ALL USING (true);
      `
    });
    
    if (rlsError) {
      console.error('Error enabling RLS and creating policy:', rlsError);
      // Continue anyway
    } else {
      console.log('RLS enabled and policy created successfully');
    }
    
    return true;
  } catch (error) {
    console.error('Error creating news_articles table:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Creating news_articles table in Supabase...');
  
  // Create the news_articles table
  const created = await createNewsArticlesTable();
  if (!created) {
    console.error('Failed to create news_articles table');
    process.exit(1);
  }
  
  console.log('news_articles table created successfully!');
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
