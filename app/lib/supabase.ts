// Supabase client removed - using local storage only
// This file is kept for compatibility but no longer uses Supabase

// Mock Supabase client for compatibility
export const supabase = {
  from: (table: string) => ({
    select: (columns?: string) => Promise.resolve({ data: [], error: null }),
    insert: (data: any) => Promise.resolve({ data: [], error: null }),
    update: (data: any) => Promise.resolve({ data: [], error: null }),
    delete: () => Promise.resolve({ data: [], error: null }),
    eq: (column: string, value: any) => ({
      select: (columns?: string) => Promise.resolve({ data: [], error: null }),
      update: (data: any) => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null }),
    }),
    order: (column: string, options?: any) => ({
      select: (columns?: string) => Promise.resolve({ data: [], error: null }),
    }),
    limit: (count: number) => ({
      select: (columns?: string) => Promise.resolve({ data: [], error: null }),
    }),
  }),
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signIn: (credentials: any) => Promise.resolve({ data: null, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  },
  storage: {
    from: (bucket: string) => ({
      upload: (path: string, file: File) => Promise.resolve({ data: null, error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: '' } }),
    }),
  },
  rpc: (fn: string, params?: any) => Promise.resolve({ data: null, error: null }),
};

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
