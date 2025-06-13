/**
 * API Route for managing ads (Mock implementation)
 *
 * Note: Supabase has been removed - this now returns mock data
 * for compatibility during the R2 migration
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// GET /api/admin/ads - Get all ads (Mock implementation)
export async function GET(request: NextRequest) {
  try {
    // Return mock ads data
    const mockAds = [
      {
        id: '1',
        title: 'Sample Ad 1',
        description: 'This is a sample advertisement',
        text_content: 'Sample ad content',
        image_url: null,
        video_url: null,
        video_type: null,
        link_url: 'https://example.com',
        frequency: 5,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockAds,
      note: 'This is mock data - Supabase has been replaced with local storage'
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/ads:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

// POST /api/admin/ads - Create a new ad (Mock implementation)
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create a mock new ad
    const now = new Date().toISOString();
    const newAd = {
      id: body.id || uuidv4(),
      title: body.title,
      description: body.description,
      text_content: body.text_content,
      image_url: body.image_url,
      video_url: body.video_url,
      video_type: body.video_type,
      link_url: body.link_url,
      frequency: body.frequency || 5,
      active: body.active !== false,
      created_at: now,
      updated_at: now
    };

    return NextResponse.json({
      success: true,
      data: newAd,
      note: 'This is a mock response - Supabase has been replaced with local storage'
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/ads:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/ads/:id - Update an ad (Mock implementation)
export async function PUT(request: NextRequest) {
  try {
    // Get the ad ID from the URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: 'Ad ID is required' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create mock updated ad
    const now = new Date().toISOString();
    const updatedAd = {
      id,
      title: body.title,
      description: body.description,
      text_content: body.text_content,
      image_url: body.image_url,
      video_url: body.video_url,
      video_type: body.video_type,
      link_url: body.link_url,
      frequency: body.frequency,
      active: body.active,
      updated_at: now
    };

    return NextResponse.json({
      success: true,
      data: updatedAd,
      note: 'This is a mock response - Supabase has been replaced with local storage'
    });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/ads:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/ads/:id - Delete an ad (Mock implementation)
export async function DELETE(request: NextRequest) {
  try {
    // Get the ad ID from the URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: 'Ad ID is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      note: 'This is a mock response - Supabase has been replaced with local storage'
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/ads:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
