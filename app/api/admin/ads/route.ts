/**
 * API Route for managing ads
 *
 * This route uses Drizzle ORM to interact with Neon database
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { ads } from '@/app/lib/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/admin/ads - Get all ads
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching ads via admin API (Drizzle)');

    // Fetch ads from Neon
    const data = await db.select()
      .from(ads)
      .orderBy(desc(ads.created_at));

    console.log(`Fetched ${data.length} ads from Neon`);

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/ads:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

// POST /api/admin/ads - Create a new ad
export async function POST(request: NextRequest) {
  try {
    console.log('Creating ad via admin API (Drizzle)');

    // Parse request body
    const body = await request.json();
    console.log('Received ad data:', body);

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create ad object
    const now = new Date();
    const ad = {
      title: body.title,
      description: body.description || '',
      text_content: body.text_content || '',
      image_url: body.image_url || '',
      video_url: body.video_url || '',
      video_type: body.video_type || '',
      link_url: body.link_url || '',
      frequency: body.frequency || 5,
      active: body.active !== false,
      created_at: now,
      updated_at: now
    };

    console.log('Inserting ad into Neon:', ad);

    // Insert into Neon
    const result = await db.insert(ads)
      .values(ad)
      .returning();

    const data = result[0];

    console.log('Ad saved successfully:', data);

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/ads:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/ads - Update an ad
export async function PUT(request: NextRequest) {
  try {
    console.log('Updating ad via admin API (Drizzle)');

    // Parse request body
    const body = await request.json();

    // Get the ad ID from URL or body
    const url = new URL(request.url);
    let id = url.searchParams.get('id') || body.id;

    // Fallback to pathname extraction
    if (!id) {
      const pathParts = url.pathname.split('/');
      const lastPart = pathParts.pop();
      if (lastPart && lastPart !== 'ads') {
        id = lastPart;
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Ad ID is required' },
        { status: 400 }
      );
    }

    console.log('Updating ad with ID:', id, 'Data:', body);

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create update object
    const now = new Date();
    const updateData = {
      title: body.title,
      description: body.description || '',
      text_content: body.text_content || '',
      image_url: body.image_url || '',
      video_url: body.video_url || '',
      video_type: body.video_type || '',
      link_url: body.link_url || '',
      frequency: body.frequency || 5,
      active: body.active !== false,
      updated_at: now
    };

    // Update in Neon
    const result = await db.update(ads)
      .set(updateData)
      .where(eq(ads.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Ad not found' },
        { status: 404 }
      );
    }

    console.log('Ad updated successfully:', result[0]);

    return NextResponse.json({
      success: true,
      data: result[0]
    });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/ads:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/ads - Delete an ad
export async function DELETE(request: NextRequest) {
  try {
    console.log('Deleting ad via admin API (Drizzle)');

    // Get the ad ID from the URL
    const url = new URL(request.url);
    let id = url.searchParams.get('id');

    // Fallback to pathname extraction
    if (!id) {
      const pathParts = url.pathname.split('/');
      const lastPart = pathParts.pop();
      if (lastPart && lastPart !== 'ads') {
        id = lastPart;
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Ad ID is required' },
        { status: 400 }
      );
    }

    console.log('Deleting ad with ID:', id);

    // Delete from Neon
    const result = await db.delete(ads)
      .where(eq(ads.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Ad not found' },
        { status: 404 }
      );
    }

    console.log('Ad deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Ad deleted successfully'
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/ads:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
