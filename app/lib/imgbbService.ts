/**
 * ImgBB Service
 * 
 * This service provides functions for uploading images to ImgBB.
 * It serves as an alternative to Supabase Storage.
 * Note: ImgBB is primarily for images, not videos.
 */

// ImgBB API key
const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || '';

/**
 * Uploads an image to ImgBB
 * 
 * @param file The image file to upload
 * @param name Optional name for the image
 * @returns Promise with the upload result
 */
export const uploadImage = async (
  file: File,
  name?: string
): Promise<{ url: string | null; error: string | null }> => {
  try {
    if (!IMGBB_API_KEY) {
      console.error('ImgBB API key is not configured');
      return {
        url: null,
        error: 'ImgBB API key is not configured',
      };
    }

    // Convert file to base64
    const base64 = await fileToBase64(file);
    const base64Data = base64.split(',')[1]; // Remove the data:image/jpeg;base64, part

    // Create form data
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', base64Data);
    
    if (name) {
      formData.append('name', name);
    }

    // Upload to ImgBB
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`ImgBB upload failed: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || 'ImgBB upload failed');
    }

    return {
      url: result.data.url,
      error: null,
    };
  } catch (error: unknown) {
    console.error('Error uploading image to ImgBB:', error);
    return {
      url: null,
      error: error.message || 'Failed to upload image',
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
 * Checks if ImgBB is properly configured
 * 
 * @returns Boolean indicating if ImgBB is configured
 */
export const isImgBBConfigured = (): boolean => {
  return !!IMGBB_API_KEY;
};

export default {
  uploadImage,
  isImgBBConfigured,
};
