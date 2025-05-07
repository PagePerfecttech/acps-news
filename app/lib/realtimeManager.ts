import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, getConnectionStatus, isSupabaseConfigured } from './supabase';

// Types
type SubscriptionCallback = (payload: any) => void;
type SubscriptionEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface Subscription {
  id: string;
  table: string;
  event: SubscriptionEvent;
  filter?: string;
  filterValue?: string;
  callback: SubscriptionCallback;
  channel: RealtimeChannel;
  status: 'active' | 'inactive' | 'error';
  lastEvent?: number;
  errorCount: number;
}

// Subscription manager state
const subscriptions: Map<string, Subscription> = new Map();
let isInitialized = false;
let healthCheckInterval: NodeJS.Timeout | null = null;
const MAX_ERROR_COUNT = 5;
const HEALTH_CHECK_INTERVAL = 60000; // 1 minute

// Initialize the subscription manager
export const initializeRealtimeManager = (): void => {
  if (isInitialized) return;
  
  // Set up health check interval
  healthCheckInterval = setInterval(checkSubscriptionsHealth, HEALTH_CHECK_INTERVAL);
  
  isInitialized = true;
  console.log('Realtime subscription manager initialized');
};

// Clean up the subscription manager
export const cleanupRealtimeManager = (): void => {
  if (!isInitialized) return;
  
  // Clear health check interval
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }
  
  // Unsubscribe from all channels
  subscriptions.forEach((subscription) => {
    try {
      subscription.channel.unsubscribe();
    } catch (error) {
      console.error(`Error unsubscribing from channel ${subscription.id}:`, error);
    }
  });
  
  // Clear subscriptions
  subscriptions.clear();
  
  isInitialized = false;
  console.log('Realtime subscription manager cleaned up');
};

// Generate a unique subscription ID
const generateSubscriptionId = (
  table: string,
  event: SubscriptionEvent,
  filter?: string,
  filterValue?: string
): string => {
  return `${table}:${event}${filter ? `:${filter}:${filterValue}` : ''}:${Date.now()}`;
};

// Subscribe to real-time changes
export const subscribeToChanges = (
  table: string,
  callback: SubscriptionCallback,
  event: SubscriptionEvent = '*',
  filter?: string,
  filterValue?: string
): { unsubscribe: () => void; id: string } => {
  // Generate a unique ID for this subscription
  const subscriptionId = generateSubscriptionId(table, event, filter, filterValue);
  
  // Create filter object if filter is provided
  const filterObj = filter && filterValue ? { [filter]: filterValue } : undefined;
  
  // Create the channel
  const channel = supabase
    .channel(`${subscriptionId}`)
    .on(
      'postgres_changes',
      {
        event,
        schema: 'public',
        table,
        filter: filterObj,
      },
      (payload) => {
        try {
          // Update last event timestamp
          const subscription = subscriptions.get(subscriptionId);
          if (subscription) {
            subscription.lastEvent = Date.now();
            subscription.errorCount = 0; // Reset error count on successful event
          }
          
          // Call the callback
          callback(payload);
        } catch (error) {
          console.error(`Error in subscription callback for ${subscriptionId}:`, error);
          
          // Increment error count
          const subscription = subscriptions.get(subscriptionId);
          if (subscription) {
            subscription.errorCount += 1;
            
            // If too many errors, mark as error
            if (subscription.errorCount >= MAX_ERROR_COUNT) {
              subscription.status = 'error';
              console.error(`Subscription ${subscriptionId} has too many errors, marking as error`);
            }
          }
        }
      }
    )
    .subscribe((status) => {
      console.log(`Subscription ${subscriptionId} status:`, status);
      
      // Update subscription status
      const subscription = subscriptions.get(subscriptionId);
      if (subscription) {
        subscription.status = status === 'SUBSCRIBED' ? 'active' : 'inactive';
      }
    });
  
  // Store the subscription
  subscriptions.set(subscriptionId, {
    id: subscriptionId,
    table,
    event,
    filter,
    filterValue,
    callback,
    channel,
    status: 'active',
    errorCount: 0,
  });
  
  // Return unsubscribe function and subscription ID
  return {
    unsubscribe: () => {
      try {
        channel.unsubscribe();
        subscriptions.delete(subscriptionId);
      } catch (error) {
        console.error(`Error unsubscribing from ${subscriptionId}:`, error);
      }
    },
    id: subscriptionId,
  };
};

// Check the health of all subscriptions
const checkSubscriptionsHealth = async (): Promise<void> => {
  // Skip if no subscriptions
  if (subscriptions.size === 0) return;
  
  // Check Supabase connection
  const connectionStatus = getConnectionStatus();
  const isConnected = connectionStatus === 'connected';
  
  // If not connected, try to reconnect
  if (!isConnected) {
    console.warn('Supabase connection is not active, attempting to reconnect...');
    const reconnected = await isSupabaseConfigured();
    
    if (!reconnected) {
      console.error('Failed to reconnect to Supabase');
      return;
    }
  }
  
  // Check each subscription
  subscriptions.forEach((subscription, id) => {
    // If subscription is in error state, try to resubscribe
    if (subscription.status === 'error') {
      console.log(`Attempting to resubscribe to ${id}...`);
      
      try {
        // Unsubscribe from the old channel
        subscription.channel.unsubscribe();
        
        // Create a new channel
        const newChannel = supabase
          .channel(`${id}-reconnect`)
          .on(
            'postgres_changes',
            {
              event: subscription.event,
              schema: 'public',
              table: subscription.table,
              filter: subscription.filter && subscription.filterValue
                ? { [subscription.filter]: subscription.filterValue }
                : undefined,
            },
            subscription.callback
          )
          .subscribe();
        
        // Update the subscription
        subscription.channel = newChannel;
        subscription.status = 'active';
        subscription.errorCount = 0;
        
        console.log(`Successfully resubscribed to ${id}`);
      } catch (error) {
        console.error(`Error resubscribing to ${id}:`, error);
      }
    }
  });
};

// Get subscription status
export const getSubscriptionStatus = (id: string): string | null => {
  const subscription = subscriptions.get(id);
  return subscription ? subscription.status : null;
};

// Get all subscriptions status
export const getAllSubscriptionsStatus = (): { 
  total: number;
  active: number;
  inactive: number;
  error: number;
  subscriptions: { id: string; table: string; status: string; lastEvent?: number }[];
} => {
  let active = 0;
  let inactive = 0;
  let error = 0;
  const subscriptionsList: { id: string; table: string; status: string; lastEvent?: number }[] = [];
  
  subscriptions.forEach((subscription) => {
    if (subscription.status === 'active') active += 1;
    else if (subscription.status === 'inactive') inactive += 1;
    else if (subscription.status === 'error') error += 1;
    
    subscriptionsList.push({
      id: subscription.id,
      table: subscription.table,
      status: subscription.status,
      lastEvent: subscription.lastEvent,
    });
  });
  
  return {
    total: subscriptions.size,
    active,
    inactive,
    error,
    subscriptions: subscriptionsList,
  };
};
