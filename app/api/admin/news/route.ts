/**
 * API Route for managing news articles
 *
 * This route uses Drizzle ORM to interact with Neon database
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { newsArticles, categories } from '@/app/lib/schema';
import { eq, desc, count } from 'drizzle-orm';

// GET /api/admin/news - Get all news articles
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching news articles via admin API (Drizzle)');

    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const page = parseInt(url.searchParams.get('page') || '1');
    const category = url.searchParams.get('category');

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build query
    let baseQuery = db.select({
      news: newsArticles,
      category: { name: categories.name, slug: categories.slug }
    })
      .from(newsArticles)
      .leftJoin(categories, eq(newsArticles.category_id, categories.slug));

    let whereClause = undefined;
    if (category) {
      whereClause = eq(categories.slug, category);
    }

    const data = await baseQuery
      .where(whereClause)
      .orderBy(desc(newsArticles.created_at))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await db.select({ count: count() })
      .from(newsArticles)
      .leftJoin(categories, eq(newsArticles.category_id, categories.slug))
      .where(whereClause);

    const total = totalResult[0]?.count || 0;

    // Transform data to match expected format
    const formattedData = data.map(item => ({
      ...item.news,
      categories: item.category
    }));

    console.log(`Fetched ${formattedData.length} articles from Neon`);

    return NextResponse.json({
      success: true,
      data: formattedData,
      page,
      limit,
      total,
      hasMore: formattedData.length === limit
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
    console.log('Creating news article via admin API (Drizzle)');

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

    // Create article object
    const now = new Date();
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

    console.log('Inserting article into Neon:', article);

    // Insert into Neon
    const result = await db.insert(newsArticles)
      .values(article)
      .returning();

    const data = result[0];

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
