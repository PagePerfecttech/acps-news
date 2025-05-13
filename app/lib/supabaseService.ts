import { supabase } from './supabase';
import { NewsArticle, Ad, Comment, Category } from '../types';

// News Article Functions
export const fetchNewsArticles = async (): Promise<NewsArticle[]> => {
  try {
    const { data, error } = await supabase
      .from('news_articles')
      .select(`
        *,
        comments:comments(*),
        category:categories(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching news articles:', error);
      return [];
    }

    // Transform the data to match our NewsArticle type
    return data.map(article => ({
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
      tags: [], // We'll need to fetch tags separately
      published: article.published
    }));
  } catch (error) {
    console.error('Error in fetchNewsArticles:', error);
    return [];
  }
};

// Get a single news article by ID
export const getNewsArticleById = async (articleId: string): Promise<NewsArticle | null> => {
  try {
    const { data, error } = await supabase
      .from('news_articles')
      .select(`
        *,
        comments:comments(*),
        category:categories(name)
      `)
      .eq('id', articleId)
      .single();

    if (error) {
      console.error('Error fetching news article:', error);
      return null;
    }

    // Transform the data to match our NewsArticle type
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      summary: data.summary || '',
      category: data.category?.name || 'Uncategorized',
      image_url: data.image_url,
      video_url: data.video_url,
      video_type: data.video_type,
      created_at: data.created_at,
      updated_at: data.updated_at,
      author: data.author || 'Unknown',
      likes: data.likes || 0,
      comments: data.comments || [],
      tags: [], // We'll need to fetch tags separately
      published: data.published
    };
  } catch (error) {
    console.error('Error in getNewsArticleById:', error);
    return null;
  }
};

// Get dashboard stats
export const fetchDashboardStats = async () => {
  try {
    // Get article count
    const { count: articleCount, error: articleError } = await supabase
      .from('news_articles')
      .select('*', { count: 'exact', head: true });

    // Get ad count
    const { count: adCount, error: adError } = await supabase
      .from('ads')
      .select('*', { count: 'exact', head: true });

    // Get active ad count
    const { count: activeAdCount, error: activeAdError } = await supabase
      .from('ads')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    // Get comment count
    const { count: commentCount, error: commentError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true });

    // Get pending comment count
    const { count: pendingCommentCount, error: pendingCommentError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('approved', false);

    // Get total likes
    const { data: likesData, error: likesError } = await supabase
      .from('news_articles')
      .select('likes');

    const totalLikes = likesData ? likesData.reduce((sum, article) => sum + (article.likes || 0), 0) : 0;

    if (articleError || adError || activeAdError || commentError || pendingCommentError || likesError) {
      console.error('Error fetching dashboard stats:', {
        articleError,
        adError,
        activeAdError,
        commentError,
        pendingCommentError,
        likesError
      });
    }

    return {
      totalArticles: articleCount || 0,
      totalAds: adCount || 0,
      activeAds: activeAdCount || 0,
      totalComments: commentCount || 0,
      pendingComments: pendingCommentCount || 0,
      totalLikes
    };
  } catch (error) {
    console.error('Error in fetchDashboardStats:', error);
    return {
      totalArticles: 0,
      totalAds: 0,
      activeAds: 0,
      totalComments: 0,
      pendingComments: 0,
      totalLikes: 0
    };
  }
};

// Fetch all comments with article titles
export const fetchAllComments = async () => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        news_article:news_articles(title)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }

    return data.map(comment => ({
      id: comment.id,
      news_id: comment.news_id,
      content: comment.content,
      author_ip: comment.author_ip,
      created_at: comment.created_at,
      approved: comment.approved,
      article_title: comment.news_article?.title || 'Unknown Article'
    }));
  } catch (error) {
    console.error('Error in fetchAllComments:', error);
    return [];
  }
};

// Fetch all ads
export const fetchAds = async (): Promise<Ad[]> => {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ads:', error);
      return [];
    }

    return data.map(ad => ({
      id: ad.id,
      title: ad.title,
      description: ad.description,
      image_url: ad.image_url,
      video_url: ad.video_url,
      video_type: ad.video_type,
      text_content: ad.text_content,
      link_url: ad.link_url,
      frequency: ad.frequency,
      active: ad.active,
      created_at: ad.created_at,
      updated_at: ad.updated_at
    }));
  } catch (error) {
    console.error('Error in fetchAds:', error);
    return [];
  }
};

// Approve a comment
export const approveComment = async (commentId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('comments')
      .update({ approved: true })
      .eq('id', commentId);

    if (error) {
      console.error('Error approving comment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in approveComment:', error);
    return false;
  }
};

// Delete a comment
export const deleteComment = async (commentId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteComment:', error);
    return false;
  }
};

// Subscribe to real-time changes (legacy method - use realtimeManager instead)
export const subscribeToChanges = (
  table: string,
  callback: (payload: any) => void,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*',
  filter?: string,
  filterValue?: string
) => {
  // Import here to avoid circular dependencies
  const { subscribeToChanges: subscribe } = require('./realtimeManager');

  // Use the new subscription manager
  return subscribe(table, callback, event, filter, filterValue);
};

// Like an article
export const likeArticle = async (articleId: string, ipAddress: string): Promise<boolean> => {
  try {
    // First check if this IP has already liked this article
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('*')
      .eq('news_id', articleId)
      .eq('ip_address', ipAddress)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing like:', checkError);
      return false;
    }

    // If already liked, return true (consider it a success)
    if (existingLike) {
      return true;
    }

    // Start a transaction to add the like and update the article's like count
    const { error: likeError } = await supabase
      .from('likes')
      .insert({
        news_id: articleId,
        ip_address: ipAddress,
        created_at: new Date().toISOString()
      });

    if (likeError) {
      console.error('Error adding like:', likeError);
      return false;
    }

    // Increment the article's like count
    const { error: updateError } = await supabase
      .rpc('increment_likes', { article_id: articleId });

    if (updateError) {
      console.error('Error updating article likes:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in likeArticle:', error);
    return false;
  }
};

// Add a comment to an article
export const addComment = async (
  articleId: string,
  content: string,
  ipAddress: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('comments')
      .insert({
        news_id: articleId,
        content,
        author_ip: ipAddress,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error adding comment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in addComment:', error);
    return false;
  }
};

// Increment view count for an article
export const incrementViewCount = async (articleId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .rpc('increment_views', { article_id: articleId });

    if (error) {
      console.error('Error incrementing view count:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in incrementViewCount:', error);
    return false;
  }
};

// Get article stats (likes, comments, views)
export const getArticleStats = async (articleId: string) => {
  try {
    const { data, error } = await supabase
      .from('news_articles')
      .select('likes, views, comments(count)')
      .eq('id', articleId)
      .single();

    if (error) {
      console.error('Error fetching article stats:', error);
      return { likes: 0, comments: 0, views: 0 };
    }

    return {
      likes: data.likes || 0,
      comments: data.comments?.length || 0,
      views: data.views || 0
    };
  } catch (error) {
    console.error('Error in getArticleStats:', error);
    return { likes: 0, comments: 0, views: 0 };
  }
};

// Check if user has already liked an article
export const hasUserLikedArticle = async (articleId: string, ipAddress: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('likes')
      .select('*')
      .eq('news_id', articleId)
      .eq('ip_address', ipAddress)
      .maybeSingle();

    if (error) {
      console.error('Error checking if user liked article:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in hasUserLikedArticle:', error);
    return false;
  }
};

// Category Management Functions

// Fetch all categories
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error in fetchCategories:', error);
    return [];
  }
};

// Add a new category
export const addCategoryToSupabase = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category | null> => {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        slug: category.slug,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding category:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in addCategoryToSupabase:', error);
    return null;
  }
};

// Update a category
export const updateCategoryInSupabase = async (id: string, category: Partial<Category>): Promise<Category | null> => {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('categories')
      .update({
        ...category,
        updated_at: now
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateCategoryInSupabase:', error);
    return null;
  }
};

// Delete a category
export const deleteCategoryFromSupabase = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteCategoryFromSupabase:', error);
    return false;
  }
};

