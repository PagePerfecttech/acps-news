'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { FiX, FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// Notification types
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

// Notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  title?: string;
  timeoutId?: NodeJS.Timeout;
}

// Notification context interface
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  showSuccess: (message: string, title?: string, duration?: number) => void;
  showError: (message: string, title?: string, duration?: number) => void;
  showInfo: (message: string, title?: string, duration?: number) => void;
  showWarning: (message: string, title?: string, duration?: number) => void;
}

// Create notification context
const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => { },
  removeNotification: () => { },
  clearNotifications: () => { },
  showSuccess: () => { },
  showError: () => { },
  showInfo: () => { },
  showWarning: () => { },
});

// Hook to use notifications
export const useNotification = () => useContext(NotificationContext);

// Notification provider component
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Add a new notification
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification = {
      ...notification,
      id,
      duration: notification.duration || 5000, // Default duration: 5 seconds
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration
    if (newNotification.duration > 0) {
      const timeoutId = setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);

      // Store the timeout ID with the notification for cleanup
      newNotification.timeoutId = timeoutId;
    }
  };

  // Remove a notification by ID
  const removeNotification = (id: string) => {
    setNotifications(prev => {
      // Find the notification to remove
      const notificationToRemove = prev.find(notification => notification.id === id);

      // Clear the timeout if it exists
      if (notificationToRemove?.timeoutId) {
        clearTimeout(notificationToRemove.timeoutId);
      }

      // Filter out the notification
      return prev.filter(notification => notification.id !== id);
    });
  };

  // Clear all notifications
  const clearNotifications = () => {
    // Clear all timeouts
    notifications.forEach(notification => {
      if (notification.timeoutId) {
        clearTimeout(notification.timeoutId);
      }
    });

    setNotifications([]);
  };

  // Helper functions
  const showSuccess = (message: string, title?: string, duration?: number) => {
    addNotification({ type: 'success', message, title, duration });
  };

  const showError = (message: string, title?: string, duration?: number) => {
    addNotification({ type: 'error', message, title, duration });
  };

  const showInfo = (message: string, title?: string, duration?: number) => {
    addNotification({ type: 'info', message, title, duration });
  };

  const showWarning = (message: string, title?: string, duration?: number) => {
    addNotification({ type: 'warning', message, title, duration });
  };

  // Cleanup timeouts when component unmounts
  useEffect(() => {
    return () => {
      notifications.forEach(notification => {
        if (notification.timeoutId) {
          clearTimeout(notification.timeoutId);
        }
      });
    };
  }, [notifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
        showSuccess,
        showError,
        showInfo,
        showWarning,
      }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Individual notification component
const NotificationItem = ({ notification, onClose }: { notification: Notification; onClose: () => void }) => {
  // Get icon and color based on notification type
  let icon;
  let bgColor;
  let borderColor;

  switch (notification.type) {
    case 'success':
      icon = <FiCheckCircle className="text-green-500" size={20} />;
      bgColor = 'bg-green-50';
      borderColor = 'border-green-500';
      break;
    case 'error':
      icon = <FiAlertCircle className="text-red-500" size={20} />;
      bgColor = 'bg-red-50';
      borderColor = 'border-red-500';
      break;
    case 'warning':
      icon = <FiAlertTriangle className="text-yellow-500" size={20} />;
      bgColor = 'bg-yellow-50';
      borderColor = 'border-yellow-500';
      break;
    case 'info':
    default:
      icon = <FiInfo className="text-blue-500" size={20} />;
      bgColor = 'bg-blue-50';
      borderColor = 'border-blue-500';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`${bgColor} border-l-4 ${borderColor} p-4 rounded-md shadow-md mb-3 max-w-md w-full flex items-start`}
    >
      <div className="mr-3 mt-0.5">{icon}</div>
      <div className="flex-1">
        {notification.title && (
          <h3 className="font-semibold text-gray-800">{notification.title}</h3>
        )}
        <p className="text-gray-700">{notification.message}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
        aria-label="Close notification"
      >
        <FiX size={18} />
      </button>
    </motion.div>
  );
};

// Helper functions for non-React usage (dispatches custom event)
export const showSuccessNotification = (message: string, title?: string, duration?: number) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('show-notification', {
      detail: { type: 'success', message, title, duration }
    }));
  }
};

export const showErrorNotification = (message: string, title?: string, duration?: number) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('show-notification', {
      detail: { type: 'error', message, title, duration }
    }));
  }
};

export const showInfoNotification = (message: string, title?: string, duration?: number) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('show-notification', {
      detail: { type: 'info', message, title, duration }
    }));
  }
};

export const showWarningNotification = (message: string, title?: string, duration?: number) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('show-notification', {
      detail: { type: 'warning', message, title, duration }
    }));
  }
};

// Container for all notifications
const NotificationContainer = () => {
  const { notifications, removeNotification, addNotification } = useNotification();

  // Listen for custom events from non-React code
  useEffect(() => {
    const handleCustomNotification = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        addNotification(customEvent.detail);
      }
    };

    window.addEventListener('show-notification', handleCustomNotification);
    return () => {
      window.removeEventListener('show-notification', handleCustomNotification);
    };
  }, [addNotification]);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end">
      <AnimatePresence>
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
