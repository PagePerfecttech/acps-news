'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MinimalPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    // Simple function to fetch data
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Clear any cached data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('flipnews_articles_cache');
        }
        
        // Simulate data fetching
        setTimeout(() => {
          // Create some dummy articles
          const dummyArticles = [
            {
              id: '1',
              title: 'Test Article 1',
              summary: 'This is a test article',
              content: 'This is the content of test article 1',
              created_at: new Date().toISOString()
            },
            {
              id: '2',
              title: 'Test Article 2',
              summary: 'This is another test article',
              content: 'This is the content of test article 2',
              created_at: new Date().toISOString()
            }
          ];
          
          setArticles(dummyArticles);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Render minimal content
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">FlipNEWS Minimal Page</h1>
        
        <p className="mb-4 text-gray-700">
          This is a minimal version of the home page to help diagnose the client-side exception.
        </p>
        
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-xl font-semibold mb-2">Test Articles</h2>
          {articles && articles.length > 0 ? (
            <ul className="space-y-2">
              {articles.map(article => (
                <li key={article.id} className="border-b pb-2">
                  <h3 className="font-medium">{article.title}</h3>
                  <p className="text-sm text-gray-600">{article.summary}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No articles found.</p>
          )}
        </div>
        
        <div className="flex space-x-4">
          <Link 
            href="/"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Main Page
          </Link>
          
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
}
