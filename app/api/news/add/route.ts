/**
 * API Route for adding news articles (Mock implementation)
 *
 * Note: Supabase has been removed - this now stores articles locally
 * for compatibility during the R2 migration
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    console.log('News article add API called (Mock implementation)');

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

    // Generate a unique ID for the article
    const articleId = uuidv4();
    const categoryId = newArticle.category || 'general';

    // Prepare the article data
    const articleData = {
      id: articleId,
      title: newArticle.title,
      content: newArticle.content,
      summary: newArticle.summary || '',
      category_id: categoryId,
      image_url: newArticle.image_url || '',
      video_url: newArticle.video_url || '',
      video_type: newArticle.video_type || '',
      author: newArticle.author || 'Anonymous',
      likes: newArticle.likes || 0,
      views: 0,
      published: newArticle.published !== false,
      created_at: newArticle.created_at || new Date().toISOString(),
      updated_at: newArticle.updated_at || new Date().toISOString(),
      tags: Array.isArray(newArticle.tags) ? newArticle.tags : []
    };

    console.log('Mock article data prepared:', articleData);

    // Store in localStorage (client-side will handle this)
    // For now, just return success with the article data
    return NextResponse.json({
      success: true,
      id: articleId,
      article: articleData,
      message: 'Article added successfully (mock implementation)',
      note: 'This is a mock response - Supabase has been replaced with local storage'
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
