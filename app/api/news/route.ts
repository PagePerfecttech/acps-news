import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

// GET /api/news - Get all news articles
export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    const configured = await isSupabaseConfigured();
    if (!configured) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    const category = url.searchParams.get('category');

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('news_articles')
      .select(`
        *,
        categories(name, slug)
      `)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add category filter if provided
    if (category) {
      query = query.eq('category_id', category);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Failed to fetch articles: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      page,
      limit,
      total: count || 0,
      hasMore: (data?.length || 0) === limit
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

// POST /api/news - Create a new news article
export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    const configured = await isSupabaseConfigured();
    if (!configured) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content' },
        { status: 400 }
      );
    }

    // Create article object for Supabase
    const now = new Date().toISOString();
    const article = {
      title: body.title,
      content: body.content,
      summary: body.summary || '',
      category_id: body.category_id || 'general',
      image_url: body.image_url || '',
      video_url: body.video_url || '',
      video_type: body.video_type || '',
      author: body.author || 'Anonymous',
      published: body.published !== false,
      created_at: now,
      updated_at: now
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('news_articles')
      .insert([article])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Failed to save article: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
