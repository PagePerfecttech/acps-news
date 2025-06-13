// Direct test of the admin news API logic
require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Simulate the admin news API logic
async function testAdminNewsAPI() {
  console.log('🧪 Testing Admin News API Logic...\n');
  
  // Get environment variables (same as in the API route)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  console.log('Environment Check:');
  console.log('- Supabase URL:', supabaseUrl);
  console.log('- Service Key available:', !!supabaseServiceKey);
  console.log('- Service Key length:', supabaseServiceKey.length);
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables');
    return false;
  }
  
  // Create Supabase admin client (same as in the API route)
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    console.log('\n📝 Creating test article...');
    
    // Simulate request body (same structure as from the frontend)
    const body = {
      title: 'Test Article from API Test - ' + new Date().toLocaleString(),
      content: 'This is a test article to verify the admin news API is working correctly.',
      summary: 'Test article summary',
      category_id: '91311113-3edc-4fc5-b666-bac2a473beca', // Cinema category
      image_url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000',
      video_url: '',
      video_type: '',
      author: 'API Test',
      published: true
    };
    
    console.log('Article data:', {
      title: body.title,
      category_id: body.category_id,
      author: body.author
    });
    
    // Validate required fields (same as in API route)
    if (!body.title || !body.content) {
      console.error('❌ Missing required fields: title, content');
      return false;
    }
    
    // Create article object for Supabase (same as in API route)
    const now = new Date().toISOString();
    const article = {
      title: body.title,
      content: body.content,
      summary: body.summary || '',
      category_id: body.category_id || 'general',
      image_url: body.image_url || '',
      video_url: body.video_url || '',
      video_type: body.video_type || '',
      author: body.author || 'Admin',
      published: body.published !== false,
      created_at: now,
      updated_at: now
    };
    
    console.log('\n🔄 Inserting article into Supabase...');
    
    // Insert into Supabase (same as in API route)
    const { data, error } = await supabaseAdmin
      .from('news_articles')
      .insert([article])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return false;
    }
    
    console.log('✅ Article saved successfully!');
    console.log('Article ID:', data.id);
    console.log('Article Title:', data.title);
    console.log('Created At:', data.created_at);
    
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return false;
  }
}

// Test categories fetch as well
async function testCategoriesFetch() {
  console.log('\n📂 Testing Categories Fetch...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('❌ Categories fetch error:', error);
      return false;
    }
    
    console.log('✅ Categories fetched successfully!');
    console.log('Available categories:');
    data.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.slug}) [ID: ${cat.id}]`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Categories fetch error:', error);
    return false;
  }
}

// Main test function
async function main() {
  console.log('🚀 Starting Admin News API Test\n');
  console.log('This test simulates the exact logic used in /api/admin/news\n');
  
  // Test categories first
  const categoriesOk = await testCategoriesFetch();
  if (!categoriesOk) {
    console.error('\n❌ Categories test failed - stopping');
    process.exit(1);
  }
  
  // Test news creation
  const newsOk = await testAdminNewsAPI();
  if (!newsOk) {
    console.error('\n❌ News API test failed');
    process.exit(1);
  }
  
  console.log('\n🎉 All tests passed!');
  console.log('\n📋 Summary:');
  console.log('  ✅ Environment variables: Configured');
  console.log('  ✅ Supabase connection: Working');
  console.log('  ✅ Categories fetch: Working');
  console.log('  ✅ News article creation: Working');
  console.log('\n💡 The "Invalid API key" error should now be resolved!');
  console.log('   Try creating a news article through the web interface.');
}

main().catch(console.error);
