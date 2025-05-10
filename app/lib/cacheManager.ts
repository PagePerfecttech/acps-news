// Cache management utilities

// Clear all application cache
export const clearAllCache = (): void => {
  if (typeof window === 'undefined') return; // Skip on server-side
  
  // Clear localStorage items
  localStorage.removeItem('flipnews_articles_cache');
  
  // Set a timestamp for the last cache clear
  localStorage.setItem('flipnews_cache_cleared', Date.now().toString());
  
  console.log('Application cache cleared');
};

// Clear specific cache
export const clearCache = (cacheKey: string): void => {
  if (typeof window === 'undefined') return; // Skip on server-side
  
  // Clear the specific cache item
  localStorage.removeItem(cacheKey);
  
  // Set a timestamp for this specific cache clear
  localStorage.setItem(`${cacheKey}_cleared`, Date.now().toString());
  
  console.log(`Cache cleared for: ${cacheKey}`);
};

// Get cache timestamp
export const getCacheTimestamp = (): number => {
  if (typeof window === 'undefined') return 0; // Skip on server-side
  
  const timestamp = localStorage.getItem('flipnews_cache_cleared');
  return timestamp ? parseInt(timestamp, 10) : 0;
};

// Check if cache is stale (older than the provided timestamp)
export const isCacheStale = (cacheKey: string, timestamp: number): boolean => {
  if (typeof window === 'undefined') return true; // Skip on server-side
  
  const cacheTimestamp = localStorage.getItem(`${cacheKey}_cleared`);
  if (!cacheTimestamp) return true;
  
  return parseInt(cacheTimestamp, 10) < timestamp;
};
