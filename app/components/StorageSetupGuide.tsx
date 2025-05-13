'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiAlertTriangle, FiCheckCircle, FiExternalLink } from 'react-icons/fi';

interface StorageSetupGuideProps {
  onClose?: () => void;
}

export default function StorageSetupGuide({ onClose }: StorageSetupGuideProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl mx-auto my-8">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FiAlertTriangle className="h-6 w-6 text-yellow-500" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium text-gray-900">Storage Setup Required</h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Your Supabase storage buckets need to be set up before you can upload images or videos.
              This is a one-time setup that requires access to your Supabase dashboard.
            </p>
          </div>
          
          <div className="mt-4 flex">
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
            
            <Link
              href="/storage-setup.html"
              target="_blank"
              className="ml-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Setup Guide <FiExternalLink className="ml-1" />
            </Link>
            
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
              <h4 className="text-sm font-medium text-gray-900">Required Storage Buckets</h4>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li className="text-sm text-gray-500">news-images - For storing article images</li>
                <li className="text-sm text-gray-500">news-videos - For storing article videos</li>
                <li className="text-sm text-gray-500">user-avatars - For storing user profile pictures</li>
                <li className="text-sm text-gray-500">site-assets - For storing site assets</li>
              </ul>
              
              <h4 className="mt-4 text-sm font-medium text-gray-900">Quick Setup Steps</h4>
              <ol className="mt-2 list-decimal pl-5 space-y-1">
                <li className="text-sm text-gray-500">
                  Go to your <a href="https://supabase.com/dashboard/project/tnaqvbrflguwpeafwclz/storage/buckets" target="_blank" className="text-blue-600 hover:text-blue-800">Supabase Storage Dashboard</a>
                </li>
                <li className="text-sm text-gray-500">Click "Create bucket" for each bucket listed above</li>
                <li className="text-sm text-gray-500">Make sure to check "Public bucket" when creating each bucket</li>
                <li className="text-sm text-gray-500">For each bucket, add a policy to allow public access</li>
              </ol>
              
              <div className="mt-4 flex items-center">
                <FiCheckCircle className="h-5 w-5 text-green-500" />
                <span className="ml-2 text-sm text-gray-500">
                  Once you've completed these steps, you'll be able to upload images and videos.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
