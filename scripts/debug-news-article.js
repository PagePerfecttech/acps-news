// Script to debug issues with adding news articles to Supabase
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

// Function to check table structure
async function checkTableStructure(tableName) {
  try {
    const result = await executeRawQuery(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = '${tableName}'
      ORDER BY ordinal_position;
    `);

    if (!result.success) {
      console.error(`Error checking table structure for ${tableName}:`, result.error);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error(`Error checking table structure for ${tableName}:`, error);
    return null;
  }
}

// Function to check RLS policies
async function checkRLSPolicies(tableName) {
  try {
    const result = await executeRawQuery(`
      SELECT pol.polname AS policy_name,
             CASE pol.polpermissive WHEN 't' THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END AS permissive,
             CASE pol.polcmd
               WHEN 'r' THEN 'SELECT'
               WHEN 'a' THEN 'INSERT'
               WHEN 'w' THEN 'UPDATE'
               WHEN 'd' THEN 'DELETE'
               WHEN '*' THEN 'ALL'
             END AS command,
             pg_get_expr(pol.polqual, pol.polrelid) AS using_expression,
             pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check_expression,
             CASE pol.polroles[1] WHEN 0 THEN 'PUBLIC' ELSE 'SPECIFIC ROLES' END AS roles
      FROM pg_policy pol
      JOIN pg_class cls ON pol.polrelid = cls.oid
      JOIN pg_namespace ns ON cls.relnamespace = ns.oid
      WHERE ns.nspname = 'public'
      AND cls.relname = '${tableName}';
    `);

    if (!result.success) {
      console.error(`Error checking RLS policies for ${tableName}:`, result.error);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error(`Error checking RLS policies for ${tableName}:`, error);
    return null;
  }
}

// Function to check if RLS is enabled
async function checkRLSEnabled(tableName) {
  try {
    const result = await executeRawQuery(`
      SELECT relrowsecurity
      FROM pg_class
      JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
      WHERE pg_namespace.nspname = 'public'
      AND pg_class.relname = '${tableName}';
    `);

    if (!result.success) {
      console.error(`Error checking if RLS is enabled for ${tableName}:`, result.error);
      return null;
    }

    return result.data && result.data.length > 0 ? result.data[0].relrowsecurity : null;
  } catch (error) {
    console.error(`Error checking if RLS is enabled for ${tableName}:`, error);
    return null;
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
      'This is a test article created by the debug-news-article.js script.',
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

// Function to test direct insert using Supabase client
async function testDirectInsert() {
  console.log('Testing direct insert using Supabase client...');

  try {
    const { data, error } = await supabase
      .from('news_articles')
      .insert({
        title: 'Direct Insert Test',
        content: 'This is a test article created using direct insert.',
        summary: 'Direct insert test summary',
        author: 'Test Author',
        published: true
      })
      .select();

    if (error) {
      console.error('Error with direct insert:', error);
      return false;
    }

    console.log('Direct insert successful!');
    console.log('Article:', data);
    return true;
  } catch (error) {
    console.error('Exception during direct insert:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Debugging news article insertion...');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Key (first 10 chars):', supabaseKey.substring(0, 10) + '...');

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
    console.log('Server version:', data);
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
    process.exit(1);
  }

  // Check news_articles table structure
  console.log('Checking news_articles table structure...');
  const newsArticlesStructure = await checkTableStructure('news_articles');
  console.log('news_articles table structure:');
  console.log(newsArticlesStructure);

  // Check if RLS is enabled for news_articles
  console.log('Checking if RLS is enabled for news_articles...');
  const rlsEnabled = await checkRLSEnabled('news_articles');
  console.log('RLS enabled:', rlsEnabled);

  // Check RLS policies for news_articles
  console.log('Checking RLS policies for news_articles...');
  const rlsPolicies = await checkRLSPolicies('news_articles');
  console.log('RLS policies:');
  console.log(rlsPolicies);

  // Try to create a test article
  console.log('Trying to create a test article...');
  const articleCreated = await createTestNewsArticle();
  console.log('Article created:', articleCreated);

  // Try direct insert
  console.log('Trying direct insert...');
  const directInsertSuccessful = await testDirectInsert();
  console.log('Direct insert successful:', directInsertSuccessful);

  console.log('Debug completed!');
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
