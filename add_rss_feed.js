// This script helps you add RSS feeds to your Vizag News application
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

// Check if environment variables are set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Error: Supabase environment variables are not set.');
  console.error('Please run setup_env.js first or create a .env.local file with your Supabase credentials.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Vizag News RSS Feed Manager');
console.log('========================');
console.log('This script will help you add RSS feeds to your Vizag News application.');
console.log('');

// Function to add a feed
async function addFeed(name, url, category, autoFetch, fetchInterval) {
  try {
    const { data, error } = await supabase
      .from('rss_feeds')
      .insert([
        {
          name,
          url,
          category,
          auto_fetch: autoFetch,
          fetch_interval: fetchInterval
        }
      ])
      .select();

    if (error) {
      console.error('Error adding feed:', error.message);
      return false;
    }

    console.log('Feed added successfully:', data[0].name);
    return true;
  } catch (error) {
    console.error('Error adding feed:', error.message);
    return false;
  }
}

// Function to list all feeds
async function listFeeds() {
  try {
    const { data, error } = await supabase
      .from('rss_feeds')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feeds:', error.message);
      return;
    }

    if (data.length === 0) {
      console.log('No feeds found.');
      return;
    }

    console.log('\nCurrent RSS Feeds:');
    console.log('=================');
    data.forEach((feed, index) => {
      console.log(`${index + 1}. ${feed.name}`);
      console.log(`   URL: ${feed.url}`);
      console.log(`   Category: ${feed.category}`);
      console.log(`   Auto Fetch: ${feed.auto_fetch ? 'Yes' : 'No'}`);
      console.log(`   Fetch Interval: ${feed.fetch_interval} minutes`);
      console.log(`   Last Fetched: ${feed.last_fetched || 'Never'}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error fetching feeds:', error.message);
  }
}

// Main menu
async function mainMenu() {
  console.log('Main Menu:');
  console.log('1. Add a new RSS feed');
  console.log('2. List all RSS feeds');
  console.log('3. Exit');
  console.log('');

  rl.question('Select an option (1-3): ', async (option) => {
    switch (option) {
      case '1':
        await addFeedPrompt();
        break;
      case '2':
        await listFeeds();
        setTimeout(mainMenu, 1000);
        break;
      case '3':
        console.log('Goodbye!');
        rl.close();
        break;
      default:
        console.log('Invalid option. Please try again.');
        mainMenu();
        break;
    }
  });
}

// Add feed prompt
async function addFeedPrompt() {
  rl.question('Enter feed name: ', (name) => {
    if (!name) {
      console.error('Error: Feed name is required.');
      mainMenu();
      return;
    }

    rl.question('Enter feed URL: ', (url) => {
      if (!url) {
        console.error('Error: Feed URL is required.');
        mainMenu();
        return;
      }

      // Validate URL format
      try {
        new URL(url);
      } catch (e) {
        console.error('Error: Invalid URL format. Please enter a valid URL.');
        mainMenu();
        return;
      }

      rl.question('Enter category (e.g., General, Technology, Sports): ', (category) => {
        if (!category) {
          console.error('Error: Category is required.');
          mainMenu();
          return;
        }

        rl.question('Auto fetch? (y/n): ', (autoFetchInput) => {
          const autoFetch = autoFetchInput.toLowerCase() === 'y';

          rl.question('Fetch interval in minutes (default: 60): ', async (fetchIntervalInput) => {
            const fetchInterval = fetchIntervalInput ? parseInt(fetchIntervalInput) : 60;

            if (isNaN(fetchInterval) || fetchInterval < 1) {
              console.error('Error: Fetch interval must be a positive number.');
              mainMenu();
              return;
            }

            const success = await addFeed(name, url, category, autoFetch, fetchInterval);
            if (success) {
              console.log('');
              console.log('Feed added successfully!');
              console.log('');
            }

            setTimeout(mainMenu, 1000);
          });
        });
      });
    });
  });
}

// Start the script
console.log('Connecting to Supabase...');
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Error connecting to Supabase:', error.message);
    process.exit(1);
  }

  console.log('Connected to Supabase successfully!');
  console.log('');
  mainMenu();
});
