// Utility functions for debugging

/**
 * Logs all articles in localStorage to help with debugging
 */
export const logAllArticles = (): void => {
  if (typeof window === 'undefined') return; // Skip on server-side
  
  try {
    const articlesJson = localStorage.getItem('flipnews_articles');
    if (!articlesJson) {
      console.log('No articles found in localStorage');
      return;
    }
    
    const articles = JSON.parse(articlesJson);
    console.log(`Found ${articles.length} articles in localStorage:`);
    
    // Log a summary of each article
    articles.forEach((article: any, index: number) => {
      console.log(`${index + 1}. ID: ${article.id}, Title: ${article.title.substring(0, 30)}...`);
    });
    
    // Return the article IDs for easy reference
    return articles.map((article: any) => article.id);
  } catch (error) {
    console.error('Error logging articles:', error);
  }
};

/**
 * Checks if an article with the given ID exists in localStorage
 */
export const checkArticleExists = (id: string): boolean => {
  if (typeof window === 'undefined') return false; // Skip on server-side
  
  try {
    const articlesJson = localStorage.getItem('flipnews_articles');
    if (!articlesJson) return false;
    
    const articles = JSON.parse(articlesJson);
    const article = articles.find((a: any) => a.id === id);
    
    if (article) {
      console.log(`Article found with ID ${id}:`, article);
      return true;
    } else {
      console.log(`No article found with ID ${id}`);
      return false;
    }
  } catch (error) {
    console.error('Error checking article:', error);
    return false;
  }
};

/**
 * Gets all available article IDs from all sources
 */
export const getAllArticleIds = (): string[] => {
  if (typeof window === 'undefined') return []; // Skip on server-side
  
  const ids: string[] = [];
  
  try {
    // Check localStorage
    const articlesJson = localStorage.getItem('flipnews_articles');
    if (articlesJson) {
      const articles = JSON.parse(articlesJson);
      articles.forEach((article: any) => {
        if (article.id && !ids.includes(article.id)) {
          ids.push(article.id);
        }
      });
    }
    
    // Check cache
    const cacheJson = localStorage.getItem('flipnews_articles_cache');
    if (cacheJson) {
      const articles = JSON.parse(cacheJson);
      articles.forEach((article: any) => {
        if (article.id && !ids.includes(article.id)) {
          ids.push(article.id);
        }
      });
    }
    
    return ids;
  } catch (error) {
    console.error('Error getting article IDs:', error);
    return [];
  }
};
