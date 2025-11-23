import { NewsArticle, Ad, Category } from '../types';
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
    frequency: 3,
    active: true,
    created_at: '2023-05-01T00:00:00Z',
    updated_at: '2023-05-01T00:00:00Z',
  },
];

// Initialize data in localStorage if it doesn't exist
const initializeData = () => {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem('acpsnews_articles')) {
    localStorage.setItem('acpsnews_articles', JSON.stringify(longNewsPosts));
  }

  if (!localStorage.getItem('acpsnews_ads')) {
    localStorage.setItem('acpsnews_ads', JSON.stringify(defaultAds));
  }

  if (!localStorage.getItem('acpsnews_categories')) {
    localStorage.setItem('acpsnews_categories', JSON.stringify(defaultCategories));
  }
};

// Get all news articles from Neon-backed API
export const getNewsArticles = async (): Promise<NewsArticle[]> => {
  try {
    console.log('Fetching articles from Neon API...');
    const response = await fetch('/api/news?limit=100');

    if (!response.ok) {
      throw new Error('Failed to fetch articles from API');
    }

    const result = await response.json();

    if (result.data && result.data.length > 0) {
      console.log(`Retrieved ${result.data.length} articles from Neon`);

      // Format the data
      const formattedData = result.data.map((article: any) => ({
        id: article.id,
        title: article.title,
        content: article.content || '',
        summary: article.summary || '',
        category: article.categories?.name || 'Uncategorized',
        category_id: article.category_id,
        author: article.author || 'Anonymous',
        image_url: article.image_url || '',
        video_url: article.video_url || '',
        video_type: article.video_type || '',
        tags: Array.isArray(article.tags) ? article.tags : [],
        likes: article.likes || 0,
        views: article.views || 0,
        published: article.published !== false,
        comments: article.comments || [],
        created_at: article.created_at || new Date().toISOString(),
        updated_at: article.updated_at || new Date().toISOString()
      }));

      // Update localStorage cache
      if (typeof window !== 'undefined') {
        localStorage.setItem('acpsnews_articles', JSON.stringify(formattedData));
        localStorage.setItem('acpsnews_articles_cache', JSON.stringify(formattedData));
        localStorage.setItem('acpsnews_articles_cache_timestamp', Date.now().toString());
        localStorage.setItem('acpsnews_articles_updated', Date.now().toString());
      }

      return formattedData;
    }
  } catch (error) {
    console.error('Error fetching from Neon API:', error);
  }

  // Fall back to localStorage
  if (typeof window === 'undefined') {
    return longNewsPosts;
  }

  initializeData();
  const articles = localStorage.getItem('acpsnews_articles');
  return articles ? JSON.parse(articles) : longNewsPosts;
};

// Get a single news article by ID
export const getNewsArticleById = async (id: string): Promise<NewsArticle | undefined> => {
  try {
    const articles = await getNewsArticles();
    return articles.find(article => article.id === id);
  } catch (error) {
    console.error('Error fetching article:', error);
    return undefined;
  }
};

// Update a news article
export const updateNewsArticle = async (updatedArticle: NewsArticle): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  try {
    console.log('Updating article via API:', updatedArticle.title);

    const response = await fetch(`/api/news?id=${updatedArticle.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: updatedArticle.title,
        content: updatedArticle.content,
        summary: updatedArticle.summary || '',
        category_id: updatedArticle.category,
        image_url: updatedArticle.image_url || '',
        video_url: updatedArticle.video_url || '',
        video_type: updatedArticle.video_type || '',
        author: updatedArticle.author || 'Anonymous',
        published: updatedArticle.published !== false,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update article via API');
    }

    const result = await response.json();

    if (result.success) {
      console.log('Article updated successfully');

      // Clear cache
      localStorage.removeItem('acpsnews_articles_cache');
      localStorage.setItem('acpsnews_articles_updated', Date.now().toString());

      return true;
    }

    return false;
  } catch (error) {
    console.error('Error updating article:', error);
    return false;
  }
};

// Add a new news article
export const addNewsArticle = async (newArticle: NewsArticle): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  try {
    console.log('Adding article via API:', newArticle.title);

    const response = await fetch('/api/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: newArticle.title,
        content: newArticle.content,
        summary: newArticle.summary || '',
        category_id: newArticle.category,
        image_url: newArticle.image_url || '',
        video_url: newArticle.video_url || '',
        video_type: newArticle.video_type || '',
        author: newArticle.author || 'Anonymous',
        published: newArticle.published !== false,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add article via API');
    }

    const result = await response.json();

    if (result.success) {
      console.log('Article added successfully:', result.data.id);

      // Update localStorage
      const articles = await getNewsArticles();
      localStorage.removeItem('acpsnews_articles_cache');
      localStorage.setItem('acpsnews_articles_updated', Date.now().toString());

      return true;
    }

    return false;
  } catch (error) {
    console.error('Error adding article:', error);
    return false;
  }
};

// Delete a news article
export const deleteNewsArticle = async (id: string): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  try {
    console.log('Deleting article via API:', id);

    const response = await fetch(`/api/news?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete article via API');
    }

    const result = await response.json();

    if (result.success) {
      console.log('Article deleted successfully from database');

      // Clear cache
      localStorage.removeItem('acpsnews_articles_cache');
      localStorage.setItem('acpsnews_articles_updated', Date.now().toString());

      return true;
    }

    return false;
  } catch (error) {
    console.error('Error deleting article:', error);
    return false;
  }
};

// Reset to default data
export const resetToDefaultData = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('acpsnews_articles', JSON.stringify(longNewsPosts));
  localStorage.setItem('acpsnews_ads', JSON.stringify(defaultAds));
  localStorage.setItem('acpsnews_categories', JSON.stringify(defaultCategories));
};

// Ad Management Functions

// Get all ads from Neon-backed API
export const getAds = async (): Promise<Ad[]> => {
  try {
    console.log('Fetching ads from Neon API...');
    const response = await fetch('/api/admin/ads');

    if (!response.ok) {
      throw new Error('Failed to fetch ads from API');
    }

    const result = await response.json();

    if (result.success && result.data && result.data.length > 0) {
      console.log(`Retrieved ${result.data.length} ads from Neon`);

      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('acpsnews_ads', JSON.stringify(result.data));
      }

      return result.data;
    }
  } catch (error) {
    console.error('Error fetching ads from API:', error);
  }

  // Fall back to localStorage
  if (typeof window === 'undefined') {
    return defaultAds;
  }

  initializeData();
  const ads = localStorage.getItem('acpsnews_ads');
  return ads ? JSON.parse(ads) : defaultAds;
};

// Get a single ad by ID
export const getAdById = async (id: string): Promise<Ad | undefined> => {
  const ads = await getAds();
  return ads.find(ad => ad.id === id);
};

// Update an ad
export const updateAd = async (updatedAd: Ad): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  try {
    console.log('Updating ad via API:', updatedAd.title);

    const response = await fetch(`/api/admin/ads?id=${updatedAd.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedAd),
    });

    if (!response.ok) {
      throw new Error('Failed to update ad via API');
    }

    const result = await response.json();

    if (result.success) {
      console.log('Ad updated successfully');

      // Update localStorage
      const ads = await getAds();
      const index = ads.findIndex(ad => ad.id === updatedAd.id);
      if (index !== -1) {
        ads[index] = updatedAd;
        localStorage.setItem('acpsnews_ads', JSON.stringify(ads));
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error('Error updating ad:', error);
    return false;
  }
};

// Add a new ad
export const addAd = async (newAd: Ad): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  try {
    console.log('Adding ad via API:', newAd.title);

    const response = await fetch('/api/admin/ads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newAd),
    });

    if (!response.ok) {
      throw new Error('Failed to add ad via API');
    }

    const result = await response.json();

    if (result.success) {
      console.log('Ad added successfully:', result.data.id);

      // Update localStorage
      const ads = await getAds();
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error adding ad:', error);
    return false;
  }
};

// Delete an ad
export const deleteAd = async (id: string): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  try {
    console.log('Deleting ad via API:', id);

    const response = await fetch(`/api/admin/ads?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete ad via API');
    }

    const result = await response.json();

    if (result.success) {
      console.log('Ad deleted successfully');

      // Update localStorage
      const ads = await getAds();
      const filteredAds = ads.filter(ad => ad.id !== id);
      localStorage.setItem('acpsnews_ads', JSON.stringify(filteredAds));

      return true;
    }

    return false;
  } catch (error) {
    console.error('Error deleting ad:', error);
    return false;
  }
};

// Category Management Functions

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
  try {
    console.log('Fetching categories from Neon API...');
    const response = await fetch('/api/admin/categories');

    if (!response.ok) {
      throw new Error('Failed to fetch categories from API');
    }

    const result = await response.json();

    if (result.success && result.data) {
      console.log(`Retrieved ${result.data.length} categories from Neon`);

      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('acpsnews_categories', JSON.stringify(result.data));
      }

      return result.data;
    }
  } catch (error) {
    console.error('Error fetching categories from API:', error);
  }

  // Fall back to localStorage
  if (typeof window === 'undefined') {
    return defaultCategories;
  }

  initializeData();
  const categories = localStorage.getItem('acpsnews_categories');
  return categories ? JSON.parse(categories) : defaultCategories;
};
