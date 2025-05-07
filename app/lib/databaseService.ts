import { supabase, isSupabaseConfigured, getConnectionStatus } from './supabase';
import { NewsArticle, Ad, Comment, Category, User, RssFeed } from '../types';

// Error types
export enum DatabaseErrorType {
  CONNECTION = 'connection',
  QUERY = 'query',
  PERMISSION = 'permission',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown'
}

// Database error class
export class DatabaseError extends Error {
  type: DatabaseErrorType;
  originalError: any;
  table: string;
  operation: string;

  constructor(
    message: string,
    type: DatabaseErrorType = DatabaseErrorType.UNKNOWN,
    originalError: any = null,
    table: string = '',
    operation: string = ''
  ) {
    super(message);
    this.name = 'DatabaseError';
    this.type = type;
    this.originalError = originalError;
    this.table = table;
    this.operation = operation;
  }
}

// Database operation result
export interface DatabaseResult<T> {
  data: T | null;
  error: DatabaseError | null;
  success: boolean;
  fromCache: boolean;
}

// Database operation options
export interface DatabaseOptions {
  bypassCache?: boolean;
  retryCount?: number;
  retryDelay?: number;
  fallbackToCache?: boolean;
  notifyOnError?: boolean;
}

// Default options
const defaultOptions: DatabaseOptions = {
  bypassCache: false,
  retryCount: 1,
  retryDelay: 1000,
  fallbackToCache: true,
  notifyOnError: true
};

// Cache management
const cache: Map<string, { data: any; timestamp: number }> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Clear expired cache entries
const clearExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
};

// Set up cache cleanup interval
if (typeof window !== 'undefined') {
  setInterval(clearExpiredCache, 60 * 1000); // Clean up every minute
}

// Get data from cache
const getFromCache = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (!cached) return null;

  // Check if cache is expired
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return cached.data as T;
};

// Save data to cache
const saveToCache = <T>(key: string, data: T): void => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Clear cache for a specific key or pattern
export const clearCache = (keyPattern?: string): void => {
  if (!keyPattern) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.includes(keyPattern)) {
      cache.delete(key);
    }
  }
};

// Parse Supabase error
const parseSupabaseError = (error: any, table: string, operation: string): DatabaseError => {
  if (!error) {
    return new DatabaseError(
      'Unknown error',
      DatabaseErrorType.UNKNOWN,
      error,
      table,
      operation
    );
  }

  // Check for connection errors
  if (error.message?.includes('network') || error.code === 'NETWORK_ERROR') {
    return new DatabaseError(
      'Network connection error',
      DatabaseErrorType.CONNECTION,
      error,
      table,
      operation
    );
  }

  // Check for permission errors
  if (error.code === 'PGRST301' || error.message?.includes('permission')) {
    return new DatabaseError(
      'Permission denied',
      DatabaseErrorType.PERMISSION,
      error,
      table,
      operation
    );
  }

  // Check for validation errors
  if (error.code === 'PGRST400' || error.message?.includes('validation')) {
    return new DatabaseError(
      'Validation error',
      DatabaseErrorType.VALIDATION,
      error,
      table,
      operation
    );
  }

  // Default to query error
  return new DatabaseError(
    error.message || 'Database query error',
    DatabaseErrorType.QUERY,
    error,
    table,
    operation
  );
};

// Log database error
const logDatabaseError = (error: DatabaseError): void => {
  console.error(`[Database Error] [${error.type}] [${error.table}] [${error.operation}]:`, error.message, error.originalError);
};

// Notify user about database error
const notifyDatabaseError = (error: DatabaseError): void => {
  // Only show user-friendly messages in the browser
  if (typeof window === 'undefined') return;

  let message = 'An error occurred while accessing the database.';
  let title = 'Database Error';

  switch (error.type) {
    case DatabaseErrorType.CONNECTION:
      message = 'Connection to the database failed. Please check your internet connection.';
      title = 'Connection Error';
      break;
    case DatabaseErrorType.PERMISSION:
      message = 'You do not have permission to perform this operation.';
      title = 'Permission Denied';
      break;
    case DatabaseErrorType.VALIDATION:
      message = 'The data provided is invalid.';
      title = 'Validation Error';
      break;
    default:
      message = 'An unexpected error occurred. Please try again later.';
      title = 'Unexpected Error';
  }

  // Use the notification system if available
  try {
    // Dynamic import to avoid circular dependencies
    import('../components/Notification').then(({ showErrorNotification }) => {
      showErrorNotification(message, title);
    }).catch(() => {
      // Fallback if notification system is not available
      console.warn('[User Notification]', title, message);
    });
  } catch (e) {
    // Fallback if import fails
    console.warn('[User Notification]', title, message);
  }
};

// Generic database query function with retry and fallback
export const executeQuery = async <T>(
  queryFn: () => Promise<{ data: any; error: any }>,
  cacheKey: string,
  table: string,
  operation: string,
  options: DatabaseOptions = {}
): Promise<DatabaseResult<T>> => {
  // Merge options with defaults
  const opts = { ...defaultOptions, ...options };

  // Check if Supabase is configured
  const supabaseConfigured = await isSupabaseConfigured();
  if (!supabaseConfigured) {
    const error = new DatabaseError(
      'Supabase is not configured',
      DatabaseErrorType.CONNECTION,
      null,
      table,
      operation
    );

    // Try to get from cache if fallback is enabled
    if (opts.fallbackToCache) {
      const cachedData = getFromCache<T>(cacheKey);
      if (cachedData) {
        return {
          data: cachedData,
          error: null,
          success: true,
          fromCache: true
        };
      }
    }

    logDatabaseError(error);
    if (opts.notifyOnError) notifyDatabaseError(error);

    return {
      data: null,
      error,
      success: false,
      fromCache: false
    };
  }

  // Check if we should use cache
  if (!opts.bypassCache) {
    const cachedData = getFromCache<T>(cacheKey);
    if (cachedData) {
      return {
        data: cachedData,
        error: null,
        success: true,
        fromCache: true
      };
    }
  }

  // Execute query with retry
  let lastError: any = null;
  let retries = 0;

  while (retries <= (opts.retryCount || 0)) {
    try {
      const { data, error } = await queryFn();

      if (error) {
        lastError = parseSupabaseError(error, table, operation);

        // If it's a connection error and we have retries left, retry
        if (lastError.type === DatabaseErrorType.CONNECTION && retries < (opts.retryCount || 0)) {
          retries++;
          await new Promise(resolve => setTimeout(resolve, opts.retryDelay));
          continue;
        }

        // Log the error
        logDatabaseError(lastError);

        // Try to get from cache if fallback is enabled
        if (opts.fallbackToCache) {
          const cachedData = getFromCache<T>(cacheKey);
          if (cachedData) {
            return {
              data: cachedData,
              error: lastError,
              success: false,
              fromCache: true
            };
          }
        }

        // Notify user if needed
        if (opts.notifyOnError) notifyDatabaseError(lastError);

        return {
          data: null,
          error: lastError,
          success: false,
          fromCache: false
        };
      }

      // Save to cache
      if (data) {
        saveToCache(cacheKey, data);
      }

      return {
        data: data as T,
        error: null,
        success: true,
        fromCache: false
      };
    } catch (error) {
      lastError = new DatabaseError(
        'Unexpected error executing query',
        DatabaseErrorType.UNKNOWN,
        error,
        table,
        operation
      );

      retries++;
      if (retries <= (opts.retryCount || 0)) {
        await new Promise(resolve => setTimeout(resolve, opts.retryDelay));
      }
    }
  }

  // If we get here, all retries failed
  logDatabaseError(lastError);

  // Try to get from cache if fallback is enabled
  if (opts.fallbackToCache) {
    const cachedData = getFromCache<T>(cacheKey);
    if (cachedData) {
      return {
        data: cachedData,
        error: lastError,
        success: false,
        fromCache: true
      };
    }
  }

  // Notify user if needed
  if (opts.notifyOnError) notifyDatabaseError(lastError);

  return {
    data: null,
    error: lastError,
    success: false,
    fromCache: false
  };
};

// News Article Functions

// Fetch all news articles
export const fetchNewsArticles = async (options: DatabaseOptions = {}): Promise<DatabaseResult<NewsArticle[]>> => {
  return executeQuery<NewsArticle[]>(
    async () => {
      const result = await supabase
        .from('news_articles')
        .select(`
          *,
          comments:comments(*),
          category:categories(name)
        `)
        .order('created_at', { ascending: false });

      if (result.error) {
        return { data: null, error: result.error };
      }

      // Transform the data to match our NewsArticle type
      const articles = result.data.map(article => ({
        id: article.id,
        title: article.title,
        content: article.content,
        summary: article.summary || '',
        category: article.category?.name || 'Uncategorized',
        image_url: article.image_url,
        video_url: article.video_url,
        video_type: article.video_type,
        created_at: article.created_at,
        updated_at: article.updated_at,
        author: article.author || 'Unknown',
        likes: article.likes || 0,
        comments: article.comments || [],
        tags: article.tags || [],
        published: article.published,
        rss_feed_id: article.rss_feed_id,
        rss_item_guid: article.rss_item_guid
      }));

      return { data: articles, error: null };
    },
    'news_articles:all',
    'news_articles',
    'fetchAll',
    options
  );
};

// Fetch a single news article by ID
export const fetchNewsArticleById = async (id: string, options: DatabaseOptions = {}): Promise<DatabaseResult<NewsArticle>> => {
  return executeQuery<NewsArticle>(
    async () => {
      const result = await supabase
        .from('news_articles')
        .select(`
          *,
          comments:comments(*),
          category:categories(name)
        `)
        .eq('id', id)
        .single();

      if (result.error) {
        return { data: null, error: result.error };
      }

      // Transform the data to match our NewsArticle type
      const article = {
        id: result.data.id,
        title: result.data.title,
        content: result.data.content,
        summary: result.data.summary || '',
        category: result.data.category?.name || 'Uncategorized',
        image_url: result.data.image_url,
        video_url: result.data.video_url,
        video_type: result.data.video_type,
        created_at: result.data.created_at,
        updated_at: result.data.updated_at,
        author: result.data.author || 'Unknown',
        likes: result.data.likes || 0,
        comments: result.data.comments || [],
        tags: result.data.tags || [],
        published: result.data.published,
        rss_feed_id: result.data.rss_feed_id,
        rss_item_guid: result.data.rss_item_guid
      };

      return { data: article, error: null };
    },
    `news_articles:${id}`,
    'news_articles',
    'fetchById',
    options
  );
};

// Create a new news article
export const createNewsArticle = async (article: Omit<NewsArticle, 'id' | 'created_at' | 'updated_at'>, options: DatabaseOptions = {}): Promise<DatabaseResult<NewsArticle>> => {
  return executeQuery<NewsArticle>(
    async () => {
      const now = new Date().toISOString();

      const result = await supabase
        .from('news_articles')
        .insert({
          title: article.title,
          content: article.content,
          summary: article.summary,
          category_id: article.category, // Assuming category is the category ID
          image_url: article.image_url,
          video_url: article.video_url,
          video_type: article.video_type,
          author: article.author,
          likes: article.likes || 0,
          tags: article.tags || [],
          published: article.published,
          created_at: now,
          updated_at: now,
          rss_feed_id: article.rss_feed_id,
          rss_item_guid: article.rss_item_guid
        })
        .select()
        .single();

      if (result.error) {
        return { data: null, error: result.error };
      }

      // Clear cache for news articles
      clearCache('news_articles:all');

      return { data: result.data as unknown as NewsArticle, error: null };
    },
    '', // No cache key for create operations
    'news_articles',
    'create',
    { ...options, bypassCache: true, fallbackToCache: false }
  );
};

// Update a news article
export const updateNewsArticle = async (id: string, article: Partial<NewsArticle>, options: DatabaseOptions = {}): Promise<DatabaseResult<NewsArticle>> => {
  return executeQuery<NewsArticle>(
    async () => {
      const now = new Date().toISOString();

      const result = await supabase
        .from('news_articles')
        .update({
          ...article,
          updated_at: now
        })
        .eq('id', id)
        .select()
        .single();

      if (result.error) {
        return { data: null, error: result.error };
      }

      // Clear cache for this article and all articles
      clearCache(`news_articles:${id}`);
      clearCache('news_articles:all');

      return { data: result.data as unknown as NewsArticle, error: null };
    },
    '', // No cache key for update operations
    'news_articles',
    'update',
    { ...options, bypassCache: true, fallbackToCache: false }
  );
};

// Delete a news article
export const deleteNewsArticle = async (id: string, options: DatabaseOptions = {}): Promise<DatabaseResult<boolean>> => {
  return executeQuery<boolean>(
    async () => {
      const result = await supabase
        .from('news_articles')
        .delete()
        .eq('id', id);

      if (result.error) {
        return { data: null, error: result.error };
      }

      // Clear cache for this article and all articles
      clearCache(`news_articles:${id}`);
      clearCache('news_articles:all');

      return { data: true, error: null };
    },
    '', // No cache key for delete operations
    'news_articles',
    'delete',
    { ...options, bypassCache: true, fallbackToCache: false }
  );
};

// Category Functions

// Fetch all categories
export const fetchCategories = async (options: DatabaseOptions = {}): Promise<DatabaseResult<Category[]>> => {
  return executeQuery<Category[]>(
    async () => {
      const result = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (result.error) {
        return { data: null, error: result.error };
      }

      return { data: result.data, error: null };
    },
    'categories:all',
    'categories',
    'fetchAll',
    options
  );
};

// Fetch a single category by ID
export const fetchCategoryById = async (id: string, options: DatabaseOptions = {}): Promise<DatabaseResult<Category>> => {
  return executeQuery<Category>(
    async () => {
      const result = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (result.error) {
        return { data: null, error: result.error };
      }

      return { data: result.data, error: null };
    },
    `categories:${id}`,
    'categories',
    'fetchById',
    options
  );
};

// Create a new category
export const createCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>, options: DatabaseOptions = {}): Promise<DatabaseResult<Category>> => {
  return executeQuery<Category>(
    async () => {
      const now = new Date().toISOString();

      const result = await supabase
        .from('categories')
        .insert({
          name: category.name,
          slug: category.slug,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (result.error) {
        return { data: null, error: result.error };
      }

      // Clear cache for categories
      clearCache('categories:all');

      return { data: result.data, error: null };
    },
    '', // No cache key for create operations
    'categories',
    'create',
    { ...options, bypassCache: true, fallbackToCache: false }
  );
};

// Update a category
export const updateCategory = async (id: string, category: Partial<Category>, options: DatabaseOptions = {}): Promise<DatabaseResult<Category>> => {
  return executeQuery<Category>(
    async () => {
      const now = new Date().toISOString();

      const result = await supabase
        .from('categories')
        .update({
          ...category,
          updated_at: now
        })
        .eq('id', id)
        .select()
        .single();

      if (result.error) {
        return { data: null, error: result.error };
      }

      // Clear cache for this category and all categories
      clearCache(`categories:${id}`);
      clearCache('categories:all');

      return { data: result.data, error: null };
    },
    '', // No cache key for update operations
    'categories',
    'update',
    { ...options, bypassCache: true, fallbackToCache: false }
  );
};

// Delete a category
export const deleteCategory = async (id: string, options: DatabaseOptions = {}): Promise<DatabaseResult<boolean>> => {
  return executeQuery<boolean>(
    async () => {
      const result = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (result.error) {
        return { data: null, error: result.error };
      }

      // Clear cache for this category and all categories
      clearCache(`categories:${id}`);
      clearCache('categories:all');

      return { data: true, error: null };
    },
    '', // No cache key for delete operations
    'categories',
    'delete',
    { ...options, bypassCache: true, fallbackToCache: false }
  );
};

// Comment Functions

// Fetch comments for an article
export const fetchCommentsByArticleId = async (articleId: string, options: DatabaseOptions = {}): Promise<DatabaseResult<Comment[]>> => {
  return executeQuery<Comment[]>(
    async () => {
      const result = await supabase
        .from('comments')
        .select('*')
        .eq('news_id', articleId)
        .order('created_at', { ascending: false });

      if (result.error) {
        return { data: null, error: result.error };
      }

      return { data: result.data, error: null };
    },
    `comments:article:${articleId}`,
    'comments',
    'fetchByArticleId',
    options
  );
};

// Add a comment to an article
export const addComment = async (
  articleId: string,
  content: string,
  ipAddress: string,
  options: DatabaseOptions = {}
): Promise<DatabaseResult<Comment>> => {
  return executeQuery<Comment>(
    async () => {
      const now = new Date().toISOString();

      const result = await supabase
        .from('comments')
        .insert({
          news_id: articleId,
          content,
          author_ip: ipAddress,
          created_at: now
        })
        .select()
        .single();

      if (result.error) {
        return { data: null, error: result.error };
      }

      // Clear cache for comments
      clearCache(`comments:article:${articleId}`);

      return { data: result.data, error: null };
    },
    '', // No cache key for create operations
    'comments',
    'create',
    { ...options, bypassCache: true, fallbackToCache: false }
  );
};

// Ad Functions

// Fetch all ads
export const fetchAds = async (options: DatabaseOptions = {}): Promise<DatabaseResult<Ad[]>> => {
  return executeQuery<Ad[]>(
    async () => {
      const result = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (result.error) {
        return { data: null, error: result.error };
      }

      return { data: result.data, error: null };
    },
    'ads:all',
    'ads',
    'fetchAll',
    options
  );
};

// Fetch active ads
export const fetchActiveAds = async (options: DatabaseOptions = {}): Promise<DatabaseResult<Ad[]>> => {
  return executeQuery<Ad[]>(
    async () => {
      const result = await supabase
        .from('ads')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (result.error) {
        return { data: null, error: result.error };
      }

      return { data: result.data, error: null };
    },
    'ads:active',
    'ads',
    'fetchActive',
    options
  );
};

// Fetch a single ad by ID
export const fetchAdById = async (id: string, options: DatabaseOptions = {}): Promise<DatabaseResult<Ad>> => {
  return executeQuery<Ad>(
    async () => {
      const result = await supabase
        .from('ads')
        .select('*')
        .eq('id', id)
        .single();

      if (result.error) {
        return { data: null, error: result.error };
      }

      return { data: result.data, error: null };
    },
    `ads:${id}`,
    'ads',
    'fetchById',
    options
  );
};

// Create a new ad
export const createAd = async (ad: Omit<Ad, 'id' | 'created_at' | 'updated_at'>, options: DatabaseOptions = {}): Promise<DatabaseResult<Ad>> => {
  return executeQuery<Ad>(
    async () => {
      const now = new Date().toISOString();

      const result = await supabase
        .from('ads')
        .insert({
          title: ad.title,
          description: ad.description,
          image_url: ad.image_url,
          video_url: ad.video_url,
          video_type: ad.video_type,
          text_content: ad.text_content,
          link_url: ad.link_url,
          frequency: ad.frequency,
          active: ad.active,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (result.error) {
        return { data: null, error: result.error };
      }

      // Clear cache for ads
      clearCache('ads:all');
      clearCache('ads:active');

      return { data: result.data, error: null };
    },
    '', // No cache key for create operations
    'ads',
    'create',
    { ...options, bypassCache: true, fallbackToCache: false }
  );
};

// Update an ad
export const updateAd = async (id: string, ad: Partial<Ad>, options: DatabaseOptions = {}): Promise<DatabaseResult<Ad>> => {
  return executeQuery<Ad>(
    async () => {
      const now = new Date().toISOString();

      const result = await supabase
        .from('ads')
        .update({
          ...ad,
          updated_at: now
        })
        .eq('id', id)
        .select()
        .single();

      if (result.error) {
        return { data: null, error: result.error };
      }

      // Clear cache for this ad and all ads
      clearCache(`ads:${id}`);
      clearCache('ads:all');
      clearCache('ads:active');

      return { data: result.data, error: null };
    },
    '', // No cache key for update operations
    'ads',
    'update',
    { ...options, bypassCache: true, fallbackToCache: false }
  );
};

// Delete an ad
export const deleteAd = async (id: string, options: DatabaseOptions = {}): Promise<DatabaseResult<boolean>> => {
  return executeQuery<boolean>(
    async () => {
      const result = await supabase
        .from('ads')
        .delete()
        .eq('id', id);

      if (result.error) {
        return { data: null, error: result.error };
      }

      // Clear cache for this ad and all ads
      clearCache(`ads:${id}`);
      clearCache('ads:all');
      clearCache('ads:active');

      return { data: true, error: null };
    },
    '', // No cache key for delete operations
    'ads',
    'delete',
    { ...options, bypassCache: true, fallbackToCache: false }
  );
};

// RSS Feed Functions

// Fetch all RSS feeds
export const fetchRssFeeds = async (options: DatabaseOptions = {}): Promise<DatabaseResult<RssFeed[]>> => {
  return executeQuery<RssFeed[]>(
    async () => {
      const result = await supabase
        .from('rss_feeds')
        .select('*')
        .order('created_at', { ascending: false });

      if (result.error) {
        return { data: null, error: result.error };
      }

      return { data: result.data, error: null };
    },
    'rss_feeds:all',
    'rss_feeds',
    'fetchAll',
    options
  );
};

// Fetch a single RSS feed by ID
export const fetchRssFeedById = async (id: string, options: DatabaseOptions = {}): Promise<DatabaseResult<RssFeed>> => {
  return executeQuery<RssFeed>(
    async () => {
      const result = await supabase
        .from('rss_feeds')
        .select('*')
        .eq('id', id)
        .single();

      if (result.error) {
        return { data: null, error: result.error };
      }

      return { data: result.data, error: null };
    },
    `rss_feeds:${id}`,
    'rss_feeds',
    'fetchById',
    options
  );
};

// Fetch RSS feed items by feed ID
export const fetchRssFeedItems = async (feedId: string, options: DatabaseOptions = {}): Promise<DatabaseResult<any[]>> => {
  return executeQuery<any[]>(
    async () => {
      const result = await supabase
        .from('news_articles')
        .select('id, rss_item_guid')
        .eq('rss_feed_id', feedId);

      if (result.error) {
        return { data: null, error: result.error };
      }

      return { data: result.data, error: null };
    },
    `rss_feed_items:${feedId}`,
    'news_articles',
    'fetchByFeedId',
    options
  );
};

// Add a new RSS feed
export const addRssFeed = async (feed: Omit<RssFeed, 'id' | 'created_at' | 'updated_at'>, options: DatabaseOptions = {}): Promise<DatabaseResult<RssFeed>> => {
  return executeQuery<RssFeed>(
    async () => {
      const now = new Date().toISOString();

      const result = await supabase
        .from('rss_feeds')
        .insert({
          name: feed.name,
          url: feed.url,
          category: feed.category,
          auto_fetch: feed.auto_fetch,
          fetch_interval: feed.fetch_interval,
          active: true,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (result.error) {
        return { data: null, error: result.error };
      }

      // Clear cache for RSS feeds
      clearCache('rss_feeds:all');

      return { data: result.data, error: null };
    },
    '', // No cache key for create operations
    'rss_feeds',
    'create',
    { ...options, bypassCache: true, fallbackToCache: false }
  );
};

// Update an RSS feed
export const updateRssFeed = async (id: string, feed: Partial<RssFeed>, options: DatabaseOptions = {}): Promise<DatabaseResult<RssFeed>> => {
  return executeQuery<RssFeed>(
    async () => {
      const now = new Date().toISOString();

      const result = await supabase
        .from('rss_feeds')
        .update({
          ...feed,
          updated_at: now
        })
        .eq('id', id)
        .select()
        .single();

      if (result.error) {
        return { data: null, error: result.error };
      }

      // Clear cache for this feed and all feeds
      clearCache(`rss_feeds:${id}`);
      clearCache('rss_feeds:all');

      return { data: result.data, error: null };
    },
    '', // No cache key for update operations
    'rss_feeds',
    'update',
    { ...options, bypassCache: true, fallbackToCache: false }
  );
};

// Delete an RSS feed
export const deleteRssFeed = async (id: string, options: DatabaseOptions = {}): Promise<DatabaseResult<boolean>> => {
  return executeQuery<boolean>(
    async () => {
      const result = await supabase
        .from('rss_feeds')
        .delete()
        .eq('id', id);

      if (result.error) {
        return { data: null, error: result.error };
      }

      // Clear cache for this feed and all feeds
      clearCache(`rss_feeds:${id}`);
      clearCache('rss_feeds:all');

      return { data: true, error: null };
    },
    '', // No cache key for delete operations
    'rss_feeds',
    'delete',
    { ...options, bypassCache: true, fallbackToCache: false }
  );
};