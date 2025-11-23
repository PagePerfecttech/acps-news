/**
 * Legacy Supabase client - DEPRECATED
 * The app now uses Neon database with Drizzle ORM
 * This file is kept for backward compatibility only
 */

// Stub functions for components that haven't been migrated yet
export const isSupabaseConfigured = async (): Promise<boolean> => {
  // Always return false since we're not using Supabase anymore
  return false;
};

export const getConnectionStatus = (): string => {
  return 'not-configured';
};

export const checkConnection = async (): Promise<{
  status: string;
  message: string;
  timestamp: number;
}> => {
  return {
    status: 'error',
    message: 'Supabase is no longer used. App now uses Neon database.',
    timestamp: Date.now()
  };
};

// Stub supabase object for legacy code
export const supabase = {
  from: () => ({
    select: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') }),
    insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    update: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    delete: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
  }),
  auth: {
    getSession: () => Promise.resolve({
      data: { session: null },
      error: new Error('Supabase auth not configured')
    }),
    getUser: () => Promise.resolve({
      data: { user: null },
      error: new Error('Supabase auth not configured')
    }),
    signInWithPassword: () => Promise.resolve({
      data: { user: null, session: null },
      error: new Error('Supabase auth not configured')
    }),
    signOut: () => Promise.resolve({ error: null }),
  },
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: new Error('Supabase Storage not configured') }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
    listBuckets: () => Promise.resolve({ data: [], error: null }),
  },
};
