'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiUpload, FiRefreshCw } from 'react-icons/fi';
import { getSettings, saveSettings, SiteSettings } from '../../lib/settingsService';
import { useSettings } from '../../contexts/SettingsContext';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: '',
    primary_color: '',
    secondary_color: '',
    share_link: '',
    logo_url: '',
    black_strip_text: '',
  });

  const [previewLogo, setPreviewLogo] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  // Load settings when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const loadedSettings = await getSettings();
        setSettings(loadedSettings);
        if (loadedSettings.logo_url) {
          setPreviewLogo(loadedSettings.logo_url);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setMessage({ type: 'error', text: 'Failed to load settings. Please try again.' });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Show preview immediately for better UX
        const previewUrl = URL.createObjectURL(file);
        setPreviewLogo(previewUrl);

        // Set loading state
        setIsSubmitting(true);

        // Create form data for upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'image');
        formData.append('bucket', 'site-assets');

        // Upload the image using the API
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          console.error('Error uploading logo:', result.error);
          setMessage({
            type: 'error',
            text: `Failed to upload logo: ${result.error || 'Unknown error'}`
          });
          // Keep the preview but don&apos;t update the form data
        } else {
          // Update settings with the actual storage URL
          setSettings(prev => ({
            ...prev,
            logo_url: result.url,
          }));
          console.log('Logo uploaded successfully:', result.url);
        }
      } catch (error) {
        console.error('Error in logo upload:', error);
        setMessage({
          type: 'error',
          text: 'Failed to upload logo. Please try again.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Get the refreshSettings function from the context
  const { refreshSettings } = useSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const success = await saveSettings(settings);

      if (success) {
        // Refresh the settings in the context to update the UI
        await refreshSettings();

        setMessage({ type: 'success', text: 'Settings saved successfully!' });

        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FiRefreshCw className="animate-spin h-8 w-8 text-yellow-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Site Settings</h1>
      </div>

      {/* Message display */}
      {message.text && (
        <div
          className={`p-4 mb-6 rounded-md ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {/* Site Name */}
        <div className="mb-4">
          <label htmlFor="site_name" className="block text-sm font-medium text-gray-700 mb-1">
            Site Name
          </label>
          <input
            type="text"
            id="site_name"
            name="site_name"
            value={settings.site_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
            required
          />
        </div>

        {/* Primary Color */}
        <div className="mb-4">
          <label htmlFor="primary_color" className="block text-sm font-medium text-gray-700 mb-1">
            Primary Color
          </label>
          <div className="flex items-center">
            <input
              type="color"
              id="primary_color"
              name="primary_color"
              value={settings.primary_color}
              onChange={handleChange}
              className="h-10 w-10 border border-gray-300 rounded-md mr-2"
            />
            <input
              type="text"
              value={settings.primary_color}
              onChange={handleChange}
              name="primary_color"
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
              placeholder="#FACC15"
            />
          </div>
        </div>

        {/* Secondary Color */}
        <div className="mb-4">
          <label htmlFor="secondary_color" className="block text-sm font-medium text-gray-700 mb-1">
            Secondary Color
          </label>
          <div className="flex items-center">
            <input
              type="color"
              id="secondary_color"
              name="secondary_color"
              value={settings.secondary_color}
              onChange={handleChange}
              className="h-10 w-10 border border-gray-300 rounded-md mr-2"
            />
            <input
              type="text"
              value={settings.secondary_color}
              onChange={handleChange}
              name="secondary_color"
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* Share Link */}
        <div className="mb-4">
          <label htmlFor="share_link" className="block text-sm font-medium text-gray-700 mb-1">
            Share Link
          </label>
          <input
            type="url"
            id="share_link"
            name="share_link"
            value={settings.share_link}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
            placeholder="https://flipnews.vercel.app"
            required
          />
        </div>

        {/* Black Strip Text */}
        <div className="mb-4">
          <label htmlFor="black_strip_text" className="block text-sm font-medium text-gray-700 mb-1">
            Black Strip Text
          </label>
          <input
            type="text"
            id="black_strip_text"
            name="black_strip_text"
            value={settings.black_strip_text || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
            placeholder="No.1 తెలుగు న్యూస్ డైలీ"
          />
          <p className="text-xs text-gray-500 mt-1">
            This text appears in the black strip below the image in news cards.
          </p>
        </div>

        {/* Logo Upload */}
        <div className="mb-6">
          <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-1">
            Logo
          </label>
          <div className="flex flex-col space-y-2">
            <div className="flex">
              <input
                type="text"
                id="logo_url"
                name="logo_url"
                value={settings.logo_url || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
                placeholder="Enter logo URL"
              />
              <label
                htmlFor="logo_upload"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-r-md cursor-pointer flex items-center"
              >
                <FiUpload />
              </label>
              <input
                type="file"
                id="logo_upload"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>

            {/* Logo Preview */}
            {previewLogo && (
              <div className="mt-2 border rounded-md p-2 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Logo Preview:</p>
                <div className="relative h-16 w-full">
                  <img
                    src={previewLogo}
                    alt="Logo Preview"
                    className="h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-md flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <FiRefreshCw className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
