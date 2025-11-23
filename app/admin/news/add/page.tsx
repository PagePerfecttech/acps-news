'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiX, FiUpload, FiYoutube } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCategories } from '../../../lib/dataService';
import { Category } from '../../../types';
import StorageSetupGuide from '../../../components/StorageSetupGuide';

// Define NewsArticle type
interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  author: string;
  image_url?: string;
  video_url?: string;
  video_type?: 'youtube' | 'uploaded';
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
  likes: number;
  comments: any[];
  views: number;
}

export default function AddNewsPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: '',
    author: 'Admin User', // Default author name
    image_url: '',
    video_url: '',
    video_type: 'youtube',
    tags: '',
    published: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showStorageGuide, setShowStorageGuide] = useState(false);

  // Load categories and user info when component mounts
  useEffect(() => {
    // Load categories
    const loadCategories = async () => {
      try {
        const loadedCategories = await getCategories();
        setCategories(loadedCategories);

        // Set default category if available
        if (loadedCategories.length > 0 && !formData.category) {
          setFormData(prev => ({
            ...prev,
            category: loadedCategories[0].name
          }));
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        // Set empty array to prevent map errors
        setCategories([]);
      }
    };

    loadCategories();

    // Get current user info from localStorage
    try {
      const storedUsers = localStorage.getItem('acpsnews_users');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        if (users && users.length > 0) {
          // Use the first user as the author (in a real app, you&apos;d use the logged-in user)
          setFormData(prev => ({
            ...prev,
            author: users[0].name || 'Admin User'
          }));
        }
      }
    } catch (error) {
      console.error('Error getting user info:', error);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Show preview immediately for better UX
        const previewUrl = URL.createObjectURL(file);
        setPreviewImage(previewUrl);

        // Set loading state
        setIsSubmitting(true);

        // Create form data for upload to R2
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'news-images');

        // Upload the image using R2 API directly
        const response = await fetch('/api/upload/r2', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          console.error('Error uploading image:', result.error);

          // Check if the error is related to storage bucket not found
          if (result.error === 'Storage bucket not found' ||
              (result.error && result.error.includes('bucket')) ||
              (result.details && result.details.includes('bucket'))) {
            setShowStorageGuide(true);
          }

          setMessage({
            type: 'error',
            text: `Failed to upload image: ${result.error || 'Unknown error'}`
          });
          // Keep the preview but don&apos;t update the form data
        } else {
          // Update form with the actual storage URL
          setFormData(prev => ({
            ...prev,
            image_url: result.url,
          }));
          console.log('Image uploaded successfully:', result.url);
        }
      } catch (error) {
        console.error('Error in image upload:', error);
        setMessage({
          type: 'error',
          text: 'Failed to upload image. Please try again.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Set loading state
        setIsSubmitting(true);

        // Create form data for upload to R2
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'news-videos');

        // Upload the video using R2 API directly
        const response = await fetch('/api/upload/r2', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          console.error('Error uploading video:', result.error);

          // Check if the error is related to storage bucket not found
          if (result.error === 'Storage bucket not found' ||
              (result.error && result.error.includes('bucket')) ||
              (result.details && result.details.includes('bucket'))) {
            setShowStorageGuide(true);
          }

          setMessage({
            type: 'error',
            text: `Failed to upload video: ${result.error || 'Unknown error'}`
          });
        } else {
          // Update form with the actual storage URL
          setFormData(prev => ({
            ...prev,
            video_url: result.url,
            video_type: 'uploaded'
          }));
          console.log('Video uploaded successfully:', result.url);
        }
      } catch (error) {
        console.error('Error in video upload:', error);
        setMessage({
          type: 'error',
          text: 'Failed to upload video. Please try again.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('Form submission started');
      console.log('Form data:', formData);

      // Process tags - safely handle empty or undefined tags
      const processedTags = formData.tags
        ? formData.tags.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
        : [];

      console.log('Processed tags:', processedTags);

      // Create a new article object
      const newArticle: NewsArticle = {
        id: `${Date.now()}`, // Generate a unique ID
        title: formData.title,
        content: formData.content,
        summary: formData.summary,
        category: formData.category,
        author: formData.author,
        image_url: formData.image_url || undefined,
        video_url: formData.video_url || undefined,
        video_type: (formData.video_type === 'youtube' || formData.video_type === 'uploaded')
          ? formData.video_type
          : undefined,
        tags: processedTags,
        published: formData.published,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        likes: 0,
        comments: [],
        views: 0
      };

      console.log('Adding new article with full details:', JSON.stringify(newArticle, null, 2));

      // Add the article using the admin API endpoint to bypass RLS
      console.log('Calling admin API to add news article...');

      // Find the category ID from the category name
      const categoryObj = categories.find(c => c.name === formData.category);
      if (!categoryObj) {
        throw new Error('Selected category not found');
      }

      // Prepare the article data for the admin API
      const articleData = {
        title: formData.title,
        content: formData.content,
        summary: formData.summary,
        category_id: categoryObj.id, // Use the actual category ID
        author: formData.author,
        image_url: formData.image_url || undefined,
        video_url: formData.video_url || undefined,
        video_type: formData.video_type,
        published: formData.published
      };

      const response = await fetch('/api/admin/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });

      const result = await response.json();
      console.log('Server API result:', result);

      if (response.ok && result.success) {
        console.log('Article added successfully:', result.id);
        setMessage({
          type: 'success',
          text: 'News article created successfully and saved to Supabase!'
        });

        // Navigate to the news list after a short delay
        setTimeout(() => {
          console.log('Navigating to news list');
          router.push('/admin/news');
        }, 1500);
      } else {
        console.error('Server API returned error:', result.error);
        throw new Error(`Failed to add article: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding article:', error);
      console.error('Error type:', typeof error);
      console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

      let errorMessage = 'Failed to create news article. Please try again.';

      // Add more detailed error information
      if (error instanceof Error) {
        errorMessage += ` Error: ${error.message}`;
        console.error('Error stack:', error.stack);
      } else if (typeof error === 'object' && error !== null) {
        errorMessage += ` Error: ${JSON.stringify(error)}`;
      }

      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add New News Article</h1>
        <Link
          href="/admin"
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md flex items-center text-sm"
        >
          <FiX className="mr-2" /> Cancel
        </Link>
      </div>

      {message.text && (
        <div
          className={`p-4 mb-6 rounded-md ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {showStorageGuide && (
        <StorageSetupGuide onClose={() => setShowStorageGuide(false)} />
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 md:col-span-2">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
                placeholder="Enter news title"
              />
            </div>

            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
                Summary <span className="text-red-500">*</span>
              </label>
              <textarea
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                required
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
                placeholder="Enter a brief summary"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
                placeholder="Enter the full news content"
              />
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
              Author <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              readOnly
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black bg-gray-50"
              placeholder="Author name (automatically set)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Author is automatically set to your username
            </p>
          </div>

          <div>
            <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            <div className="flex flex-col space-y-2">
              <div className="flex">
                <input
                  type="text"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
                  placeholder="Enter image URL"
                />
                <label
                  htmlFor="image_upload"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-r-md cursor-pointer flex items-center"
                >
                  <FiUpload />
                </label>
                <input
                  type="file"
                  id="image_upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              {previewImage && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Preview:</p>
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="h-32 object-cover rounded-md border border-gray-300"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 mb-1">
              Video
            </label>
            <div className="flex flex-col space-y-2">
              <div className="flex">
                <input
                  type="text"
                  id="video_url"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
                  placeholder="Enter video URL (YouTube or direct link)"
                />
                <select
                  id="video_type"
                  name="video_type"
                  value={formData.video_type}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 border-l-0 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
                >
                  <option value="youtube">YouTube</option>
                  <option value="uploaded">Uploaded</option>
                </select>
                <label
                  htmlFor="video_upload"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-r-md cursor-pointer flex items-center"
                >
                  <FiUpload />
                </label>
                <input
                  type="file"
                  id="video_upload"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoUpload}
                />
              </div>

              {formData.video_url && formData.video_type === 'uploaded' && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Video selected</p>
                  <div className="p-2 bg-gray-100 rounded-md border border-gray-300 text-sm">
                    Video ready for upload
                  </div>
                </div>
              )}

              {formData.video_url && formData.video_type === 'youtube' && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">YouTube video</p>
                  <div className="p-2 bg-gray-100 rounded-md border border-gray-300 text-sm flex items-center">
                    <FiYoutube className="text-red-600 mr-2" size={16} />
                    YouTube video linked
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
              placeholder="Enter tags separated by commas"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate tags with commas (e.g., "సినిమా, బాలయ్య, రజినీకాంత్")
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
              Publish immediately
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-md flex items-center"
          >
            <FiSave className="mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Article'}
          </button>
        </div>
      </form>
    </div>
  );
}
