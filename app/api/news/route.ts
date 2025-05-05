import { NextResponse } from 'next/server';

// GET /api/news - Get all news articles
export async function GET() {
  try {
    // For now, return a simple response
    return NextResponse.json({
      data: [],
      message: 'API is working but not connected to database yet'
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

// POST /api/news - Create a new news article
export async function POST() {
  try {
    // For now, return a simple response
    return NextResponse.json({
      success: true,
      message: 'API is working but not connected to database yet'
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
