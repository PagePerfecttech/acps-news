// Simple script to test Supabase connection
require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? 'Key is set (not showing for security)' : 'Key is not set');

// Check if credentials are available
if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in environment variables.');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Main function
async function main() {
  console.log('Testing connection to Supabase...');
  
  try {
    // Try to get the session as a simple connection test
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      process.exit(1);
    }
    
    console.log('Successfully connected to Supabase!');
    
    // Try to query a table
    console.log('Checking if tables exist...');
    
    // Try to query the categories table
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (categoriesError) {
      console.error('Error querying categories table:', categoriesError);
      console.log('Categories table might not exist or you might not have permission to access it.');
    } else {
      console.log(`Categories table exists with ${categories.length} rows retrieved.`);
      console.log('Sample categories:', categories);
    }
    
    // Try to query the news_articles table
    const { data: articles, error: articlesError } = await supabase
      .from('news_articles')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (articlesError) {
      console.error('Error querying news_articles table:', articlesError);
      console.log('news_articles table might not exist or you might not have permission to access it.');
    } else {
      console.log(`news_articles table exists with ${articles.length} rows retrieved.`);
      console.log('Sample articles:', articles);
    }
    
    console.log('Connection test completed!');
  } catch (error) {
    console.error('Unexpected error during connection test:', error);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
