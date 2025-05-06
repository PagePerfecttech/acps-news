'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSettings, SiteSettings } from '../lib/settingsService';

// Default settings
const defaultSettings: SiteSettings = {
  site_name: 'FlipNews',
  primary_color: '#FACC15', // Yellow-500
  secondary_color: '#000000',
  share_link: 'https://flipnews.vercel.app',
  logo_url: '',
};

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadSettings();
  }, []);

  const refreshSettings = async () => {
    await loadSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
