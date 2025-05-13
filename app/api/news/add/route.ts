/**
 * API Route for adding news articles
 *
 * This route handles server-side news article creation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tnaqvbrflguwpeafwclz.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuYXF2YnJmbGd1d3BlYWZ3Y2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NzE3NDIsImV4cCI6MjA2MjU0Nzc0Mn0.wosmLe8bA0LOJQttRD03c7tIa8woLbFNSVWuc0ntcME';
const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Use the category name directly as category_id for now
    let categoryId = newArticle.category;

    // If we have categories table, try to find the ID
    try {
      if (typeof categoryId === 'string') {
        // Check if categories table exists
        const { count, error: countError } = await supabase
          .from('categories')
          .select('*', { count: 'exact', head: true });

        if (!countError && count && count > 0) {
          // If category is a name rather than an ID, look up the ID
          const { data: categoryData } = await supabase
            .from('categories')
            .select('id, name')
            .eq('name', newArticle.category)
            .single();

          if (categoryData) {
            categoryId = categoryData.id;
          }
        }
      }
    } catch (categoryError) {
      console.warn('Error looking up category, using name as ID:', categoryError);
      // Continue with the category name as the ID
    }

    // Prepare the article data
    const articleData = {
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

    console.log('Final article data to be inserted:', articleData);

    console.log('Article data prepared:', articleData);

    // Insert the article into Supabase
    const { data, error } = await supabase
      .from('news_articles')
      .insert(articleData)
      .select()
      .single();

    if (error) {
      console.error('Error adding article to Supabase:', error);
      console.log('Error code:', error.code);
      console.log('Error message:', error.message);
      console.log('Error details:', error.details);

      // Try a simpler insert without select
      console.log('Trying simpler insert without select...');
      const { error: simpleError } = await supabase
        .from('news_articles')
        .insert(articleData);

      if (simpleError) {
        console.error('Error with simple insert:', simpleError);
        console.log('Simple error code:', simpleError.code);
        console.log('Simple error message:', simpleError.message);
        console.log('Simple error details:', simpleError.details);

        return NextResponse.json(
          {
            success: false,
            error: simpleError.message || 'Failed to add article',
            details: simpleError.details || {}
          },
          { status: 500 }
        );
      } else {
        console.log('Article added to Supabase with simple insert (ID unknown)');
        return NextResponse.json({
          success: true,
          message: 'Article added successfully (ID unknown)'
        });
      }
    } else {
      console.log('Article added to Supabase successfully:', data.id);

      return NextResponse.json({
        success: true,
        id: data.id,
        message: 'Article added successfully'
      });
    }
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
