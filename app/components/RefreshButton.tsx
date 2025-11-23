'use client';

import { useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';

interface RefreshButtonProps {
  onRefresh?: () => void;
  className?: string;
  label?: string;
}

export default function RefreshButton({ 
  onRefresh, 
  className = '', 
  label = 'Refresh' 
}: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Clear any cached data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('acpsnews_articles_cache');
      console.log('Cache cleared via refresh button');
    }
    
    // Call the onRefresh callback if provided
    if (onRefresh) {
      onRefresh();
    }
    
    // Force reload the page
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
    
    // Reset the refreshing state after a delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`flex items-center justify-center px-3 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600 transition-colors ${className}`}
      aria-label="Refresh content"
    >
      <FiRefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
      {label}
    </button>
  );
}
