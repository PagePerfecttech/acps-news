import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Define allowed file types - PNG prioritized
const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
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

// POST /api/upload/server - Server-side upload to Cloudflare R2
export async function POST(request: NextRequest) {
  try {
    console.log('Server-side R2 upload API called');

    // Check if R2 is configured
    const accountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID;
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    const publicUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL;

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
      return NextResponse.json(
        { error: 'Cloudflare R2 is not configured' },
        { status: 500 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'news-images';

    console.log('R2 upload request details:', {
      fileType: file?.type,
      fileSize: file?.size,
      folder
    });

    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Determine file type
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    // Validate file type
    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Allowed types: ' +
                 [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(', ')
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: `Image size exceeds maximum allowed size (${MAX_IMAGE_SIZE / 1024 / 1024}MB)` },
        { status: 400 }
      );
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: `Video size exceeds maximum allowed size (${MAX_VIDEO_SIZE / 1024 / 1024}MB)` },
        { status: 400 }
      );
    }

    // Generate a unique file name
    let fileExt = file.name.split('.').pop();

    // For site-assets folder (background images), prefer PNG extension
    if (folder === 'site-assets' && file.type === 'image/png') {
      fileExt = 'png';
    }

    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('Uploading to Cloudflare R2 with filename:', fileName);

    // Initialize S3 client for R2
    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: filePath,
      Body: buffer,
      ContentType: file.type
    });

    await s3.send(command);

    // Construct the public URL
    const fileUrl = `${publicUrl}/${filePath}`;

    // Add cache-busting parameter to prevent caching issues
    const finalUrl = `${fileUrl}?t=${Date.now()}`;

    console.log('Generated public URL (via R2):', finalUrl);

    return NextResponse.json({
      success: true,
      url: finalUrl,
      provider: 'r2'
    });
  } catch (error: any) {
    console.error('Error in server-side R2 upload API:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload to Cloudflare R2',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
