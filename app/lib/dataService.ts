import { NewsArticle, Ad, Comment } from '../types';
import { longNewsPosts } from '../data/longNewsPosts';

// Initialize data in localStorage if it doesn't exist
const initializeData = () => {
  if (typeof window === 'undefined') return; // Skip on server-side

  // Check if news data exists in localStorage
  if (!localStorage.getItem('flipnews_articles')) {
    // Initialize with the default data
    localStorage.setItem('flipnews_articles', JSON.stringify(longNewsPosts));
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
};
