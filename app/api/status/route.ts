import { NextRequest, NextResponse } from 'next/server';
import { checkConnection } from '../../lib/supabase';
import { getAllSubscriptionsStatus } from '../../lib/realtimeManager';

// GET /api/status - Get the current connection status
export async function GET(request: NextRequest) {
  try {
    // Check the connection status
    const connectionStatus = await checkConnection();
    
    // Get the subscription status
    const subscriptionStatus = getAllSubscriptionsStatus();
    
    return NextResponse.json({
      success: true,
      data: {
        connection: connectionStatus,
        subscriptions: subscriptionStatus,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('Error in GET /api/status:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
