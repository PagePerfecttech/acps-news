/**
 * API Route for managing ads
 *
 * This route bypasses RLS policies by using the service role key
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Create Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/admin/ads - Get all ads
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching ads via admin API');

    // Fetch ads from Supabase
    const { data, error } = await supabaseAdmin
      .from('ads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Failed to fetch ads: ${error.message}` },
        { status: 500 }
      );
    }

    console.log(`Fetched ${data?.length || 0} ads from Supabase`);

    return NextResponse.json({
      success: true,
      data: data || []
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
    console.log('Creating ad via admin API');

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

    // Create ad object for Supabase
    const now = new Date().toISOString();
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

    console.log('Inserting ad into Supabase:', ad);

    // Insert into Supabase
    const { data, error } = await supabaseAdmin
      .from('ads')
      .insert([ad])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Failed to save ad: ${error.message}` },
        { status: 500 }
      );
    }

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

// PUT /api/admin/ads/:id - Update an ad
export async function PUT(request: NextRequest) {
  try {
    console.log('Updating ad via admin API');

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
    console.log('Updating ad with ID:', id, 'Data:', body);

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create update object for Supabase
    const now = new Date().toISOString();
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

    console.log('Updating ad in Supabase:', updateData);

    // Update in Supabase
    const { data, error } = await supabaseAdmin
      .from('ads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Failed to update ad: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Ad updated successfully:', data);

    return NextResponse.json({
      success: true,
      data: data
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
