import { NextRequest, NextResponse } from 'next/server';
import { fetchRssFeeds, fetchRssFeedItems, updateRssFeed } from '../../../lib/databaseService';
import { processRssFeed } from '../../../lib/rssProcessor';

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

    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Fetch all RSS feeds
    const feedsResult = await fetchRssFeeds();

    if (!feedsResult.success || !feedsResult.data) {
      return NextResponse.json(
        { error: 'Failed to fetch feeds' },
        { status: 500 }
      );
    }

    const feeds = feedsResult.data;
    let totalImported = 0;
    let totalErrors = 0;
    const results = [];

    // Process each feed that has auto_fetch enabled
    for (const feed of feeds) {
      if (!feed.auto_fetch) continue;

      try {
        // Get existing items to avoid duplicates
        const existingItemsResult = await fetchRssFeedItems(feed.id);
        const existingGuids = existingItemsResult.success && existingItemsResult.data
          ? existingItemsResult.data.map(item => item.rss_item_guid)
          : [];

        // Process the feed
        const result = await processRssFeed(feed, existingGuids);

        totalImported += result.newArticles;
        totalErrors += result.errors;

        // Update the last_fetched timestamp
        await updateRssFeed(feed.id, {
          last_fetched: new Date().toISOString()
        });

        results.push({
          feedId: feed.id,
          feedName: feed.name,
          success: result.success,
          newArticles: result.newArticles,
          errors: result.errors,
          message: result.message
        });
      } catch (error) {
        console.error(`Error processing feed ${feed.id} (${feed.name}):`, error);
        totalErrors++;
        results.push({
          feedId: feed.id,
          feedName: feed.name,
          success: false,
          newArticles: 0,
          errors: 1,
          message: `Error: ${error}`
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        processedFeeds: feeds.filter(f => f.auto_fetch).length,
        totalFeeds: feeds.length,
        importedCount: totalImported,
        errors: totalErrors,
        results,
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
