/**
 * API Route for adding a test news article
 *
 * This route bypasses RLS policies by using the service role key
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Create Supabase admin client with service role key
// This bypasses RLS policies
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Sample image URL for testing
const sampleImageUrl = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000';

// POST /api/admin/add-test-article - Add a test news article
export async function POST(request: NextRequest) {
  try {
    // Use a hardcoded category ID for testing
    // This is the General category which should exist in most setups
    const categoryId = '5ffa84cc-dfc7-4876-a682-dd9fdbaaa1b9';
    const categoryName = 'General';

    // Create a unique ID for the article
    const articleId = uuidv4();
    const now = new Date().toISOString();

    // Create a test article
    const testArticle = {
      id: articleId,
      title: `Test Article - ${new Date().toLocaleString()}`,
      content: `
        <p>This is a test article created on ${new Date().toLocaleString()}.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.</p>
        <p>This article was created using the admin API to test the Supabase database integration.</p>
        <img src="${sampleImageUrl}" alt="Test Image" />
        <p>The image above is from Unsplash.</p>
      `,
      summary: 'This is a test article created by the admin API to test the Supabase database integration.',
      category_id: categoryId,
      image_url: sampleImageUrl,
      author: 'Admin API',
      published: true,
      created_at: now,
      updated_at: now
    };

    // Get a random category
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from('categories')
      .select('id, name')
      .limit(10);

    if (categoriesError) {
      return NextResponse.json(
        { error: `Error fetching categories: ${categoriesError.message}` },
        { status: 500 }
      );
    }

    if (!categories || categories.length === 0) {
      return NextResponse.json(
        { error: 'No categories found in the database' },
        { status: 500 }
      );
    }

    // Select a random category
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    // Update the article with the random category
    testArticle.category_id = randomCategory.id;

    // Insert the article using the admin client
    const { data, error } = await supabaseAdmin
      .from('news_articles')
      .insert([testArticle])
      .select();

    if (error) {
      return NextResponse.json(
        { error: `Error inserting article: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      article: data[0],
      category: randomCategory.name
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/add-test-article:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
