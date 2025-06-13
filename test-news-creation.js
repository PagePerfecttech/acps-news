// Test script to verify news article creation with Supabase
require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing news article creation...');
console.log('Supabase URL:', supabaseUrl);
console.log('Service Key available:', !!supabaseServiceKey);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase credentials not found in environment variables.');
  process.exit(1);
}

// Create Supabase client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testNewsCreation() {
  try {
    console.log('\n🧪 Testing news article creation...');
    
    // Create test article data
    const now = new Date().toISOString();
    const testArticle = {
      title: 'Test News Article - ' + new Date().toLocaleString(),
      content: 'This is a test news article to verify that the creation process is working correctly.',
      summary: 'Test article summary for verification',
      category_id: '91311113-3edc-4fc5-b666-bac2a473beca', // Cinema category from the test
      image_url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000',
      video_url: '',
      video_type: '',
      author: 'Test Author',
      published: true,
      created_at: now,
      updated_at: now
    };
    
    console.log('Inserting test article:', testArticle.title);
    
    // Insert into Supabase
    const { data, error } = await supabaseAdmin
      .from('news_articles')
      .insert([testArticle])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase error:', error);
      return false;
    }
    
    console.log('✅ Article created successfully!');
    console.log('Article ID:', data.id);
    console.log('Article Title:', data.title);
    
    return true;
  } catch (error) {
    console.error('❌ Error in testNewsCreation:', error);
    return false;
  }
}

async function testCategoriesFetch() {
  try {
    console.log('\n📂 Testing categories fetch...');
    
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Error fetching categories:', error);
      return false;
    }
    
    console.log('✅ Categories fetched successfully!');
    console.log('Available categories:');
    data.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.slug})`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error in testCategoriesFetch:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting Supabase news creation test...\n');
  
  // Test categories fetch
  const categoriesSuccess = await testCategoriesFetch();
  if (!categoriesSuccess) {
    console.error('❌ Categories test failed');
    process.exit(1);
  }
  
  // Test news creation
  const newsSuccess = await testNewsCreation();
  if (!newsSuccess) {
    console.error('❌ News creation test failed');
    process.exit(1);
  }
  
  console.log('\n🎉 All tests passed! News article creation is working correctly.');
  console.log('\n📝 Summary:');
  console.log('  ✅ Supabase connection: Working');
  console.log('  ✅ Categories fetch: Working');
  console.log('  ✅ News article creation: Working');
  console.log('\nThe "Invalid API key" error should now be resolved!');
}

main().catch(console.error);
