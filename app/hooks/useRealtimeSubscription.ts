import { useEffect, useState, useRef } from 'react';
import { isSupabaseConfigured, getConnectionStatus } from '../lib/supabase';
import { initializeRealtimeManager, subscribeToChanges, getSubscriptionStatus } from '../lib/realtimeManager';

type SubscriptionCallback = (payload: unknown) => void;
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
  dependencies: unknown[] = [],
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

    // No cleanup needed here as initializeRealtimeManager is idempotent
    // and doesn&apos;t create resources that need to be cleaned up
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Check if Supabase is configured
  useEffect(() => {
    let isMounted = true;

    const checkSupabase = async () => {
      try {
        const configured = await isSupabaseConfigured();

        // Only update state if component is still mounted
        if (isMounted) {
          setIsConfigured(configured);

          // Get initial connection status
          const status = getConnectionStatus();
          setConnectionStatus(status);
          if (onConnectionChange) onConnectionChange(status);
        }
      } catch (error) {
        console.error('Error checking Supabase configuration:', error);
        if (isMounted) {
          setIsConfigured(false);
        }
      }
    };

    checkSupabase();

    // Set up interval to check connection status
    checkIntervalRef.current = setInterval(() => {
      // Don&apos;t update state if component is unmounted
      if (!isMounted) return;

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
      isMounted = false;
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
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