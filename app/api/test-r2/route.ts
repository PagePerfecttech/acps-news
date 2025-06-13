import { NextRequest, NextResponse } from 'next/server';
import { isR2Configured } from '../../lib/r2Service';

// GET /api/test-r2 - Test Cloudflare R2 configuration
export async function GET(request: NextRequest) {
  try {
    const isConfigured = isR2Configured();
    
    const config = {
      accountId: !!process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID,
      accessKeyId: !!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: !!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      bucketName: !!process.env.CLOUDFLARE_R2_BUCKET_NAME,
      publicUrl: !!process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL,
    };

    return NextResponse.json({
      configured: isConfigured,
      config,
      message: isConfigured 
        ? 'Cloudflare R2 is properly configured' 
        : 'Cloudflare R2 configuration is incomplete',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error testing R2 configuration:', error);
    return NextResponse.json(
      { 
        error: 'Failed to test R2 configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
