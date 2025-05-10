'use client';

import { useEffect } from 'react';
import { FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console
    console.error('Global application error:', error);
  }, [error]);

  const handleReset = () => {
    // Clear any cached data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('flipnews_articles_cache');
      localStorage.removeItem('flipnews_settings');
      console.log('Cache cleared due to global error recovery');
    }
    // Reset the error boundary
    reset();
  };

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-center text-red-500 mb-4">
              <FiAlertTriangle size={48} />
            </div>
            
            <h1 className="text-2xl font-bold text-center mb-4">Critical Error</h1>
            
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-800 font-medium">Error details:</p>
              <p className="text-red-700 mt-1 text-sm font-mono break-all">
                {error?.message || 'A critical error occurred while loading the application'}
              </p>
              {error?.digest && (
                <p className="text-red-700 mt-1 text-xs font-mono">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
            
            <p className="text-gray-600 mb-6 text-center">
              We apologize for the inconvenience. The application encountered a critical error.
              Please try refreshing the page.
            </p>
            
            <div className="flex justify-center">
              <button
                onClick={handleReset}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center"
              >
                <FiRefreshCw className="mr-2" /> Refresh Application
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
