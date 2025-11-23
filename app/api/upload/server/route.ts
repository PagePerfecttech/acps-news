import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

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

// POST /api/upload/server - Server-side upload to Cloudflare R2 or Local Storage
export async function POST(request: NextRequest) {
  try {
    console.log('Server-side upload API called');

    // Check if R2 is configured
    const accountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID;
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    const publicUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL;

    const isR2Configured = accountId && accessKeyId && secretAccessKey && bucketName && publicUrl;

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'news-images';

    console.log('Upload request details:', {
      fileType: file?.type,
      fileSize: file?.size,
      folder,
      storage: isR2Configured ? 'R2' : 'Local'
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

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (isR2Configured) {
      // Upload to R2
      const filePath = `${folder}/${fileName}`;
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

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: filePath,
        Body: buffer,
        ContentType: file.type
      });

      await s3.send(command);

      // Construct the public URL
      const fileUrl = `${publicUrl}/${filePath}`;
      const finalUrl = `${fileUrl}?t=${Date.now()}`;

      console.log('Generated public URL (via R2):', finalUrl);

      return NextResponse.json({
        success: true,
        url: finalUrl,
        provider: 'r2'
      });
    } else {
      // Upload to Local Storage (public/uploads)
      console.log('Uploading to local storage with filename:', fileName);

      const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);

      // Ensure directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);

      const fileUrl = `/uploads/${folder}/${fileName}`;
      console.log('Generated public URL (via Local):', fileUrl);

      return NextResponse.json({
        success: true,
        url: fileUrl,
        provider: 'local'
      });
    }
  } catch (error: any) {
    console.error('Error in server-side upload API:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
