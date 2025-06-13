// Supabase client removed - using local storage only
// This file is kept for compatibility but no longer uses Supabase

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mock functions for compatibility
export const isSupabaseConfigured = async (): Promise<boolean> => {
  console.warn('Supabase is disabled - using local storage only');
  return false;
};

export const getConnectionStatus = (): string => {
  return 'disabled';
};

export const checkConnection = async (): Promise<{
  status: string;
  message: string;
  timestamp: number;
}> => {
  return {
    status: 'disabled',
    message: 'Supabase is disabled - using local storage only',
    timestamp: Date.now()
  };
};
