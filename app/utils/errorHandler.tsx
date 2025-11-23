/**
 * Global error handler to catch and handle script errors
 * This helps prevent the "Something went wrong" error message
 */

// Error message component to show when an error occurs
export const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="text-gray-700 mb-4">
          Error details: {error.message || 'Script error.'}
        </p>
        <p className="text-gray-600 mb-6">
          We apologize for the inconvenience. Please try refreshing the page or return to the home page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Refresh Page
          </button>
          <button
            onClick={() => {
              window.location.href = '/';
              resetErrorBoundary();
            }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

// Initialize global error handler
export const initGlobalErrorHandler = () => {
  if (typeof window !== 'undefined') {
    // Handle uncaught errors
    window.onerror = (message, source, lineno, colno, error) => {
      console.error('Global error caught:', { message, source, lineno, colno, error });
      
      // Don't show error UI for network errors or CORS issues
      if (
        message.toString().includes('Script error') || 
        message.toString().includes('ResizeObserver') ||
        message.toString().includes('network error')
      ) {
        console.warn('Suppressing error UI for:', message);
        return true; // Prevents the default error handling
      }
      
      return false; // Let other handlers run
    };
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Don't show error UI for network errors or CORS issues
      if (
        event.reason?.message?.includes('network error') ||
        event.reason?.message?.includes('Failed to fetch') ||
        event.reason?.message?.includes('ResizeObserver')
      ) {
        console.warn('Suppressing error UI for promise rejection:', event.reason);
        event.preventDefault();
      }
    });
  }
};
