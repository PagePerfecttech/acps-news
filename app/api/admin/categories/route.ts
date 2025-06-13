/**
 * API Route for managing categories
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

// GET /api/admin/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching categories via admin API');

    // Fetch categories from Supabase
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Failed to fetch categories: ${error.message}` },
        { status: 500 }
      );
    }

    console.log(`Fetched ${data?.length || 0} categories from Supabase`);

    return NextResponse.json({
      success: true,
      data: data || []
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/categories:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    console.log('Creating category via admin API');

    // Parse request body
    const body = await request.json();
    console.log('Received category data:', body);

    // Validate required fields
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Create category object for Supabase
    const now = new Date().toISOString();
    const category = {
      id: body.id || uuidv4(),
      name: body.name,
      slug: body.slug,
      created_at: now,
      updated_at: now
    };

    console.log('Inserting category into Supabase:', category);

    // Insert into Supabase
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert([category])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Failed to save category: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Category saved successfully:', data);

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/categories:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/categories/:id - Update a category
export async function PUT(request: NextRequest) {
  try {
    // Get the category ID from the URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }
    
    // Create mock updated category
    const now = new Date().toISOString();
    const updatedCategory = {
      id,
      name: body.name,
      slug: body.slug,
      updated_at: now
    };

    return NextResponse.json({
      success: true,
      data: updatedCategory,
      note: 'This is a mock response - Supabase has been replaced with local storage'
    });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/categories:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories/:id - Delete a category
export async function DELETE(request: NextRequest) {
  try {
    // Get the category ID from the URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }
    
    // Mock category deletion
    return NextResponse.json({
      success: true,
      note: 'This is a mock response - Supabase has been replaced with local storage'
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/categories:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
