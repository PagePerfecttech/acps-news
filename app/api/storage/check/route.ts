/**
 * API Route for checking storage configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '../../../lib/supabase';
import { isR2Configured } from '../../../lib/r2Service';

// GET /api/storage/check - Check storage configuration
export async function GET(request: NextRequest) {
  try {
    // Check Supabase configuration
    const supabaseConfigured = await isSupabaseConfigured();
    
    // Check Cloudflare R2 configuration
    const r2Configured = isR2Configured();
    
    // Get R2 bucket name and public URL
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    const publicUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL;
    
    // Return configuration status
    return NextResponse.json({
      success: true,
      supabaseConfigured,
      r2Configured,
      bucketName,
      publicUrl,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error in GET /api/storage/check:', error);
    return NextResponse.json(
      { error: 'An error occurred checking storage configuration' },
      { status: 500 }
    );
  }
}
