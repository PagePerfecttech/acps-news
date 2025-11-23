// Stub file to prevent build errors
export const subscribeToChanges = () => {
    return { unsubscribe: () => { } };
};

export const getAllSubscriptionsStatus = () => {
    return {};
};

export const initializeRealtimeManager = () => {
    console.log('Realtime manager stub initialized');
};

export const cleanupRealtimeManager = () => {
    console.log('Realtime manager stub cleaned up');
};

export const getSubscriptionStatus = () => {
    return 'disconnected';
};
