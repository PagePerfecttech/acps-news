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
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const cloudflareAccountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID;
    const cloudflareR2AccessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const cloudflareR2SecretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    const cloudflareR2Bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    const cloudflareR2PublicUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL;
    
    // Return environment variables status
    return NextResponse.json({
      success: true,
      supabaseUrl: !!supabaseUrl,
      supabaseAnonKey: !!supabaseAnonKey,
      supabaseServiceRoleKey: !!supabaseServiceRoleKey,
      cloudflareAccountId: !!cloudflareAccountId,
      cloudflareR2AccessKeyId: !!cloudflareR2AccessKeyId,
      cloudflareR2SecretAccessKey: !!cloudflareR2SecretAccessKey,
      cloudflareR2Bucket: !!cloudflareR2Bucket,
      cloudflareR2PublicUrl: !!cloudflareR2PublicUrl,
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
