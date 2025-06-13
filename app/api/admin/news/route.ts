/**
 * API Route for managing news articles
 * 
 * This route bypasses RLS policies by using the service role key
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Note: Supabase has been removed - this now returns mock data
// for compatibility during the R2 migration

// GET /api/admin/news - Get all news articles (Mock implementation)
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const page = parseInt(url.searchParams.get('page') || '1');
    const category = url.searchParams.get('category');

    // Return mock news articles
    const mockArticles = [
      {
        id: '1',
        title: 'Sample Admin News Article',
        content: 'This is a sample news article from admin API.',
        summary: 'Sample article summary',
        category_id: 'general',
        image_url: '',
        video_url: '',
        video_type: '',
        author: 'Admin',
        published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        categories: { name: 'General', slug: 'general' }
      }
    ];

    // Filter by category if provided
    const filteredArticles = category
      ? mockArticles.filter(article => article.categories.slug === category)
      : mockArticles;

    return NextResponse.json({
      success: true,
      data: filteredArticles,
      page,
      limit,
      total: filteredArticles.length,
      hasMore: false,
      note: 'This is mock data - Supabase has been replaced with local storage'
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/news:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

// POST /api/admin/news - Create a new news article (Mock implementation)
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content' },
        { status: 400 }
      );
    }

    // Create mock article object
    const now = new Date().toISOString();
    const article = {
      id: body.id || uuidv4(),
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

    console.log('Mock article created:', article);

    return NextResponse.json({
      success: true,
      data: article,
      note: 'This is a mock response - Supabase has been replaced with local storage'
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/news:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
