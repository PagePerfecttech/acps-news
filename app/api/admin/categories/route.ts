/**
 * API Route for managing categories
 * 
 * This route bypasses RLS policies by using the service role key
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Note: Supabase has been removed - this now returns mock data
// for compatibility during the R2 migration

// GET /api/admin/categories - Get all categories (Mock implementation)
export async function GET(request: NextRequest) {
  try {
    // Return mock categories
    const mockCategories = [
      {
        id: 'general',
        name: 'General',
        slug: 'general',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'politics',
        name: 'Politics',
        slug: 'politics',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'sports',
        name: 'Sports',
        slug: 'sports',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockCategories,
      note: 'This is mock data - Supabase has been replaced with local storage'
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/categories:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories - Create a new category (Mock implementation)
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

    // Create a mock new category
    const now = new Date().toISOString();
    const newCategory = {
      id: body.id || uuidv4(),
      name: body.name,
      slug: body.slug,
      created_at: now,
      updated_at: now
    };

    return NextResponse.json({
      success: true,
      data: newCategory,
      note: 'This is a mock response - Supabase has been replaced with local storage'
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
