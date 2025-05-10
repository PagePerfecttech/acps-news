import { NewsArticle, Ad, Comment, Category } from '../types';
import { longNewsPosts } from '../data/longNewsPosts';

// Default categories data
const defaultCategories: Category[] = [
  { id: '1', name: 'సినిమా', slug: 'cinema', created_at: '2023-05-01T00:00:00Z', updated_at: '2023-05-01T00:00:00Z' },
  { id: '2', name: 'రాజకీయం', slug: 'politics', created_at: '2023-05-01T00:00:00Z', updated_at: '2023-05-01T00:00:00Z' },
  { id: '3', name: 'క్రీడలు', slug: 'sports', created_at: '2023-05-01T00:00:00Z', updated_at: '2023-05-01T00:00:00Z' },
  { id: '4', name: 'వ్యాపారం', slug: 'business', created_at: '2023-05-01T00:00:00Z', updated_at: '2023-05-01T00:00:00Z' },
  { id: '5', name: 'టెక్నాలజీ', slug: 'technology', created_at: '2023-05-01T00:00:00Z', updated_at: '2023-05-01T00:00:00Z' },
  { id: '6', name: 'ఆరోగ్యం', slug: 'health', created_at: '2023-05-01T00:00:00Z', updated_at: '2023-05-01T00:00:00Z' },
  { id: '7', name: 'విద్య', slug: 'education', created_at: '2023-05-01T00:00:00Z', updated_at: '2023-05-01T00:00:00Z' },
  { id: '8', name: 'రాష్ట్రీయం', slug: 'state', created_at: '2023-05-01T00:00:00Z', updated_at: '2023-05-01T00:00:00Z' },
  { id: '9', name: 'జాతీయం', slug: 'national', created_at: '2023-05-01T00:00:00Z', updated_at: '2023-05-01T00:00:00Z' },
  { id: '10', name: 'అంతర్జాతీయం', slug: 'international', created_at: '2023-05-01T00:00:00Z', updated_at: '2023-05-01T00:00:00Z' }
];

// Default ads data
const defaultAds: Ad[] = [
  {
    id: '1',
    title: 'ప్రీమియం సబ్‌స్క్రిప్షన్ - అన్లిమిటెడ్ యాక్సెస్ పొందండి',
    description: 'ఇప్పుడే సబ్‌స్క్రైబ్ చేసుకొని యాడ్-ఫ్రీ రీడింగ్, ఎక్స్‌క్లూజివ్ కంటెంట్ మరియు మరిన్ని ఆనందించండి!',
    image_url: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=1470&auto=format&fit=crop',
    link_url: '/subscribe',
    frequency: 3, // Show after every 3 articles
    active: true,
    created_at: '2023-05-01T00:00:00Z',
    updated_at: '2023-05-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'నూతన స్మార్ట్‌ఫోన్ లాంచ్',
    description: 'అత్యాధునిక ఫీచర్లతో కొత్త స్మార్ట్‌ఫోన్ మార్కెట్లోకి',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    video_type: 'youtube',
    link_url: '/smartphone',
    frequency: 5,
    active: true,
    created_at: '2023-05-02T00:00:00Z',
    updated_at: '2023-05-02T00:00:00Z',
  },
  {
    id: '3',
    title: 'ఆన్‌లైన్ షాపింగ్ ఆఫర్స్',
    text_content: 'ఇప్పుడే కొనుగోలు చేసి 50% వరకు పొదుపు చేయండి!',
    image_url: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=1470&auto=format&fit=crop',
    link_url: '/shopping',
    frequency: 4,
    active: true,
    created_at: '2023-05-03T00:00:00Z',
    updated_at: '2023-05-03T00:00:00Z',
  }
];

// Initialize data in localStorage if it doesn't exist
const initializeData = () => {
  if (typeof window === 'undefined') return; // Skip on server-side

  // Check if news data exists in localStorage
  if (!localStorage.getItem('flipnews_articles')) {
    // Initialize with the default data
    localStorage.setItem('flipnews_articles', JSON.stringify(longNewsPosts));
  }

  // Check if ads data exists in localStorage
  if (!localStorage.getItem('flipnews_ads')) {
    // Initialize with the default ads
    localStorage.setItem('flipnews_ads', JSON.stringify(defaultAds));
  }

  // Check if categories data exists in localStorage
  if (!localStorage.getItem('flipnews_categories')) {
    // Initialize with the default categories
    localStorage.setItem('flipnews_categories', JSON.stringify(defaultCategories));
  }
};

// Get all news articles
export const getNewsArticles = async (): Promise<NewsArticle[]> => {
  // Try to get data from Supabase first
  try {
    // Import dynamically to avoid circular dependencies
    const { supabase, isSupabaseConfigured } = await import('./supabase');

    // Check if Supabase is configured
    const configured = await isSupabaseConfigured();

    if (configured) {
      console.log('Fetching articles from Supabase...');
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        console.log(`Retrieved ${data.length} articles from Supabase`);

        // Update localStorage with the latest data
        if (typeof window !== 'undefined') {
          localStorage.setItem('flipnews_articles', JSON.stringify(data));
          localStorage.setItem('flipnews_articles_cache', JSON.stringify(data));
          localStorage.setItem('flipnews_articles_cache_timestamp', Date.now().toString());
          localStorage.setItem('flipnews_articles_updated', Date.now().toString());
        }

        return data;
      } else {
        console.warn('Failed to fetch articles from Supabase:', error);
      }
    }
  } catch (error) {
    console.error('Error fetching from Supabase:', error);
  }

  // Fall back to localStorage if Supabase fails
  if (typeof window === 'undefined') {
    // Return the default data on server-side
    return longNewsPosts;
  }

  initializeData();

  // Check if we have a cached version and when it was last updated
  const lastUpdated = localStorage.getItem('flipnews_articles_updated');
  const cachedArticles = localStorage.getItem('flipnews_articles_cache');

  // Get the actual articles from storage
  const articles = localStorage.getItem('flipnews_articles');

  if (!articles) {
    return longNewsPosts;
  }

  // Parse the articles
  const parsedArticles = JSON.parse(articles);

  // If we have cached articles, check if they're still fresh
  if (cachedArticles && lastUpdated) {
    const cachedTimestamp = localStorage.getItem('flipnews_articles_cache_timestamp');

    // If the cache timestamp is newer than the last update, use the cache
    if (cachedTimestamp && parseInt(cachedTimestamp, 10) > parseInt(lastUpdated, 10)) {
      console.log('Using cached articles from localStorage');
      return JSON.parse(cachedArticles);
    }
  }

  // If we get here, either there's no cache or it's stale
  // Update the cache with the fresh data
  localStorage.setItem('flipnews_articles_cache', JSON.stringify(parsedArticles));
  localStorage.setItem('flipnews_articles_cache_timestamp', Date.now().toString());

  console.log('Using fresh articles data from localStorage');
  return parsedArticles;
};

// Get a single news article by ID
export const getNewsArticleById = async (id: string): Promise<NewsArticle | undefined> => {
  // Try to get from Supabase first
  try {
    // Import dynamically to avoid circular dependencies
    const { supabase, isSupabaseConfigured } = await import('./supabase');

    // Check if Supabase is configured
    const configured = await isSupabaseConfigured();

    if (configured) {
      console.log('Fetching article from Supabase:', id);

      const { data, error } = await supabase
        .from('news_articles')
        .select(`
          *,
          categories:category_id(name)
        `)
        .eq('id', id)
        .single();

      if (!error && data) {
        console.log(`Article ${id} found in Supabase`);

        // Format the article to match our expected structure
        const article: NewsArticle = {
          ...data,
          category: data.categories ? data.categories.name : data.category_id,
          comments: []
        };

        return article;
      } else {
        console.warn('Failed to fetch article from Supabase:', error);
      }
    }
  } catch (error) {
    console.error('Error fetching article from Supabase:', error);
  }

  // Try to get from all possible localStorage sources
  try {
    // First try the main articles storage
    const articlesPromise = getNewsArticles();
    const articles = await articlesPromise;
    const article = articles.find(article => article.id === id);

    if (article) {
      console.log(`Article ${id} found in main storage`);
      return article;
    }

    // If not found, try the cache
    if (typeof window !== 'undefined') {
      const cachedArticlesJson = localStorage.getItem('flipnews_articles_cache');
      if (cachedArticlesJson) {
        try {
          const cachedArticles = JSON.parse(cachedArticlesJson);
          const cachedArticle = cachedArticles.find((a: NewsArticle) => a.id === id);

          if (cachedArticle) {
            console.log(`Article ${id} found in cache`);
            return cachedArticle;
          }
        } catch (e) {
          console.error('Error parsing cached articles:', e);
        }
      }

      // Last resort: check all localStorage keys for any article data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('article')) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              const storedArticle = JSON.parse(value);
              if (storedArticle.id === id) {
                console.log(`Article ${id} found in localStorage key: ${key}`);
                return storedArticle;
              }
            }
          } catch (e) {
            // Skip this key if it's not valid JSON
          }
        }
      }
    }
  } catch (error) {
    console.error('Error searching for article in localStorage:', error);
  }

  console.log(`Article ${id} not found in any storage`);
  return undefined;
};

// Update a news article
export const updateNewsArticle = async (updatedArticle: NewsArticle): Promise<boolean> => {
  if (typeof window === 'undefined') return false; // Can't update on server-side

  try {
    // Try to update in Supabase first
    try {
      // Import dynamically to avoid circular dependencies
      const { supabase, isSupabaseConfigured } = await import('./supabase');

      // Check if Supabase is configured
      const configured = await isSupabaseConfigured();

      if (configured) {
        console.log('Updating article in Supabase:', updatedArticle.title);

        // Find category ID if needed
        let categoryId = updatedArticle.category;
        if (typeof categoryId === 'string' && isNaN(Number(categoryId))) {
          // If category is a name rather than an ID, look up the ID
          const { data: categoryData } = await supabase
            .from('categories')
            .select('id, name')
            .eq('name', updatedArticle.category)
            .single();

          if (categoryData) {
            categoryId = categoryData.id;
          }
        }

        // Update the article in Supabase
        const { error } = await supabase
          .from('news_articles')
          .update({
            title: updatedArticle.title,
            content: updatedArticle.content,
            summary: updatedArticle.summary,
            category_id: categoryId,
            image_url: updatedArticle.image_url,
            video_url: updatedArticle.video_url,
            video_type: updatedArticle.video_type,
            author: updatedArticle.author,
            published: updatedArticle.published !== false,
            updated_at: updatedArticle.updated_at || new Date().toISOString()
          })
          .eq('id', updatedArticle.id);

        if (error) {
          console.error('Error updating article in Supabase:', error);
        } else {
          console.log('Article updated in Supabase successfully');
        }
      }
    } catch (supabaseError) {
      console.error('Error with Supabase when updating article:', supabaseError);
      // Continue to update localStorage even if Supabase fails
    }

    // Also update in localStorage as a fallback
    const articlesPromise = getNewsArticles();
    const articles = await articlesPromise;
    const index = articles.findIndex(article => article.id === updatedArticle.id);

    if (index === -1) return false;

    articles[index] = updatedArticle;
    localStorage.setItem('flipnews_articles', JSON.stringify(articles));

    // Clear any cached data to ensure fresh data is loaded
    localStorage.removeItem('flipnews_articles_cache');

    // Set a timestamp for when the articles were last updated
    localStorage.setItem('flipnews_articles_updated', Date.now().toString());

    console.log('Article updated successfully, cache cleared');
    return true;
  } catch (error) {
    console.error('Error updating article:', error);
    return false;
  }
};

// Add a new news article
export const addNewsArticle = async (newArticle: NewsArticle): Promise<boolean> => {
  if (typeof window === 'undefined') return false; // Can't update on server-side

  try {
    // Try to add to Supabase first
    try {
      // Import dynamically to avoid circular dependencies
      const { supabase, isSupabaseConfigured } = await import('./supabase');

      // Check if Supabase is configured
      const configured = await isSupabaseConfigured();

      if (configured) {
        console.log('Adding article to Supabase:', newArticle.title);

        // Find category ID if needed
        let categoryId = newArticle.category;
        if (typeof categoryId === 'string' && isNaN(Number(categoryId))) {
          // If category is a name rather than an ID, look up the ID
          const { data: categoryData } = await supabase
            .from('categories')
            .select('id, name')
            .eq('name', newArticle.category)
            .single();

          if (categoryData) {
            categoryId = categoryData.id;
          }
        }

        // Insert the article into Supabase
        const { data, error } = await supabase
          .from('news_articles')
          .insert({
            title: newArticle.title,
            content: newArticle.content,
            summary: newArticle.summary,
            category_id: categoryId,
            image_url: newArticle.image_url,
            video_url: newArticle.video_url,
            video_type: newArticle.video_type,
            author: newArticle.author,
            likes: newArticle.likes || 0,
            views: 0,
            published: newArticle.published !== false,
            created_at: newArticle.created_at,
            updated_at: newArticle.updated_at
          })
          .select()
          .single();

        if (error) {
          console.error('Error adding article to Supabase:', error);
        } else {
          console.log('Article added to Supabase successfully:', data.id);

          // Update the article ID with the one from Supabase
          newArticle.id = data.id;
        }
      }
    } catch (supabaseError) {
      console.error('Error with Supabase when adding article:', supabaseError);
      // Continue to add to localStorage even if Supabase fails
    }

    // Also add to localStorage as a fallback
    const articlesPromise = getNewsArticles();
    const articles = await articlesPromise;
    articles.unshift(newArticle); // Add to the beginning of the array
    localStorage.setItem('flipnews_articles', JSON.stringify(articles));

    // Clear cache to ensure fresh data is loaded
    localStorage.removeItem('flipnews_articles_cache');
    localStorage.setItem('flipnews_articles_updated', Date.now().toString());

    return true;
  } catch (error) {
    console.error('Error adding article:', error);
    return false;
  }
};

// Delete a news article
export const deleteNewsArticle = async (id: string): Promise<boolean> => {
  if (typeof window === 'undefined') return false; // Can't update on server-side

  try {
    // Try to delete from Supabase first
    try {
      // Import dynamically to avoid circular dependencies
      const { supabase, isSupabaseConfigured } = await import('./supabase');

      // Check if Supabase is configured
      const configured = await isSupabaseConfigured();

      if (configured) {
        console.log('Deleting article from Supabase:', id);

        // Delete the article from Supabase
        const { error } = await supabase
          .from('news_articles')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting article from Supabase:', error);
        } else {
          console.log('Article deleted from Supabase successfully');
        }
      }
    } catch (supabaseError) {
      console.error('Error with Supabase when deleting article:', supabaseError);
      // Continue to delete from localStorage even if Supabase fails
    }

    // Also delete from localStorage as a fallback
    const articlesPromise = getNewsArticles();
    const articles = await articlesPromise;
    const filteredArticles = articles.filter(article => article.id !== id);
    localStorage.setItem('flipnews_articles', JSON.stringify(filteredArticles));

    // Clear any cached data to ensure fresh data is loaded
    localStorage.removeItem('flipnews_articles_cache');
    localStorage.setItem('flipnews_articles_updated', Date.now().toString());

    return true;
  } catch (error) {
    console.error('Error deleting article:', error);
    return false;
  }
};

// Reset to default data (for testing)
export const resetToDefaultData = (): void => {
  if (typeof window === 'undefined') return; // Skip on server-side
  localStorage.setItem('flipnews_articles', JSON.stringify(longNewsPosts));
  localStorage.setItem('flipnews_ads', JSON.stringify(defaultAds));
  localStorage.setItem('flipnews_categories', JSON.stringify(defaultCategories));
};

// Ad Management Functions

// Get all ads
export const getAds = async (): Promise<Ad[]> => {
  // Try to get data from Supabase first
  try {
    // Import dynamically to avoid circular dependencies
    const { supabase, isSupabaseConfigured } = await import('./supabase');

    // Check if Supabase is configured
    const configured = await isSupabaseConfigured();

    if (configured) {
      console.log('Fetching ads from Supabase...');
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('active', true);

      if (!error && data && data.length > 0) {
        console.log(`Retrieved ${data.length} ads from Supabase`);

        // Update localStorage with the latest data
        if (typeof window !== 'undefined') {
          localStorage.setItem('flipnews_ads', JSON.stringify(data));
        }

        return data;
      } else {
        console.warn('Failed to fetch ads from Supabase:', error);
      }
    }
  } catch (error) {
    console.error('Error fetching ads from Supabase:', error);
  }

  // Fall back to localStorage if Supabase fails
  if (typeof window === 'undefined') {
    // Return the default data on server-side
    return defaultAds;
  }

  initializeData();
  const ads = localStorage.getItem('flipnews_ads');
  return ads ? JSON.parse(ads) : defaultAds;
};

// Get a single ad by ID
export const getAdById = async (id: string): Promise<Ad | undefined> => {
  const ads = await getAds();
  return ads.find(ad => ad.id === id);
};

// Update an ad
export const updateAd = (updatedAd: Ad): boolean => {
  if (typeof window === 'undefined') return false; // Can't update on server-side

  try {
    const ads = getAds();
    const index = ads.findIndex(ad => ad.id === updatedAd.id);

    if (index === -1) return false;

    ads[index] = updatedAd;
    localStorage.setItem('flipnews_ads', JSON.stringify(ads));
    return true;
  } catch (error) {
    console.error('Error updating ad:', error);
    return false;
  }
};

// Add a new ad
export const addAd = (newAd: Ad): boolean => {
  if (typeof window === 'undefined') return false; // Can't update on server-side

  try {
    const ads = getAds();
    ads.unshift(newAd); // Add to the beginning of the array
    localStorage.setItem('flipnews_ads', JSON.stringify(ads));
    return true;
  } catch (error) {
    console.error('Error adding ad:', error);
    return false;
  }
};

// Delete an ad
export const deleteAd = (id: string): boolean => {
  if (typeof window === 'undefined') return false; // Can't update on server-side

  try {
    const ads = getAds();
    const filteredAds = ads.filter(ad => ad.id !== id);
    localStorage.setItem('flipnews_ads', JSON.stringify(filteredAds));
    return true;
  } catch (error) {
    console.error('Error deleting ad:', error);
    return false;
  }
};

// Category Management Functions

// Get all categories
export const getCategories = (): Category[] => {
  if (typeof window === 'undefined') {
    // Return the default data on server-side
    return defaultCategories;
  }

  initializeData();
  const categories = localStorage.getItem('flipnews_categories');
  return categories ? JSON.parse(categories) : defaultCategories;
};

// Get a single category by ID
export const getCategoryById = (id: string): Category | undefined => {
  const categories = getCategories();
  return categories.find(category => category.id === id);
};

// Get a single category by slug
export const getCategoryBySlug = (slug: string): Category | undefined => {
  const categories = getCategories();
  return categories.find(category => category.slug === slug);
};

// Update a category
export const updateCategory = (updatedCategory: Category): boolean => {
  if (typeof window === 'undefined') return false; // Can't update on server-side

  try {
    const categories = getCategories();
    const index = categories.findIndex(category => category.id === updatedCategory.id);

    if (index === -1) return false;

    categories[index] = updatedCategory;
    localStorage.setItem('flipnews_categories', JSON.stringify(categories));
    return true;
  } catch (error) {
    console.error('Error updating category:', error);
    return false;
  }
};

// Add a new category
export const addCategory = (newCategory: Category): boolean => {
  if (typeof window === 'undefined') return false; // Can't update on server-side

  try {
    const categories = getCategories();

    // Check if slug already exists
    const slugExists = categories.some(category => category.slug === newCategory.slug);
    if (slugExists) {
      console.error('Category with this slug already exists');
      return false;
    }

    categories.push(newCategory);
    localStorage.setItem('flipnews_categories', JSON.stringify(categories));
    return true;
  } catch (error) {
    console.error('Error adding category:', error);
    return false;
  }
};

// Delete a category
export const deleteCategory = (id: string): boolean => {
  if (typeof window === 'undefined') return false; // Can't update on server-side

  try {
    const categories = getCategories();
    const filteredCategories = categories.filter(category => category.id !== id);
    localStorage.setItem('flipnews_categories', JSON.stringify(filteredCategories));
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    return false;
  }
};
