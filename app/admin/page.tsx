'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiEdit, FiTrash2, FiPlus, FiImage, FiFileText, FiDollarSign, FiMessageSquare, FiThumbsUp, FiRefreshCw } from 'react-icons/fi';
import { NewsArticle, Ad, Comment } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';
import EnvironmentStatus from '../components/EnvironmentStatus';
import ConnectionStatus from '../components/ConnectionStatus';
import {
  fetchNewsArticles,
  fetchAds,
  fetchAllComments,
  fetchDashboardStats,
  approveComment,
  deleteComment,
  subscribeToChanges
} from '../lib/supabaseService';
import { getNewsArticles, getAds } from '../lib/dataService';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'articles' | 'ads' | 'comments'>('articles');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [allComments, setAllComments] = useState<(Comment & { article_title?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalAds: 0,
    activeAds: 0,
    totalComments: 0,
    pendingComments: 0,
    totalLikes: 0
  });
  const [usingSupabase, setUsingSupabase] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check if Supabase is configured
        const supabaseConfigured = isSupabaseConfigured();
        setUsingSupabase(supabaseConfigured);

        if (supabaseConfigured) {
          // Fetch data from Supabase
          const [articlesData, adsData, commentsData, statsData] = await Promise.all([
            fetchNewsArticles(),
            fetchAds(),
            fetchAllComments(),
            fetchDashboardStats()
          ]);

          setArticles(articlesData);
          setAds(adsData);
          setAllComments(commentsData);
          setStats(statsData);
        } else {
          // Fallback to localStorage data
          try {
            const [articlesData, adsData] = await Promise.all([
              getNewsArticles(),
              getAds()
            ]);

            setArticles(articlesData);
            setAds(adsData);
          } catch (error) {
            console.error('Error fetching data from localStorage:', error);
          }

          // Get all comments from articles
          const comments: (Comment & { article_title?: string })[] = [];
          articlesData.forEach(article => {
            if (article.comments && article.comments.length > 0) {
              comments.push(...article.comments.map(comment => ({
                ...comment,
                article_title: article.title
              })));
            }
          });
          setAllComments(comments);

          // Calculate stats
          setStats({
            totalArticles: articlesData.length,
            totalAds: adsData.length,
            activeAds: adsData.filter(ad => ad.active).length,
            totalComments: comments.length,
            pendingComments: comments.filter(comment => !comment.approved).length,
            totalLikes: articlesData.reduce((sum, article) => sum + article.likes, 0)
          });
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps;

  // Set up real-time subscriptions if using Supabase
  useEffect(() => {
    if (!usingSupabase) return;

    // Subscribe to changes in news_articles table
    const articlesSubscription = subscribeToChanges('news_articles', async (payload) => {
      console.log('News article change detected:', payload);
      // Refresh articles data
      const articlesData = await fetchNewsArticles();
      setArticles(articlesData);

      // Update stats
      const statsData = await fetchDashboardStats();
      setStats(statsData);
    });

    // Subscribe to changes in ads table
    const adsSubscription = subscribeToChanges('ads', async (payload) => {
      console.log('Ad change detected:', payload);
      // Refresh ads data
      const adsData = await fetchAds();
      setAds(adsData);

      // Update stats
      const statsData = await fetchDashboardStats();
      setStats(statsData);
    });

    // Subscribe to changes in comments table
    const commentsSubscription = subscribeToChanges('comments', async (payload) => {
      console.log('Comment change detected:', payload);
      // Refresh comments data
      const commentsData = await fetchAllComments();
      setAllComments(commentsData);

      // Update stats
      const statsData = await fetchDashboardStats();
      setStats(statsData);
    });

    // Clean up subscriptions on unmount
    return () => {
      articlesSubscription.unsubscribe();
      adsSubscription.unsubscribe();
      commentsSubscription.unsubscribe();
    };
  }, [usingSupabase]);

  // Handle approving a comment
  const handleApproveComment = async (commentId: string) => {
    if (usingSupabase) {
      const success = await approveComment(commentId);
      if (!success) {
        setError('Failed to approve comment. Please try again.');
      }
      // Data will be updated via real-time subscription
    } else {
      // Update local state for demo
      setAllComments(allComments.map(comment =>
        comment.id === commentId ? { ...comment, approved: true } : comment
      ));

      // Update stats
      setStats({
        ...stats,
        pendingComments: stats.pendingComments - 1
      });
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = async (commentId: string) => {
    if (usingSupabase) {
      const success = await deleteComment(commentId);
      if (!success) {
        setError('Failed to delete comment. Please try again.');
      }
      // Data will be updated via real-time subscription
    } else {
      // Update local state for demo
      setAllComments(allComments.filter(comment => comment.id !== commentId));

      // Update stats
      const wasApproved = allComments.find(c => c.id === commentId)?.approved || false;
      setStats({
        ...stats,
        totalComments: stats.totalComments - 1,
        pendingComments: wasApproved ? stats.pendingComments : stats.pendingComments - 1
      });
    }
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      if (usingSupabase) {
        // Fetch fresh data from Supabase
        const [articlesData, adsData, commentsData, statsData] = await Promise.all([
          fetchNewsArticles(),
          fetchAds(),
          fetchAllComments(),
          fetchDashboardStats()
        ]);

        setArticles(articlesData);
        setAds(adsData);
        setAllComments(commentsData);
        setStats(statsData);
      } else {
        // Refresh from localStorage
        try {
          const [articlesData, adsData] = await Promise.all([
            getNewsArticles(),
            getAds()
          ]);

          setArticles(articlesData);
          setAds(adsData);
        } catch (error) {
          console.error('Error refreshing data from localStorage:', error);
        }

        // Get all comments from articles
        const comments: (Comment & { article_title?: string })[] = [];
        articlesData.forEach(article => {
          if (article.comments && article.comments.length > 0) {
            comments.push(...article.comments.map(comment => ({
              ...comment,
              article_title: article.title
            })));
          }
        });
        setAllComments(comments);

        // Calculate stats
        setStats({
          totalArticles: articlesData.length,
          totalAds: adsData.length,
          activeAds: adsData.filter(ad => ad.active).length,
          totalComments: comments.length,
          pendingComments: comments.filter(comment => !comment.approved).length,
          totalLikes: articlesData.reduce((sum, article) => sum + article.likes, 0)
        });
      }
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
      setError('Failed to refresh dashboard data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ACPS News Admin Dashboard</h1>
        <div className="flex items-center">
          {usingSupabase && (
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full mr-2">
              Real-time Data
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md flex items-center text-sm transition-colors"
          >
            <FiRefreshCw className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow-md animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="bg-gray-200 p-3 rounded-full h-10 w-10"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Stats Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">News Articles</p>
                <h2 className="text-2xl font-bold">{stats.totalArticles}</h2>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FiFileText className="text-yellow-500" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Ads</p>
                <h2 className="text-2xl font-bold">{stats.activeAds}/{stats.totalAds}</h2>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FiImage className="text-green-500" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Comments</p>
                <h2 className="text-2xl font-bold">{stats.totalComments}</h2>
                {stats.pendingComments > 0 && (
                  <p className="text-xs text-red-500">{stats.pendingComments} pending</p>
                )}
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FiMessageSquare className="text-purple-500" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Likes</p>
                <h2 className="text-2xl font-bold">{stats.totalLikes}</h2>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <FiThumbsUp className="text-red-500" size={20} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'articles'
              ? 'border-b-2 border-yellow-500 text-yellow-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('articles')}
          disabled={loading}
        >
          <FiFileText className="inline mr-2" />
          News Articles
          <span className="ml-1 text-xs text-gray-500">({stats.totalArticles})</span>
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'ads'
              ? 'border-b-2 border-yellow-500 text-yellow-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('ads')}
          disabled={loading}
        >
          <FiDollarSign className="inline mr-2" />
          Advertisements
          <span className="ml-1 text-xs text-gray-500">({stats.totalAds})</span>
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'comments'
              ? 'border-b-2 border-yellow-500 text-yellow-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('comments')}
          disabled={loading}
        >
          <FiMessageSquare className="inline mr-2" />
          Comments
          {stats.pendingComments > 0 && (
            <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
              {stats.pendingComments}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md p-4">
        {activeTab === 'articles' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">News Articles</h2>
              <Link href="/admin/news/add" className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded-md flex items-center text-sm">
                <FiPlus className="mr-1" /> Add New Article
              </Link>
            </div>

            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No articles found. Create your first article to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {articles.map((article) => (
                      <tr key={article.id}>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{article.title}</div>
                          <div className="text-xs text-gray-500">{article.author}</div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            {article.category}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <span className="flex items-center">
                              <FiThumbsUp className="mr-1 text-blue-500" size={14} />
                              {article.likes}
                            </span>
                            <span className="flex items-center">
                              <FiMessageSquare className="mr-1 text-purple-500" size={14} />
                              {article.comments?.length || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(article.created_at)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              article.published
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {article.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                          <Link href={`/admin/news/edit/${article.id}`} className="text-blue-600 hover:text-blue-900 mr-2 inline-block">
                            <FiEdit size={16} />
                          </Link>
                          <button
                            className="text-red-600 hover:text-red-900 inline-block"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this article?')) {
                                console.log(`Deleting article with ID: ${article.id}`);
                                // In a real app, this would delete from the database
                              }
                            }}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === 'ads' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Advertisements</h2>
              <Link href="/admin/ads/add" className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded-md flex items-center text-sm">
                <FiPlus className="mr-1" /> Add New Ad
              </Link>
            </div>

            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
                ))}
              </div>
            ) : ads.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No advertisements found. Create your first ad to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Frequency
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ads.map((ad) => (
                      <tr key={ad.id}>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {ad.description || ad.text_content || 'No description'}
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {ad.video_url && ad.video_type === 'youtube' && 'YouTube Video'}
                          {ad.video_url && ad.video_type !== 'youtube' && 'Uploaded Video'}
                          {ad.image_url && !ad.video_url && 'Image'}
                          {ad.text_content && !ad.image_url && !ad.video_url && 'Text Only'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          Every {ad.frequency} articles
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              ad.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {ad.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(ad.created_at)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                          <Link href={`/admin/ads/edit/${ad.id}`} className="text-blue-600 hover:text-blue-900 mr-2 inline-block">
                            <FiEdit size={16} />
                          </Link>
                          <button
                            className="text-red-600 hover:text-red-900 inline-block"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this ad?')) {
                                console.log(`Deleting ad with ID: ${ad.id}`);
                                // In a real app, this would delete from the database
                              }
                            }}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === 'comments' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Comments</h2>
              <div>
                <span className="text-sm text-gray-500 mr-2">
                  {stats.pendingComments} pending approval
                </span>
              </div>
            </div>

            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
                ))}
              </div>
            ) : allComments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No comments found. Comments will appear here when users engage with your content.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Comment
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Article
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allComments.map((comment) => (
                      <tr key={comment.id}>
                        <td className="px-4 py-2">
                          <div className="text-sm text-gray-900">{comment.content}</div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {comment.article_title}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {comment.author_ip}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(comment.created_at)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              comment.approved
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {comment.approved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                          {!comment.approved && (
                            <button
                              className="text-green-600 hover:text-green-900 mr-2"
                              onClick={() => handleApproveComment(comment.id)}
                              disabled={refreshing}
                            >
                              Approve
                            </button>
                          )}
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={refreshing}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Environment and Connection Status */}
      <div className="mt-6 space-y-4">
        <EnvironmentStatus />
        <ConnectionStatus showDetails={true} className="mt-4" />

        {/* Data source indicator */}
        <div className="mt-4 text-xs text-gray-500 text-right">
          Data source: {usingSupabase ? 'Supabase (real-time)' : 'Local Storage'}
          {refreshing && <span className="ml-2 animate-pulse">Refreshing...</span>}
        </div>
      </div>
    </div>
  );
}
