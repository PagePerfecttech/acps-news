'use client';

import { useEffect, useState } from 'react';
import { FiRefreshCw, FiHome, FiAlertTriangle } from 'react-icons/fi';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = useState<string>('');

  useEffect(() => {
    // Add global error handler
    const errorHandler = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      setHasError(true);
      setError(event.error);
      setErrorInfo(event.message);
      // Prevent the default error handling
      event.preventDefault();
    };

    // Add unhandled promise rejection handler
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setHasError(true);
      setError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
      setErrorInfo(String(event.reason));
      // Prevent the default error handling
      event.preventDefault();
    };

    // Register the error handlers
    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    // Clean up the error handlers
    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps;

  const handleReset = () => {
    setHasError(false);
    setError(null);
    setErrorInfo('');
    // Clear any cached data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('flipnews_articles_cache');
      console.log('Cache cleared due to error recovery');
    }
    // Reload the page
    window.location.reload();
  };

  if (hasError) {
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
              {error?.name}: {errorInfo || error?.message || 'Unknown error'}
            </p>
          </div>
          
          <p className="text-gray-600 mb-6 text-center">
            We apologize for the inconvenience. Please try refreshing the page or return to the home page.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleReset}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center"
            >
              <FiRefreshCw className="mr-2" /> Refresh Page
            </button>
            
            <a
              href="/"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center justify-center"
            >
              <FiHome className="mr-2" /> Go to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
