'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSettings, SiteSettings } from '../lib/settingsService';
import { isSupabaseConfigured } from '../lib/supabase';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import { applyThemeColors } from '../lib/themeUtils';

// Default settings
const defaultSettings: SiteSettings = {
  site_name: 'ACPS News',
  primary_color: '#FACC15', // Yellow-500
  secondary_color: '#000000',
  share_link: 'https://acps-news.vercel.app',
  logo_url: '',
  background_logo_url: '/logo-background.svg',
  background_logo_opacity: 0.1,
  black_strip_text: 'No.1 News Daily',
};

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  connectionStatus: string;
  subscriptionStatus: string | null;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => { },
  connectionStatus: 'disconnected',
  subscriptionStatus: null,
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [usingSupabase, setUsingSupabase] = useState(false);

  // Handle settings update from real-time subscription
  const handleSettingsUpdate = async (payload: unknown) => {
    console.log('Settings update received:', payload);
    if (payload.new) {
      setSettings(payload.new);
    } else {
      // If we just got a notification without data, refresh settings
      await loadSettings();
    }
  };

  // Set up real-time subscription for settings
  const { connectionStatus, subscriptionStatus } = useRealtimeSubscription(
    'site_settings',
    handleSettingsUpdate,
    [],
    {
      onConnectionChange: (status) => {
        console.log('Settings connection status changed:', status);
      },
      onSubscriptionError: (error) => {
        console.error('Settings subscription error:', error);
        // Try to refresh settings manually if subscription fails
        loadSettings();
      }
    }
  );

  const loadSettings = async () => {
    try {
      setLoading(true);
      const loadedSettings = await getSettings();
      setSettings(loadedSettings || defaultSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      // Use default settings if there's an error
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  // Check if Supabase is configured
  useEffect(() => {
    const checkSupabase = async () => {
      const configured = await isSupabaseConfigured();
      setUsingSupabase(configured);
    };

    checkSupabase();
  }, []);

  // Initial load of settings
  useEffect(() => {
    loadSettings();
  }, []);

  const refreshSettings = async () => {
    await loadSettings();
  };

  // Apply CSS variables for theme colors
  useEffect(() => {
    if (settings) {
      applyThemeColors(settings);
    }
  }, [settings]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings,
        connectionStatus,
        subscriptionStatus
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
