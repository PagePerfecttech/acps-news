'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FiRefreshCw, FiHome, FiAlertTriangle } from 'react-icons/fi';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console
    console.error('Application error:', error);
  }, [error]);

  const handleReset = () => {
    // Clear any cached data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('flipnews_articles_cache');
      localStorage.removeItem('flipnews_settings');
      console.log('Cache cleared due to error recovery');
    }
    // Reset the error boundary
    reset();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-center text-red-500 mb-4">
          <FiAlertTriangle size={48} />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-4">Something went wrong</h1>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800 font-medium">Error details:</p>
          <p className="text-red-700 mt-1 text-sm font-mono break-all">
            {error?.message || 'An unexpected error occurred'}
          </p>
          {error?.digest && (
            <p className="text-red-700 mt-1 text-xs font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        
        <p className="text-gray-600 mb-6 text-center">
          We apologize for the inconvenience. Please try refreshing the page or return to the home page.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleReset}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center"
          >
            <FiRefreshCw className="mr-2" /> Try Again
          </button>
          
          <Link
            href="/"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center justify-center"
          >
            <FiHome className="mr-2" /> Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
