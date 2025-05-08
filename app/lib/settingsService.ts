import { supabase } from './supabase';
import { isSupabaseConfigured } from './supabase';

export interface SiteSettings {
  id?: string;
  site_name: string;
  primary_color: string;
  secondary_color: string;
  share_link: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Default settings
const defaultSettings: SiteSettings = {
  site_name: 'FlipNews',
  primary_color: '#FACC15', // Yellow-500
  secondary_color: '#000000',
  share_link: 'https://flipnews.vercel.app',
  logo_url: '',
};

// Initialize settings in localStorage if they don't exist
const initializeSettings = (): void => {
  if (typeof window === 'undefined') return; // Skip on server-side

  if (!localStorage.getItem('flipnews_settings')) {
    localStorage.setItem('flipnews_settings', JSON.stringify(defaultSettings));
  }
};

// Get settings
export const getSettings = async (): Promise<SiteSettings> => {
  try {
    // Check if using Supabase
    const usingSupabase = await isSupabaseConfigured();

    if (usingSupabase) {
      try {
        // Try to get settings from Supabase
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching settings from Supabase:', error);
          // Fall back to localStorage
          return getLocalSettings();
        }

        if (data) {
          return data as SiteSettings;
        } else {
          console.log('No settings found in Supabase, using localStorage');
          return getLocalSettings();
        }
      } catch (error) {
        console.error('Error in getSettings:', error);
        // Fall back to localStorage
        return getLocalSettings();
      }
    } else {
      // Use localStorage
      console.log('Supabase not configured, using localStorage for settings');
      return getLocalSettings();
    }
  } catch (error) {
    console.error('Unexpected error in getSettings:', error);
    // Fall back to default settings in case of any error
    return defaultSettings;
  }
};

// Get settings from localStorage
const getLocalSettings = (): SiteSettings => {
  if (typeof window === 'undefined') {
    // Return default settings on server-side
    return defaultSettings;
  }

  initializeSettings();
  const settings = localStorage.getItem('flipnews_settings');
  return settings ? JSON.parse(settings) : defaultSettings;
};

// Save settings
export const saveSettings = async (settings: SiteSettings): Promise<boolean> => {
  try {
    // Check if using Supabase
    const usingSupabase = await isSupabaseConfigured();

    if (usingSupabase) {
      try {
        // Save to Supabase
        const now = new Date().toISOString();

        // Check if settings already exist
        const { data: existingSettings, error: queryError } = await supabase
          .from('site_settings')
          .select('id')
          .limit(1)
          .single();

        // If there's an error querying, fall back to localStorage
        if (queryError) {
          console.error('Error checking existing settings:', queryError);
          return saveLocalSettings(settings);
        }

        let result;

        if (existingSettings) {
          // Update existing settings
          result = await supabase
            .from('site_settings')
            .update({
              ...settings,
              updated_at: now
            })
            .eq('id', existingSettings.id);
        } else {
          // Insert new settings
          result = await supabase
            .from('site_settings')
            .insert({
              ...settings,
              created_at: now,
              updated_at: now
            });
        }

        if (result.error) {
          console.error('Error saving settings to Supabase:', result.error);
          // Fall back to localStorage
          return saveLocalSettings(settings);
        }

        return true;
      } catch (error) {
        console.error('Error in saveSettings:', error);
        // Fall back to localStorage
        return saveLocalSettings(settings);
      }
    } else {
      // Save to localStorage
      console.log('Supabase not configured, using localStorage for settings');
      return saveLocalSettings(settings);
    }
  } catch (error) {
    console.error('Unexpected error in saveSettings:', error);
    // Try to save to localStorage as a last resort
    try {
      return saveLocalSettings(settings);
    } catch (e) {
      console.error('Failed to save settings to localStorage:', e);
      return false;
    }
  }
};

// Save settings to localStorage
const saveLocalSettings = (settings: SiteSettings): boolean => {
  if (typeof window === 'undefined') return false; // Can't update on server-side

  try {
    // Make sure we're saving a complete settings object
    const currentSettings = getLocalSettings();
    const updatedSettings = { ...currentSettings, ...settings };

    localStorage.setItem('flipnews_settings', JSON.stringify(updatedSettings));

    // Also update document title if site_name is changed
    if (settings.site_name && typeof document !== 'undefined') {
      document.title = settings.site_name;
    }

    return true;
  } catch (error) {
    console.error('Error saving settings to localStorage:', error);
    return false;
  }
};
