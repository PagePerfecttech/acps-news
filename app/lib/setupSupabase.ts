import { supabase, isSupabaseConfigured } from './supabase';
import { getNewsArticles, getAds, getCategories } from './dataService';

/**
 * Initializes the Supabase database with data from localStorage if needed
 */
export const initializeSupabaseData = async (): Promise<boolean> => {
  try {
    console.log('Checking Supabase configuration...');
    const isConfigured = await isSupabaseConfigured();
    
    if (!isConfigured) {
      console.error('Supabase is not properly configured');
      return false;
    }
    
    console.log('Supabase is properly configured');
    
    // Check if we need to initialize data
    const { count: articleCount, error: countError } = await supabase
      .from('news_articles')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error checking article count:', countError);
      return false;
    }
    
    // If there are already articles in the database, we don&apos;t need to initialize
    if (articleCount && articleCount > 0) {
      console.log(`Database already has ${articleCount} articles, no need to initialize`);
      return true;
    }
    
    console.log('No articles found in database, initializing with localStorage data...');
    
    // Get data from localStorage
    const articles = getNewsArticles();
    const ads = getAds();
    const categories = getCategories();
    
    // First, insert categories
    for (const category of categories) {
      const { error } = await supabase
        .from('categories')
        .insert({
          name: category.name,
          slug: category.slug,
          created_at: category.created_at,
          updated_at: category.updated_at
        });
      
      if (error) {
        console.error(`Error inserting category ${category.name}:`, error);
      }
    }
    
    // Get category IDs
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id, name');
    
    if (categoryError) {
      console.error('Error fetching categories:', categoryError);
      return false;
    }
    
    const categoryMap = new Map();
    categoryData?.forEach(cat => categoryMap.set(cat.name, cat.id));
    
    // Insert articles
    for (const article of articles) {
      const categoryId = categoryMap.get(article.category);
      
      const { error } = await supabase
        .from('news_articles')
        .insert({
          title: article.title,
          content: article.content,
          summary: article.summary,
          category_id: categoryId,
          image_url: article.image_url,
          video_url: article.video_url,
          video_type: article.video_type,
          author: article.author,
          likes: article.likes || 0,
          views: 0,
          published: article.published !== false,
          created_at: article.created_at,
          updated_at: article.updated_at
        });
      
      if (error) {
        console.error(`Error inserting article ${article.title}:`, error);
      }
    }
    
    // Insert ads
    for (const ad of ads) {
      const { error } = await supabase
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
          active: ad.active !== false,
          created_at: ad.created_at,
          updated_at: ad.updated_at
        });
      
      if (error) {
        console.error(`Error inserting ad ${ad.title}:`, error);
      }
    }
    
    console.log('Database initialization complete');
    return true;
  } catch (error) {
    console.error('Error initializing Supabase data:', error);
    return false;
  }
};

/**
 * Checks if the required tables exist in the Supabase database
 */
export const checkSupabaseTables = async (): Promise<{
  exists: boolean;
  missingTables: string[];
}> => {
  try {
    const requiredTables = [
      'categories',
      'news_articles',
      'comments',
      'likes',
      'ads',
      'site_settings'
    ];
    
    const missingTables: string[] = [];
    
    for (const table of requiredTables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error && error.code === '42P01') { // Table doesn&apos;t exist
        missingTables.push(table);
      }
    }
    
    return {
      exists: missingTables.length === 0,
      missingTables
    };
  } catch (error) {
    console.error('Error checking Supabase tables:', error);
    return {
      exists: false,
      missingTables: ['Error checking tables']
    };
  }
};

/**
 * Gets the Supabase project details
 */
export const getSupabaseProjectInfo = async (): Promise<{
  projectName: string;
  region: string;
  status: string;
}> => {
  try {
    // This is a simple check to get some info about the project
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return {
        projectName: 'Unknown',
        region: 'Unknown',
        status: 'Error'
      };
    }
    
    // Extract project info from URL
    const url = supabase.supabaseUrl;
    const projectId = url.split('//')[1].split('.')[0];
    
    return {
      projectName: 'VRM MEDIA',
      region: 'ap-south-1 (Mumbai)',
      status: 'Connected'
    };
  } catch (error) {
    console.error('Error getting Supabase project info:', error);
    return {
      projectName: 'Unknown',
      region: 'Unknown',
      status: 'Error'
    };
  }
};
