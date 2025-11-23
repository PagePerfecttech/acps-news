/**
 * Media Service
 *
 * Handles uploading and managing media files (images, videos, etc.)
 * Supports multiple storage providers with fallbacks
 */

import { v4 as uuidv4 } from 'uuid';
import imgbbService from './imgbbService';
import cloudflareR2Service from './cloudflareR2Service';

// Types
export type StorageProvider = 'cloudflare-r2' | 'imgbb' | 'local';

export type UploadResult = {
  url: string | null;
  error: string | null;
  provider?: StorageProvider;
};

// Default provider order (can be overridden) - Prioritizing Cloudflare R2
const DEFAULT_PROVIDER_ORDER: StorageProvider[] = [
  'cloudflare-r2',
  'imgbb', // Keep as emergency fallback only
  // 'local' removed to force server-side upload API usage which handles local storage properly
];

/**
 * Converts image to PNG format if it's intended for background use
 */
const convertToPngIfNeeded = async (file: File, folder: string): Promise<File> => {
  // Convert to PNG for background images (site-assets folder)
  if (folder === 'site-assets' && file.type !== 'image/png') {
    try {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);

          canvas.toBlob((blob) => {
            if (blob) {
              const pngFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.png'), {
                type: 'image/png',
                lastModified: Date.now()
              });
              resolve(pngFile);
            } else {
              reject(new Error('Failed to convert image to PNG'));
            }
          }, 'image/png', 0.95);
        };

        img.onerror = () => reject(new Error('Failed to load image for PNG conversion'));
        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      console.warn('PNG conversion failed, using original file:', error);
      return file;
    }
  }
  return file;
};

/**
 * Uploads an image to the configured storage provider
 *
 * @param file The image file to upload
 * @param options Upload options
 * @returns Promise with the upload result
 */
export const uploadImage = async (
  file: File,
  options: {
    folder?: 'news-images' | 'user-avatars' | 'site-assets';
    preferredProvider?: StorageProvider;
    fileName?: string;
  } = {}
): Promise<UploadResult> => {
  const { folder = 'news-images', preferredProvider, fileName } = options;

  console.log('uploadImage called with options:', {
    folder,
    preferredProvider,
    fileName,
    fileType: file.type,
    fileSize: file.size
  });

  // Check if we're in a server environment
  if (typeof window === 'undefined') {
    console.log('Server-side environment detected, using server upload API');
    return {
      url: null,
      error: 'Direct uploads from server-side are not supported. Use the /api/upload/server endpoint instead.',
      provider: 'server' as any
    };
  }

  // Convert to PNG if needed for background images
  let processedFile = file;
  try {
    processedFile = await convertToPngIfNeeded(file, folder);
    if (processedFile !== file) {
      console.log('File converted to PNG for background use');
    }
  } catch (error) {
    console.warn('PNG conversion failed, using original file:', error);
  }

  // Determine the order of providers to try
  const providers = determineProviderOrder(preferredProvider);
  console.log('Providers to try in order:', providers);

  // Try each provider in order
  for (const provider of providers) {
    try {
      console.log(`Attempting to upload image using ${provider}...`);

      let result: UploadResult | null = null;

      switch (provider) {
        case 'cloudflare-r2':
          if (cloudflareR2Service.isR2Configured()) {
            console.log('Cloudflare R2 is configured, attempting upload...');
            const uploadResult = await cloudflareR2Service.uploadImage(processedFile, folder);
            console.log('Cloudflare R2 upload result:', uploadResult);
            result = { ...uploadResult, provider };
          } else {
            console.log('Cloudflare R2 is not configured, skipping');
          }
          break;

        case 'imgbb':
          if (imgbbService.isImgBBConfigured()) {
            console.log('ImgBB is configured, attempting upload...');
            const uploadResult = await imgbbService.uploadImage(processedFile, fileName);
            console.log('ImgBB upload result:', uploadResult);
            result = { ...uploadResult, provider };
          } else {
            console.log('ImgBB is not configured, skipping');
          }
          break;

        case 'local':
          // Local storage fallback (for development/testing)
          console.log('Using local storage fallback...');
          const localResult = await storeFileLocally(processedFile, 'image');
          console.log('Local storage result:', localResult);
          result = { ...localResult, provider };
          break;
      }

      if (result && result.url) {
        console.log(`Successfully uploaded image using ${provider}, URL:`, result.url);
        return result;
      } else {
        console.log(`Provider ${provider} failed to return a URL`);
      }
    } catch (error) {
      console.error(`Error uploading image with ${provider}:`, error);
      // Continue to next provider
    }
  }

  // If all providers fail, try the server-side upload API
  try {
    console.log('All client-side providers failed, trying server-side upload API...');

    // Create a FormData object for the server upload
    const formData = new FormData();
    formData.append('file', processedFile);
    formData.append('type', 'image');
    formData.append('folder', folder);

    // Call the server-side upload API
    const response = await fetch('/api/upload/server', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server upload API error:', errorText);
      throw new Error(`Server upload failed: ${errorText}`);
    }

    const result = await response.json();

    if (result.success && result.url) {
      console.log('Server-side upload successful:', result);
      return {
        url: result.url,
        error: null,
        provider: result.provider || 'server' as any,
      };
    } else {
      console.error('Server upload API returned error:', result.error);
      throw new Error(result.error || 'Unknown server upload error');
    }
  } catch (serverError) {
    console.error('Error with server-side upload:', serverError);
  }

  // If all providers fail, return an error
  return {
    url: null,
    error: 'All storage providers failed',
    provider: undefined,
  };
};

/**
 * Uploads a video to the configured storage provider
 *
 * @param file The video file to upload
 * @param options Upload options
 * @returns Promise with the upload result
 */
export const uploadVideo = async (
  file: File,
  options: {
    preferredProvider?: StorageProvider;
    fileName?: string;
  } = {}
): Promise<UploadResult> => {
  // Similar implementation to uploadImage, but for videos
  // For now, we'll just call uploadImage with a different folder
  return uploadImage(file, {
    folder: 'news-images', // We'll use the same folder for now
    preferredProvider: options.preferredProvider,
    fileName: options.fileName,
  });
};

// Supabase upload function removed - using R2 only

/**
 * Determines the order of providers to try
 *
 * @param preferredProvider The preferred provider to try first
 * @returns Array of providers in order of preference
 */
const determineProviderOrder = (
  preferredProvider?: StorageProvider
): StorageProvider[] => {
  if (!preferredProvider) return DEFAULT_PROVIDER_ORDER;

  const defaultOrder = [...DEFAULT_PROVIDER_ORDER];
  return [
    preferredProvider,
    ...defaultOrder.filter(p => p !== preferredProvider),
  ];
};

/**
 * Stores a file locally (for development/testing)
 *
 * @param file The file to store
 * @param type The type of file (image or video)
 * @returns Promise with the result
 */
const storeFileLocally = async (
  file: File,
  type: 'image' | 'video'
): Promise<{ url: string | null; error: string | null }> => {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && typeof URL.createObjectURL !== 'undefined') {
      // In a real implementation, this would store the file on the server
      // For now, we'll just create an object URL for the browser
      const url = URL.createObjectURL(file);

      // Store the URL in localStorage for persistence across page refreshes
      if (typeof localStorage !== 'undefined') {
        const key = `acpsnews_local_${type}_${Date.now()}`;
        localStorage.setItem(key, url);
      }

      console.warn('Using local storage for file. This URL will not persist across sessions.');

      return {
        url,
        error: null,
      };
    } else {
      // Server-side handling - redirect to server upload API
      console.log('Server-side local storage is not supported, redirecting to server upload API');

      // In a server environment, we should use a different approach
      // For now, just return an error
      return {
        url: null,
        error: 'Local storage is not available in server environment',
      };
    }
  } catch (error: unknown) {
    console.error('Error storing file locally:', error);
    return {
      url: null,
      error: error instanceof Error ? error.message : 'Failed to store file locally',
    };
  }
};

/**
 * Gets the configured storage providers
 *
 * @returns Object with provider configuration status
 */
export const getConfiguredProviders = async (): Promise<Record<StorageProvider, boolean>> => {
  return {
    'cloudflare-r2': cloudflareR2Service.isR2Configured(),
    imgbb: imgbbService.isImgBBConfigured(),
    local: true, // Local storage is always available
    // Removed Supabase and Cloudinary - using R2 only
  };
};

export default {
  uploadImage,
  uploadVideo,
  getConfiguredProviders,
};
