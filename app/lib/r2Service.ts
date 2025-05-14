/**
 * Cloudflare R2 Service
 *
 * This service provides functions for uploading images and videos to Cloudflare R2.
 * It serves as an alternative to Supabase Storage and Cloudinary.
 */

import { v4 as uuidv4 } from 'uuid';

// Define folder names for different types of media
const FOLDERS = {
  NEWS_IMAGES: 'news-images',
  NEWS_VIDEOS: 'news-videos',
  USER_AVATARS: 'user-avatars',
  SITE_ASSETS: 'site-assets',
};

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Check if Cloudflare R2 is configured
 * @returns boolean indicating if R2 is configured
 */
export const isR2Configured = (): boolean => {
  const accountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  const publicUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL;

  const isConfigured = !!(accountId && accessKeyId && secretAccessKey && bucketName && publicUrl);
  console.log('Cloudflare R2 configured:', isConfigured);
  return isConfigured;
};

/**
 * Uploads a file to Cloudflare R2 via the server API
 * 
 * @param file The file to upload
 * @param options Upload options
 * @returns Promise with the upload result
 */
const uploadToR2 = async (
  file: File,
  options: {
    folder: string;
    fileName?: string;
  }
): Promise<{ url: string | null; error: string | null }> => {
  try {
    console.log('Starting R2 upload process...', {
      folder: options.folder,
      fileName: options.fileName,
      fileType: file.type,
      fileSize: file.size
    });

    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', options.folder);
    
    if (options.fileName) {
      formData.append('fileName', options.fileName);
    }

    // Call our server API endpoint that handles R2 uploads
    const response = await fetch('/api/upload/r2', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('R2 upload failed:', errorData);
      return {
        url: null,
        error: errorData.error || `Upload failed with status ${response.status}`,
      };
    }

    const data = await response.json();
    console.log('R2 upload successful:', data);

    return {
      url: data.url,
      error: null,
    };
  } catch (error) {
    console.error('Error in uploadToR2:', error);
    return {
      url: null,
      error: error instanceof Error ? error.message : 'Unknown error during R2 upload',
    };
  }
};

/**
 * Uploads an image to Cloudflare R2
 *
 * @param file The image file
 * @param folder The folder to upload to (defaults to news-images)
 * @returns Promise with the upload result
 */
export const uploadImage = async (
  file: File,
  folder: 'news-images' | 'user-avatars' | 'site-assets' = 'news-images'
): Promise<{ url: string | null; error: string | null }> => {
  try {
    console.log('Uploading image to Cloudflare R2...', {
      fileType: file.type,
      fileSize: file.size,
      folder
    });

    // Generate a unique filename if needed
    const fileName = `${uuidv4()}.${file.name.split('.').pop()}`;

    return await uploadToR2(file, {
      folder,
      fileName
    });
  } catch (error) {
    console.error('Error in R2 uploadImage:', error);
    return {
      url: null,
      error: error instanceof Error ? error.message : 'Unknown error during image upload to R2',
    };
  }
};

/**
 * Uploads a video to Cloudflare R2
 *
 * @param file The video file
 * @returns Promise with the upload result
 */
export const uploadVideo = async (
  file: File
): Promise<{ url: string | null; error: string | null }> => {
  try {
    console.log('Uploading video to Cloudflare R2...');

    // Generate a unique filename
    const fileName = `${uuidv4()}.${file.name.split('.').pop()}`;

    return await uploadToR2(file, {
      folder: FOLDERS.NEWS_VIDEOS,
      fileName
    });
  } catch (error) {
    console.error('Error in R2 uploadVideo:', error);
    return {
      url: null,
      error: error instanceof Error ? error.message : 'Unknown error during video upload to R2',
    };
  }
};
