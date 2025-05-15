/**
 * API Route for managing ads
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

// GET /api/admin/ads - Get all ads
export async function GET(request: NextRequest) {
  try {
    // Get all ads
    const { data, error } = await supabaseAdmin
      .from('ads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      return NextResponse.json(
        { error: `Error fetching ads: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data
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
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    // Create a new ad
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
    
    // Insert the ad
    const { data, error } = await supabaseAdmin
      .from('ads')
      .insert([newAd])
      .select();
    
    if (error) {
      return NextResponse.json(
        { error: `Error creating ad: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: data[0]
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
    
    // Update the ad
    const now = new Date().toISOString();
    const updatedAd = {
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
    
    // Update the ad
    const { data, error } = await supabaseAdmin
      .from('ads')
      .update(updatedAd)
      .eq('id', id)
      .select();
    
    if (error) {
      return NextResponse.json(
        { error: `Error updating ad: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: data[0]
    });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/ads:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/ads/:id - Delete an ad
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
    
    // Delete the ad
    const { error } = await supabaseAdmin
      .from('ads')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json(
        { error: `Error deleting ad: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/ads:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
