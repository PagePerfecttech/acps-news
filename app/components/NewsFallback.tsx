'use client';

import { FiRefreshCw, FiAlertCircle } from 'react-icons/fi';

interface NewsFallbackProps {
  error?: Error;
  onRetry: () => void;
}

export default function NewsFallback({ error, onRetry }: NewsFallbackProps) {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
        <div className="text-yellow-500 mb-4">
          <FiAlertCircle className="h-16 w-16 mx-auto" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4">Unable to Load News</h1>
        
        <p className="text-gray-600 mb-6">
          We're having trouble loading the latest news. This could be due to a network issue or a temporary server problem.
        </p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-6 text-left">
            <p className="text-red-800 text-sm font-medium">Error details:</p>
            <p className="text-red-700 text-xs mt-1 font-mono break-all">
              {error.message || 'Unknown error occurred'}
            </p>
          </div>
        )}
        
        <button
          onClick={onRetry}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-md flex items-center mx-auto"
        >
          <FiRefreshCw className="mr-2" /> Try Again
        </button>
        
        <p className="text-gray-500 text-sm mt-4">
          If the problem persists, please try again later or check your internet connection.
        </p>
      </div>
    </div>
  );
}
