/**
 * Cloudinary Service
 *
 * This service provides functions for uploading images and videos to Cloudinary.
 * It serves as an alternative to Supabase Storage.
 * Fixed to prevent "t.map is not a function" error.
 */

// We need to use a browser-compatible approach for Cloudinary
// This is a mock implementation that will be replaced with API calls
const cloudinary = {
  config: (config?: any) => {
    console.log('Cloudinary config called with:', config);
    return {};
  },
  uploader: {
    upload: async () => ({ secure_url: null }),
  },
  utils: {
    api_sign_request: (params: any, secret: string) => {
      // This is just a mock - the actual signing will happen server-side
      console.log('Cloudinary signature requested for:', params);
      return 'mock-signature';
    },
  },
};

// Cloudinary configuration
// Note: These values should be set in your environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
});

// Define folder names for different types of media
const FOLDERS = {
  NEWS_IMAGES: 'news-images',
  NEWS_VIDEOS: 'news-videos',
  USER_AVATARS: 'user-avatars',
  SITE_ASSETS: 'site-assets',
};

/**
 * Uploads a file to Cloudinary
 *
 * @param file The file to upload (as a base64 string or URL)
 * @param options Upload options
 * @returns Promise with upload result
 */
const uploadToCloudinary = async (
  file: string,
  options: {
    folder: string;
    resource_type: 'image' | 'video' | 'auto';
    public_id?: string;
    tags?: string[];
    transformation?: any;
  }
): Promise<any> => {
  try {
    // For server-side uploads
    if (typeof window === 'undefined') {
      return await cloudinary.uploader.upload(file, options);
    }

    // For client-side uploads, we need to use the upload widget or a signed upload
    // This is a simplified version that uses a pre-signed URL approach
    const response = await fetch('/api/cloudinary/signature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        folder: options.folder,
        resource_type: options.resource_type,
        public_id: options.public_id,
        tags: options.tags,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get upload signature');
    }

    const { signature, timestamp, api_key } = await response.json();

    // Create form data for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', api_key);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', options.folder);
    formData.append('resource_type', options.resource_type);

    if (options.public_id) {
      formData.append('public_id', options.public_id);
    }

    if (options.tags && Array.isArray(options.tags)) {
      formData.append('tags', options.tags.join(','));
    }

    // Get cloud name from environment variable directly to avoid potential issues
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';

    // Upload to Cloudinary
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${options.resource_type}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload to Cloudinary');
    }

    return await uploadResponse.json();
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Uploads an image to Cloudinary
 *
 * @param file The image file (as a base64 string or URL)
 * @param folder The folder to upload to (defaults to news-images)
 * @returns Promise with the upload result
 */
export const uploadImage = async (
  file: File | string,
  folder: 'news-images' | 'user-avatars' | 'site-assets' = 'news-images'
): Promise<{ url: string | null; error: string | null }> => {
  try {
    // Convert File to base64 if needed
    let fileData = file;
    if (file instanceof File) {
      fileData = await fileToBase64(file);
    }

    const result = await uploadToCloudinary(fileData as string, {
      folder,
      resource_type: 'image',
      tags: folder ? ['flipnews', folder] : ['flipnews'],
    });

    return {
      url: result.secure_url,
      error: null,
    };
  } catch (error: any) {
    console.error('Error uploading image to Cloudinary:', error);
    return {
      url: null,
      error: error.message || 'Failed to upload image',
    };
  }
};

/**
 * Uploads a video to Cloudinary
 *
 * @param file The video file (as a base64 string or URL)
 * @returns Promise with the upload result
 */
export const uploadVideo = async (
  file: File | string
): Promise<{ url: string | null; error: string | null }> => {
  try {
    // Convert File to base64 if needed
    let fileData = file;
    if (file instanceof File) {
      fileData = await fileToBase64(file);
    }

    const result = await uploadToCloudinary(fileData as string, {
      folder: FOLDERS.NEWS_VIDEOS,
      resource_type: 'video',
      tags: ['flipnews', 'video'],
    });

    return {
      url: result.secure_url,
      error: null,
    };
  } catch (error: any) {
    console.error('Error uploading video to Cloudinary:', error);
    return {
      url: null,
      error: error.message || 'Failed to upload video',
    };
  }
};

/**
 * Converts a File object to a base64 string
 *
 * @param file The file to convert
 * @returns Promise with the base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Checks if Cloudinary is properly configured
 *
 * @returns Boolean indicating if Cloudinary is configured
 */
export const isCloudinaryConfigured = (): boolean => {
  return !!(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

export default {
  uploadImage,
  uploadVideo,
  isCloudinaryConfigured,
  FOLDERS,
};
