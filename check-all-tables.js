// Script to check all tables in the Supabase database
require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if credentials are available
if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in environment variables.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// List of tables to check from the schema
const tablesToCheck = [
  'users',
  'categories',
  'news_articles',
  'comments',
  'saved_articles',
  'likes',
  'ads',
  'rss_feeds',
  'site_settings'
];

// Function to check if a table exists
async function checkTable(tableName) {
  try {
    console.log(`Checking table: ${tableName}`);
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error(`  ❌ Error checking ${tableName} table:`, error.message);
      return false;
    }
    
    console.log(`  ✅ ${tableName} table exists with ${count} rows`);
    return true;
  } catch (error) {
    console.error(`  ❌ Error checking ${tableName} table:`, error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('Checking all tables in the Supabase database...');
  
  const results = {};
  let allTablesExist = true;
  
  for (const table of tablesToCheck) {
    const exists = await checkTable(table);
    results[table] = exists;
    if (!exists) allTablesExist = false;
  }
  
  console.log('\nSummary:');
  for (const [table, exists] of Object.entries(results)) {
    console.log(`${exists ? '✅' : '❌'} ${table}`);
  }
  
  if (allTablesExist) {
    console.log('\n✅ All tables exist in the database!');
  } else {
    console.log('\n❌ Some tables are missing. You may need to run the schema SQL file.');
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
