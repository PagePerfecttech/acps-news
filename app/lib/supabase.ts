import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default to placeholder values if environment variables are not set
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Fix malformed URL if it contains the PowerShell command
if (supabaseUrl && supabaseUrl.includes('PS C:')) {
  // Extract the actual URL from the malformed string
  const matches = supabaseUrl.match(/(https:\/\/[a-z0-9-]+\.supabase\.co)/);
  if (matches && matches[1]) {
    console.log('Fixed malformed Supabase URL');
    supabaseUrl = matches[1];
  }
}

// Validate URL before creating client
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return url.includes('supabase.co'); // Additional check to ensure it's a Supabase URL
  } catch (e) {
    console.error('Invalid Supabase URL:', url);
    return false;
  }
};

// Use placeholder URL if the provided URL is invalid
const validSupabaseUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder-url.supabase.co';

// Create Supabase client with enhanced options
export const supabase = createClient(validSupabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Increase events per second for better real-time performance
    },
  },
  global: {
    headers: {
      'x-application-name': 'FlipNews',
    },
  },
});

// Connection status tracking
let connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error' = 'disconnected';
let lastConnectionCheck: number = 0;
const CONNECTION_CHECK_INTERVAL = 30000; // 30 seconds

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = async (): Promise<boolean> => {
  try {
    // Check if the URL is valid (after our fix for malformed URLs)
    if (!isValidUrl(validSupabaseUrl)) {
      console.warn('Supabase URL is invalid or not a Supabase URL');
      connectionStatus = 'error';
      return false;
    }

    // Check if environment variables are set
    const envVarsConfigured = (
      validSupabaseUrl !== 'https://placeholder-url.supabase.co' &&
      supabaseAnonKey !== undefined &&
      supabaseAnonKey !== '' &&
      supabaseAnonKey !== 'placeholder-key'
    );

    if (!envVarsConfigured) {
      console.warn('Supabase environment variables not properly configured');
      connectionStatus = 'error';
      return false;
    }

    // Try to make a simple query to verify connection
    try {
      connectionStatus = 'connecting';
      const { error } = await supabase.from('site_settings').select('count', { count: 'exact', head: true });

      if (error) {
        console.error('Error testing Supabase connection:', error);
        connectionStatus = 'error';
        return false;
      }

      connectionStatus = 'connected';
      lastConnectionCheck = Date.now();
      return true;
    } catch (error) {
      console.error('Error testing Supabase connection:', error);
      connectionStatus = 'error';
      return false;
    }
  } catch (error) {
    console.error('Error in isSupabaseConfigured:', error);
    connectionStatus = 'error';
    return false;
  }
};

// Get current connection status
export const getConnectionStatus = (): string => {
  // If it's been more than 30 seconds since our last check and we think we're connected,
  // we should verify the connection again
  if (connectionStatus === 'connected' &&
      Date.now() - lastConnectionCheck > CONNECTION_CHECK_INTERVAL) {
    // Don't await this, just trigger the check
    isSupabaseConfigured();
  }
  return connectionStatus;
};

// Manually check connection and return detailed status
export const checkConnection = async (): Promise<{
  status: string;
  message: string;
  timestamp: number;
}> => {
  try {
    const isConfigured = await isSupabaseConfigured();
    return {
      status: connectionStatus,
      message: isConfigured
        ? 'Connected to Supabase'
        : 'Failed to connect to Supabase',
      timestamp: Date.now()
    };
  } catch (error) {
    return {
      status: 'error',
      message: `Error checking connection: ${error}`,
      timestamp: Date.now()
    };
  }
};
