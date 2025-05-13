/**
 * Media Service
 *
 * This service provides a unified interface for uploading media files.
 * It tries different storage providers in order of preference:
 * 1. Supabase Storage (if configured)
 * 2. Cloudinary (if configured)
 * 3. ImgBB (if configured, images only)
 * 4. Local storage fallback (for development/testing)
 */

// Import supabase service functions directly to avoid naming conflicts
import {
  uploadImage as uploadImageToSupabase,
  uploadVideo as uploadVideoToSupabase,
  isSupabaseConfigured
} from './supabaseService';

// Import cloudinary service with fallbacks
import * as cloudinaryServiceImport from './cloudinaryService';
const cloudinaryService = {
  uploadImage: cloudinaryServiceImport.uploadImage || (async () => ({ url: null, error: 'Cloudinary service not available' })),
  uploadVideo: cloudinaryServiceImport.uploadVideo || (async () => ({ url: null, error: 'Cloudinary service not available' })),
  isCloudinaryConfigured: cloudinaryServiceImport.isCloudinaryConfigured || (() => false),
};

// Import imgbb service with fallbacks
import * as imgbbServiceImport from './imgbbService';
const imgbbService = {
  uploadImage: imgbbServiceImport.uploadImage || (async () => ({ url: null, error: 'ImgBB service not available' })),
  isImgBBConfigured: imgbbServiceImport.isImgBBConfigured || (() => false),
};

// Storage provider types
export type StorageProvider = 'supabase' | 'cloudinary' | 'imgbb' | 'local';

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
        case 'supabase':
          if (await isSupabaseConfigured()) {
            console.log('Supabase is configured, attempting upload...');
            const uploadResult = await uploadImageToSupabase(file, folder);
            console.log('Supabase upload result:', uploadResult);
            result = { ...uploadResult, provider };
          } else {
            console.log('Supabase is not configured, skipping');
          }
          break;

        case 'cloudinary':
          if (cloudinaryService.isCloudinaryConfigured()) {
            console.log('Cloudinary is configured, attempting upload...');
            const uploadResult = await cloudinaryService.uploadImage(file, folder);
            console.log('Cloudinary upload result:', uploadResult);
            result = { ...uploadResult, provider };
          } else {
            console.log('Cloudinary is not configured, skipping');
          }
          break;

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
        case 'supabase':
          if (await isSupabaseConfigured()) {
            const uploadResult = await uploadVideoToSupabase(file);
            result = { ...uploadResult, provider };
          }
          break;

        case 'cloudinary':
          if (cloudinaryService.isCloudinaryConfigured()) {
            const uploadResult = await cloudinaryService.uploadVideo(file);
            result = { ...uploadResult, provider };
          }
          break;

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
  // Prioritize Cloudinary over Supabase
  const defaultOrder: StorageProvider[] = ['cloudinary', 'supabase', 'imgbb', 'local'];

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
    supabase: await isSupabaseConfigured(),
    cloudinary: cloudinaryService.isCloudinaryConfigured(),
    imgbb: imgbbService.isImgBBConfigured(),
    local: true, // Local storage is always available
  };
};

export default {
  uploadImage,
  uploadVideo,
  getConfiguredProviders,
};
