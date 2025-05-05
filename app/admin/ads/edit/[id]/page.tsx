'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiX, FiUpload, FiYoutube } from 'react-icons/fi';
import { getAdById, updateAd } from '../../../../lib/dataService';
import { Ad } from '../../../../types';

export default function EditAd({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  // Find the ad with the given ID using the data service
  const ad = getAdById(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    text_content: '',
    link_url: '',
    frequency: 3,
    active: true,
    mediaType: 'image', // 'image', 'video', 'youtube', 'text'
    imageUrl: '',
    videoUrl: '',
    youtubeUrl: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Load ad data when component mounts
  useEffect(() => {
    if (ad) {
      let mediaType = 'image';
      if (ad.video_url) {
        mediaType = ad.video_type === 'youtube' ? 'youtube' : 'video';
      } else if (ad.text_content && !ad.image_url) {
        mediaType = 'text';
      }

      setFormData({
        title: ad.title,
        description: ad.description || '',
        text_content: ad.text_content || '',
        link_url: ad.link_url,
        frequency: ad.frequency,
        active: ad.active,
        mediaType,
        imageUrl: ad.image_url || '',
        videoUrl: ad.video_url && ad.video_type !== 'youtube' ? ad.video_url : '',
        youtubeUrl: ad.video_url && ad.video_type === 'youtube' ? ad.video_url : '',
      });

      if (ad.image_url) {
        setPreviewImage(ad.image_url);
      }
    }
  }, [ad]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleMediaTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, mediaType: e.target.value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a server or cloud storage
      // For demo purposes, we'll just create a local URL
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);

      // In a real app, you would upload the file to a server and get the URL
      setFormData(prev => ({
        ...prev,
        imageUrl, // In a real app, this would be the URL from your server
      }));

      console.log('File selected:', file.name, 'size:', (file.size / 1024).toFixed(2) + 'KB');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create the updated ad object
      const updatedAd: Ad = {
        ...ad!,
        title: formData.title,
        description: formData.description || undefined,
        text_content: formData.mediaType === 'text' ? formData.text_content : undefined,
        link_url: formData.link_url,
        frequency: formData.frequency,
        active: formData.active,
        image_url: formData.mediaType === 'image' ? formData.imageUrl : undefined,
        video_url: formData.mediaType === 'video' ? formData.videoUrl :
                  formData.mediaType === 'youtube' ? formData.youtubeUrl : undefined,
        video_type: formData.mediaType === 'youtube' ? 'youtube' : undefined,
        updated_at: new Date().toISOString(),
      };

      console.log('Updating ad:', updatedAd);

      // Update the ad using the data service
      const success = updateAd(updatedAd);

      if (success) {
        setMessage({ type: 'success', text: 'Ad updated successfully!' });
        setTimeout(() => {
          router.push('/admin/ads');
        }, 1500);
      } else {
        throw new Error('Failed to update ad');
      }
    } catch (error) {
      console.error('Error updating ad:', error);
      setMessage({ type: 'error', text: 'Failed to update ad. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/ads');
  };

  if (!ad) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-red-600">Ad Not Found</h1>
        <p className="mb-4">The ad with ID {id} could not be found.</p>
        <button
          onClick={() => router.push('/admin/ads')}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-md"
        >
          Back to Ad Management
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Ad</h1>
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
              Ad Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter ad title"
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
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter a brief description (optional)"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="link_url" className="block text-sm font-medium text-gray-700 mb-1">
              Link URL *
            </label>
            <input
              type="url"
              id="link_url"
              name="link_url"
              required
              value={formData.link_url}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="https://example.com"
            />
            <p className="mt-1 text-sm text-gray-500">
              Where users will be directed when they click on the ad
            </p>
          </div>

          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
              Frequency *
            </label>
            <input
              type="number"
              id="frequency"
              name="frequency"
              required
              min="1"
              max="20"
              value={formData.frequency}
              onChange={handleNumberChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <p className="mt-1 text-sm text-gray-500">
              Show after every X articles (1-20)
            </p>
          </div>

          <div>
            <div className="flex items-center h-full">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                Active (immediately display this ad)
              </label>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ad Type *
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="mediaType"
                  value="image"
                  checked={formData.mediaType === 'image'}
                  onChange={handleMediaTypeChange}
                  className="form-radio h-4 w-4 text-yellow-500"
                />
                <span className="ml-2">Image</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="mediaType"
                  value="video"
                  checked={formData.mediaType === 'video'}
                  onChange={handleMediaTypeChange}
                  className="form-radio h-4 w-4 text-yellow-500"
                />
                <span className="ml-2">Uploaded Video</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="mediaType"
                  value="youtube"
                  checked={formData.mediaType === 'youtube'}
                  onChange={handleMediaTypeChange}
                  className="form-radio h-4 w-4 text-yellow-500"
                />
                <span className="ml-2">YouTube Video</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="mediaType"
                  value="text"
                  checked={formData.mediaType === 'text'}
                  onChange={handleMediaTypeChange}
                  className="form-radio h-4 w-4 text-yellow-500"
                />
                <span className="ml-2">Text Only</span>
              </label>
            </div>
          </div>

          {formData.mediaType === 'image' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Image
              </label>
              <div className="mt-1 flex items-center">
                <label className="flex flex-col items-center px-4 py-2 bg-white text-yellow-500 rounded-md border border-yellow-500 cursor-pointer hover:bg-yellow-50">
                  <FiUpload className="h-5 w-5" />
                  <span className="mt-2 text-sm">Select Image</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
                <span className="ml-4 text-sm text-gray-500">
                  {previewImage ? 'Image selected' : 'No image selected'}
                </span>
              </div>
              {previewImage && (
                <div className="mt-4">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="h-40 object-cover rounded-md"
                  />
                </div>
              )}
              <div className="mt-2">
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Or enter image URL
                </label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          )}

          {formData.mediaType === 'video' && (
            <div className="md:col-span-2">
              <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Video URL
              </label>
              <input
                type="text"
                id="videoUrl"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="https://example.com/video.mp4"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the URL of your uploaded video file (MP4 format recommended)
              </p>
            </div>
          )}

          {formData.mediaType === 'youtube' && (
            <div className="md:col-span-2">
              <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700 mb-1">
                YouTube Video URL
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <FiYoutube className="h-5 w-5 text-red-500" />
                </span>
                <input
                  type="text"
                  id="youtubeUrl"
                  name="youtubeUrl"
                  value={formData.youtubeUrl}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-r-md"
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Enter the full YouTube video URL
              </p>
            </div>
          )}

          {formData.mediaType === 'text' && (
            <div className="md:col-span-2">
              <label htmlFor="text_content" className="block text-sm font-medium text-gray-700 mb-1">
                Ad Text Content
              </label>
              <textarea
                id="text_content"
                name="text_content"
                value={formData.text_content}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter the text content for your ad"
              />
            </div>
          )}
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
