/**
 * API Route for managing categories
 * 
 * This route bypasses RLS policies by using the service role key
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Note: Supabase has been removed - this now returns mock data
// for compatibility during the R2 migration

// GET /api/admin/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    // Get all categories
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      return NextResponse.json(
        { error: `Error fetching categories: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data
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
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }
    
    // Create a new category
    const now = new Date().toISOString();
    const newCategory = {
      id: body.id || uuidv4(),
      name: body.name,
      slug: body.slug,
      created_at: now,
      updated_at: now
    };
    
    // Insert the category
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert([newCategory])
      .select();
    
    if (error) {
      return NextResponse.json(
        { error: `Error creating category: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: data[0]
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
    
    // Update the category
    const now = new Date().toISOString();
    const updatedCategory = {
      name: body.name,
      slug: body.slug,
      updated_at: now
    };
    
    // Update the category
    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(updatedCategory)
      .eq('id', id)
      .select();
    
    if (error) {
      return NextResponse.json(
        { error: `Error updating category: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: data[0]
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
    
    // Delete the category
    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json(
        { error: `Error deleting category: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/categories:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
