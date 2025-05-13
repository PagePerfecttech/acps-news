/**
 * API Route for generating Cloudinary upload signatures
 *
 * This route generates a signature for client-side Cloudinary uploads,
 * which is more secure than exposing the API secret in the browser.
 */

import { NextRequest, NextResponse } from 'next/server';
// For server-side routes, we can use a different approach
// We'll implement our own signature generation without requiring the full cloudinary package

// Simple function to generate a signature for Cloudinary uploads
function generateSignature(params: Record<string, any>, apiSecret: string): string {
  // In a real implementation, we would use a crypto library to generate the signature
  // For now, we'll use a simplified approach
  const crypto = require('crypto');

  // Sort the parameters
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc: Record<string, any>, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

  // Create a string with key=value pairs
  const paramString = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  // Generate the signature using HMAC SHA-1
  return crypto
    .createHmac('sha1', apiSecret)
    .update(paramString)
    .digest('hex');
}

// Cloudinary configuration values
const cloudinaryConfig = {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
};

export async function POST(request: NextRequest) {
  try {
    // Check if Cloudinary is configured
    if (!cloudinaryConfig.api_secret) {
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

    // Generate signature using our custom function
    const signature = generateSignature(params, cloudinaryConfig.api_secret);

    // Return signature and other required parameters
    return NextResponse.json({
      signature,
      timestamp,
      api_key: cloudinaryConfig.api_key,
      cloud_name: cloudinaryConfig.cloud_name,
    });
  } catch (error: any) {
    console.error('Error generating Cloudinary signature:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate signature' },
      { status: 500 }
    );
  }
}
