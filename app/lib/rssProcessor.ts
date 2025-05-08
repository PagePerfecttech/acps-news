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
    console.log(`Fetching RSS feed: ${url}`);

    // Use a CORS proxy if needed
    const proxyUrl = process.env.NEXT_PUBLIC_CORS_PROXY || '';
    const fetchUrl = `${proxyUrl}${url}`;

    const response = await fetch(fetchUrl, {
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        'User-Agent': 'FlipNews/1.0 (RSS Reader)',
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();

    // Log the first 200 characters of the XML for debugging
    console.log(`Received XML (first 200 chars): ${xml.substring(0, 200)}...`);

    // Use a dynamic import for the RSS parser to avoid server-side issues
    const Parser = (await import('rss-parser'));
    const parser = new Parser.default({
      customFields: {
        item: [
          ['media:content', 'media'],
          ['media:thumbnail', 'thumbnail'],
          ['content:encoded', 'content'],
          ['dc:creator', 'creator'],
          ['pubDate', 'pubDate'],
          ['description', 'description'],
          ['link', 'link'],
          ['guid', 'guid'],
          ['category', 'category'],
        ],
        feed: [
          ['language', 'language'],
          ['lastBuildDate', 'lastBuildDate'],
          ['pubDate', 'pubDate'],
        ]
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

    return {
      title: feed.title || '',
      description: feed.description || '',
      link: feed.link || '',
      items: feed.items.map(item => ({
        ...item,
        guid: item.guid || item.id || item.link || uuidv4(),
        // Ensure title and description are strings
        title: item.title ? String(item.title) : '',
        description: item.description ? String(item.description) : '',
      })),
      lastBuildDate: feed.lastBuildDate,
      pubDate: feed.pubDate,
      language: feed.language,
    };
  } catch (error) {
    console.error('Error parsing RSS feed:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
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
  if (item.media) {
    // Handle different media content structures
    if (item.media.$ && item.media.$.url) {
      return item.media.$.url;
    } else if (Array.isArray(item.media)) {
      // Some feeds provide media as an array
      for (const mediaItem of item.media) {
        if (mediaItem.$ && mediaItem.$.url) {
          return mediaItem.$.url;
        }
      }
    } else if (typeof item.media === 'object') {
      // Try to find any URL property in the media object
      const mediaObj = item.media as any;
      if (mediaObj.url) return mediaObj.url;
      if (mediaObj.content && mediaObj.content.url) return mediaObj.content.url;
      if (mediaObj.thumbnail && mediaObj.thumbnail.url) return mediaObj.thumbnail.url;
    }
  }

  // Check for image property (some feeds use this)
  if (item.image && typeof item.image === 'string') {
    return item.image;
  } else if (item.image && typeof item.image === 'object' && (item.image as any).url) {
    return (item.image as any).url;
  }

  // Try to extract image from content or description
  const content = item.content || item.contentSnippet || item.description || '';

  // Try different patterns for img tags
  const imgPatterns = [
    /<img[^>]+src="([^">]+)"/i,
    /<img[^>]+src='([^'>]+)'/i,
    /<img[^>]+src=([^ >]+)/i
  ];

  for (const pattern of imgPatterns) {
    const imgMatch = content.match(pattern);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1].trim();
    }
  }

  return null;
};

// Clean HTML content
export const cleanHtml = (html: string): string => {
  if (!html) return '';

  // Remove script tags and their content
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove style tags and their content
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove iframe tags and their content
  cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // Remove HTML comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

  // Fix common encoding issues with Telugu content
  cleaned = cleaned.replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Fix broken image tags
  cleaned = cleaned.replace(/<img([^>]*)src=['"]?([^'"\s>]*)['"]?([^>]*)>/gi,
    (match, before, src, after) => {
      // Ensure src is a valid URL
      if (src && !src.startsWith('http') && !src.startsWith('/')) {
        src = 'https://' + src;
      }
      return `<img${before}src="${src}"${after}>`;
    }
  );

  // Fix relative URLs in links
  cleaned = cleaned.replace(/<a([^>]*)href=['"]?([^'"\s>]*)['"]?([^>]*)>/gi,
    (match, before, href, after) => {
      // Make relative URLs absolute
      if (href && href.startsWith('/') && !href.startsWith('//')) {
        href = 'https://telugu.hindustantimes.com' + href;
      }
      return `<a${before}href="${href}"${after}>`;
    }
  );

  // Remove excessive whitespace but preserve paragraph breaks
  cleaned = cleaned.replace(/\s+/g, ' ')
    .replace(/<\/p>\s*<p>/gi, '</p>\n<p>') // Preserve paragraph breaks
    .trim();

  return cleaned;
};

// Extract plain text from HTML
export const extractTextFromHtml = (html: string): string => {
  if (!html) return '';

  // First clean the HTML
  const cleaned = cleanHtml(html);

  // Replace HTML tags with spaces
  let text = cleaned.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities (including Telugu characters)
  text = text.replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Decode numeric HTML entities (important for Telugu characters)
  text = text.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(parseInt(dec, 10));
  });

  // Decode hex HTML entities
  text = text.replace(/&#x([0-9a-f]+);/gi, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

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
  categoryId: string
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
    category: categoryId, // Use category ID instead of name
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
    console.log(`Processing RSS feed: ${feed.name} (${feed.url})`);

    // Parse the RSS feed
    const rssFeed = await parseRssFeed(feed.url);

    if (!rssFeed) {
      console.error(`Failed to parse RSS feed: ${feed.name} (${feed.url})`);
      showErrorNotification(
        `Failed to parse RSS feed: ${feed.name}`,
        'RSS Processing Failed'
      );
      return {
        success: false,
        newArticles: 0,
        errors: 1,
        message: 'Failed to parse RSS feed',
      };
    }

    console.log(`Successfully parsed RSS feed: ${feed.name}, found ${rssFeed.items.length} items`);

    // Track results
    let newArticles = 0;
    let errors = 0;
    let skipped = 0;

    // Process each item
    for (const item of rssFeed.items) {
      try {
        // Skip if we already have this item
        if (existingGuids.includes(item.guid || '')) {
          skipped++;
          continue;
        }

        console.log(`Processing item: ${item.title}`);

        // Convert to news article
        const article = rssItemToNewsArticle(item, feed.id, feed.category_id);

        // Save to database
        const result: DatabaseResult<NewsArticle> = await createNewsArticle(article);

        if (result.success) {
          console.log(`Successfully added article: ${article.title}`);
          newArticles++;
        } else {
          errors++;
          console.error('Error saving article:', result.error);
          console.error('Article data:', JSON.stringify(article, null, 2));
        }
      } catch (error) {
        errors++;
        console.error('Error processing RSS item:', error);
        console.error('Item data:', JSON.stringify(item, null, 2));
      }
    }

    console.log(`RSS feed processing complete: ${feed.name}`);
    console.log(`- Total items: ${rssFeed.items.length}`);
    console.log(`- New articles: ${newArticles}`);
    console.log(`- Skipped (already exists): ${skipped}`);
    console.log(`- Errors: ${errors}`);

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
      message: `Processed ${rssFeed.items.length} items, added ${newArticles} new articles, skipped ${skipped}, with ${errors} errors`,
    };
  } catch (error) {
    console.error('Error processing RSS feed:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Feed data:', JSON.stringify(feed, null, 2));

    showErrorNotification(
      `Failed to process RSS feed: ${feed.name}`,
      'RSS Processing Failed'
    );

    return {
      success: false,
      newArticles: 0,
      errors: 1,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};
