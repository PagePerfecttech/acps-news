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

// Initialize settings in localStorage if they don&apos;t exist
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
        // Try to get settings from Supabase as key-value pairs
        const { data: keyValueSettings, error: keyValueError } = await supabase
          .from('site_settings')
          .select('*');

        if (keyValueError) {
          console.error('Error fetching key-value settings from Supabase:', keyValueError);
          // Fall back to localStorage
          return getLocalSettings();
        }

        if (keyValueSettings && Array.isArray(keyValueSettings) && keyValueSettings.length > 0) {
          try {
            // Convert key-value pairs to settings object
            const settingsObj: Record<string, string> = {};
            keyValueSettings.forEach((item: { key: string; value: unknown }) => {
              if (item && item.key) {
                // Handle different value formats (string, JSON, etc.)
                let parsedValue = item.value;
                if (typeof parsedValue === 'string' && (parsedValue.startsWith('"') || parsedValue.startsWith('{'))) {
                  try {
                    parsedValue = JSON.parse(parsedValue);
                  } catch (e) {
                    // Keep as string if parsing fails
                  }
                }
                settingsObj[item.key] = parsedValue;
              }
            });

            console.log('Retrieved settings from site_settings table:', settingsObj);

            // Map to our settings format
            const mappedSettings: SiteSettings = {
              site_name: settingsObj.site_name || settingsObj.app_name || defaultSettings.site_name,
              primary_color: settingsObj.primary_color || settingsObj.theme_primary_color || defaultSettings.primary_color,
              secondary_color: settingsObj.secondary_color || settingsObj.theme_secondary_color || defaultSettings.secondary_color,
              share_link: settingsObj.share_link || defaultSettings.share_link,
              logo_url: settingsObj.logo_url || defaultSettings.logo_url,
            };

            return mappedSettings;
          } catch (parseError) {
            console.error('Error parsing settings from Supabase:', parseError);
            return getLocalSettings();
          }
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
        // Save to Supabase as key-value pairs
        const now = new Date().toISOString();

        // Create an array of settings to save
        const settingsToSave = [
          { key: 'site_name', value: settings.site_name },
          { key: 'primary_color', value: settings.primary_color },
          { key: 'secondary_color', value: settings.secondary_color },
          { key: 'share_link', value: settings.share_link },
        ];

        if (settings.logo_url) {
          settingsToSave.push({ key: 'logo_url', value: settings.logo_url });
        }

        // Add additional settings for the app
        settingsToSave.push({ key: 'app_version', value: '1.0.0' });
        settingsToSave.push({ key: 'last_updated', value: now });

        console.log('Saving settings to Supabase:', settingsToSave);

        // Upsert each setting
        let hasError = false;
        for (const setting of settingsToSave) {
          const { error } = await supabase
            .from('site_settings')
            .upsert({
              key: setting.key,
              value: setting.value,
              updated_at: now
            }, {
              onConflict: 'key'
            });

          if (error) {
            console.error(`Error upserting setting ${setting.key}:`, error);
            hasError = true;
          }
        }

        if (hasError) {
          console.warn('Some settings failed to save to Supabase, falling back to localStorage');
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
  if (typeof window === 'undefined') return false; // Can&apos;t update on server-side

  try {
    // Make sure we&apos;re saving a complete settings object
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
