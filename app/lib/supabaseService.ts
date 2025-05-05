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

// Subscribe to real-time changes
export const subscribeToChanges = (
  table: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      payload => {
        callback(payload);
      }
    )
    .subscribe();
};
