'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiX } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Category, User } from '../../../types';
import { getCategories } from '../../../lib/dataService';
import { getUsers } from '../../../lib/userService';
import AdminLayout from '../../../components/AdminLayout';

export default function AddRssFeedPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    category_id: '',
    user_id: '',
    active: true,
    fetch_frequency: 60
  });

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps;

  const fetchData = async () => {
    try {
      // Fetch categories and users with error handling
      let fetchedCategories = [];
      let fetchedUsers = [];

      try {
        fetchedCategories = await getCategories() || [];
      } catch (catError) {
        console.error('Error fetching categories:', catError);
        fetchedCategories = [];
      }

      try {
        fetchedUsers = await getUsers() || [];
      } catch (userError) {
        console.error('Error fetching users:', userError);
        fetchedUsers = [];
      }

      // Ensure we&apos;re setting arrays even if the API returns null or undefined
      setCategories(Array.isArray(fetchedCategories) ? fetchedCategories : []);
      setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : []);

      // If no users exist, create a default system user
      if ((!fetchedUsers || fetchedUsers.length === 0) && typeof window !== 'undefined') {
        setFormData(prev => ({
          ...prev,
          user_id: 'system'
        }));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load categories or users');

      // Set empty arrays to prevent map errors
      setCategories([]);
      setUsers([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'fetch_frequency') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 60 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.name || !formData.url || !formData.category_id || !formData.user_id) {
        throw new Error('Please fill in all required fields');
      }

      // Submit the form
      const response = await fetch('/api/rss', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create RSS feed');
      }

      // Redirect to RSS feeds list
      router.push('/admin/rss');
    } catch (err: unknown) {
      console.error('Error adding RSS feed:', err);
      setError(err.message || 'Failed to add RSS feed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Add RSS Feed</h1>
          <Link href="/admin/rss" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center">
            <FiX className="mr-2" />
            Cancel
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Feed Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Enter feed name"
              />
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                RSS URL *
              </label>
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="https://example.com/rss"
              />
            </div>

            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value="">Select a category</option>
                {Array.isArray(categories) && categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-1">
                Author (User) *
              </label>
              <select
                id="user_id"
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value="">Select a user</option>
                {Array.isArray(users) && users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
                {(!Array.isArray(users) || users.length === 0) && (
                  <option value="system">System (Default)</option>
                )}
              </select>
            </div>

            <div>
              <label htmlFor="fetch_frequency" className="block text-sm font-medium text-gray-700 mb-1">
                Fetch Frequency (minutes)
              </label>
              <input
                type="number"
                id="fetch_frequency"
                name="fetch_frequency"
                value={formData.fetch_frequency}
                onChange={handleChange}
                min="5"
                max="1440"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                Active (fetch and import articles)
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md flex items-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" />
                  Save Feed
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
