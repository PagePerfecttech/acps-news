'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ConnectionStatus from './ConnectionStatus';
import { useSettings } from '../contexts/SettingsContext';

export default function ConnectionStatusWrapper() {
  const pathname = usePathname();
  const [showStatus, setShowStatus] = useState(false);
  const { connectionStatus } = useSettings();

  // Only show in admin/setup pages or when there&apos;s a connection issue
  useEffect(() => {
    const isAdminPage = pathname?.startsWith('/admin');
    const isSetupPage = pathname?.startsWith('/setup');
    const isDebugPage = pathname?.startsWith('/debug');
    const hasConnectionIssue = connectionStatus === 'error' || connectionStatus === 'disconnected';

    setShowStatus(isAdminPage || isSetupPage || isDebugPage || hasConnectionIssue);
  }, [pathname, connectionStatus]);

  if (!showStatus) return null;

  return (
    <div className="connection-indicator">
      <ConnectionStatus showDetails={
        pathname?.startsWith('/admin') ||
        pathname?.startsWith('/setup') ||
        pathname?.startsWith('/debug')
      } />
    </div>
  );
}
