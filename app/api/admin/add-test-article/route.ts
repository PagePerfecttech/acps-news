/**
 * API Route for adding a test news article
 *
 * This route bypasses RLS policies by using the service role key
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Note: Supabase has been removed - this endpoint now returns mock data
// for compatibility during the R2 migration

// Sample image URL for testing
const sampleImageUrl = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000';

// POST /api/admin/add-test-article - Add a test news article (Mock implementation)
export async function POST(request: NextRequest) {
  try {
    // Create a unique ID for the article
    const articleId = uuidv4();
    const now = new Date().toISOString();

    // Create a mock test article
    const testArticle = {
      id: articleId,
      title: `Test Article - ${new Date().toLocaleString()}`,
      content: `
        <p>This is a test article created on ${new Date().toLocaleString()}.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. This is a mock article created during R2 migration.</p>
        <p>This article was created using the admin API to test the local storage integration.</p>
        <img src="${sampleImageUrl}" alt="Test Image" />
        <p>The image above is from Unsplash.</p>
      `,
      summary: 'This is a test article created by the admin API to test the local storage integration.',
      category_id: 'general',
      image_url: sampleImageUrl,
      author: 'Admin API',
      published: true,
      created_at: now,
      updated_at: now
    };

    // Return mock success response
    return NextResponse.json({
      success: true,
      article: testArticle,
      category: 'General',
      note: 'This is a mock response - Supabase has been replaced with local storage'
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/add-test-article:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
