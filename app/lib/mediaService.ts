/**
 * Media Service
 *
 * This service provides a unified interface for uploading media files.
 * It tries different storage providers in order of preference:
 * 1. Cloudflare R2 (primary storage)
 * 2. ImgBB (emergency fallback for images only)
 * 3. Local storage fallback (for development/testing)
 *
 * Note: Cloudinary and Supabase storage have been removed
 */

// Import imgbb service with fallbacks
import * as imgbbServiceImport from './imgbbService';
const imgbbService = {
  uploadImage: imgbbServiceImport.uploadImage || (async () => ({ url: null, error: 'ImgBB service not available' })),
  isImgBBConfigured: imgbbServiceImport.isImgBBConfigured || (() => false),
};

// Import r2 service with fallbacks
import * as r2ServiceImport from './r2Service';
const r2Service = {
  uploadImage: r2ServiceImport.uploadImage || (async () => ({ url: null, error: 'Cloudflare R2 service not available' })),
  uploadVideo: r2ServiceImport.uploadVideo || (async () => ({ url: null, error: 'Cloudflare R2 service not available' })),
  isR2Configured: r2ServiceImport.isR2Configured || (() => false),
};

// Storage provider types
export type StorageProvider = 'r2' | 'imgbb' | 'local';

// Upload result interface
export interface UploadResult {
  url: string | null;
  error: string | null;
  provider?: StorageProvider;
}

/**
 * Uploads an image using available storage providers
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

  // Determine the order of providers to try
  const providers = determineProviderOrder(preferredProvider);
  console.log('Providers to try in order:', providers);

  // Try each provider in order
  for (const provider of providers) {
    try {
      console.log(`Attempting to upload image using ${provider}...`);

      let result: UploadResult | null = null;

      switch (provider) {
        case 'r2':
          if (r2Service.isR2Configured()) {
            console.log('Cloudflare R2 is configured, attempting upload...');
            const uploadResult = await r2Service.uploadImage(file, folder);
            console.log('R2 upload result:', uploadResult);
            result = { ...uploadResult, provider };
          } else {
            console.log('Cloudflare R2 is not configured, skipping');
          }
          break;

        // Supabase and Cloudinary cases removed

        case 'imgbb':
          if (imgbbService.isImgBBConfigured()) {
            console.log('ImgBB is configured, attempting upload...');
            const uploadResult = await imgbbService.uploadImage(file, fileName);
            console.log('ImgBB upload result:', uploadResult);
            result = { ...uploadResult, provider };
          } else {
            console.log('ImgBB is not configured, skipping');
          }
          break;

        case 'local':
          // Local storage fallback (for development/testing)
          console.log('Using local storage fallback...');
          const localResult = await storeFileLocally(file, 'image');
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

  // If all providers fail
  return {
    url: null,
    error: 'Failed to upload image with any available provider',
    provider: 'none' as any,
  };
};

/**
 * Uploads a video using available storage providers
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
  const { preferredProvider, fileName } = options;

  // Determine the order of providers to try (excluding ImgBB which doesn&apos;t support videos)
  const providers = determineProviderOrder(preferredProvider).filter(p => p !== 'imgbb');

  // Try each provider in order
  for (const provider of providers) {
    try {
      console.log(`Attempting to upload video using ${provider}...`);

      let result: UploadResult | null = null;

      switch (provider) {
        case 'r2':
          if (r2Service.isR2Configured()) {
            console.log('Cloudflare R2 is configured, attempting video upload...');
            const uploadResult = await r2Service.uploadVideo(file);
            console.log('R2 video upload result:', uploadResult);
            result = { ...uploadResult, provider };
          }
          break;

        // Supabase and Cloudinary cases removed

        case 'local':
          // Local storage fallback (for development/testing)
          const localResult = await storeFileLocally(file, 'video');
          result = { ...localResult, provider };
          break;
      }

      if (result && result.url) {
        console.log(`Successfully uploaded video using ${provider}`);
        return result;
      }
    } catch (error) {
      console.error(`Error uploading video with ${provider}:`, error);
      // Continue to next provider
    }
  }

  // If all providers fail
  return {
    url: null,
    error: 'Failed to upload video with any available provider',
    provider: 'none' as any,
  };
};

/**
 * Determines the order of providers to try based on preference and availability
 *
 * @param preferredProvider Optional preferred provider
 * @returns Array of providers in order of preference
 */
const determineProviderOrder = (preferredProvider?: StorageProvider): StorageProvider[] => {
  // Prioritize R2 as primary storage
  const defaultOrder: StorageProvider[] = ['r2', 'imgbb', 'local'];

  if (!preferredProvider) {
    return defaultOrder;
  }

  // Move preferred provider to the front
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
    // In a real implementation, this would store the file on the server
    // For now, we&apos;ll just create an object URL for the browser
    const url = URL.createObjectURL(file);

    // Store the URL in localStorage for persistence across page refreshes
    const key = `flipnews_local_${type}_${Date.now()}`;
    localStorage.setItem(key, url);

    console.warn('Using local storage for file. This URL will not persist across sessions.');

    return {
      url,
      error: null,
    };
  } catch (error: unknown) {
    console.error('Error storing file locally:', error);
    return {
      url: null,
      error: error.message || 'Failed to store file locally',
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
    r2: r2Service.isR2Configured(),
    imgbb: imgbbService.isImgBBConfigured(),
    local: true, // Local storage is always available
  };
};

export default {
  uploadImage,
  uploadVideo,
  getConfiguredProviders,
};
