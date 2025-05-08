// This script sets up the RSS feed functionality by creating a default user and category
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupRss() {
  console.log('Setting up RSS feed functionality...');

  try {
    // Create a default system user if it doesn't exist
    console.log('Creating default system user...');
    
    const { data: existingUsers, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'system@flipnews.app')
      .limit(1);
    
    if (userCheckError) {
      console.error('Error checking for system user:', userCheckError);
      return;
    }
    
    let systemUserId;
    
    if (!existingUsers || existingUsers.length === 0) {
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert({
          name: 'System',
          email: 'system@flipnews.app',
          role: 'system',
          profile_pic: '/images/system-avatar.png',
          bio: 'System user for automated tasks'
        })
        .select()
        .single();
      
      if (createUserError) {
        console.error('Error creating system user:', createUserError);
        return;
      }
      
      systemUserId = newUser.id;
      console.log('System user created with ID:', systemUserId);
    } else {
      systemUserId = existingUsers[0].id;
      console.log('System user already exists with ID:', systemUserId);
    }
    
    // Create an RSS category if it doesn't exist
    console.log('Creating RSS category...');
    
    const { data: existingCategories, error: categoryCheckError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', 'rss')
      .limit(1);
    
    if (categoryCheckError) {
      console.error('Error checking for RSS category:', categoryCheckError);
      return;
    }
    
    let rssCategoryId;
    
    if (!existingCategories || existingCategories.length === 0) {
      const { data: newCategory, error: createCategoryError } = await supabase
        .from('categories')
        .insert({
          name: 'RSS',
          slug: 'rss'
        })
        .select()
        .single();
      
      if (createCategoryError) {
        console.error('Error creating RSS category:', createCategoryError);
        return;
      }
      
      rssCategoryId = newCategory.id;
      console.log('RSS category created with ID:', rssCategoryId);
    } else {
      rssCategoryId = existingCategories[0].id;
      console.log('RSS category already exists with ID:', rssCategoryId);
    }
    
    console.log('RSS setup completed successfully!');
    console.log('You can now use the RSS feed functionality with:');
    console.log(`- System User ID: ${systemUserId}`);
    console.log(`- RSS Category ID: ${rssCategoryId}`);
  } catch (error) {
    console.error('Error setting up RSS:', error);
  }
}

// Run the setup
setupRss();
