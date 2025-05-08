import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Define allowed file types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg'
];

// Define max file sizes
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

// POST /api/upload - Upload a file
export async function POST(request: NextRequest) {
  try {
    // Check if using Supabase
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      return NextResponse.json(
        { error: 'Storage not configured', details: bucketError.message },
        { status: 500 }
      );
    }
    
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'image';
    const bucket = formData.get('bucket') as string || 'news-images';
    
    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (type === 'image' && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid image type. Allowed types: ' + ALLOWED_IMAGE_TYPES.join(', ') },
        { status: 400 }
      );
    }
    
    if (type === 'video' && !ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid video type. Allowed types: ' + ALLOWED_VIDEO_TYPES.join(', ') },
        { status: 400 }
      );
    }
    
    // Validate file size
    if (type === 'image' && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: `Image size exceeds maximum allowed size (${MAX_IMAGE_SIZE / 1024 / 1024}MB)` },
        { status: 400 }
      );
    }
    
    if (type === 'video' && file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: `Video size exceeds maximum allowed size (${MAX_VIDEO_SIZE / 1024 / 1024}MB)` },
        { status: 400 }
      );
    }
    
    // Check if bucket exists
    const bucketExists = buckets?.some(b => b.name === bucket);
    
    if (!bucketExists) {
      // Create bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: type === 'video' ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE,
      });
      
      if (createError) {
        return NextResponse.json(
          { error: 'Failed to create storage bucket', details: createError.message },
          { status: 500 }
        );
      }
    }
    
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);
    
    if (uploadError) {
      return NextResponse.json(
        { error: 'Failed to upload file', details: uploadError.message },
        { status: 500 }
      );
    }
    
    // Get the public URL
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return NextResponse.json({
      success: true,
      url: data.publicUrl
    });
  } catch (error: any) {
    console.error('Error in upload API:', error);
    return NextResponse.json(
      { error: 'An error occurred', details: error.message },
      { status: 500 }
    );
  }
}
