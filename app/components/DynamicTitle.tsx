'use client';

import { useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

export default function DynamicTitle() {
  const { settings } = useSettings();

  useEffect(() => {
    if (settings && settings.site_name) {
      document.title = `${settings.site_name} - తెలుగు న్యూస్ అప్లికేషన్`;
    }
  }, [settings]);

  return null; // This component doesn't render anything
}
