'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiX, FiThumbsUp, FiMessageSquare, FiEye, FiExternalLink } from 'react-icons/fi';
import { NewsArticle, Comment } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';
import { subscribeToChanges } from '../lib/supabaseService';
import UserProfile from './UserProfile';
import { useSettings } from '../contexts/SettingsContext';
import ShareButton from './ShareButton';

interface NewsCardProps {
  article: NewsArticle;
  index?: number;
  totalArticles?: number;
  onPopupStateChange?: (isOpen: boolean) => void;
}

export default function NewsCard({ article, onPopupStateChange }: NewsCardProps) {
  const [showFullContent, setShowFullContent] = useState(false);
  // Show 200+ likes for a more realistic appearance
  const [stats, setStats] = useState({
    likes: Math.max(article.likes || 0, 200 + Math.floor(Math.random() * 50)),
    comments: article.comments?.length || 0,
    views: Math.floor(Math.random() * 1000) + 500
  });
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usingSupabase, setUsingSupabase] = useState(false);
  // Removed showShareModal state as we&apos;re using ShareButton component
  const { settings } = useSettings();

  // Check if Supabase is configured
  useEffect(() => {
    let isMounted = true;

    const checkSupabase = async () => {
      try {
        const configured = await isSupabaseConfigured();

        // Only update state if component is still mounted
        if (isMounted) {
          setUsingSupabase(configured);

          // Record view when component mounts
          if (configured) {
            recordView();
          }
        }
      } catch (error) {
        console.error('Error checking Supabase configuration:', error);
      }
    };

    checkSupabase();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [/* recordView is defined inside the component, so no need to add it as a dependency */]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!usingSupabase) return;

    // Subscribe to likes changes
    const likesSubscription = subscribeToChanges('likes', (payload) => {
      if (payload.new && payload.new.news_id === article.id) {
        // Update likes count
        setStats(prev => ({ ...prev, likes: prev.likes + 1 }));
      }
    });

    // Subscribe to comments changes
    const commentsSubscription = subscribeToChanges('comments', (payload) => {
      if (payload.new && payload.new.news_id === article.id) {
        // Update comments count
        setStats(prev => ({ ...prev, comments: prev.comments + 1 }));
      }
    });

    return () => {
      likesSubscription.unsubscribe();
      commentsSubscription.unsubscribe();
    };
  }, [usingSupabase, article.id]);

  // Notify parent component when popup state changes
  const toggleFullContent = (isOpen: boolean) => {
    setShowFullContent(isOpen);
    if (onPopupStateChange) {
      onPopupStateChange(isOpen);
    }
  };

  // Record view
  const recordView = async () => {
    try {
      await fetch('/api/news/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: article.id })
      });
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  // Handle like
  const handleLike = async () => {
    try {
      // Optimistic update
      setStats(prev => ({ ...prev, likes: prev.likes + 1 }));

      const response = await fetch('/api/news/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: article.id })
      });

      if (!response.ok) {
        // Revert optimistic update if failed
        setStats(prev => ({ ...prev, likes: prev.likes - 1 }));
      }
    } catch (error) {
      console.error('Error liking article:', error);
      // Revert optimistic update if failed
      setStats(prev => ({ ...prev, likes: prev.likes - 1 }));
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/news/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: article.id,
          content: commentText
        })
      });

      if (response.ok) {
        // Clear form and update UI
        setCommentText('');
        if (!usingSupabase) {
          // If not using Supabase real-time, update manually
          setStats(prev => ({ ...prev, comments: prev.comments + 1 }));
        }
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add comment form and stats to the existing component
  // This would go in the full content view section
  const commentForm = (
    <form onSubmit={handleCommentSubmit} className="mt-6 pt-4 border-t border-gray-200">
      <h4 className="text-base font-medium mb-3">Add a Comment</h4>
      <textarea
        className="w-full p-2 border border-gray-300 rounded-md"
        rows={3}
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="Write your comment here..."
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Comment'}
      </button>
    </form>
  );

  // Enhanced stats section with interactive buttons
  const enhancedStats = (
    <div className="px-3 py-2 flex justify-between items-center border-t border-gray-200">
      <div className="flex items-center space-x-4">
        <button onClick={handleLike} className="flex items-center hover:text-red-500">
          <FiThumbsUp className="h-4 w-4 mr-1" />
          <span className="text-xs">{stats.likes}</span>
        </button>
        <div className="flex items-center">
          <FiMessageSquare className="h-4 w-4 text-blue-500 mr-1" />
          <span className="text-xs">{stats.comments}</span>
        </div>
        <div className="flex items-center">
          <FiEye className="h-4 w-4 text-gray-500 mr-1" />
          <span className="text-xs">{stats.views}</span>
        </div>
      </div>
      <div className="text-xs text-gray-500">
        {new Date(article.created_at).toLocaleDateString()}
      </div>
    </div>
  );

  // Function to render YouTube or uploaded video
  const renderMedia = () => {
    console.log('Rendering media for article:', article);

    if (article.video_url && article.video_type === 'youtube') {
      // Extract YouTube video ID
      const videoId = article.video_url.split('v=')[1]?.split('&')[0];
      console.log('Rendering YouTube video with ID:', videoId);

      if (!videoId) {
        console.warn('Invalid YouTube URL:', article.video_url);
        // Fallback to image or default
        if (article.image_url) {
          return renderImage();
        } else {
          return renderDefaultMedia();
        }
      }

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
      console.log('Rendering uploaded video:', article.video_url);
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
      return renderImage();
    } else {
      return renderDefaultMedia();
    }
  };

  // Helper function to render image
  const renderImage = () => {
    console.log('Rendering image:', article.image_url);
    try {
      return (
        <div className="relative w-full h-full">
          <Image
            src={article.image_url || '/placeholder.jpg'}
            alt={article.title}
            fill
            className="object-cover"
            onError={() => {
              console.error('Error loading image:', article.image_url);
              return renderDefaultMedia();
            }}
          />
        </div>
      );
    } catch (error) {
      console.error('Error rendering image:', error);
      return renderDefaultMedia();
    }
  };

  // Helper function to render default media
  const renderDefaultMedia = () => {
    console.log('Rendering default media');
    return (
      <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
        <span className="text-white text-xl font-bold" data-site-name>FlipNEWS</span>
      </div>
    );
  };

  // Removed handleShare function as we&apos;re using ShareButton component

  // Check if content exceeds 700 characters to show Read More button
  const showReadMore = article.content && article.content.length > 700;

  return (
    <>
      <div className="w-full h-[100vh] perspective-1000">
        {/* Full screen card optimized for mobile */}
        <div id={`news-card-${article.id}`} className="w-full h-full overflow-hidden bg-white flex flex-col relative">
          {/* Media (image or video) */}
          <div className="h-[45vh]">
            {renderMedia()}
          </div>

        {/* Content - white background with black text */}
        <div className="flex-grow flex flex-col p-0 bg-white text-black">
          {/* Category on left, author on right */}
          <div className="px-3 py-2 bg-primary flex justify-between items-center">
            {/* Category on left */}
            <div>
              <span className="text-xs font-medium text-black px-2 py-1 bg-primary-80 rounded-sm">
                {article.category || 'General'}
              </span>
            </div>

            {/* Author on right */}
            <div className="flex items-center">
              <UserProfile authorName={article.author} size="small" showName={true} />
            </div>
          </div>

          {/* Title and content area */}
          <div className="px-3 py-2">
            {/* Title - limited to 2 lines */}
            <h3 className="text-base font-bold line-clamp-2 mb-1">
              {article.title}
            </h3>

            {/* Description with max height and fade out effect */}
            <div className="relative max-h-[8em] overflow-hidden">
              <p className="text-sm text-gray-700 leading-snug">
                {article.content}
              </p>

              {/* Gradient overlay to fade out text */}
              {showReadMore && (
                <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent"></div>
              )}

              {/* Floating Read More button - only shown if content is long enough */}
              {showReadMore && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFullContent(true);
                  }}
                  className="absolute bottom-0 left-[50%] transform -translate-x-1/2 translate-y-1/2
                             bg-primary text-black font-medium text-xs px-3 py-1 rounded-full
                             hover:bg-primary-80 transition-colors shadow-lg z-10
                             flex items-center justify-center"
                  aria-label="Read full article"
                >
                  <span>Read More</span>
                </button>
              )}
            </div>
          </div>

          {/* Stats at the bottom - horizontal */}
          <div className="px-3 py-2 border-t border-gray-200">
            {/* Stats */}
            <div className="flex justify-center items-center">
              <div className="flex items-center space-x-6">
                <button onClick={handleLike} className="flex items-center hover:text-red-500">
                  <FiThumbsUp className="h-4 w-4 mr-1" />
                  <span className="text-xs">{stats.likes}</span>
                </button>
                <div className="flex items-center">
                  <FiMessageSquare className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-xs">{stats.comments}</span>
                </div>
                <div className="flex items-center">
                  <FiEye className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-xs">{stats.views}</span>
                </div>
                <ShareButton
                  title={article.title}
                  elementId={`news-card-${article.id}`}
                  className="flex items-center hover:text-blue-500"
                  iconSize={16}
                />
                <span className="text-xs ml-1">Share</span>
                <Link
                  href={`/news/${article.id}`}
                  className="flex items-center text-green-600 hover:text-green-700"
                  title="Open article in new page"
                >
                  <FiExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full content popup */}
      {showFullContent && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 overflow-hidden">
          <div className="bg-white text-black w-full max-w-2xl h-[90vh] rounded-lg shadow-xl flex flex-col">
            {/* Sticky header */}
            <div className="sticky top-0 bg-primary flex justify-between items-center z-10 px-4 py-3">
              <h3 className="text-base font-bold pr-4 truncate">{article.title}</h3>
              <div className="flex items-center space-x-2">
                <Link
                  href={`/news/${article.id}`}
                  className="bg-primary-80 p-1 text-black rounded-full hover:bg-primary-70 transition-colors"
                  title="Open in new page"
                >
                  <FiExternalLink size={18} />
                </Link>
                <button
                  onClick={() => toggleFullContent(false)}
                  className="bg-primary-80 p-1 text-black rounded-full hover:bg-primary-70 transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>

            {/* Full content - scrollable container */}
            <div className="flex-grow overflow-y-auto overscroll-contain modal-content px-4 py-3 pb-8 h-[calc(90vh-56px)]">
              {/* Featured image (if available) */}
              {article.image_url && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Title */}
              <h2 className="text-xl font-bold text-gray-900 mb-3">{article.title}</h2>

              {/* Author and date */}
              <div className="mb-4 text-sm text-gray-600 flex items-center">
                <UserProfile authorName={article.author} size="medium" showName={true} />
                <span className="mx-2">•</span>
                <span>{new Date(article.created_at).toLocaleDateString()}</span>
              </div>

              {/* Category */}
              <div className="mb-4">
                <span className="text-xs font-medium text-black px-2 py-1 bg-primary-80 rounded-sm">
                  {article.category || 'General'}
                </span>
              </div>

              {/* Content - with better formatting */}
              <div className="text-gray-800 text-base leading-relaxed mb-6 article-content">
                {article.content.split('\n').map((paragraph, index) => (
                  paragraph.trim() ?
                    <p key={index} className="mb-4">{paragraph}</p> :
                    <br key={index} />
                ))}
              </div>

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

              {/* Social sharing */}
              <div className="my-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <h4 className="text-base font-medium">Share this article</h4>
                  <div className="flex space-x-3">
                    <ShareButton
                      title={article.title}
                      elementId={`news-card-${article.id}`}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                      iconSize={20}
                    />
                  </div>
                </div>
              </div>

              {/* Comments section */}
              {article.comments && Array.isArray(article.comments) && article.comments.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-base font-medium mb-3">Comments ({article.comments.length})</h4>
                  <div className="space-y-3">
                    {article.comments.map(comment => (
                      <div key={comment.id || `comment-${Math.random()}`} className="bg-gray-50 p-3 rounded-md">
                        <p className="text-gray-800 text-sm">{comment.content}</p>
                        <p className="text-gray-500 text-xs mt-2">
                          {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add comment form */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-base font-medium mb-3">Add a Comment</h4>
                <form onSubmit={handleCommentSubmit}>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write your comment here..."
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 px-4 py-2 bg-primary text-black rounded-md hover:bg-primary-80 disabled:bg-primary-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Comment'}
                  </button>
                </form>
              </div>

              {/* Bottom padding for mobile scrolling */}
              <div className="h-12"></div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* ShareModal is now handled by the ShareButton component */}
    </>
  );
}
