import { NextRequest, NextResponse } from 'next/server';
import { likeArticle } from '../../../lib/dbService';

export async function POST(request: NextRequest) {
  try {
    const { articleId } = await request.json();
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

    const success = await likeArticle(articleId, ipAddress);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to like article' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in like API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}