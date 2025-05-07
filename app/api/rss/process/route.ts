import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '../../../lib/supabase';
import { fetchRssFeedById, fetchRssFeedItems, updateRssFeed, fetchRssFeeds } from '../../../lib/databaseService';
import { processRssFeed } from '../../../lib/rssProcessor';
import { RssFeed } from '../../../types';

// POST /api/rss/process - Process all RSS feeds or a specific feed
export async function POST(request: NextRequest) {
  try {
    const usingSupabase = await isSupabaseConfigured();

    if (!usingSupabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();

    if (body.feedId) {
      // Process a specific feed
      const feedResult = await fetchRssFeedById(body.feedId);

      if (!feedResult.success || !feedResult.data) {
        return NextResponse.json(
          { error: 'Feed not found' },
          { status: 404 }
        );
      }

      const feed = feedResult.data;

      // Get existing items to avoid duplicates
      const existingItemsResult = await fetchRssFeedItems(body.feedId);
      const existingGuids = existingItemsResult.success && existingItemsResult.data
        ? existingItemsResult.data.map(item => item.guid)
        : [];

      // Process the feed
      const result = await processRssFeed(feed, existingGuids);

      // Update the last_fetched timestamp
      await updateRssFeed(body.feedId, {
        last_fetched: new Date().toISOString()
      });

      return NextResponse.json({
        success: result.success,
        data: {
          feedId: body.feedId,
          feedName: feed.name,
          importedCount: result.newArticles,
          errors: result.errors,
          message: result.message
        }
      });
    } else {
      // Process all feeds
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

      for (const feed of feeds) {
        if (!feed.auto_fetch) continue;

        // Get existing items to avoid duplicates
        const existingItemsResult = await fetchRssFeedItems(feed.id);
        const existingGuids = existingItemsResult.success && existingItemsResult.data
          ? existingItemsResult.data.map(item => item.guid)
          : [];

        // Process the feed
        const result = await processRssFeed(feed, existingGuids);

        totalImported += result.newArticles;
        totalErrors += result.errors;

        // Update the last_fetched timestamp
        await updateRssFeed(feed.id, {
          last_fetched: new Date().toISOString()
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          processedFeeds: feeds.filter(f => f.auto_fetch).length,
          totalFeeds: feeds.length,
          importedCount: totalImported,
          errors: totalErrors
        }
      });
    }
  } catch (error) {
    console.error('Error in POST /api/rss/process:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing RSS feeds' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
