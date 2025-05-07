import { supabase } from './supabase';
import { isSupabaseConfigured } from './supabase';
import { NewsArticle, User } from '../types';
import { addNewsArticle } from './dataService';
import { getUserById } from './userService';
import { Parser } from 'rss-parser';

// Define RSS feed types
export interface RssFeed {
  id: string;
  name: string;
  url: string;
  category_id: string;
  user_id: string;
  active: boolean;
  last_fetched: string | null;
  fetch_frequency: number;
  created_at: string;
  updated_at: string;
}

export interface RssFeedItem {
  id: string;
  feed_id: string;
  guid: string;
  title: string;
  link: string | null;
  pub_date: string | null;
  news_article_id: string | null;
  imported: boolean;
  created_at: string;
}

// Create a new RSS parser instance
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['content:encoded', 'contentEncoded'],
      ['description', 'description']
    ]
  }
});

// Get all RSS feeds
export const getRssFeeds = async (): Promise<RssFeed[]> => {
  // Check if using Supabase
  const usingSupabase = await isSupabaseConfigured();

  if (usingSupabase) {
    try {
      const { data, error } = await supabase
        .from('rss_feeds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching RSS feeds:', error);
        return [];
      }

      return data as RssFeed[];
    } catch (error) {
      console.error('Error in getRssFeeds:', error);
      return [];
    }
  } else {
    console.log('Supabase not configured, cannot fetch RSS feeds');
    return [];
  }
};

// Get RSS feed by ID
export const getRssFeedById = async (id: string): Promise<RssFeed | null> => {
  // Check if using Supabase
  const usingSupabase = await isSupabaseConfigured();

  if (usingSupabase) {
    try {
      const { data, error } = await supabase
        .from('rss_feeds')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching RSS feed:', error);
        return null;
      }

      return data as RssFeed;
    } catch (error) {
      console.error('Error in getRssFeedById:', error);
      return null;
    }
  } else {
    console.log('Supabase not configured, cannot fetch RSS feed');
    return null;
  }
};

// Add a new RSS feed
export const addRssFeed = async (feed: Omit<RssFeed, 'id' | 'created_at' | 'updated_at' | 'last_fetched'>): Promise<RssFeed | null> => {
  // Check if using Supabase
  const usingSupabase = await isSupabaseConfigured();

  if (usingSupabase) {
    try {
      const { data, error } = await supabase
        .from('rss_feeds')
        .insert({
          ...feed,
          last_fetched: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding RSS feed:', error);
        return null;
      }

      return data as RssFeed;
    } catch (error) {
      console.error('Error in addRssFeed:', error);
      return null;
    }
  } else {
    console.log('Supabase not configured, cannot add RSS feed');
    return null;
  }
};

// Update an RSS feed
export const updateRssFeed = async (id: string, feed: Partial<RssFeed>): Promise<boolean> => {
  // Check if using Supabase
  const usingSupabase = await isSupabaseConfigured();

  if (usingSupabase) {
    try {
      const { error } = await supabase
        .from('rss_feeds')
        .update({
          ...feed,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating RSS feed:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateRssFeed:', error);
      return false;
    }
  } else {
    console.log('Supabase not configured, cannot update RSS feed');
    return false;
  }
};

// Delete an RSS feed
export const deleteRssFeed = async (id: string): Promise<boolean> => {
  // Check if using Supabase
  const usingSupabase = await isSupabaseConfigured();

  if (usingSupabase) {
    try {
      const { error } = await supabase
        .from('rss_feeds')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting RSS feed:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteRssFeed:', error);
      return false;
    }
  } else {
    console.log('Supabase not configured, cannot delete RSS feed');
    return false;
  }
};

// Fetch and parse RSS feed
export const fetchRssFeed = async (feedUrl: string): Promise<any> => {
  try {
    const feed = await parser.parseURL(feedUrl);
    return feed;
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    throw error;
  }
};

// Process RSS feed and import new items
export const processRssFeed = async (feedId: string): Promise<number> => {
  // Check if using Supabase
  const usingSupabase = await isSupabaseConfigured();
  
  if (!usingSupabase) {
    console.log('Supabase not configured, cannot process RSS feed');
    return 0;
  }

  try {
    // Get the RSS feed
    const feed = await getRssFeedById(feedId);
    if (!feed) {
      console.error('RSS feed not found:', feedId);
      return 0;
    }

    // Fetch the RSS feed content
    const feedContent = await fetchRssFeed(feed.url);
    
    // Get the user who owns this feed
    const user = await getUserById(feed.user_id);
    if (!user) {
      console.error('User not found for RSS feed:', feed.user_id);
      return 0;
    }

    let importedCount = 0;

    // Process each item in the feed
    for (const item of feedContent.items) {
      // Check if this item has already been imported
      const { data: existingItems, error: checkError } = await supabase
        .from('rss_feed_items')
        .select('*')
        .eq('feed_id', feedId)
        .eq('guid', item.guid || item.link)
        .limit(1);

      if (checkError) {
        console.error('Error checking existing RSS item:', checkError);
        continue;
      }

      // Skip if already imported
      if (existingItems && existingItems.length > 0) {
        continue;
      }

      // Extract content from the item
      const content = item.contentEncoded || item.content || item.description || '';
      
      // Extract image URL from media:content or from content
      let imageUrl = '';
      if (item.media && item.media.$ && item.media.$.url) {
        imageUrl = item.media.$.url;
      } else if (content) {
        // Try to extract the first image from the content
        const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch && imgMatch[1]) {
          imageUrl = imgMatch[1];
        }
      }

      // Create a new news article
      const newArticle: NewsArticle = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: item.title || 'Untitled',
        content: content,
        summary: item.summary || item.description || content.substring(0, 200),
        category: feed.category_id,
        image_url: imageUrl,
        author: user.name,
        created_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        updated_at: new Date().toISOString(),
        likes: 0,
        comments: [],
        published: true,
        rss_feed_id: feedId,
        rss_item_guid: item.guid || item.link
      };

      // Add the news article
      const { data: newsArticle, error: insertError } = await supabase
        .from('news_articles')
        .insert({
          title: newArticle.title,
          content: newArticle.content,
          summary: newArticle.summary,
          category_id: feed.category_id,
          image_url: newArticle.image_url,
          author: user.name,
          user_id: feed.user_id,
          published: true,
          rss_feed_id: feedId,
          rss_item_guid: item.guid || item.link
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting news article:', insertError);
        continue;
      }

      // Add the RSS feed item record
      const { error: itemError } = await supabase
        .from('rss_feed_items')
        .insert({
          feed_id: feedId,
          guid: item.guid || item.link,
          title: item.title || 'Untitled',
          link: item.link || null,
          pub_date: item.pubDate ? new Date(item.pubDate).toISOString() : null,
          news_article_id: newsArticle.id,
          imported: true
        });

      if (itemError) {
        console.error('Error inserting RSS feed item:', itemError);
        continue;
      }

      importedCount++;
    }

    // Update the last_fetched timestamp
    await updateRssFeed(feedId, {
      last_fetched: new Date().toISOString()
    });

    return importedCount;
  } catch (error) {
    console.error('Error processing RSS feed:', error);
    return 0;
  }
};

// Process all active RSS feeds
export const processAllRssFeeds = async (): Promise<number> => {
  // Check if using Supabase
  const usingSupabase = await isSupabaseConfigured();
  
  if (!usingSupabase) {
    console.log('Supabase not configured, cannot process RSS feeds');
    return 0;
  }

  try {
    // Get all active RSS feeds
    const { data: feeds, error } = await supabase
      .from('rss_feeds')
      .select('*')
      .eq('active', true);

    if (error) {
      console.error('Error fetching active RSS feeds:', error);
      return 0;
    }

    let totalImported = 0;

    // Process each feed
    for (const feed of feeds) {
      const importedCount = await processRssFeed(feed.id);
      totalImported += importedCount;
    }

    return totalImported;
  } catch (error) {
    console.error('Error processing all RSS feeds:', error);
    return 0;
  }
};
