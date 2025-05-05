'use client';

import { useState } from 'react';
import { FiSave, FiX, FiUpload, FiYoutube } from 'react-icons/fi';
import Link from 'next/link';

export default function AddNewsPage() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: 'సినిమా',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a server or cloud storage
      // For demo purposes, we'll just create a local URL
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);

      // In a real app, you would upload the file to a server and get the URL
      // For now, we'll use the local URL for preview and simulate a server URL
      setFormData(prev => ({
        ...prev,
        image_url: imageUrl, // In a real app, this would be the URL from your server
      }));

      console.log('File selected:', file.name, 'size:', (file.size / 1024).toFixed(2) + 'KB');
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a server or cloud storage
      // For demo purposes, we'll just create a local URL
      const videoUrl = URL.createObjectURL(file);

      // In a real app, you would upload the file to a server and get the URL
      setFormData(prev => ({
        ...prev,
        video_url: videoUrl,
        video_type: 'uploaded'
      }));

      console.log('Video selected:', file.name, 'size:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // In a real app, this would be an API call
      console.log('Submitting news article:', formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage({
        type: 'success',
        text: 'News article created successfully!'
      });

      // Reset form after successful submission
      setFormData({
        title: '',
        content: '',
        summary: '',
        category: 'సినిమా',
        author: '',
        image_url: '',
        video_url: '',
        video_type: 'youtube',
        tags: '',
        published: true
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to create news article. Please try again.'
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
              <option value="సినిమా">సినిమా (Cinema)</option>
              <option value="రాష్ట్రీయం">రాష్ట్రీయం (Politics)</option>
              <option value="క్రీడలు">క్రీడలు (Sports)</option>
              <option value="వ్యాపారం">వ్యాపారం (Business)</option>
              <option value="ఆరోగ్యం">ఆరోగ్యం (Health)</option>
              <option value="విద్య">విద్య (Education)</option>
              <option value="టెక్">టెక్ (Technology)</option>
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
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
              placeholder="Enter author name"
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
