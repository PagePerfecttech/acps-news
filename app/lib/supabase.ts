import { createClient } from '@supabase/supabase-js';

// Default to placeholder values if environment variables are not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Validate URL before creating client
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    console.error('Invalid Supabase URL:', url);
    return false;
  }
};

// Use placeholder URL if the provided URL is invalid
const validSupabaseUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder-url.supabase.co';

export const supabase = createClient(validSupabaseUrl, supabaseAnonKey);

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = async (): Promise<boolean> => {
  try {
    // Check if environment variables are set
    const envVarsConfigured = (
      process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== '' &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-url.supabase.co' &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== undefined &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== '' &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key'
    );

    if (!envVarsConfigured) {
      return false;
    }

    // Try to make a simple query to verify connection
    try {
      const { error } = await supabase.from('site_settings').select('count', { count: 'exact', head: true });
      return !error;
    } catch (error) {
      console.error('Error testing Supabase connection:', error);
      return false;
    }
  } catch (error) {
    console.error('Error in isSupabaseConfigured:', error);
    return false;
  }
};
