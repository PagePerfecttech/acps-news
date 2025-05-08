// This script initializes the categories table with default categories
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Default categories to create
const defaultCategories = [
  { name: 'News', slug: 'news' },
  { name: 'Business', slug: 'business' },
  { name: 'Technology', slug: 'technology' },
  { name: 'Sports', slug: 'sports' },
  { name: 'Entertainment', slug: 'entertainment' },
  { name: 'Lifestyle', slug: 'lifestyle' },
  { name: 'Health', slug: 'health' },
  { name: 'Science', slug: 'science' },
  { name: 'Regional', slug: 'regional' },
  { name: 'Politics', slug: 'politics' },
  { name: 'World', slug: 'world' },
  { name: 'Opinion', slug: 'opinion' },
  { name: 'Food', slug: 'food' },
  { name: 'Travel', slug: 'travel' },
  { name: 'Culture', slug: 'culture' }
];

async function initCategories() {
  console.log('Initializing categories table...');

  try {
    // Check if the categories table exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'categories');

    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return;
    }

    if (tables.length === 0) {
      console.log('Categories table does not exist. Creating it...');
      
      // Create the categories table
      const { error: createError } = await supabase.sql`
        CREATE TABLE IF NOT EXISTS categories (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      if (createError) {
        console.error('Error creating categories table:', createError);
        return;
      }
      
      console.log('Categories table created successfully!');
    } else {
      console.log('Categories table exists.');
    }

    // Check if there are any categories
    const { data: existingCategories, error: countError } = await supabase
      .from('categories')
      .select('id')
      .limit(1);

    if (countError) {
      console.error('Error checking categories count:', countError);
      return;
    }

    // If no categories exist, add the default ones
    if (!existingCategories || existingCategories.length === 0) {
      console.log('No categories found. Adding default categories...');
      
      // Add default categories
      const { data, error } = await supabase
        .from('categories')
        .insert(defaultCategories)
        .select();
      
      if (error) {
        console.error('Error adding default categories:', error);
        return;
      }
      
      console.log(`Added ${data.length} default categories.`);
    } else {
      console.log('Categories already exist. Skipping default categories.');
    }

    // Enable RLS on categories table
    console.log('Setting up RLS policies...');
    
    // Enable RLS on categories table
    const { error: rlsError } = await supabase.sql`
      ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
    `;
    
    if (rlsError) {
      console.error('Error enabling RLS:', rlsError);
      // Continue anyway
    }
    
    // Check if policies exist
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname')
      .eq('tablename', 'categories');
    
    if (policiesError) {
      console.error('Error checking policies:', policiesError);
      // Continue anyway
    }
    
    // Create policies if they don't exist
    if (!policies || policies.length === 0) {
      console.log('Creating RLS policies...');
      
      // Create policy for authenticated users
      const { error: authPolicyError } = await supabase.sql`
        CREATE POLICY "Allow full access to authenticated users" ON categories
        FOR ALL USING (true);
      `;
      
      if (authPolicyError) {
        console.error('Error creating authenticated policy:', authPolicyError);
        // Continue anyway
      }
      
      // Create policy for anonymous users
      const { error: anonPolicyError } = await supabase.sql`
        CREATE POLICY "Allow read access to anonymous users" ON categories
        FOR SELECT USING (true);
      `;
      
      if (anonPolicyError) {
        console.error('Error creating anonymous policy:', anonPolicyError);
        // Continue anyway
      }
      
      console.log('RLS policies created successfully!');
    } else {
      console.log('RLS policies already exist.');
    }
    
    console.log('Categories initialization complete!');
  } catch (error) {
    console.error('Error initializing categories:', error);
  }
}

// Run the function
initCategories();
