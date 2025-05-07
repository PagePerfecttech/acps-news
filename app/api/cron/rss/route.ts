import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '../../../lib/supabase';
import { processAllRssFeeds } from '../../../lib/rssService';

// This endpoint is designed to be called by a cron job service like Vercel Cron
// It will process all active RSS feeds and import new articles

export async function GET(request: NextRequest) {
  try {
    // Check for a secret key to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;
    
    // If a secret is configured, validate it
    if (expectedSecret && (!authHeader || authHeader !== `Bearer ${expectedSecret}`)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const usingSupabase = await isSupabaseConfigured();
    
    if (!usingSupabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }
    
    // Process all active RSS feeds
    const importedCount = await processAllRssFeeds();
    
    return NextResponse.json({
      success: true,
      data: {
        importedCount,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in RSS cron job:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
