// Stub file to prevent build errors
// Supabase is no longer used in this project

export const isSupabaseConfigured = () => {
    return false;
};

export const getConnectionStatus = () => {
    return {
        status: 'disconnected',
        message: 'Supabase is not configured'
    };
};

export const checkConnection = async () => {
    return false;
};

export const supabase = null;
