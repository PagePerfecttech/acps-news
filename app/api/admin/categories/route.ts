/**
 * API Route for managing categories
 *
 * This route uses Drizzle ORM to interact with Neon database
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { categories } from '@/app/lib/schema';
import { eq, asc } from 'drizzle-orm';

// GET /api/admin/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching categories via admin API (Drizzle)');

    // Fetch categories from Neon
    const data = await db.select()
      .from(categories)
      .orderBy(asc(categories.name));

    console.log(`Fetched ${data.length} categories from Neon`);

    return NextResponse.json({
      success: true,
      data: data
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
    console.log('Creating category via admin API (Drizzle)');

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

    // Insert into Neon
    const result = await db.insert(categories)
      .values({
        name: body.name,
        slug: body.slug,
      })
      .returning();

    const data = result[0];

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

// PUT /api/admin/categories - Update a category
// Note: This should ideally be in [id]/route.ts, but keeping here to match previous file structure
// We will look for ID in query params or body if pathname extraction fails or is weird.
export async function PUT(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Try to get ID from URL or body
    const url = new URL(request.url);
    let id = url.searchParams.get('id') || body.id;

    // Fallback to pathname extraction if needed (though likely incorrect in this file location)
    if (!id) {
      const pathParts = url.pathname.split('/');
      const lastPart = pathParts.pop();
      if (lastPart && lastPart !== 'categories') {
        id = lastPart;
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Update in Neon
    const result = await db.update(categories)
      .set({
        name: body.name,
        slug: body.slug,
        // updated_at: new Date() // Schema doesn't have updated_at for categories? Check schema.
        // Schema has created_at but not updated_at in my definition.
      })
      .where(eq(categories.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0]
    });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/categories:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories - Delete a category
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    let id = url.searchParams.get('id');

    // Fallback to pathname extraction
    if (!id) {
      const pathParts = url.pathname.split('/');
      const lastPart = pathParts.pop();
      if (lastPart && lastPart !== 'categories') {
        id = lastPart;
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Delete from Neon
    const result = await db.delete(categories)
      .where(eq(categories.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0]
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/categories:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
