const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase credentials
const supabaseUrl = 'https://wtwetyalktzkimwtiwun.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0d2V0eWFsa3R6a2ltd3Rpd3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MTgxNTksImV4cCI6MjA2NTI5NDE1OX0.44EU7VKJPO7W7Xpvf-X6zp58O0KuBYZ0seRTfLextR0';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database...');
  
  try {
    // Test connection first
    console.log('📡 Testing connection...');
    const { data, error } = await supabase.from('_test').select('*').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.error('❌ Connection failed:', error);
      return;
    }
    console.log('✅ Connection successful!');

    // Read and execute the schema file
    console.log('📄 Reading schema file...');
    const schemaPath = path.join(__dirname, 'supabase-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🔧 Executing schema...');
    console.log('Note: You need to run this SQL in your Supabase SQL Editor:');
    console.log('='.repeat(60));
    console.log(schema);
    console.log('='.repeat(60));
    
    console.log('📋 Instructions:');
    console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Copy and paste the SQL above');
    console.log('5. Click "Run" to execute');
    
    // Try to check if tables exist
    console.log('🔍 Checking if tables exist...');
    
    // Check categories table
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(1);
    
    if (!catError) {
      console.log('✅ Categories table exists and is accessible');
    } else {
      console.log('⚠️  Categories table not found or not accessible:', catError.message);
    }
    
    // Check news_articles table
    const { data: articles, error: artError } = await supabase
      .from('news_articles')
      .select('*')
      .limit(1);
    
    if (!artError) {
      console.log('✅ News articles table exists and is accessible');
    } else {
      console.log('⚠️  News articles table not found or not accessible:', artError.message);
    }
    
    // Check site_settings table
    const { data: settings, error: setError } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1);
    
    if (!setError) {
      console.log('✅ Site settings table exists and is accessible');
    } else {
      console.log('⚠️  Site settings table not found or not accessible:', setError.message);
    }

  } catch (error) {
    console.error('❌ Error setting up database:', error);
  }
}

// Run the setup
setupDatabase();
