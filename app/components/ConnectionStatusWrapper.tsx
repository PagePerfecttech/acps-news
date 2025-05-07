'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ConnectionStatus from './ConnectionStatus';
import { useSettings } from '../contexts/SettingsContext';

export default function ConnectionStatusWrapper() {
  const pathname = usePathname();
  const [showStatus, setShowStatus] = useState(false);
  const { connectionStatus } = useSettings();
  
  // Only show in admin pages or when there's a connection issue
  useEffect(() => {
    const isAdminPage = pathname?.startsWith('/admin');
    const hasConnectionIssue = connectionStatus === 'error' || connectionStatus === 'disconnected';
    
    setShowStatus(isAdminPage || hasConnectionIssue);
  }, [pathname, connectionStatus]);
  
  if (!showStatus) return null;
  
  return (
    <div className="connection-indicator">
      <ConnectionStatus showDetails={pathname?.startsWith('/admin')} />
    </div>
  );
}
