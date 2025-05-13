/**
 * API Route for generating Cloudinary upload signatures
 *
 * This route generates a signature for client-side Cloudinary uploads,
 * which is more secure than exposing the API secret in the browser.
 */

import { NextRequest, NextResponse } from 'next/server';
// Try to import cloudinary, but provide a fallback if it fails
let cloudinary: any;
try {
  const cloudinaryModule = require('cloudinary');
  cloudinary = cloudinaryModule.v2;
} catch (error) {
  console.error('Failed to import cloudinary in API route:', error);
  // Create a mock cloudinary object with the same interface
  cloudinary = {
    config: () => ({}),
    utils: {
      api_sign_request: () => '',
    },
  };
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
});

export async function POST(request: NextRequest) {
  try {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'Cloudinary API secret is not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { folder, resource_type = 'image', public_id, tags } = body;

    // Generate timestamp
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Create signature parameters
    const params: Record<string, any> = {
      timestamp,
      folder,
      resource_type,
    };

    if (public_id) {
      params.public_id = public_id;
    }

    if (tags && Array.isArray(tags)) {
      params.tags = tags.join(',');
    }

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET
    );

    // Return signature and other required parameters
    return NextResponse.json({
      signature,
      timestamp,
      api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    });
  } catch (error: any) {
    console.error('Error generating Cloudinary signature:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate signature' },
      { status: 500 }
    );
  }
}
