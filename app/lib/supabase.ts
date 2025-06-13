// Supabase client configuration
// This file configures the Supabase client for data storage

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if Supabase is configured
export const isSupabaseConfigured = async (): Promise<boolean> => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase credentials are missing');
      return false;
    }

    // Test connection with a simple query
    const { error } = await supabase.from('news_articles').select('id').limit(1);

    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }

    console.log('Supabase is properly configured and connected');
    return true;
  } catch (error) {
    console.error('Error checking Supabase configuration:', error);
    return false;
  }
};

export const getConnectionStatus = (): string => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return 'not-configured';
  }
  return 'configured';
};

export const checkConnection = async (): Promise<{
  status: string;
  message: string;
  timestamp: number;
}> => {
  try {
    const isConfigured = await isSupabaseConfigured();

    if (!isConfigured) {
      return {
        status: 'error',
        message: 'Supabase is not properly configured or connection failed',
        timestamp: Date.now()
      };
    }

    return {
      status: 'connected',
      message: 'Supabase is connected and working properly',
      timestamp: Date.now()
    };
  } catch (error) {
    return {
      status: 'error',
      message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: Date.now()
    };
  }
};
