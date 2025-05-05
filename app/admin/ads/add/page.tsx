'use client';

import { useState } from 'react';
import { FiSave, FiX, FiUpload, FiYoutube } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addAd } from '../../../lib/dataService';
import { Ad } from '../../../types';

export default function AddAdPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    text_content: '',
    image_url: '',
    video_url: '',
    video_type: 'youtube',
    link_url: '',
    frequency: 3,
    active: true
  });

  const [adType, setAdType] = useState<'image' | 'video' | 'text'>('image');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleAdTypeChange = (type: 'image' | 'video' | 'text') => {
    setAdType(type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Create a new ad object
      const newAd: Ad = {
        id: `ad-${Date.now()}`, // Generate a unique ID
        title: formData.title,
        description: formData.description || undefined,
        text_content: adType === 'text' ? formData.text_content : undefined,
        image_url: adType === 'image' ? formData.image_url : undefined,
        video_url: adType === 'video' ? formData.video_url : undefined,
        video_type: adType === 'video' ? (formData.video_type as 'youtube' | 'uploaded') : undefined,
        link_url: formData.link_url,
        frequency: Number(formData.frequency),
        active: formData.active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Adding new ad:', newAd);

      // Add the ad using the data service
      const success = addAd(newAd);

      if (success) {
        setMessage({
          type: 'success',
          text: 'Advertisement created successfully!'
        });

        // Navigate to the ads list after a short delay
        setTimeout(() => {
          router.push('/admin/ads');
        }, 1500);
      } else {
        throw new Error('Failed to add advertisement');
      }
    } catch (error) {
      console.error('Error adding ad:', error);
      setMessage({
        type: 'error',
        text: 'Failed to create advertisement. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add New Advertisement</h1>
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
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Ad Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter advertisement title"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter a brief description"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ad Type <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => handleAdTypeChange('image')}
                className={`px-4 py-2 rounded-md ${
                  adType === 'image'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Image Ad
              </button>
              <button
                type="button"
                onClick={() => handleAdTypeChange('video')}
                className={`px-4 py-2 rounded-md ${
                  adType === 'video'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Video Ad
              </button>
              <button
                type="button"
                onClick={() => handleAdTypeChange('text')}
                className={`px-4 py-2 rounded-md ${
                  adType === 'text'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Text Ad
              </button>
            </div>
          </div>

          {adType === 'image' && (
            <div className="md:col-span-2">
              <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                Image URL <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  required={adType === 'image'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter image URL"
                />
                <button
                  type="button"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-r-md"
                  onClick={() => console.log('Upload image')}
                >
                  <FiUpload />
                </button>
              </div>
            </div>
          )}

          {adType === 'video' && (
            <div className="md:col-span-2">
              <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 mb-1">
                Video URL <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="video_url"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleChange}
                  required={adType === 'video'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter video URL (YouTube or direct link)"
                />
                <select
                  id="video_type"
                  name="video_type"
                  value={formData.video_type}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 border-l-0 rounded-r-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="youtube">YouTube</option>
                  <option value="uploaded">Uploaded</option>
                </select>
              </div>
            </div>
          )}

          {adType === 'text' && (
            <div className="md:col-span-2">
              <label htmlFor="text_content" className="block text-sm font-medium text-gray-700 mb-1">
                Text Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="text_content"
                name="text_content"
                value={formData.text_content}
                onChange={handleChange}
                required={adType === 'text'}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Enter the text content for your ad"
              />
            </div>
          )}

          <div className="md:col-span-2">
            <label htmlFor="link_url" className="block text-sm font-medium text-gray-700 mb-1">
              Link URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              id="link_url"
              name="link_url"
              value={formData.link_url}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter the URL where the ad should link to"
            />
          </div>

          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
              Frequency <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <span className="mr-2 text-gray-600">Show after every</span>
              <input
                type="number"
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                required
                min="1"
                max="20"
                className="w-16 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <span className="ml-2 text-gray-600">articles</span>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={formData.active}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
              Active (ad will be shown to users)
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
            {isSubmitting ? 'Saving...' : 'Save Advertisement'}
          </button>
        </div>
      </form>
    </div>
  );
}
