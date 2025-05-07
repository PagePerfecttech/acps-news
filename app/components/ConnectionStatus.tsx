'use client';

import { useState, useEffect } from 'react';
import { FiWifi, FiWifiOff, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { getConnectionStatus, checkConnection } from '../lib/supabase';
import { getAllSubscriptionsStatus } from '../lib/realtimeManager';

interface ConnectionStatusProps {
  showDetails?: boolean;
  className?: string;
}

export default function ConnectionStatus({ showDetails = false, className = '' }: ConnectionStatusProps) {
  const [status, setStatus] = useState<string>('disconnected');
  const [subscriptions, setSubscriptions] = useState<{
    total: number;
    active: number;
    inactive: number;
    error: number;
  }>({ total: 0, active: 0, inactive: 0, error: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<number | null>(null);

  useEffect(() => {
    // Get initial status
    setStatus(getConnectionStatus());

    // Set up interval to check status
    const interval = setInterval(() => {
      setStatus(getConnectionStatus());
      
      // Get subscription status
      const subStatus = getAllSubscriptionsStatus();
      setSubscriptions({
        total: subStatus.total,
        active: subStatus.active,
        inactive: subStatus.inactive,
        error: subStatus.error
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleCheckConnection = async () => {
    setIsChecking(true);
    try {
      const result = await checkConnection();
      setStatus(result.status);
      setLastChecked(result.timestamp);
    } catch (error) {
      console.error('Error checking connection:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Determine icon and color based on status
  let icon;
  let color;
  let statusText;

  switch (status) {
    case 'connected':
      icon = <FiWifi className="text-green-500" />;
      color = 'bg-green-100 border-green-500';
      statusText = 'Connected';
      break;
    case 'connecting':
      icon = <FiLoader className="text-yellow-500 animate-spin" />;
      color = 'bg-yellow-100 border-yellow-500';
      statusText = 'Connecting';
      break;
    case 'error':
      icon = <FiAlertCircle className="text-red-500" />;
      color = 'bg-red-100 border-red-500';
      statusText = 'Error';
      break;
    default:
      icon = <FiWifiOff className="text-gray-500" />;
      color = 'bg-gray-100 border-gray-500';
      statusText = 'Disconnected';
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${color} cursor-pointer`}
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {icon}
        {showDetails && (
          <span className="text-sm font-medium">{statusText}</span>
        )}
      </div>

      {showTooltip && (
        <div className="absolute z-50 mt-2 w-64 bg-white rounded-md shadow-lg p-4 text-sm">
          <div className="font-bold mb-2">Database Connection</div>
          <div className="flex items-center mb-2">
            <span className="mr-2">Status:</span>
            <span className={`px-2 py-0.5 rounded-full ${color}`}>
              {statusText}
            </span>
          </div>

          <div className="mb-2">
            <div className="font-bold mb-1">Subscriptions:</div>
            <div className="grid grid-cols-2 gap-1">
              <div>Total: {subscriptions.total}</div>
              <div>Active: {subscriptions.active}</div>
              <div>Inactive: {subscriptions.inactive}</div>
              <div>Errors: {subscriptions.error}</div>
            </div>
          </div>

          {lastChecked && (
            <div className="text-xs text-gray-500 mb-2">
              Last checked: {new Date(lastChecked).toLocaleTimeString()}
            </div>
          )}

          <button
            onClick={handleCheckConnection}
            disabled={isChecking}
            className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm flex items-center justify-center disabled:opacity-50"
          >
            {isChecking ? (
              <>
                <FiLoader className="animate-spin mr-1" />
                Checking...
              </>
            ) : (
              'Check Connection'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
