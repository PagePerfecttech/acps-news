// Script to test Supabase service role key
require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if credentials are available
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase credentials not found in environment variables.');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file.');
  process.exit(1);
}

// Create Supabase client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Function to test fetching categories
async function testFetchCategories() {
  try {
    console.log('Testing fetching categories with service role key...');
    
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('Error fetching categories:', error);
      return false;
    }
    
    console.log('Successfully fetched categories:');
    console.log(data);
    
    return true;
  } catch (error) {
    console.error('Error in testFetchCategories:', error);
    return false;
  }
}

// Function to test inserting a test article
async function testInsertArticle() {
  try {
    console.log('Testing inserting a test article with service role key...');
    
    // Get a random category
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from('categories')
      .select('id, name')
      .limit(10);
    
    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return false;
    }
    
    if (!categories || categories.length === 0) {
      console.error('No categories found in the database');
      return false;
    }
    
    // Select a random category
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // Create a test article
    const testArticle = {
      title: `Test Article - ${new Date().toLocaleString()}`,
      content: 'This is a test article created with the service role key.',
      summary: 'Test article summary',
      category_id: randomCategory.id,
      image_url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000',
      author: 'Service Role Test',
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert the article
    const { data, error } = await supabaseAdmin
      .from('news_articles')
      .insert([testArticle])
      .select();
    
    if (error) {
      console.error('Error inserting article:', error);
      return false;
    }
    
    console.log('Successfully inserted test article:');
    console.log(data[0]);
    
    return true;
  } catch (error) {
    console.error('Error in testInsertArticle:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Testing Supabase service role key...');
  
  // Test connection to Supabase
  try {
    console.log('Testing connection to Supabase with service role key...');
    const { data, error } = await supabaseAdmin.auth.getSession();
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      process.exit(1);
    }
    
    console.log('Successfully connected to Supabase with service role key!');
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
    process.exit(1);
  }
  
  // Test fetching categories
  const categoriesSuccess = await testFetchCategories();
  
  if (!categoriesSuccess) {
    console.error('Failed to fetch categories with service role key.');
    process.exit(1);
  }
  
  // Test inserting a test article
  const insertSuccess = await testInsertArticle();
  
  if (!insertSuccess) {
    console.error('Failed to insert test article with service role key.');
    process.exit(1);
  }
  
  console.log('All tests passed! Service role key is working correctly.');
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
