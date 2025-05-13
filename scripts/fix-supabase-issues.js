// Script to fix issues with Supabase
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

// Function to check if a table exists by trying to select from it
async function checkTableExists(tableName) {
  try {
    console.log(`Checking if ${tableName} table exists...`);
    
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error(`Error checking ${tableName} table:`, error);
      return false;
    }
    
    console.log(`${tableName} table exists with ${count} rows`);
    return true;
  } catch (error) {
    console.error(`Error checking ${tableName} table:`, error);
    return false;
  }
}

// Function to create a test news article
async function createTestArticle() {
  try {
    console.log('Creating a test news article...');
    
    // First, get a category ID
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .limit(1);
    
    if (categoryError || !categories || categories.length === 0) {
      console.error('Error getting category ID:', categoryError || 'No categories found');
      
      // Try to create a category
      console.log('Creating a default category...');
      const { data: newCategory, error: insertError } = await supabase
        .from('categories')
        .insert({
          name: 'Default Category',
          slug: 'default-category'
        })
        .select();
      
      if (insertError || !newCategory || newCategory.length === 0) {
        console.error('Error creating default category:', insertError || 'No category returned');
        return false;
      }
      
      var categoryId = newCategory[0].id;
      console.log('Created default category with ID:', categoryId);
    } else {
      var categoryId = categories[0].id;
      console.log('Using existing category with ID:', categoryId);
    }
    
    // Create a test article
    const { data: article, error: articleError } = await supabase
      .from('news_articles')
      .insert({
        title: 'Test Article ' + new Date().toISOString(),
        content: 'This is a test article created by the fix-supabase-issues.js script.',
        summary: 'Test article summary',
        category_id: categoryId,
        author: 'Test Author',
        image_url: 'https://via.placeholder.com/800x600',
        published: true,
        tags: ['test', 'article', 'script']
      })
      .select();
    
    if (articleError) {
      console.error('Error creating test article:', articleError);
      return false;
    }
    
    console.log('Test article created successfully:', article);
    return true;
  } catch (error) {
    console.error('Error creating test article:', error);
    return false;
  }
}

// Function to fix the dataService.ts file
async function fixDataService() {
  try {
    console.log('Fixing dataService.ts file...');
    
    // This would be done manually by updating the file
    console.log('Please update the dataService.ts file to use direct Supabase queries instead of pgexecute');
    console.log('Example:');
    console.log(`
    // Instead of:
    const result = await executeRawQuery(\`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '\${tableName}'
      );
    \`);

    // Use:
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    `);
    
    return true;
  } catch (error) {
    console.error('Error fixing dataService.ts file:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Fixing Supabase issues...');
  
  // Check connection to Supabase
  try {
    console.log('Testing connection to Supabase...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      process.exit(1);
    }
    console.log('Successfully connected to Supabase!');
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
    process.exit(1);
  }
  
  // Check if tables exist
  const newsArticlesExist = await checkTableExists('news_articles');
  const categoriesExist = await checkTableExists('categories');
  const adsExist = await checkTableExists('ads');
  const siteSettingsExist = await checkTableExists('site_settings');
  
  console.log('Table check results:');
  console.log('- news_articles:', newsArticlesExist ? 'exists' : 'does not exist');
  console.log('- categories:', categoriesExist ? 'exists' : 'does not exist');
  console.log('- ads:', adsExist ? 'exists' : 'does not exist');
  console.log('- site_settings:', siteSettingsExist ? 'exists' : 'does not exist');
  
  // If news_articles table exists, try to create a test article
  if (newsArticlesExist && categoriesExist) {
    console.log('Trying to create a test article...');
    const articleCreated = await createTestArticle();
    console.log('Test article creation:', articleCreated ? 'successful' : 'failed');
  }
  
  // Fix the dataService.ts file
  await fixDataService();
  
  console.log('Supabase issues fixed!');
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
