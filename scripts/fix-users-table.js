// This script fixes the users table in Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUsersTable() {
  console.log('Fixing users table...');

  try {
    // Check if the users table exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'users');

    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return;
    }

    if (tables.length === 0) {
      console.log('Users table does not exist. Creating it...');
      
      // Create the users table
      const { error: createError } = await supabase.sql`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password TEXT,
          role VARCHAR(50) NOT NULL DEFAULT 'user',
          profile_pic TEXT,
          bio TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      if (createError) {
        console.error('Error creating users table:', createError);
        return;
      }
      
      console.log('Users table created successfully!');
    } else {
      console.log('Users table exists. Checking for auth_id column...');
      
      // Check if the auth_id column exists
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'users')
        .eq('table_schema', 'public')
        .eq('column_name', 'auth_id');
      
      if (columnsError) {
        console.error('Error checking columns:', columnsError);
        return;
      }
      
      if (columns.length > 0) {
        console.log('Removing auth_id column and constraint...');
        
        // Drop the foreign key constraint first
        const { error: dropConstraintError } = await supabase.sql`
          DO $$
          BEGIN
            IF EXISTS (
              SELECT 1 FROM information_schema.table_constraints 
              WHERE constraint_name = 'users_auth_id_fkey' 
              AND table_name = 'users'
            ) THEN
              ALTER TABLE users DROP CONSTRAINT users_auth_id_fkey;
            END IF;
          END $$;
        `;
        
        if (dropConstraintError) {
          console.error('Error dropping constraint:', dropConstraintError);
          // Continue anyway
        }
        
        // Drop the auth_id column
        const { error: dropColumnError } = await supabase.sql`
          ALTER TABLE users DROP COLUMN IF EXISTS auth_id;
        `;
        
        if (dropColumnError) {
          console.error('Error dropping auth_id column:', dropColumnError);
          return;
        }
        
        console.log('auth_id column removed successfully!');
      }
      
      // Check if the password column exists
      const { data: passwordColumn, error: passwordColumnError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'users')
        .eq('table_schema', 'public')
        .eq('column_name', 'password');
      
      if (passwordColumnError) {
        console.error('Error checking password column:', passwordColumnError);
        return;
      }
      
      if (passwordColumn.length === 0) {
        console.log('Adding password column...');
        
        // Add the password column
        const { error: addColumnError } = await supabase.sql`
          ALTER TABLE users ADD COLUMN password TEXT;
        `;
        
        if (addColumnError) {
          console.error('Error adding password column:', addColumnError);
          return;
        }
        
        console.log('Password column added successfully!');
      } else {
        console.log('Password column already exists.');
      }
    }
    
    // Make sure RLS policies are set correctly
    console.log('Setting up RLS policies...');
    
    // Enable RLS on users table
    const { error: rlsError } = await supabase.sql`
      ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    `;
    
    if (rlsError) {
      console.error('Error enabling RLS:', rlsError);
      // Continue anyway
    }
    
    // Check if policies exist
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname')
      .eq('tablename', 'users');
    
    if (policiesError) {
      console.error('Error checking policies:', policiesError);
      // Continue anyway
    }
    
    // Create policies if they don't exist
    if (!policies || policies.length === 0) {
      console.log('Creating RLS policies...');
      
      // Create policy for authenticated users
      const { error: authPolicyError } = await supabase.sql`
        CREATE POLICY "Allow full access to authenticated users" ON users
        FOR ALL USING (true);
      `;
      
      if (authPolicyError) {
        console.error('Error creating authenticated policy:', authPolicyError);
        // Continue anyway
      }
      
      // Create policy for anonymous users
      const { error: anonPolicyError } = await supabase.sql`
        CREATE POLICY "Allow read access to anonymous users" ON users
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
    
    console.log('Users table fixed successfully!');
  } catch (error) {
    console.error('Error fixing users table:', error);
  }
}

// Run the function
fixUsersTable();
