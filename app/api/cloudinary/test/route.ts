/**
 * API Route for testing Cloudinary configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Cloudinary configuration values - hardcoded for now to ensure they work
const cloudinaryConfig = {
  cloud_name: 'dejesejon',
  api_key: '137179496379745',
  api_secret: '2iwEKWNqCHLtSWKu9KvFv06zpDw',
};

// Simple function to generate a signature for Cloudinary uploads
function generateSignature(params: Record<string, any>, apiSecret: string): string {
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
    
  console.log('Signature param string:', paramString);

  // Generate the signature using HMAC SHA-1
  const signature = crypto
    .createHmac('sha1', apiSecret)
    .update(paramString)
    .digest('hex');
    
  return signature;
}

export async function GET(request: NextRequest) {
  try {
    console.log('Cloudinary test API called');

    // Check if Cloudinary is configured
    if (!cloudinaryConfig.api_secret) {
      return NextResponse.json(
        { error: 'Cloudinary API secret is not configured' },
        { status: 500 }
      );
    }

    // Generate timestamp
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Create test parameters
    const params = {
      timestamp,
      folder: 'test',
      resource_type: 'image',
    };
    
    // Generate signature
    const signature = generateSignature(params, cloudinaryConfig.api_secret);
    
    // Return test data
    return NextResponse.json({
      status: 'success',
      config: {
        cloud_name: cloudinaryConfig.cloud_name,
        api_key: cloudinaryConfig.api_key,
      },
      test: {
        timestamp,
        params,
        signature,
      },
      message: 'Cloudinary is properly configured'
    });
  } catch (error: any) {
    console.error('Error in Cloudinary test API:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
