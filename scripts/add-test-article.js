// Script to add a test news article with all required fields
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

// Function to get a category ID
async function getCategoryId() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Error getting category ID:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log('No categories found. Creating a default category...');
      
      const { data: newCategory, error: insertError } = await supabase
        .from('categories')
        .insert({
          name: 'Default Category',
          slug: 'default-category'
        })
        .select();
      
      if (insertError) {
        console.error('Error creating default category:', insertError);
        return null;
      }
      
      return newCategory[0].id;
    }
    
    return data[0].id;
  } catch (error) {
    console.error('Error getting category ID:', error);
    return null;
  }
}

// Function to add a test news article
async function addTestNewsArticle() {
  try {
    console.log('Adding a test news article...');
    
    // Get a category ID
    const categoryId = await getCategoryId();
    if (!categoryId) {
      console.error('Failed to get a category ID.');
      return false;
    }
    
    console.log('Using category ID:', categoryId);
    
    // Create a test news article
    const { data, error } = await supabase
      .from('news_articles')
      .insert({
        title: 'Test Article ' + new Date().toISOString(),
        content: 'This is a test article created by the add-test-article.js script.',
        summary: 'Test article summary',
        category_id: categoryId,
        author: 'Test Author',
        image_url: 'https://via.placeholder.com/800x600',
        published: true,
        tags: ['test', 'article', 'script']
      })
      .select();
    
    if (error) {
      console.error('Error adding test news article:', error);
      return false;
    }
    
    console.log('Test news article added successfully!');
    console.log('Article:', data);
    
    return true;
  } catch (error) {
    console.error('Error adding test news article:', error);
    return false;
  }
}

// Function to list all news articles
async function listNewsArticles() {
  try {
    console.log('Listing all news articles...');
    
    const { data, error } = await supabase
      .from('news_articles')
      .select(`
        *,
        categories:category_id(name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error listing news articles:', error);
      return false;
    }
    
    console.log('News articles:');
    data.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title} (Category: ${article.categories?.name || 'None'})`);
    });
    
    return true;
  } catch (error) {
    console.error('Error listing news articles:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Testing news article creation...');
  
  // Add a test news article
  const articleAdded = await addTestNewsArticle();
  if (!articleAdded) {
    console.error('Failed to add test news article.');
    process.exit(1);
  }
  
  // List all news articles
  await listNewsArticles();
  
  console.log('Test completed!');
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
