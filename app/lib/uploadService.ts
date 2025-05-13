import { supabase } from './supabase';
;

// Define bucket names
const BUCKETS = {
  NEWS_IMAGES: 'news-images',
  USER_AVATARS: 'user-avatars',
  SITE_ASSETS: 'site-assets',
};

// Initialize buckets if they don&apos;t exist
export const initializeBuckets = async (): Promise<boolean> => {
  try {
    // Check if buckets exist and create them if they don&apos;t
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
    // Check if bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

    if (bucketError) {
      console.error('Error listing buckets:', bucketError);
      // If we can&apos;t list buckets, we&apos;ll try to upload anyway
      console.log('Continuing with upload despite bucket listing error...');
    } else {
      const bucketExists = buckets?.some(b => b.name === bucket);

      if (!bucketExists) {
        console.warn(`⚠️ Bucket ${bucket} doesn&apos;t exist! Please create it manually in the Supabase dashboard.`);
        console.warn('Go to: https://supabase.com/dashboard/project/tnaqvbrflguwpeafwclz/storage/buckets');
        console.warn('Attempting to upload anyway, but this will likely fail...');
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
  } catch (error: unknown) {
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

    // Check if bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

    if (bucketError) {
      console.error('Error listing buckets:', bucketError);
      // If we can&apos;t list buckets, we&apos;ll try to upload anyway
      console.log('Continuing with upload despite bucket listing error...');
    } else {
      const bucketExists = buckets?.some(b => b.name === bucket);

      if (!bucketExists) {
        console.warn(`⚠️ Bucket ${bucket} doesn&apos;t exist! Please create it manually in the Supabase dashboard.`);
        console.warn('Go to: https://supabase.com/dashboard/project/tnaqvbrflguwpeafwclz/storage/buckets');
        console.warn('Attempting to upload anyway, but this will likely fail...');
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
  } catch (error: unknown) {
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
  } catch (error: unknown) {
    console.error('Error in deleteFile:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
};
