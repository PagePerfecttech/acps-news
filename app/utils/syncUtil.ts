/**
 * Utility functions for data synchronization between devices
 */

// Generate a unique device ID to identify this device
export const getDeviceId = (): string => {
  if (typeof window === 'undefined') return 'server';
  
  // Try to get existing device ID from localStorage
  let deviceId = localStorage.getItem('flipnews_device_id');
  
  // If no device ID exists, create one and store it
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('flipnews_device_id', deviceId);
  }
  
  return deviceId;
};

// Get the last sync timestamp
export const getLastSyncTime = (): number => {
  if (typeof window === 'undefined') return 0;
  
  const timestamp = localStorage.getItem('flipnews_last_sync');
  return timestamp ? parseInt(timestamp, 10) : 0;
};

// Update the last sync timestamp
export const updateLastSyncTime = (): void => {
  if (typeof window === 'undefined') return;
  
  const now = Date.now();
  localStorage.setItem('flipnews_last_sync', now.toString());
};

// Check if we need to sync data (e.g., if it's been more than 5 minutes)
export const shouldSyncData = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const lastSync = getLastSyncTime();
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  return (now - lastSync) > fiveMinutes;
};

// Force a data refresh by clearing the sync timestamp
export const forceDataRefresh = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('flipnews_last_sync');
};
