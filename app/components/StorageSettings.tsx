'use client';

import { useState, useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiSettings, FiInfo } from 'react-icons/fi';
import { getConfiguredProviders, StorageProvider } from '../lib/mediaService';

interface StorageSettingsProps {
  onClose?: () => void;
}

export default function StorageSettings({ onClose }: StorageSettingsProps) {
  const [providers, setProviders] = useState<Record<StorageProvider, boolean>>({
    supabase: false,
    cloudinary: false,
    imgbb: false,
    local: true,
  });
  
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps;

  const getProviderStatus = (provider: StorageProvider) => {
    if (loading) return 'Checking...';
    return providers[provider] ? 'Configured' : 'Not configured';
  };

  const getProviderIcon = (provider: StorageProvider) => {
    if (loading) return null;
    return providers[provider] ? (
      <FiCheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <FiXCircle className="h-5 w-5 text-red-500" />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl mx-auto my-8">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FiSettings className="h-6 w-6 text-blue-500" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium text-gray-900">Storage Provider Settings</h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              FlipNEWS can use multiple storage providers for images and videos. 
              Below is the status of each configured provider.
            </p>
          </div>
          
          <div className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-medium">Supabase Storage</span>
                  <div className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100">
                    {getProviderStatus('supabase')}
                  </div>
                </div>
                {getProviderIcon('supabase')}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-medium">Cloudinary</span>
                  <div className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100">
                    {getProviderStatus('cloudinary')}
                  </div>
                </div>
                {getProviderIcon('cloudinary')}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-medium">ImgBB</span>
                  <div className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100">
                    {getProviderStatus('imgbb')}
                  </div>
                </div>
                {getProviderIcon('imgbb')}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-medium">Local Storage (Fallback)</span>
                  <div className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100">
                    {getProviderStatus('local')}
                  </div>
                </div>
                {getProviderIcon('local')}
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex">
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
            
            {onClose && (
              <button
                type="button"
                className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={onClose}
              >
                Close
              </button>
            )}
          </div>
          
          {showDetails && (
            <div className="mt-4 bg-gray-50 p-4 rounded-md">
              <div className="flex items-center mb-2">
                <FiInfo className="h-5 w-5 text-blue-500" />
                <h4 className="ml-2 text-sm font-medium text-gray-900">Configuration Details</h4>
              </div>
              
              <div className="space-y-4 text-sm">
                <div>
                  <h5 className="font-medium">Supabase Storage</h5>
                  <p className="text-gray-500 mt-1">
                    Requires Supabase project with storage buckets configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.
                  </p>
                </div>
                
                <div>
                  <h5 className="font-medium">Cloudinary</h5>
                  <p className="text-gray-500 mt-1">
                    Requires Cloudinary account. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment.
                  </p>
                </div>
                
                <div>
                  <h5 className="font-medium">ImgBB</h5>
                  <p className="text-gray-500 mt-1">
                    Requires ImgBB API key. Set NEXT_PUBLIC_IMGBB_API_KEY in your environment. Note: ImgBB only supports images, not videos.
                  </p>
                </div>
                
                <div>
                  <h5 className="font-medium">Local Storage</h5>
                  <p className="text-gray-500 mt-1">
                    Fallback option that stores files in browser memory. Files will be lost when the browser is closed. Use only for development.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-100">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> The system will try each configured provider in order until one succeeds. 
                  If all fail, the local storage fallback will be used.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
