/**
 * API Route for managing news articles
 * 
 * This route bypasses RLS policies by using the service role key
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Note: Supabase has been removed - this now returns mock data
// for compatibility during the R2 migration

// GET /api/admin/news - Get all news articles
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const page = parseInt(url.searchParams.get('page') || '1');
    const category = url.searchParams.get('category');
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Build query
    let query = supabaseAdmin
      .from('news_articles')
      .select(`
        *,
        categories(name, slug)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);
    
    // Add category filter if provided
    if (category) {
      query = query.eq('categories.slug', category);
    }
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: `Error fetching news articles: ${error.message}` },
        { status: 500 }
      );
    }
    
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
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.content || !body.category_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, category_id' },
        { status: 400 }
      );
    }
    
    // Create article object
    const now = new Date().toISOString();
    const article = {
      id: body.id || uuidv4(),
      title: body.title,
      content: body.content,
      summary: body.summary,
      category_id: body.category_id,
      image_url: body.image_url,
      video_url: body.video_url,
      video_type: body.video_type,
      author: body.author || 'Admin',
      published: body.published !== false,
      created_at: now,
      updated_at: now
    };
    
    // Insert article
    const { data, error } = await supabaseAdmin
      .from('news_articles')
      .insert([article])
      .select();
    
    if (error) {
      return NextResponse.json(
        { error: `Error creating news article: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: data[0]
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/news:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
