/**
 * API Route for adding news articles
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { newsArticles } from '../../../lib/schema';

export async function POST(request: NextRequest) {
  try {
    console.log('News article add API called');

    // Parse request body
    const newArticle = await request.json();
    console.log('Received article data:', newArticle);

    // Validate required fields
    if (!newArticle.title || !newArticle.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Prepare the article data
    const now = new Date();
    const categoryId = newArticle.category || 'general';
    const articleData = {
      title: newArticle.title,
      content: newArticle.content,
      summary: newArticle.summary || '',
      category_id: categoryId,
      image_url: newArticle.image_url || '',
      video_url: newArticle.video_url || '',
      video_type: newArticle.video_type || '',
      author: newArticle.author || 'Anonymous',
      published: newArticle.published !== false,
      created_at: newArticle.created_at ? new Date(newArticle.created_at) : now,
      updated_at: newArticle.updated_at ? new Date(newArticle.updated_at) : now
    };

    console.log('Inserting article into database:', articleData);

    // Insert into database
    const result = await db.insert(newsArticles)
      .values(articleData)
      .returning();

    const data = result[0];

    console.log('Article saved successfully:', data);

    return NextResponse.json({
      success: true,
      id: data.id,
      article: data,
      message: 'Article added successfully'
    });
  } catch (error: any) {
    console.error('Error in news article add API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An unknown error occurred',
        details: error.details || {}
      },
      { status: 500 }
    );
  }
}
