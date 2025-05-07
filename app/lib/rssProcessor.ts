import { v4 as uuidv4 } from 'uuid';
import { NewsArticle, RssFeed } from '../types';
import { createNewsArticle, DatabaseResult } from './databaseService';
import { showErrorNotification, showSuccessNotification } from '../components/Notification';

// Interface for RSS item
interface RssItem {
  title: string;
  description: string;
  content?: string;
  contentSnippet?: string;
  guid?: string;
  link?: string;
  pubDate?: string;
  creator?: string;
  author?: string;
  categories?: string[];
  isoDate?: string;
  enclosure?: {
    url?: string;
    length?: string;
    type?: string;
  };
  [key: string]: any; // For any other properties
}

// Interface for RSS feed
interface RssFeedData {
  title: string;
  description: string;
  link: string;
  items: RssItem[];
  lastBuildDate?: string;
  pubDate?: string;
  language?: string;
  [key: string]: any; // For any other properties
}

// Parse RSS feed
export const parseRssFeed = async (url: string): Promise<RssFeedData | null> => {
  try {
    // Use a CORS proxy if needed
    const proxyUrl = process.env.NEXT_PUBLIC_CORS_PROXY || '';
    const fetchUrl = `${proxyUrl}${url}`;
    
    const response = await fetch(fetchUrl, {
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`);
    }
    
    const xml = await response.text();
    
    // Use a dynamic import for the RSS parser to avoid server-side issues
    const Parser = (await import('rss-parser')).default;
    const parser = new Parser({
      customFields: {
        item: [
          ['media:content', 'media'],
          ['content:encoded', 'content'],
          ['dc:creator', 'creator'],
        ],
      },
    });
    
    const feed = await parser.parseString(xml);
    
    return {
      title: feed.title || '',
      description: feed.description || '',
      link: feed.link || '',
      items: feed.items.map(item => ({
        ...item,
        guid: item.guid || item.id || item.link || uuidv4(),
      })),
      lastBuildDate: feed.lastBuildDate,
      pubDate: feed.pubDate,
      language: feed.language,
    };
  } catch (error) {
    console.error('Error parsing RSS feed:', error);
    return null;
  }
};

// Extract image URL from RSS item
export const extractImageFromRssItem = (item: RssItem): string | null => {
  // Check for enclosure with image type
  if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith('image/')) {
    return item.enclosure.url;
  }
  
  // Check for media:content
  if (item.media && item.media.$ && item.media.$.url && item.media.$.type?.startsWith('image/')) {
    return item.media.$.url;
  }
  
  // Try to extract image from content or description
  const content = item.content || item.contentSnippet || item.description || '';
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  
  return null;
};

// Clean HTML content
export const cleanHtml = (html: string): string => {
  // Remove script tags and their content
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove style tags and their content
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove iframe tags and their content
  cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  
  // Remove HTML comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
  
  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
};

// Extract plain text from HTML
export const extractTextFromHtml = (html: string): string => {
  // First clean the HTML
  const cleaned = cleanHtml(html);
  
  // Replace HTML tags with spaces
  let text = cleaned.replace(/<[^>]+>/g, ' ');
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Remove excessive whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
};

// Create a summary from content
export const createSummary = (content: string, maxLength: number = 200): string => {
  // Extract text from HTML content
  const text = extractTextFromHtml(content);
  
  // Truncate to maxLength
  if (text.length <= maxLength) {
    return text;
  }
  
  // Find the last space before maxLength
  const lastSpace = text.lastIndexOf(' ', maxLength);
  if (lastSpace === -1) {
    return text.substring(0, maxLength) + '...';
  }
  
  return text.substring(0, lastSpace) + '...';
};

// Convert RSS item to NewsArticle
export const rssItemToNewsArticle = (
  item: RssItem,
  feedId: string,
  categoryName: string = 'RSS'
): Omit<NewsArticle, 'id' | 'created_at' | 'updated_at'> => {
  // Extract content
  const content = item.content || item.contentSnippet || item.description || '';
  
  // Extract image
  const imageUrl = extractImageFromRssItem(item);
  
  // Create summary
  const summary = createSummary(content);
  
  // Get author
  const author = item.creator || item.author || 'Unknown';
  
  // Get publication date
  const pubDate = item.isoDate || item.pubDate || new Date().toISOString();
  
  return {
    title: item.title || 'Untitled',
    content: cleanHtml(content),
    summary,
    category: categoryName,
    image_url: imageUrl || '',
    video_url: '',
    video_type: '',
    author,
    likes: 0,
    comments: [],
    tags: item.categories || [],
    published: true,
    rss_feed_id: feedId,
    rss_item_guid: item.guid || '',
  };
};

// Process RSS feed and save new articles
export const processRssFeed = async (
  feed: RssFeed,
  existingGuids: string[] = []
): Promise<{
  success: boolean;
  newArticles: number;
  errors: number;
  message: string;
}> => {
  try {
    // Parse the RSS feed
    const rssFeed = await parseRssFeed(feed.url);
    
    if (!rssFeed) {
      return {
        success: false,
        newArticles: 0,
        errors: 1,
        message: 'Failed to parse RSS feed',
      };
    }
    
    // Track results
    let newArticles = 0;
    let errors = 0;
    
    // Process each item
    for (const item of rssFeed.items) {
      // Skip if we already have this item
      if (existingGuids.includes(item.guid || '')) {
        continue;
      }
      
      // Convert to news article
      const article = rssItemToNewsArticle(item, feed.id, feed.category);
      
      // Save to database
      try {
        const result: DatabaseResult<NewsArticle> = await createNewsArticle(article);
        
        if (result.success) {
          newArticles++;
        } else {
          errors++;
          console.error('Error saving article:', result.error);
        }
      } catch (error) {
        errors++;
        console.error('Error processing RSS item:', error);
      }
    }
    
    // Show notification
    if (newArticles > 0) {
      showSuccessNotification(
        `Added ${newArticles} new articles from ${feed.name}`,
        'RSS Feed Processed'
      );
    } else if (errors === 0) {
      showSuccessNotification(
        `No new articles found in ${feed.name}`,
        'RSS Feed Processed'
      );
    }
    
    if (errors > 0) {
      showErrorNotification(
        `Encountered ${errors} errors while processing ${feed.name}`,
        'RSS Processing Errors'
      );
    }
    
    return {
      success: true,
      newArticles,
      errors,
      message: `Processed ${rssFeed.items.length} items, added ${newArticles} new articles with ${errors} errors`,
    };
  } catch (error) {
    console.error('Error processing RSS feed:', error);
    
    showErrorNotification(
      `Failed to process RSS feed: ${error}`,
      'RSS Processing Failed'
    );
    
    return {
      success: false,
      newArticles: 0,
      errors: 1,
      message: `Error: ${error}`,
    };
  }
};
