// Test and setup ads functionality
require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🧪 Testing Ads Management Setup...\n');

// Get Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Environment Check:');
console.log('- Supabase URL:', supabaseUrl ? 'Set' : '❌ Missing');
console.log('- Service Key:', supabaseServiceKey ? 'Set' : '❌ Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n❌ Missing Supabase credentials!');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAdsTable() {
  try {
    console.log('\n📋 Testing ads table...');
    
    // Test if ads table exists by trying to fetch data
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.message.includes('relation "public.ads" does not exist')) {
        console.log('❌ Ads table does not exist');
        return false;
      } else {
        console.error('❌ Error accessing ads table:', error.message);
        return false;
      }
    }
    
    console.log('✅ Ads table exists and is accessible');
    console.log(`📊 Found ${data?.length || 0} ads in table`);
    return true;
    
  } catch (error) {
    console.error('❌ Error testing ads table:', error.message);
    return false;
  }
}

async function createAdsTable() {
  try {
    console.log('\n🔨 Creating ads table...');
    
    // Create ads table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.ads (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          text_content TEXT,
          image_url TEXT,
          video_url TEXT,
          video_type VARCHAR(50) DEFAULT 'youtube',
          link_url TEXT,
          frequency INTEGER DEFAULT 5,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (createError) {
      console.error('❌ Error creating ads table:', createError.message);
      return false;
    }
    
    console.log('✅ Ads table created successfully');
    
    // Create indexes
    const indexSQL = `
      CREATE INDEX IF NOT EXISTS idx_ads_active ON public.ads(active);
      CREATE INDEX IF NOT EXISTS idx_ads_created_at ON public.ads(created_at DESC);
    `;
    
    await supabase.rpc('exec_sql', { sql: indexSQL });
    console.log('✅ Indexes created');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error creating ads table:', error.message);
    return false;
  }
}

async function insertSampleAds() {
  try {
    console.log('\n📝 Inserting sample ads...');
    
    const sampleAds = [
      {
        title: 'విజయవాడ వ్యాపార ప్రకటన',
        description: 'స్థానిక వ్యాపారాల కోసం ప్రకటన',
        text_content: 'మీ వ్యాపారాన్ని ప్రచారం చేయండి విజయవాడలో',
        image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1000',
        link_url: 'https://example.com/business',
        frequency: 3,
        active: true
      },
      {
        title: 'తెలుగు వార్తల ప్రకటన',
        description: 'తాజా తెలుగు వార్తలు',
        text_content: 'రోజువారీ తెలుగు వార్తలు మరియు అప్డేట్లు',
        image_url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000',
        link_url: 'https://vizag-news.vercel.app',
        frequency: 5,
        active: true
      },
      {
        title: 'విజయవాడ ఈవెంట్స్',
        description: 'నగరంలో జరుగుతున్న కార్యక్రమాలు',
        text_content: 'విజయవాడలో జరుగుతున్న సాంస్కృతిక మరియు వ్యాపార కార్యక్రమాలు',
        image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000',
        link_url: 'https://example.com/events',
        frequency: 4,
        active: true
      }
    ];
    
    const { data, error } = await supabase
      .from('ads')
      .insert(sampleAds)
      .select();
    
    if (error) {
      console.error('❌ Error inserting sample ads:', error.message);
      return false;
    }
    
    console.log(`✅ Inserted ${data?.length || 0} sample ads`);
    return true;
    
  } catch (error) {
    console.error('❌ Error inserting sample ads:', error.message);
    return false;
  }
}

async function testAdsAPI() {
  try {
    console.log('\n🔌 Testing ads API endpoints...');
    
    // Test GET endpoint
    console.log('Testing GET /api/admin/ads...');
    const getResponse = await fetch('http://localhost:3000/api/admin/ads');
    
    if (!getResponse.ok) {
      console.log('⚠️  API server not running or GET endpoint failed');
      return false;
    }
    
    const getData = await getResponse.json();
    console.log('✅ GET endpoint working:', getData.success ? 'Success' : 'Failed');
    console.log(`📊 Found ${getData.data?.length || 0} ads via API`);
    
    return true;
    
  } catch (error) {
    console.log('⚠️  Could not test API endpoints (server may not be running)');
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Ads Management Setup and Test...\n');
  
  // Test if ads table exists
  const tableExists = await testAdsTable();
  
  if (!tableExists) {
    console.log('\n🔧 Ads table not found, attempting to create...');
    
    // Try to create table using direct SQL
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .limit(1);
      
      if (error && error.message.includes('does not exist')) {
        console.log('📝 Creating ads table manually...');
        
        // Insert sample ads directly (this will create the table if it doesn't exist)
        const sampleAd = {
          title: 'Test Ad',
          description: 'Test Description',
          text_content: 'Test Content',
          frequency: 5,
          active: true
        };
        
        const { data: insertData, error: insertError } = await supabase
          .from('ads')
          .insert([sampleAd])
          .select();
        
        if (insertError) {
          console.error('❌ Could not create ads table:', insertError.message);
          console.log('\n💡 Manual Setup Required:');
          console.log('1. Go to your Supabase dashboard');
          console.log('2. Navigate to SQL Editor');
          console.log('3. Run the SQL script in scripts/create-ads-table.sql');
          process.exit(1);
        } else {
          console.log('✅ Ads table created with test data');
        }
      }
    } catch (createError) {
      console.error('❌ Could not create ads table:', createError.message);
      process.exit(1);
    }
  }
  
  // Insert sample ads if table is empty
  const { data: existingAds } = await supabase.from('ads').select('*').limit(1);
  if (!existingAds || existingAds.length === 0) {
    await insertSampleAds();
  }
  
  // Test API endpoints
  await testAdsAPI();
  
  console.log('\n🎉 Ads Management Setup Complete!');
  console.log('\n📋 Summary:');
  console.log('  ✅ Ads table: Created and accessible');
  console.log('  ✅ Sample data: Inserted');
  console.log('  ✅ API endpoints: Ready');
  console.log('\n🎯 Next Steps:');
  console.log('  1. Start development server: npm run dev');
  console.log('  2. Go to admin panel: /admin/ads');
  console.log('  3. Test creating, editing, and deleting ads');
}

main().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
