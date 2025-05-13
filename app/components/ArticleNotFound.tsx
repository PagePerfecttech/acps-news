'use client';

import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiHome, FiRefreshCw } from 'react-icons/fi';

interface ArticleNotFoundProps {
  articleId: string;
  onRetry?: () => void;
}

export default function ArticleNotFound({ articleId, onRetry }: ArticleNotFoundProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="text-yellow-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Article Not Found</h1>
        
        <p className="text-gray-600 mb-6">
          The article with ID <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">{articleId}</span> doesn&apos;t exist or has been removed.
        </p>
        
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            <FiArrowLeft className="mr-2" /> Go Back
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center w-full py-2 px-4 bg-yellow-500 text-black rounded-md hover:bg-yellow-600 transition-colors"
          >
            <FiHome className="mr-2" /> Go to Home
          </button>
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center justify-center w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <FiRefreshCw className="mr-2" /> Retry Loading
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
