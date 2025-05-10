'use client';

import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { initializeRealtimeManager, cleanupRealtimeManager } from '../lib/realtimeManager';
import { getSettings, saveSettings } from '../lib/settingsService';

export default function SupabaseInitializer() {
  const [initialized, setInitialized] = useState(false);

  // Function to initialize default settings in Supabase
  const initializeDefaultSettings = async () => {
    try {
      // Check if settings exist in Supabase
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) {
        console.error('Error checking settings in Supabase:', error);
        return;
      }

      // If no settings exist, initialize with defaults
      if (!data || data.length === 0) {
        console.log('No settings found in Supabase, initializing defaults...');

        // Get default settings from localStorage or defaults
        const settings = await getSettings();

        // Save to Supabase
        const success = await saveSettings(settings);

        if (success) {
          console.log('Default settings initialized in Supabase');
        } else {
          console.error('Failed to initialize default settings in Supabase');
        }
      } else {
        console.log('Settings already exist in Supabase:', data.length, 'entries');
      }
    } catch (error) {
      console.error('Error initializing default settings:', error);
    }
  };

  useEffect(() => {
    const initSupabase = async () => {
      try {
        // Check if Supabase is configured
        const configured = await isSupabaseConfigured();

        if (configured) {
          // Initialize the realtime manager
          initializeRealtimeManager();

          // Initialize default settings if needed
          await initializeDefaultSettings();

          console.log('Supabase initialized successfully');
        } else {
          console.warn('Supabase is not properly configured');
        }

        setInitialized(true);
      } catch (error) {
        console.error('Error initializing Supabase:', error);
      }
    };

    initSupabase();

    // Cleanup function
    return () => {
      if (initialized) {
        try {
          cleanupRealtimeManager();
          console.log('Supabase realtime manager cleaned up');
        } catch (error) {
          console.error('Error cleaning up Supabase realtime manager:', error);
        }
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
}
