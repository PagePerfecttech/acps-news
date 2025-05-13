import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import * as cloudinary from 'cloudinary';

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

// Cloudinary configuration - hardcoded for reliability
const cloudinaryConfig = {
  cloud_name: 'dejesejon',
  api_key: '137179496379745',
  api_secret: '2iwEKWNqCHLtSWKu9KvFv06zpDw',
};

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: cloudinaryConfig.cloud_name,
  api_key: cloudinaryConfig.api_key,
  api_secret: cloudinaryConfig.api_secret,
  secure: true,
});

// POST /api/upload/server - Server-side upload to Cloudinary
export async function POST(request: NextRequest) {
  try {
    console.log('Server-side upload API called');

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'image';
    const folder = formData.get('folder') as string || 'news-images';

    console.log('Upload request details:', {
      fileType: file?.type,
      fileSize: file?.size,
      type,
      folder
    });

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

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    
    console.log('Uploading to Cloudinary with filename:', fileName);

    // Upload to Cloudinary using server-side SDK
    try {
      // Create a temporary file path for Cloudinary upload
      const uploadOptions = {
        public_id: fileName.split('.')[0], // Remove extension for public_id
        folder: folder,
        resource_type: type === 'image' ? 'image' : 'video',
        tags: ['flipnews', folder],
      };
      
      console.log('Cloudinary upload options:', uploadOptions);
      
      // Upload the buffer to Cloudinary
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              console.log('Cloudinary upload success:', {
                public_id: result?.public_id,
                url: result?.secure_url
              });
              resolve(result);
            }
          }
        );
        
        // Convert ArrayBuffer to Buffer and pipe to upload stream
        const bufferData = Buffer.from(buffer);
        const Readable = require('stream').Readable;
        const readableStream = new Readable();
        readableStream.push(bufferData);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
      });
      
      const result = await uploadPromise as any;
      
      if (!result || !result.secure_url) {
        console.error('No secure URL returned from Cloudinary');
        return NextResponse.json(
          { error: 'Failed to get secure URL from Cloudinary' },
          { status: 500 }
        );
      }
      
      // Make sure the URL is properly formatted
      let publicUrl = result.secure_url;
      
      // Log the URL for debugging
      console.log('Generated public URL (via Cloudinary):', publicUrl);
      
      // Add cache-busting parameter to prevent caching issues
      publicUrl = `${publicUrl}?t=${Date.now()}`;
      
      return NextResponse.json({
        success: true,
        url: publicUrl,
        provider: 'cloudinary',
        public_id: result.public_id
      });
    } catch (uploadError: any) {
      console.error('Error uploading to Cloudinary:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload to Cloudinary', details: uploadError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in server-side upload API:', error);
    return NextResponse.json(
      { error: 'An error occurred', details: error.message },
      { status: 500 }
    );
  }
}
