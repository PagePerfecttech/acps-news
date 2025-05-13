// Script to fix the issue with news articles not storing in Supabase
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

// Function to check if a table exists
async function checkTableExists(tableName) {
  try {
    const result = await executeRawQuery(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '${tableName}'
      );
    `);

    if (!result.success) {
      console.error(`Error checking if table ${tableName} exists:`, result.error);
      return false;
    }

    return result.data && result.data.length > 0 && result.data[0].exists;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
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

// Function to enable RLS and create a policy for a table
async function enableRLSAndCreatePolicy(tableName) {
  try {
    console.log(`Enabling RLS for ${tableName}...`);
    
    // Enable RLS
    const enableResult = await executeRawQuery(`
      ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;
    `);
    
    if (!enableResult.success) {
      console.error(`Error enabling RLS for ${tableName}:`, enableResult.error);
      return false;
    }
    
    console.log(`RLS enabled for ${tableName}`);
    
    // Check if a policy already exists
    const policies = await checkRLSPolicies(tableName);
    if (policies && policies.length > 0) {
      console.log(`Policies already exist for ${tableName}:`, policies);
      return true;
    }
    
    // Create a policy for all operations
    console.log(`Creating policy for ${tableName}...`);
    const policyResult = await executeRawQuery(`
      CREATE POLICY "Allow full access to all users" ON ${tableName} FOR ALL USING (true);
    `);
    
    if (!policyResult.success) {
      console.error(`Error creating policy for ${tableName}:`, policyResult.error);
      return false;
    }
    
    console.log(`Policy created for ${tableName}`);
    return true;
  } catch (error) {
    console.error(`Error enabling RLS and creating policy for ${tableName}:`, error);
    return false;
  }
}

// Function to fix the news_articles table
async function fixNewsArticlesTable() {
  try {
    console.log('Fixing news_articles table...');
    
    // Check if the table exists
    const tableExists = await checkTableExists('news_articles');
    if (!tableExists) {
      console.error('news_articles table does not exist');
      return false;
    }
    
    // Check if RLS is enabled
    const rlsEnabled = await checkRLSEnabled('news_articles');
    console.log('RLS enabled for news_articles:', rlsEnabled);
    
    // Enable RLS and create a policy if needed
    if (rlsEnabled === false) {
      const rlsFixed = await enableRLSAndCreatePolicy('news_articles');
      if (!rlsFixed) {
        console.error('Failed to enable RLS and create policy for news_articles');
        return false;
      }
    }
    
    // Check RLS policies
    const policies = await checkRLSPolicies('news_articles');
    console.log('RLS policies for news_articles:', policies);
    
    // If no policies exist, create one
    if (!policies || policies.length === 0) {
      const policyCreated = await enableRLSAndCreatePolicy('news_articles');
      if (!policyCreated) {
        console.error('Failed to create policy for news_articles');
        return false;
      }
    }
    
    console.log('news_articles table fixed successfully');
    return true;
  } catch (error) {
    console.error('Error fixing news_articles table:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Fixing news articles storage in Supabase...');
  
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
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
    process.exit(1);
  }
  
  // Fix the news_articles table
  const newsArticlesFixed = await fixNewsArticlesTable();
  if (!newsArticlesFixed) {
    console.error('Failed to fix news_articles table');
    process.exit(1);
  }
  
  console.log('News articles storage in Supabase fixed successfully!');
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
