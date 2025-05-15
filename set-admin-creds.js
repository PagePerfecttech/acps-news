// Simple script to set admin credentials in Supabase
require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if credentials are available
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase credentials not found in environment variables.');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file.');
  process.exit(1);
}

// Create Supabase client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Admin credentials
const adminCredentials = {
  admin_email: 'admin@flipnews.com',
  admin_password: 'admin123',
  admin_name: 'Admin'
};

// Function to set up admin credentials
async function setAdminCredentials() {
  try {
    console.log('Setting admin credentials in Supabase...');

    // First, check if the site_settings table exists
    console.log('Checking if site_settings table exists...');

    try {
      // Try to create the table directly
      console.log('Creating table directly...');

      const { error } = await supabaseAdmin.query(`
        CREATE TABLE IF NOT EXISTS public.site_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          key TEXT UNIQUE NOT NULL,
          value TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      if (error) {
        console.error('Error creating table:', error);
        return false;
      }

      console.log('Table created or already exists');
    } catch (error) {
      console.error('Error creating site_settings table:', error);
      return false;
    }

    console.log('Table check/creation completed');

    const now = new Date().toISOString();

    // Insert admin_email
    console.log('Setting admin_email...');
    const { error: emailError } = await supabaseAdmin
      .from('site_settings')
      .upsert({
        key: 'admin_email',
        value: adminCredentials.admin_email,
        created_at: now,
        updated_at: now
      }, {
        onConflict: 'key'
      });

    if (emailError) {
      console.error('Error setting admin_email:', emailError);
      return false;
    }

    // Insert admin_password
    console.log('Setting admin_password...');
    const { error: passwordError } = await supabaseAdmin
      .from('site_settings')
      .upsert({
        key: 'admin_password',
        value: adminCredentials.admin_password,
        created_at: now,
        updated_at: now
      }, {
        onConflict: 'key'
      });

    if (passwordError) {
      console.error('Error setting admin_password:', passwordError);
      return false;
    }

    // Insert admin_name
    console.log('Setting admin_name...');
    const { error: nameError } = await supabaseAdmin
      .from('site_settings')
      .upsert({
        key: 'admin_name',
        value: adminCredentials.admin_name,
        created_at: now,
        updated_at: now
      }, {
        onConflict: 'key'
      });

    if (nameError) {
      console.error('Error setting admin_name:', nameError);
      return false;
    }

    console.log('Admin credentials set successfully!');
    console.log('Email:', adminCredentials.admin_email);
    console.log('Password:', adminCredentials.admin_password);

    return true;
  } catch (error) {
    console.error('Error in setAdminCredentials:', error);
    return false;
  }
}

// Run the function
setAdminCredentials().then(() => {
  console.log('Done!');
  process.exit(0);
}).catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
