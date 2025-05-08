// This script adds Telugu RSS feeds to the database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Telugu RSS feeds to add
const teluguFeeds = [
  {
    name: 'Andhra Pradesh',
    url: 'https://telugu.hindustantimes.com/rss/andhra-pradesh',
    category: 'Regional'
  },
  {
    name: 'Telangana',
    url: 'https://telugu.hindustantimes.com/rss/telangana',
    category: 'Regional'
  },
  {
    name: 'Nation And World',
    url: 'https://telugu.hindustantimes.com/rss/national-international',
    category: 'News'
  },
  {
    name: 'Business',
    url: 'https://telugu.hindustantimes.com/rss/business',
    category: 'Business'
  },
  {
    name: 'Sports',
    url: 'https://telugu.hindustantimes.com/rss/sports',
    category: 'Sports'
  },
  {
    name: 'Entertainment',
    url: 'https://telugu.hindustantimes.com/rss/entertainment',
    category: 'Entertainment'
  },
  {
    name: 'LifeStyle',
    url: 'https://telugu.hindustantimes.com/rss/lifestyle',
    category: 'Lifestyle'
  }
];

async function addTeluguFeeds() {
  console.log('Adding Telugu RSS feeds...');

  try {
    // First, make sure we have the necessary categories
    const categories = ['Regional', 'News', 'Business', 'Sports', 'Entertainment', 'Lifestyle'];
    const categoryMap = {};

    for (const categoryName of categories) {
      // Check if category exists
      const { data: existingCategories } = await supabase
        .from('categories')
        .select('id, name')
        .eq('name', categoryName)
        .limit(1);

      if (existingCategories && existingCategories.length > 0) {
        console.log(`Category '${categoryName}' already exists with ID: ${existingCategories[0].id}`);
        categoryMap[categoryName] = existingCategories[0].id;
      } else {
        // Create the category
        const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const { data: newCategory, error } = await supabase
          .from('categories')
          .insert({
            name: categoryName,
            slug: slug,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error(`Error creating category '${categoryName}':`, error);
          continue;
        }

        console.log(`Created category '${categoryName}' with ID: ${newCategory.id}`);
        categoryMap[categoryName] = newCategory.id;
      }
    }

    // Get system user ID or create one if it doesn't exist
    let systemUserId;
    const { data: systemUsers } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'system@flipnews.app')
      .limit(1);

    if (systemUsers && systemUsers.length > 0) {
      systemUserId = systemUsers[0].id;
      console.log(`Using existing system user with ID: ${systemUserId}`);
    } else {
      // Create system user
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          name: 'System',
          email: 'system@flipnews.app',
          role: 'system',
          profile_pic: '/images/system-avatar.png',
          bio: 'System user for automated tasks',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating system user:', error);
        return;
      }

      systemUserId = newUser.id;
      console.log(`Created system user with ID: ${systemUserId}`);
    }

    // Now add the RSS feeds
    for (const feed of teluguFeeds) {
      // Check if feed already exists
      const { data: existingFeeds } = await supabase
        .from('rss_feeds')
        .select('id, name')
        .eq('url', feed.url)
        .limit(1);

      if (existingFeeds && existingFeeds.length > 0) {
        console.log(`Feed '${feed.name}' already exists with ID: ${existingFeeds[0].id}`);
        continue;
      }

      // Get category ID
      const categoryId = categoryMap[feed.category];
      if (!categoryId) {
        console.error(`Category '${feed.category}' not found in map. Skipping feed '${feed.name}'`);
        continue;
      }

      // Add the feed
      const { data: newFeed, error } = await supabase
        .from('rss_feeds')
        .insert({
          name: feed.name,
          url: feed.url,
          category_id: categoryId,
          user_id: systemUserId,
          active: true,
          fetch_frequency: 60, // Check every hour
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error(`Error adding feed '${feed.name}':`, error);
        continue;
      }

      console.log(`Added feed '${feed.name}' with ID: ${newFeed.id}`);
    }

    console.log('Telugu RSS feeds added successfully!');
  } catch (error) {
    console.error('Error adding Telugu RSS feeds:', error);
  }
}

// Run the function
addTeluguFeeds();
