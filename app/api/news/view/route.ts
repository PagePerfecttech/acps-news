import { NextRequest, NextResponse } from 'next/server';
import { incrementViewCount } from '../../../lib/supabaseService';

export async function POST(request: NextRequest) {
  try {
    const { articleId } = await request.json();
    
    const success = await incrementViewCount(articleId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to increment view count' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in view API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}