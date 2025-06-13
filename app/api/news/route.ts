import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { isSupabaseConfigured } from '../../lib/supabase';

// Note: Supabase has been removed - this now returns mock data
// for compatibility during the R2 migration

// GET /api/news - Get all news articles (Mock implementation)
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    const category = url.searchParams.get('category');

    // Return mock news articles
    const mockArticles = [
      {
        id: '1',
        title: 'Sample News Article 1',
        content: 'This is a sample news article content.',
        summary: 'Sample article summary',
        category_id: 'general',
        image_url: '',
        video_url: '',
        video_type: '',
        author: 'Mock Author',
        likes: 0,
        views: 0,
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
      data: filteredArticles,
      page,
      limit,
      total: filteredArticles.length,
      hasMore: false,
      note: 'This is mock data - Supabase has been replaced with local storage'
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

// POST /api/news - Create a new news article (Mock implementation)
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
    const article = {
      id: uuidv4(),
      title: body.title,
      content: body.content,
      summary: body.summary || '',
      category_id: body.category_id || 'general',
      image_url: body.image_url || '',
      video_url: body.video_url || '',
      video_type: body.video_type || '',
      author: body.author || 'Anonymous',
      published: body.published !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: article,
      note: 'This is a mock response - Supabase has been replaced with local storage'
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
