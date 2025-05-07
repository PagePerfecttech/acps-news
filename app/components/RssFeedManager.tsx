'use client';

import { useState, useEffect } from 'react';
import { FiRefreshCw, FiPlus, FiEdit, FiTrash2, FiRss, FiCheck, FiX } from 'react-icons/fi';
import { RssFeed } from '../types';
import { fetchRssFeeds, fetchRssFeedItems, addRssFeed, updateRssFeed, deleteRssFeed } from '../lib/databaseService';
import { processRssFeed } from '../lib/rssProcessor';
import { showErrorNotification, showSuccessNotification } from './Notification';

export default function RssFeedManager() {
  const [feeds, setFeeds] = useState<RssFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFeed, setEditingFeed] = useState<RssFeed | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    category: '',
    auto_fetch: true,
    fetch_interval: 60,
  });

  // Load feeds on component mount
  useEffect(() => {
    loadFeeds();
  }, []);

  // Load RSS feeds
  const loadFeeds = async () => {
    setLoading(true);
    try {
      const result = await fetchRssFeeds();
      if (result.success && result.data) {
        setFeeds(result.data);
      } else {
        console.error('Error loading RSS feeds:', result.error);
        showErrorNotification('Failed to load RSS feeds', 'Error');
      }
    } catch (error) {
      console.error('Error loading RSS feeds:', error);
      showErrorNotification('Failed to load RSS feeds', 'Error');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingFeed) {
        // Update existing feed
        const result = await updateRssFeed(editingFeed.id, {
          ...formData,
          fetch_interval: Number(formData.fetch_interval),
        });

        if (result.success) {
          showSuccessNotification('RSS feed updated successfully', 'Success');
          setEditingFeed(null);
        } else {
          showErrorNotification('Failed to update RSS feed', 'Error');
          console.error('Update error:', result.error);
        }
      } else {
        // Add new feed
        const result = await addRssFeed({
          ...formData,
          fetch_interval: Number(formData.fetch_interval),
        });

        if (result.success) {
          showSuccessNotification('RSS feed added successfully', 'Success');
          setShowAddForm(false);
        } else {
          showErrorNotification('Failed to add RSS feed', 'Error');
          console.error('Add error:', result.error);
        }
      }

      // Reset form and reload feeds
      resetForm();
      loadFeeds();
    } catch (error) {
      console.error('Error saving RSS feed:', error);
      showErrorNotification('An error occurred while saving the RSS feed', 'Error');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      category: '',
      auto_fetch: true,
      fetch_interval: 60,
    });
  };

  // Start editing a feed
  const handleEdit = (feed: RssFeed) => {
    setEditingFeed(feed);
    setFormData({
      name: feed.name,
      url: feed.url,
      category: feed.category,
      auto_fetch: feed.auto_fetch,
      fetch_interval: feed.fetch_interval,
    });
    setShowAddForm(true);
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingFeed(null);
    setShowAddForm(false);
    resetForm();
  };

  // Delete a feed
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this RSS feed?')) {
      return;
    }

    try {
      const result = await deleteRssFeed(id);

      if (result.success) {
        showSuccessNotification('RSS feed deleted successfully', 'Success');
        loadFeeds();
      } else {
        showErrorNotification('Failed to delete RSS feed', 'Error');
        console.error('Delete error:', result.error);
      }
    } catch (error) {
      console.error('Error deleting RSS feed:', error);
      showErrorNotification('An error occurred while deleting the RSS feed', 'Error');
    }
  };

  // Process a feed
  const handleProcess = async (feed: RssFeed) => {
    setProcessing(feed.id);

    try {
      // Get existing items to avoid duplicates
      const itemsResult = await fetchRssFeedItems(feed.id);
      const existingGuids = itemsResult.success && itemsResult.data
        ? itemsResult.data.map(item => item.rss_item_guid)
        : [];

      // Process the feed
      const result = await processRssFeed(feed, existingGuids);

      if (result.success) {
        if (result.newArticles > 0) {
          showSuccessNotification(
            `Added ${result.newArticles} new articles from ${feed.name}`,
            'RSS Feed Processed'
          );
        } else {
          showSuccessNotification(
            `No new articles found in ${feed.name}`,
            'RSS Feed Processed'
          );
        }
      } else {
        showErrorNotification(
          `Failed to process RSS feed: ${result.message}`,
          'Error'
        );
      }
    } catch (error) {
      console.error('Error processing RSS feed:', error);
      showErrorNotification(
        'An error occurred while processing the RSS feed',
        'Error'
      );
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">RSS Feeds</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-primary hover:bg-opacity-80 text-black px-3 py-1 rounded-md flex items-center text-sm"
        >
          {showAddForm ? (
            <>
              <FiX className="mr-1" /> Cancel
            </>
          ) : (
            <>
              <FiPlus className="mr-1" /> Add New Feed
            </>
          )}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-md">
          <h3 className="text-md font-semibold mb-3">
            {editingFeed ? 'Edit RSS Feed' : 'Add New RSS Feed'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feed Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feed URL
              </label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fetch Interval (minutes)
              </label>
              <input
                type="number"
                name="fetch_interval"
                value={formData.fetch_interval}
                onChange={handleInputChange}
                min="5"
                max="1440"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="auto_fetch"
                  checked={formData.auto_fetch}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Automatically fetch new articles
                </span>
              </label>
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-black rounded-md hover:bg-opacity-80"
            >
              {editingFeed ? 'Update Feed' : 'Add Feed'}
            </button>
          </div>
        </form>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
          ))}
        </div>
      ) : feeds.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FiRss className="mx-auto mb-2" size={24} />
          <p>No RSS feeds found. Add your first feed to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auto Fetch
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interval
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feeds.map((feed) => (
                <tr key={feed.id}>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{feed.name}</div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-500 truncate max-w-xs">{feed.url}</div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary bg-opacity-10">
                      {feed.category}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {feed.auto_fetch ? (
                      <FiCheck className="text-green-500" />
                    ) : (
                      <FiX className="text-red-500" />
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {feed.fetch_interval} min
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleProcess(feed)}
                      disabled={processing === feed.id}
                      className="text-green-600 hover:text-green-900 mr-2 inline-block"
                      title="Process Feed"
                    >
                      <FiRefreshCw className={processing === feed.id ? 'animate-spin' : ''} size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(feed)}
                      className="text-blue-600 hover:text-blue-900 mr-2 inline-block"
                      title="Edit Feed"
                    >
                      <FiEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(feed.id)}
                      className="text-red-600 hover:text-red-900 inline-block"
                      title="Delete Feed"
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
    </div>
  );
}
