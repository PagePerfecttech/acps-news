/**
 * API Route for checking environment variables
 */

import { NextRequest, NextResponse } from 'next/server';

// GET /api/env-check - Check environment variables
export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const cloudflareAccountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID;
    const cloudflareR2AccessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const cloudflareR2SecretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    const cloudflareR2Bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    const cloudflareR2PublicUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL;

    // Return environment variables status with more details
    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV || 'unknown',
      supabase: {
        url: !!supabaseUrl,
        urlValue: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'missing',
        anonKey: !!supabaseAnonKey,

      },
      cloudflare: {
        accountId: !!cloudflareAccountId,
        accountIdValue: cloudflareAccountId ? cloudflareAccountId.substring(0, 10) + '...' : 'missing',
        r2AccessKeyId: !!cloudflareR2AccessKeyId,
        r2AccessKeyIdValue: cloudflareR2AccessKeyId ? cloudflareR2AccessKeyId.substring(0, 10) + '...' : 'missing',
        r2SecretAccessKey: !!cloudflareR2SecretAccessKey,
        r2Bucket: !!cloudflareR2Bucket,
        r2BucketValue: cloudflareR2Bucket || 'missing',
        r2PublicUrl: !!cloudflareR2PublicUrl,
        r2PublicUrlValue: cloudflareR2PublicUrl || 'missing'
      },
      allConfigured: !!(supabaseUrl && supabaseAnonKey && cloudflareAccountId &&
        cloudflareR2AccessKeyId && cloudflareR2SecretAccessKey &&
        cloudflareR2Bucket && cloudflareR2PublicUrl),
      timestamp: Date.now()
    });
  } catch (error: any) {
    console.error('Error in GET /api/env-check:', error);
    return NextResponse.json(
      { error: 'An error occurred checking environment variables' },
      { status: 500 }
    );
  }
}
