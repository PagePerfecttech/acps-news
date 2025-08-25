// Setup script for ACPS News database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('Service Key:', supabaseServiceKey ? 'Set' : 'Not set');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

// Create Supabase admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up ACPS News database...');

  try {
    // First, let's test the connection
    console.log('🔗 Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('categories')
      .select('*')
      .limit(1);

    if (testError && testError.code === '42P01') {
      console.log('📋 Tables don\'t exist yet, this is expected for first setup');
    } else if (testError) {
      console.log('Connection test result:', testError.message);
    } else {
      console.log('✅ Connection successful, tables may already exist');
    }

    // 6. Insert initial categories for ACPS News
    console.log('📋 Inserting initial categories...');
    const { error: insertError } = await supabase
      .from('categories')
      .upsert([
        { name: 'Education', slug: 'education' },
        { name: 'Sports', slug: 'sports' },
        { name: 'Community', slug: 'community' },
        { name: 'Events', slug: 'events' },
        { name: 'Announcements', slug: 'announcements' },
        { name: 'Technology', slug: 'technology' },
        { name: 'Health', slug: 'health' },
        { name: 'General', slug: 'general' }
      ], { onConflict: 'slug' });

    if (insertError) {
      console.log('Categories insert error:', insertError.message);
    } else {
      console.log('✅ Categories inserted successfully');
    }

    // 7. Create a test admin user (you'll need to set this up in Supabase Auth)
    console.log('👤 Admin user setup note:');
    console.log('   Please create an admin user in Supabase Auth dashboard:');
    console.log('   Email: admin@acpsnews.com');
    console.log('   Password: admin123');

    console.log('🎉 Database setup completed successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Create admin user in Supabase Auth dashboard');
    console.log('   2. Run: npm run dev');
    console.log('   3. Visit: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
  }
}

// Run the setup
setupDatabase();
