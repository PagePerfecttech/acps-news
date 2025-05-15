// Script to set up admin credentials in Supabase
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
async function setupAdminCredentials() {
  try {
    console.log('Setting up admin credentials in Supabase...');
    
    // Check if site_settings table exists
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'site_settings');
    
    if (tablesError) {
      console.error('Error checking if site_settings table exists:', tablesError);
      return false;
    }
    
    const tableExists = tables && tables.length > 0;
    
    if (!tableExists) {
      console.error('site_settings table does not exist in the database');
      console.log('Creating site_settings table...');
      
      // Create site_settings table
      const { error: createTableError } = await supabaseAdmin.rpc('create_site_settings_table');
      
      if (createTableError) {
        console.error('Error creating site_settings table:', createTableError);
        return false;
      }
      
      console.log('site_settings table created successfully');
    }
    
    // Set up admin credentials in site_settings table
    const now = new Date().toISOString();
    
    // Insert admin_email
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
    
    console.log('Admin credentials set up successfully!');
    console.log('Email:', adminCredentials.admin_email);
    console.log('Password:', adminCredentials.admin_password);
    
    return true;
  } catch (error) {
    console.error('Error in setupAdminCredentials:', error);
    return false;
  }
}

// Function to check admin credentials
async function checkAdminCredentials() {
  try {
    console.log('Checking admin credentials in Supabase...');
    
    // Get admin_email
    const { data: emailData, error: emailError } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'admin_email')
      .single();
    
    if (emailError) {
      console.error('Error getting admin_email:', emailError);
      return false;
    }
    
    // Get admin_password
    const { data: passwordData, error: passwordError } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'admin_password')
      .single();
    
    if (passwordError) {
      console.error('Error getting admin_password:', passwordError);
      return false;
    }
    
    console.log('Current admin credentials:');
    console.log('Email:', emailData?.value || 'Not set');
    console.log('Password:', passwordData?.value ? '********' : 'Not set');
    
    return true;
  } catch (error) {
    console.error('Error in checkAdminCredentials:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('FlipNEWS Admin Setup');
  console.log('===================');
  
  // Check current admin credentials
  const checkResult = await checkAdminCredentials();
  
  if (!checkResult) {
    console.log('Setting up admin credentials...');
    const setupResult = await setupAdminCredentials();
    
    if (setupResult) {
      console.log('Admin credentials set up successfully!');
    } else {
      console.error('Failed to set up admin credentials.');
    }
  } else {
    console.log('Admin credentials already set up.');
    
    // Ask if user wants to update admin credentials
    console.log('Do you want to update admin credentials? (y/n)');
    process.stdin.once('data', async (data) => {
      const answer = data.toString().trim().toLowerCase();
      
      if (answer === 'y' || answer === 'yes') {
        const setupResult = await setupAdminCredentials();
        
        if (setupResult) {
          console.log('Admin credentials updated successfully!');
        } else {
          console.error('Failed to update admin credentials.');
        }
      }
      
      process.exit(0);
    });
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
