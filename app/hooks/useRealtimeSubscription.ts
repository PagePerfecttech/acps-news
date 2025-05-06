import { useEffect, useState } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import { subscribeToChanges } from '../lib/supabaseService';

type SubscriptionCallback = (payload: any) => void;

export function useRealtimeSubscription(
  table: string,
  callback: SubscriptionCallback,
  dependencies: any[] = []
) {
  const [isConfigured, setIsConfigured] = useState(false);

  // Check if Supabase is configured
  useEffect(() => {
    const checkSupabase = async () => {
      const configured = await isSupabaseConfigured();
      setIsConfigured(configured);
    };
    
    checkSupabase();
  }, []);

  // Set up subscription
  useEffect(() => {
    if (!isConfigured) return;
    
    const subscription = subscribeToChanges(table, callback);
    
    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured, table, callback