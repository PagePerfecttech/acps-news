/**
 * API Route for managing news articles
 * 
 * This route bypasses RLS policies by using the service role key
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Create Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/admin/news - Get all news articles
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching news articles via admin API');

    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const page = parseInt(url.searchParams.get('page') || '1');
    const category = url.searchParams.get('category');

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build query
    let query = supabaseAdmin
      .from('news_articles')
      .select(`
        *,
        categories(name, slug)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add category filter if provided
    if (category) {
      query = query.eq('categories.slug', category);
    }

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Failed to fetch articles: ${error.message}` },
        { status: 500 }
      );
    }

    console.log(`Fetched ${data?.length || 0} articles from Supabase`);

    return NextResponse.json({
      success: true,
      data: data || [],
      page,
      limit,
      total: count,
      hasMore: data && data.length === limit
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/news:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

// POST /api/admin/news - Create a new news article
export async function POST(request: NextRequest) {
  try {
    console.log('Creating news article via admin API');

    // Parse request body
    const body = await request.json();
    console.log('Received article data:', body);

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
      author: body.author || 'Admin',
      published: body.published !== false,
      created_at: now,
      updated_at: now
    };

    console.log('Inserting article into Supabase:', article);

    // Insert into Supabase
    const { data, error } = await supabaseAdmin
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

    console.log('Article saved successfully:', data);

    return NextResponse.json({
      success: true,
      data: data,
      id: data.id
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/news:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
