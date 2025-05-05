'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiX } from 'react-icons/fi';
import { NewsArticle } from '../types';

interface NewsCardProps {
  article: NewsArticle;
  index?: number;
  totalArticles?: number;
  onPopupStateChange?: (isOpen: boolean) => void;
}

export default function NewsCard({ article, onPopupStateChange }: NewsCardProps) {
  const [showFullContent, setShowFullContent] = useState(false);

  // Notify parent component when popup state changes
  const toggleFullContent = (isOpen: boolean) => {
    setShowFullContent(isOpen);
    if (onPopupStateChange) {
      onPopupStateChange(isOpen);
    }
  };

  // Always show Read More button after 7 lines
  const showReadMore = true;

  // Function to render YouTube or uploaded video
  const renderMedia = () => {
    if (article.video_url && article.video_type === 'youtube') {
      // Extract YouTube video ID
      const videoId = article.video_url.split('v=')[1]?.split('&')[0];

      return (
        <div className="relative w-full h-full">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={article.title}
            className="w-full h-full border-0"
            allowFullScreen
          />
        </div>
      );
    } else if (article.video_url) {
      // Uploaded video
      return (
        <div className="relative w-full h-full">
          <video
            src={article.video_url}
            controls
            className="w-full h-full object-cover"
          />
        </div>
      );
    } else if (article.image_url) {
      // Image
      return (
        <div className="relative w-full h-full">
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>
      );
    } else {
      // Fallback
      return (
        <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
          <span className="text-white text-xl font-bold">FlipNews</span>
        </div>
      );
    }
  };

  return (
    <div className="w-full h-[100vh] perspective-1000">
      {/* Full screen card optimized for mobile */}
      <div className="w-full h-full overflow-hidden bg-white flex flex-col relative">
        {/* Media (image or video) */}
        <div className="h-[45vh]">
          {renderMedia()}
        </div>

        {/* Content - white background with black text */}
        <div className="flex-grow flex flex-col p-0 bg-white text-black">
          {/* Category tag */}
          <div className="px-3 py-1 bg-yellow-500">
            <span className="text-xs font-medium text-black">
              {article.category}
            </span>
          </div>

          {/* Title and content area */}
          <div className="px-3 py-2">
            {/* Title - limited to 2 lines */}
            <h3 className="text-base font-bold line-clamp-2 mb-1">
              {article.title}
            </h3>

            {/* Description (limited to exactly 7 lines) */}
            <p className="text-sm text-gray-700 leading-snug line-clamp-7">
              {article.content}
            </p>
          </div>

          {/* Read More button - transparent */}
          {showReadMore && (
            <div className="px-3 pb-2 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullContent(true);
                }}
                className="bg-transparent text-gray-600 text-xs px-3 py-1 border border-gray-300 rounded-sm hover:bg-gray-100 transition-colors"
              >
                Read More
              </button>
            </div>
          )}

          {/* Stats at the bottom - horizontal */}
          <div className="px-3 py-2 flex justify-between items-center border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-gray-600">{article.likes}</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-gray-600">{article.comments?.length || 0}</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-gray-600">12K</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {new Date(article.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Full content popup */}
      {showFullContent && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 overflow-hidden">
          <div className="bg-white text-black w-full max-w-2xl h-[90vh] rounded-lg shadow-xl flex flex-col">
            {/* Sticky header */}
            <div className="sticky top-0 bg-yellow-500 flex justify-between items-center z-10 px-4 py-3">
              <h3 className="text-base font-bold pr-4 truncate">{article.title}</h3>
              <button
                onClick={() => toggleFullContent(false)}
                className="bg-yellow-600 p-1 text-black rounded-full hover:bg-yellow-700 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* No media in popup as per user request */}

            {/* Full content - scrollable container (takes full height since no image) */}
            <div className="flex-grow overflow-y-auto overscroll-contain modal-content px-4 py-3 pb-8 h-[calc(90vh-56px)]">
              {/* Title (added since we removed the image) */}
              <h2 className="text-xl font-bold text-gray-900 mb-3">{article.title}</h2>

              {/* Author and date */}
              <div className="mb-4 text-sm text-gray-600 flex items-center">
                <span className="font-medium">{article.author}</span>
                <span className="mx-2">•</span>
                <span>{new Date(article.created_at).toLocaleDateString()}</span>
              </div>

              {/* Content */}
              <p className="text-gray-800 text-base leading-relaxed mb-6">
                {article.content}
              </p>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {article.tags.map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Comments section */}
              {article.comments && article.comments.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-base font-medium mb-3">Comments ({article.comments.length})</h4>
                  <div className="space-y-3">
                    {article.comments.map(comment => (
                      <div key={comment.id} className="bg-gray-50 p-3 rounded-md">
                        <p className="text-gray-800 text-sm">{comment.content}</p>
                        <p className="text-gray-500 text-xs mt-2">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom padding for mobile scrolling */}
              <div className="h-12"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
