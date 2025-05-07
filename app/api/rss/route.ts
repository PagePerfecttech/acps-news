import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';
import { isSupabaseConfigured } from '../../lib/supabase';
import { getRssFeeds, addRssFeed, updateRssFeed, deleteRssFeed, processRssFeed } from '../../lib/rssService';

// GET /api/rss - Get all RSS feeds
export async function GET() {
  try {
    const usingSupabase = await isSupabaseConfigured();
    
    if (!usingSupabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }
    
    const feeds = await getRssFeeds();
    
    return NextResponse.json({
      success: true,
      data: feeds
    });
  } catch (error) {
    console.error('Error in GET /api/rss:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

// POST /api/rss - Create a new RSS feed
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
    
    // Validate required fields
    if (!body.name || !body.url || !body.category_id || !body.user_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const feed = await addRssFeed({
      name: body.name,
      url: body.url,
      category_id: body.category_id,
      user_id: body.user_id,
      active: body.active !== undefined ? body.active : true,
      fetch_frequency: body.fetch_frequency || 60
    });
    
    if (!feed) {
      return NextResponse.json(
        { error: 'Failed to create RSS feed' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: feed
    });
  } catch (error) {
    console.error('Error in POST /api/rss:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

// PUT /api/rss/:id - Update an RSS feed
export async function PUT(request: NextRequest) {
  try {
    const usingSupabase = await isSupabaseConfigured();
    
    if (!usingSupabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    
    // Get the feed ID from the URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing feed ID' },
        { status: 400 }
      );
    }
    
    const success = await updateRssFeed(id, body);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update RSS feed' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error in PUT /api/rss:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

// DELETE /api/rss/:id - Delete an RSS feed
export async function DELETE(request: NextRequest) {
  try {
    const usingSupabase = await isSupabaseConfigured();
    
    if (!usingSupabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }
    
    // Get the feed ID from the URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing feed ID' },
        { status: 400 }
      );
    }
    
    const success = await deleteRssFeed(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete RSS feed' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error in DELETE /api/rss:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
