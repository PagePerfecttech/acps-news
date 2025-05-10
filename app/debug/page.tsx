'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiRefreshCw, FiExternalLink, FiSearch, FiInfo } from 'react-icons/fi';
import { getAllArticleIds, checkArticleExists } from '../lib/debugUtils';
import { getNewsArticles } from '../lib/dataService';
import { isSupabaseConfigured } from '../lib/supabase';

export default function DebugPage() {
  const [articleIds, setArticleIds] = useState<string[]>([]);
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<{ found: boolean; message: string } | null>(null);
  const [usingSupabase, setUsingSupabase] = useState(false);
  const [loading, setLoading] = useState(true);
  const [storageInfo, setStorageInfo] = useState<{ key: string; size: string; items: number }[]>([]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      // Check if using Supabase
      const supabaseConfigured = await isSupabaseConfigured();
      setUsingSupabase(supabaseConfigured);

      // Get all article IDs
      const ids = getAllArticleIds();
      setArticleIds(ids);

      // Get localStorage info
      const info: { key: string; size: string; items: number }[] = [];

      if (typeof window !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const value = localStorage.getItem(key);
            const size = value ? (value.length / 1024).toFixed(2) + ' KB' : '0 KB';
            let items = 0;

            try {
              const parsed = JSON.parse(value || '[]');
              items = Array.isArray(parsed) ? parsed.length : 1;
            } catch (e) {
              // Not JSON, just count as 1 item
              items = 1;
            }

            info.push({ key, size, items });
          }
        }
      }

      setStorageInfo(info);
      setLoading(false);
    };

    init();
  }, []);

  const handleRefresh = async () => {
    // Force reload all data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('flipnews_articles_cache');
      console.log('Cache cleared via debug page');
    }

    // Get articles to force reload
    try {
      await getNewsArticles();
    } catch (error) {
      console.error('Error refreshing articles:', error);
    }

    // Reload the page
    window.location.reload();
  };

  const handleSearch = () => {
    if (!searchId.trim()) return;

    const exists = checkArticleExists(searchId.trim());

    if (exists) {
      setSearchResult({
        found: true,
        message: `Article with ID ${searchId} was found in localStorage.`
      });
    } else {
      setSearchResult({
        found: false,
        message: `Article with ID ${searchId} was NOT found in localStorage.`
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">FlipNEWS Debug Page</h1>
          <button
            onClick={handleRefresh}
            className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FiRefreshCw className="mr-2" /> Refresh Data
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Data Source</h3>
              <div className="flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${usingSupabase ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                <span>{usingSupabase ? 'Supabase (Real-time Database)' : 'Local Storage (Offline Mode)'}</span>
              </div>
            </div>

            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Available Articles</h3>
              <div className="flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${articleIds.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>{articleIds.length} articles found</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Article Search</h2>
          <div className="flex items-center">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter article ID"
              className="border rounded-l-md px-4 py-2 w-full"
            />
            <button
              onClick={handleSearch}
              className="bg-yellow-500 text-black px-4 py-2 rounded-r-md"
            >
              <FiSearch />
            </button>
          </div>

          {searchResult && (
            <div className={`mt-2 p-3 rounded-md ${searchResult.found ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {searchResult.message}
              {searchResult.found && (
                <Link href={`/news/${searchId}`} className="block mt-2 text-blue-600 hover:underline flex items-center">
                  <FiExternalLink className="mr-1" /> View Article
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Available Article IDs</h2>
          {loading ? (
            <div className="animate-pulse h-20 bg-gray-200 rounded"></div>
          ) : articleIds.length > 0 ? (
            <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {articleIds.map((id) => (
                  <li key={id} className="flex items-center">
                    <Link href={`/news/${id}`} className="text-blue-600 hover:underline flex items-center">
                      <span className="font-mono text-sm">{id}</span>
                      <FiExternalLink className="ml-1" size={14} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="border rounded-md p-4 text-red-600">
              No articles found in storage.
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Local Storage Information</h2>
          {loading ? (
            <div className="animate-pulse h-40 bg-gray-200 rounded"></div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {storageInfo.map((item) => (
                    <tr key={item.key}>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{item.key}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.size}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.items}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 flex items-start">
        <FiInfo className="mr-2 mt-1 flex-shrink-0" />
        <div>
          <p className="font-medium">Debug Information</p>
          <p className="text-sm mt-1">
            This page helps diagnose issues with articles not being found. If you're experiencing problems with specific articles,
            try searching for them using the article ID. You can also refresh the data to clear any caches.
          </p>
          <p className="text-sm mt-2">
            <Link href="/" className="text-blue-600 hover:underline">
              Return to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
