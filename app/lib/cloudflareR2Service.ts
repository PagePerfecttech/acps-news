/**
 * Cloudflare R2 Storage Service
 * 
 * Handles uploading and managing files using Cloudflare R2 (S3-compatible storage)
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Types
export type R2UploadResult = {
  url: string | null;
  error: string | null;
};

// Configuration
const getR2Config = () => {
  return {
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || '',
    bucket: process.env.CLOUDFLARE_R2_BUCKET || 'vizajnews',
    publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL || '',
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  };
};

// Check if Cloudflare R2 is configured
export const isR2Configured = (): boolean => {
  const config = getR2Config();
  return !!(
    config.endpoint &&
    config.bucket &&
    config.publicUrl &&
    config.accessKeyId &&
    config.secretAccessKey
  );
};

// Create S3 client for Cloudflare R2
const createR2Client = () => {
  const config = getR2Config();
  
  if (!isR2Configured()) {
    throw new Error('Cloudflare R2 is not properly configured');
  }

  return new S3Client({
    region: 'auto', // Cloudflare R2 uses 'auto' as region
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
};

/**
 * Upload an image to Cloudflare R2
 */
export const uploadImage = async (
  file: File,
  folder: string = 'images'
): Promise<R2UploadResult> => {
  try {
    if (!isR2Configured()) {
      return {
        url: null,
        error: 'Cloudflare R2 is not configured',
      };
    }

    const config = getR2Config();
    const client = createR2Client();

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      CacheControl: 'public, max-age=31536000', // 1 year cache
    });

    await client.send(command);

    // Construct public URL
    const publicUrl = `${config.publicUrl}/${fileName}`;

    console.log('Successfully uploaded to Cloudflare R2:', publicUrl);

    return {
      url: publicUrl,
      error: null,
    };
  } catch (error: any) {
    console.error('Error uploading to Cloudflare R2:', error);
    return {
      url: null,
      error: error.message || 'Failed to upload to Cloudflare R2',
    };
  }
};

/**
 * Upload a video to Cloudflare R2
 */
export const uploadVideo = async (
  file: File,
  folder: string = 'videos'
): Promise<R2UploadResult> => {
  // Same implementation as uploadImage, just different folder
  return uploadImage(file, folder);
};

/**
 * Test Cloudflare R2 connection
 */
export const testConnection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!isR2Configured()) {
      return {
        success: false,
        error: 'Cloudflare R2 is not configured',
      };
    }

    const config = getR2Config();
    const client = createR2Client();

    // Try to list objects (this will test the connection)
    const command = new GetObjectCommand({
      Bucket: config.bucket,
      Key: 'test-connection', // This file doesn't need to exist
    });

    try {
      await client.send(command);
    } catch (error: any) {
      // If the error is "NoSuchKey", it means the connection works but the file doesn't exist
      // This is expected and means the connection is working
      if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
        return { success: true };
      }
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Cloudflare R2 connection test failed:', error);
    return {
      success: false,
      error: error.message || 'Connection test failed',
    };
  }
};

/**
 * Get R2 configuration status
 */
export const getConfigStatus = () => {
  const config = getR2Config();
  return {
    configured: isR2Configured(),
    endpoint: !!config.endpoint,
    bucket: !!config.bucket,
    publicUrl: !!config.publicUrl,
    credentials: !!(config.accessKeyId && config.secretAccessKey),
  };
};

export default {
  uploadImage,
  uploadVideo,
  testConnection,
  isR2Configured,
  getConfigStatus,
};
