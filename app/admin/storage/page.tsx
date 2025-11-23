'use client';

import { useState, useEffect } from 'react';
import { FiRefreshCw, FiUpload, FiCheck, FiX } from 'react-icons/fi';
import StorageSettings from '../../components/StorageSettings';
import { getConfiguredProviders, StorageProvider } from '../../lib/mediaService';

export default function StorageConfigPage() {
  const [providers, setProviders] = useState<Record<StorageProvider, boolean>>({
    supabase: false,
    cloudinary: false,
    imgbb: false,
    local: true,
  });
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [testUploadStatus, setTestUploadStatus] = useState<{
    inProgress: boolean;
    result: null | { success: boolean; url: string | null; provider: string | null };
  }>({
    inProgress: false,
    result: null,
  });

  useEffect(() => {
    const checkProviders = async () => {
      try {
        const configuredProviders = await getConfiguredProviders();
        setProviders(configuredProviders);
      } catch (error) {
        console.error('Error checking storage providers:', error);
      } finally {
        setLoading(false);
      }
    };

    checkProviders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTestUpload = async () => {
    setTestUploadStatus({
      inProgress: true,
      result: null,
    });

    try {
      // Create a small test image (1x1 pixel transparent PNG)
      const base64Data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      const response = await fetch(base64Data);
      const blob = await response.blob();
      const file = new File([blob], 'test-image.png', { type: 'image/png' });

      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image');
      formData.append('bucket', 'site-assets');

      // Upload the test image
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await uploadResponse.json();

      if (result.success) {
        setTestUploadStatus({
          inProgress: false,
          result: {
            success: true,
            url: result.url,
            provider: result.provider,
          },
        });
        setMessage({
          type: 'success',
          text: `Test upload successful using ${result.provider} provider!`,
        });
      } else {
        setTestUploadStatus({
          inProgress: false,
          result: {
            success: false,
            url: null,
            provider: null,
          },
        });
        setMessage({
          type: 'error',
          text: `Test upload failed: ${result.error || 'Unknown error'}`,
        });
      }
    } catch (error: unknown) {
      console.error('Error during test upload:', error);
      setTestUploadStatus({
        inProgress: false,
        result: {
          success: false,
          url: null,
          provider: null,
        },
      });
      setMessage({
        type: 'error',
        text: `Test upload failed: ${error.message || 'Unknown error'}`,
      });
    }

    // Clear message after 5 seconds
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 5000);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Storage Configuration</h1>
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

      {/* Storage Settings Component */}
      <StorageSettings />

      {/* Test Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Test Storage Configuration</h2>
        <p className="text-gray-600 mb-4">
          Click the button below to test your storage configuration by uploading a small test image.
          This will help verify that at least one storage provider is working correctly.
        </p>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleTestUpload}
            disabled={testUploadStatus.inProgress || loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testUploadStatus.inProgress ? (
              <>
                <FiRefreshCw className="animate-spin mr-2" />
                Testing...
              </>
            ) : (
              <>
                <FiUpload className="mr-2" />
                Test Upload
              </>
            )}
          </button>

          {testUploadStatus.result && (
            <div className="flex items-center">
              {testUploadStatus.result.success ? (
                <>
                  <FiCheck className="text-green-500 mr-2" />
                  <span className="text-green-700">Success!</span>
                </>
              ) : (
                <>
                  <FiX className="text-red-500 mr-2" />
                  <span className="text-red-700">Failed</span>
                </>
              )}
            </div>
          )}
        </div>

        {testUploadStatus.result && testUploadStatus.result.success && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Provider:</strong> {testUploadStatus.result.provider}
            </p>
            {testUploadStatus.result.url && (
              <div>
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Image URL:</strong>
                </p>
                <div className="bg-gray-100 p-2 rounded text-xs text-gray-800 break-all">
                  {testUploadStatus.result.url}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Environment Variables Guide */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
        <p className="text-gray-600 mb-4">
          To configure storage providers, add the following environment variables to your project:
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Supabase Storage</h3>
            <div className="bg-gray-100 p-3 rounded">
              <pre className="text-xs">
                NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
                NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-800 mb-2">Cloudinary</h3>
            <div className="bg-gray-100 p-3 rounded">
              <pre className="text-xs">
                NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
                NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
                CLOUDINARY_API_SECRET=your-api-secret
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-800 mb-2">ImgBB</h3>
            <div className="bg-gray-100 p-3 rounded">
              <pre className="text-xs">
                NEXT_PUBLIC_IMGBB_API_KEY=your-api-key
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
