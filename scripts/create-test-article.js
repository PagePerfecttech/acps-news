// Script to create a test news article in Supabase
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

// Function to create a test news article
async function createTestNewsArticle() {
  console.log('Creating a test news article...');

  // First, get a category ID
  const getCategoryResult = await executeRawQuery(`
    SELECT id FROM categories LIMIT 1;
  `);

  let categoryId = null;
  if (getCategoryResult.success && getCategoryResult.data && getCategoryResult.data.length > 0) {
    categoryId = getCategoryResult.data[0].id;
    console.log('Using category ID:', categoryId);
  } else {
    console.log('No categories found. Creating a test category...');
    
    const createCategoryResult = await executeRawQuery(`
      INSERT INTO categories (name, slug)
      VALUES ('Test Category', 'test-category')
      RETURNING id;
    `);
    
    if (createCategoryResult.success && createCategoryResult.data && createCategoryResult.data.length > 0) {
      categoryId = createCategoryResult.data[0].id;
      console.log('Created test category with ID:', categoryId);
    } else {
      console.error('Failed to create test category:', createCategoryResult.error);
    }
  }

  // Now create the test article
  const createArticleResult = await executeRawQuery(`
    INSERT INTO news_articles (
      title,
      content,
      summary,
      category_id,
      author,
      image_url,
      published
    ) VALUES (
      'Test Article',
      'This is a test article created by the create-test-article.js script.',
      'Test article summary',
      ${categoryId ? `'${categoryId}'` : 'NULL'},
      'Test Author',
      'https://via.placeholder.com/800x600',
      true
    )
    RETURNING id, title;
  `);

  if (createArticleResult.success) {
    console.log('Test article created successfully!');
    console.log('Article:', createArticleResult.data);
    return true;
  } else {
    console.error('Failed to create test article:', createArticleResult.error);
    return false;
  }
}

// Function to create a test ad
async function createTestAd() {
  console.log('Creating a test ad...');

  const createAdResult = await executeRawQuery(`
    INSERT INTO ads (
      title,
      description,
      image_url,
      link_url,
      active
    ) VALUES (
      'Test Ad',
      'This is a test ad created by the create-test-article.js script.',
      'https://via.placeholder.com/300x250',
      'https://example.com',
      true
    )
    RETURNING id, title;
  `);

  if (createAdResult.success) {
    console.log('Test ad created successfully!');
    console.log('Ad:', createAdResult.data);
    return true;
  } else {
    console.error('Failed to create test ad:', createAdResult.error);
    return false;
  }
}

// Function to create a test site setting
async function createTestSiteSetting() {
  console.log('Creating a test site setting...');

  const createSettingResult = await executeRawQuery(`
    INSERT INTO site_settings (
      key,
      value
    ) VALUES (
      'test_setting',
      'This is a test setting created by the create-test-article.js script.'
    )
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    RETURNING key, value;
  `);

  if (createSettingResult.success) {
    console.log('Test site setting created successfully!');
    console.log('Setting:', createSettingResult.data);
    return true;
  } else {
    console.error('Failed to create test site setting:', createSettingResult.error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Testing Supabase database...');

  // Check connection to Supabase
  try {
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

  // Create a test news article
  await createTestNewsArticle();

  // Create a test ad
  await createTestAd();

  // Create a test site setting
  await createTestSiteSetting();

  console.log('Test data creation completed!');
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
