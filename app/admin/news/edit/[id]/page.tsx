'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiX, FiUpload, FiYoutube } from 'react-icons/fi';
import { getNewsArticleById, updateNewsArticle, getCategories } from '../../../../lib/dataService';
import { Category, NewsArticle } from '../../../../types';

export default function EditNewsArticle({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  // Find the article with the given ID using the data service
  const article = getNewsArticleById(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: '',
    author: '',
    image_url: '',
    video_url: '',
    video_type: 'youtube',
    tags: '',
    published: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Load article data and categories when component mounts
  useEffect(() => {
    // Load categories
    const loadedCategories = getCategories();
    setCategories(loadedCategories);

    if (article) {
      setFormData({
        title: article.title,
        content: article.content,
        summary: article.summary || '',
        category: article.category,
        author: article.author,
        image_url: article.image_url || '',
        video_url: article.video_url || '',
        video_type: article.video_type || 'youtube',
        tags: article.tags ? article.tags.join(', ') : '',
        published: article.published
      });

      if (article.image_url) {
        setPreviewImage(article.image_url);
      }
    }
  }, [article]);

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

        // Create form data for upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'image');
        formData.append('bucket', 'news-images');

        // Upload the image using the API
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          console.error('Error uploading image:', result.error);
          setMessage({
            type: 'error',
            text: `Failed to upload image: ${result.error || 'Unknown error'}`
          });
          // Keep the preview but don't update the form data
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

        // Create form data for upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'video');
        formData.append('bucket', 'news-videos');

        // Upload the video using the API
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          console.error('Error uploading video:', result.error);
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

    try {
      // Process tags
      const processedTags = formData.tags.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Create the updated article object
      const updatedArticle: NewsArticle = {
        ...article!,
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        category: formData.category,
        author: formData.author,
        tags: processedTags,
        published: formData.published,
        image_url: formData.image_url || undefined,
        video_url: formData.video_url || undefined,
        video_type: (formData.video_type === 'youtube' || formData.video_type === 'uploaded')
          ? formData.video_type
          : undefined,
        updated_at: new Date().toISOString(),
      };

      console.log('Updating article:', updatedArticle);

      // Update the article using the data service
      const success = await updateNewsArticle(updatedArticle);

      if (success) {
        // Clear any cached data to ensure fresh data is loaded on the front end
        if (typeof window !== 'undefined') {
          localStorage.removeItem('flipnews_articles_cache');
          localStorage.setItem('flipnews_articles_updated', Date.now().toString());
          console.log('Article updated and cache cleared');
        }

        setMessage({ type: 'success', text: 'Article updated successfully and saved to Supabase!' });
        setTimeout(() => {
          router.push('/admin/news');
        }, 1500);
      } else {
        throw new Error('Failed to update article');
      }
    } catch (error) {
      console.error('Error updating article:', error);
      setMessage({ type: 'error', text: 'Failed to update article. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/news');
  };

  if (!article) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-red-600">Article Not Found</h1>
        <p className="mb-4">The article with ID {id} could not be found.</p>
        <button
          onClick={() => router.push('/admin/news')}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-md"
        >
          Back to News Management
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Article</h1>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md flex items-center"
            disabled={isSubmitting}
          >
            <FiX className="mr-2" /> Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-md flex items-center"
            disabled={isSubmitting}
          >
            <FiSave className="mr-2" /> {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter article title"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
              Summary *
            </label>
            <textarea
              id="summary"
              name="summary"
              required
              value={formData.summary}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter a brief summary (will be shown in cards)"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Full Content *
            </label>
            <textarea
              id="content"
              name="content"
              required
              value={formData.content}
              onChange={handleChange}
              rows={10}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter the full article content"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
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
              Author *
            </label>
            <input
              type="text"
              id="author"
              name="author"
              required
              value={formData.author}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter author name"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g. సినిమా, బాలయ్య, రజినీకాంత్"
            />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter video URL (YouTube or direct link)"
                />
                <select
                  id="video_type"
                  name="video_type"
                  value={formData.video_type}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 border-l-0 focus:outline-none focus:ring-2 focus:ring-yellow-500"
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

          <div className="md:col-span-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                name="published"
                checked={formData.published}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded"
              />
              <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                Publish immediately
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-white text-gray-700 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-yellow-500 text-black px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-yellow-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
