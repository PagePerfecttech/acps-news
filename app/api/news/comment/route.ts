import { NextRequest, NextResponse } from 'next/server';
import { addComment } from '../../../lib/supabaseService';

export async function POST(request: NextRequest) {
  try {
    const { articleId, content } = await request.json();
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    
    const success = await addComment(articleId, content, ipAddress);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to add comment' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in comment API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}