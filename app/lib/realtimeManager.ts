// Note: Supabase real-time has been removed - this now provides mock functionality
// for compatibility during the R2 migration
import { getConnectionStatus, isSupabaseConfigured } from './supabase';

// Types
type SubscriptionCallback = (payload: unknown) => void;
type SubscriptionEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

// Mock channel interface for compatibility
interface MockChannel {
  unsubscribe: () => void;
}

interface Subscription {
  id: string;
  table: string;
  event: SubscriptionEvent;
  filter?: string;
  filterValue?: string;
  callback: SubscriptionCallback;
  channel: MockChannel;
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

// Subscribe to real-time changes (Mock implementation)
export const subscribeToChanges = (
  table: string,
  callback: SubscriptionCallback,
  event: SubscriptionEvent = '*',
  filter?: string,
  filterValue?: string
): { unsubscribe: () => void; id: string } => {
  // Generate a unique ID for this subscription
  const subscriptionId = generateSubscriptionId(table, event, filter, filterValue);

  console.log(`Mock subscription created for table: ${table}, event: ${event}`);

  // Create a mock channel
  const mockChannel: MockChannel = {
    unsubscribe: () => {
      console.log(`Mock channel unsubscribed: ${subscriptionId}`);
    }
  };

  // Store the mock subscription
  subscriptions.set(subscriptionId, {
    id: subscriptionId,
    table,
    event,
    filter,
    filterValue,
    callback,
    channel: mockChannel,
    status: 'active',
    errorCount: 0,
  });

  // Return unsubscribe function and subscription ID
  return {
    unsubscribe: () => {
      try {
        mockChannel.unsubscribe();
        subscriptions.delete(subscriptionId);
        console.log(`Mock subscription ${subscriptionId} unsubscribed`);
      } catch (error) {
        console.error(`Error unsubscribing from ${subscriptionId}:`, error);
      }
    },
    id: subscriptionId,
  };
};

// Check the health of all subscriptions (Mock implementation)
const checkSubscriptionsHealth = async (): Promise<void> => {
  // Skip if no subscriptions
  if (subscriptions.size === 0) return;

  console.log('Mock health check: All subscriptions are healthy (mock implementation)');

  // Mark all subscriptions as active (mock behavior)
  subscriptions.forEach((subscription) => {
    if (subscription.status === 'error') {
      subscription.status = 'active';
      subscription.errorCount = 0;
      console.log(`Mock resubscription successful for ${subscription.id}`);
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
