import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

// Define bucket names
const BUCKETS = {
  NEWS_IMAGES: 'news-images',
  USER_AVATARS: 'user-avatars',
  SITE_ASSETS: 'site-assets',
};

// Initialize buckets if they don't exist
export const initializeBuckets = async (): Promise<boolean> => {
  try {
    // Check if buckets exist and create them if they don't
    for (const bucketName of Object.values(BUCKETS)) {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });

        if (error) {
          console.error(`Error creating bucket ${bucketName}:`, error);
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error initializing storage buckets:', error);
    return false;
  }
};

// Upload an image file
export const uploadImage = async (
  file: File,
  bucket: 'news-images' | 'user-avatars' | 'site-assets' = 'news-images'
): Promise<{ url: string | null; error: string | null }> => {
  try {
    // Check if bucket exists and create it if it doesn't
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucket);

    if (!bucketExists) {
      console.log(`Bucket ${bucket} doesn't exist, creating it...`);
      const { error } = await supabase.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });

      if (error) {
        console.error(`Error creating bucket ${bucket}:`, error);
        return { url: null, error: `Failed to create storage bucket: ${error.message}` };
      }
    }

    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileData, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return { url: null, error: uploadError.message };
    }

    // Get the public URL
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (error: any) {
    console.error('Error in uploadImage:', error);
    return { url: null, error: error.message || 'Unknown error' };
  }
};

// Upload a video file
export const uploadVideo = async (
  file: File
): Promise<{ url: string | null; error: string | null }> => {
  try {
    const bucket = 'news-videos';

    // Check if bucket exists and create it if it doesn't
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucket);

    if (!bucketExists) {
      console.log(`Bucket ${bucket} doesn't exist, creating it...`);
      const { error } = await supabase.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: 50 * 1024 * 1024, // 50MB
      });

      if (error) {
        console.error(`Error creating bucket ${bucket}:`, error);
        return { url: null, error: `Failed to create storage bucket: ${error.message}` };
      }
    }

    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileData, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading video:', uploadError);
      return { url: null, error: uploadError.message };
    }

    // Get the public URL
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (error: any) {
    console.error('Error in uploadVideo:', error);
    return { url: null, error: error.message || 'Unknown error' };
  }
};

// Delete a file
export const deleteFile = async (
  url: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    // Extract the bucket and file path from the URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const bucketName = pathParts[1];
    const filePath = pathParts.slice(2).join('/');

    // Delete the file
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error in deleteFile:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
};
