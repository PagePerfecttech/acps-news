import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../lib/db';
import { newsArticles, categories } from '../../lib/schema';
import { eq, desc, count, and } from 'drizzle-orm';

// GET /api/news - Get all news articles
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    const category = url.searchParams.get('category');

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build where clause
    const whereConditions = [eq(newsArticles.published, true)];
    if (category) {
      whereConditions.push(eq(newsArticles.category_id, category));
    }

    // Fetch articles with category info
    const data = await db.select({
      news: newsArticles,
      category: { name: categories.name, slug: categories.slug }
    })
      .from(newsArticles)
      .leftJoin(categories, eq(newsArticles.category_id, categories.slug))
      .where(and(...whereConditions))
      .orderBy(desc(newsArticles.created_at))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await db.select({ count: count() })
      .from(newsArticles)
      .where(and(...whereConditions));

    const total = totalResult[0]?.count || 0;

    // Transform data to match expected format
    const formattedData = data.map(item => ({
      ...item.news,
      categories: item.category
    }));

    return NextResponse.json({
      data: formattedData,
      page,
      limit,
      total,
      hasMore: formattedData.length === limit
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
    // Parse request body
    const body = await request.json();

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
      author: body.author || 'Anonymous',
      published: body.published !== false,
      created_at: now,
      updated_at: now
    };

    // Insert into database
    const result = await db.insert(newsArticles)
      .values(article)
      .returning();

    return NextResponse.json({
      success: true,
      data: result[0]
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
