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
export const getNewsArticles = (): NewsArticle[] => {
  if (typeof window === 'undefined') {
    // Return the default data on server-side
    return longNewsPosts;
  }

  initializeData();
  const articles = localStorage.getItem('flipnews_articles');
  return articles ? JSON.parse(articles) : longNewsPosts;
};

// Get a single news article by ID
export const getNewsArticleById = (id: string): NewsArticle | undefined => {
  const articles = getNewsArticles();
  return articles.find(article => article.id === id);
};

// Update a news article
export const updateNewsArticle = (updatedArticle: NewsArticle): boolean => {
  if (typeof window === 'undefined') return false; // Can't update on server-side

  try {
    const articles = getNewsArticles();
    const index = articles.findIndex(article => article.id === updatedArticle.id);

    if (index === -1) return false;

    articles[index] = updatedArticle;
    localStorage.setItem('flipnews_articles', JSON.stringify(articles));
    return true;
  } catch (error) {
    console.error('Error updating article:', error);
    return false;
  }
};

// Add a new news article
export const addNewsArticle = (newArticle: NewsArticle): boolean => {
  if (typeof window === 'undefined') return false; // Can't update on server-side

  try {
    const articles = getNewsArticles();
    articles.unshift(newArticle); // Add to the beginning of the array
    localStorage.setItem('flipnews_articles', JSON.stringify(articles));
    return true;
  } catch (error) {
    console.error('Error adding article:', error);
    return false;
  }
};

// Delete a news article
export const deleteNewsArticle = (id: string): boolean => {
  if (typeof window === 'undefined') return false; // Can't update on server-side

  try {
    const articles = getNewsArticles();
    const filteredArticles = articles.filter(article => article.id !== id);
    localStorage.setItem('flipnews_articles', JSON.stringify(filteredArticles));
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
export const getAds = (): Ad[] => {
  if (typeof window === 'undefined') {
    // Return the default data on server-side
    return defaultAds;
  }

  initializeData();
  const ads = localStorage.getItem('flipnews_ads');
  return ads ? JSON.parse(ads) : defaultAds;
};

// Get a single ad by ID
export const getAdById = (id: string): Ad | undefined => {
  const ads = getAds();
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
