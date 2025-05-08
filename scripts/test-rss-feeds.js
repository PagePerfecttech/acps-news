// This script tests the RSS feed processing
const { createClient } = require('@supabase/supabase-js');
const Parser = require('rss-parser');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Telugu RSS feeds to test
const teluguFeeds = [
  {
    name: 'Andhra Pradesh',
    url: 'https://telugu.hindustantimes.com/rss/andhra-pradesh'
  },
  {
    name: 'Telangana',
    url: 'https://telugu.hindustantimes.com/rss/telangana'
  },
  {
    name: 'Nation And World',
    url: 'https://telugu.hindustantimes.com/rss/national-international'
  },
  {
    name: 'Business',
    url: 'https://telugu.hindustantimes.com/rss/business'
  },
  {
    name: 'Sports',
    url: 'https://telugu.hindustantimes.com/rss/sports'
  },
  {
    name: 'Entertainment',
    url: 'https://telugu.hindustantimes.com/rss/entertainment'
  },
  {
    name: 'LifeStyle',
    url: 'https://telugu.hindustantimes.com/rss/lifestyle'
  }
];

// Parse RSS feed
async function parseRssFeed(url) {
  try {
    console.log(`Fetching RSS feed: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        'User-Agent': 'FlipNews/1.0 (RSS Reader)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    
    // Log the first 200 characters of the XML for debugging
    console.log(`Received XML (first 200 chars): ${xml.substring(0, 200)}...`);

    const parser = new Parser({
      customFields: {
        item: [
          ['media:content', 'media'],
          ['media:thumbnail', 'thumbnail'],
          ['content:encoded', 'content'],
          ['dc:creator', 'creator'],
        ],
      },
      // Handle Telugu character encoding
      defaultRSS: 2.0,
      xml2js: {
        normalize: true,
        normalizeTags: true,
        ignoreAttrs: false,
      }
    });

    const feed = await parser.parseString(xml);
    console.log(`Parsed feed: ${feed.title}, ${feed.items.length} items`);
    
    // Print the first item
    if (feed.items.length > 0) {
      const firstItem = feed.items[0];
      console.log('First item:');
      console.log(`- Title: ${firstItem.title}`);
      console.log(`- Link: ${firstItem.link}`);
      console.log(`- GUID: ${firstItem.guid}`);
      console.log(`- PubDate: ${firstItem.pubDate}`);
      console.log(`- Creator: ${firstItem.creator || 'N/A'}`);
      
      // Check for media content
      if (firstItem.media) {
        console.log('- Media found');
        console.log(JSON.stringify(firstItem.media, null, 2));
      } else {
        console.log('- No media found');
      }
      
      // Check for image in content
      if (firstItem.content) {
        const imgMatch = firstItem.content.match(/<img[^>]+src="([^">]+)"/i);
        if (imgMatch && imgMatch[1]) {
          console.log(`- Image in content: ${imgMatch[1]}`);
        } else {
          console.log('- No image found in content');
        }
      }
    }

    return {
      success: true,
      title: feed.title,
      itemCount: feed.items.length
    };
  } catch (error) {
    console.error('Error parsing RSS feed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Test all feeds
async function testAllFeeds() {
  console.log('Testing all Telugu RSS feeds...');
  
  const results = [];
  
  for (const feed of teluguFeeds) {
    console.log(`\n=== Testing feed: ${feed.name} ===`);
    const result = await parseRssFeed(feed.url);
    
    results.push({
      name: feed.name,
      url: feed.url,
      success: result.success,
      title: result.title,
      itemCount: result.itemCount,
      error: result.error
    });
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Print summary
  console.log('\n=== Test Results Summary ===');
  for (const result of results) {
    if (result.success) {
      console.log(`✅ ${result.name}: ${result.itemCount} items`);
    } else {
      console.log(`❌ ${result.name}: ${result.error}`);
    }
  }
}

// Run the tests
testAllFeeds();
