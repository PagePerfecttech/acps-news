/**
 * API Route for adding news articles
 */

import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('News article add API called');

    // Check if Supabase is configured
    const configured = await isSupabaseConfigured();
    if (!configured) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

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

    // Prepare the article data for Supabase
    const now = new Date().toISOString();
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
      created_at: newArticle.created_at || now,
      updated_at: newArticle.updated_at || now
    };

    console.log('Inserting article into Supabase:', articleData);

    // Insert into Supabase
    const { data, error } = await supabase
      .from('news_articles')
      .insert([articleData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to save article: ${error.message}`,
          details: error
        },
        { status: 500 }
      );
    }

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
