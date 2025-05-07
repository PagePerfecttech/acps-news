import { useEffect, useState, useRef } from 'react';
import { isSupabaseConfigured, getConnectionStatus } from '../lib/supabase';
import { initializeRealtimeManager, subscribeToChanges, getSubscriptionStatus } from '../lib/realtimeManager';

type SubscriptionCallback = (payload: any) => void;
type SubscriptionEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeSubscriptionOptions {
  event?: SubscriptionEvent;
  filter?: string;
  filterValue?: string;
  onConnectionChange?: (status: string) => void;
  onSubscriptionError?: (error: string) => void;
}

export function useRealtimeSubscription(
  table: string,
  callback: SubscriptionCallback,
  dependencies: any[] = [],
  options: UseRealtimeSubscriptionOptions = {}
) {
  const [isConfigured, setIsConfigured] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const subscriptionIdRef = useRef<string | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    event = '*',
    filter,
    filterValue,
    onConnectionChange,
    onSubscriptionError
  } = options;

  // Initialize the realtime manager
  useEffect(() => {
    initializeRealtimeManager();
  }, []);

  // Check if Supabase is configured
  useEffect(() => {
    const checkSupabase = async () => {
      const configured = await isSupabaseConfigured();
      setIsConfigured(configured);

      // Get initial connection status
      const status = getConnectionStatus();
      setConnectionStatus(status);
      if (onConnectionChange) onConnectionChange(status);
    };

    checkSupabase();

    // Set up interval to check connection status
    checkIntervalRef.current = setInterval(() => {
      const status = getConnectionStatus();
      setConnectionStatus(prev => {
        if (prev !== status && onConnectionChange) onConnectionChange(status);
        return status;
      });

      // Check subscription status if we have an active subscription
      if (subscriptionIdRef.current) {
        const subStatus = getSubscriptionStatus(subscriptionIdRef.current);
        setSubscriptionStatus(subStatus);

        // Notify of subscription errors
        if (subStatus === 'error' && onSubscriptionError) {
          onSubscriptionError(`Subscription to ${table} is in error state`);
        }
      }
    }, 5000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [table, onConnectionChange, onSubscriptionError]);

  // Set up subscription
  useEffect(() => {
    if (!isConfigured) return;

    const subscription = subscribeToChanges(table, callback, event, filter, filterValue);
    subscriptionIdRef.current = subscription.id;
    setSubscriptionStatus('active');

    return () => {
      subscription.unsubscribe();
      subscriptionIdRef.current = null;
      setSubscriptionStatus(null);
    };
  }, [isConfigured, table, callback, event, filter, filterValue, ...dependencies]);

  // Return status information along with the subscription
  return {
    isConfigured,
    connectionStatus,
    subscriptionStatus
  };
}