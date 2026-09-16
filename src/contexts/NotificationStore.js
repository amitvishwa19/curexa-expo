import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'devlomatix.notifications';
const MAX_NOTIFICATIONS = 50;

const SEED_NOTIFICATIONS = [
  { id: 'seed_1', module: 'curexa', title: 'New OPD appointment booked', description: 'Dr. Sarah Lin confirmed for patient Eleanor Vance at 10:30 AM.', icon: 'calendar', color: '#059669', time: new Date(Date.now() - 600000).toISOString(), read: false },
  { id: 'seed_2', module: 'curexa', title: 'Diagnostic lab report ready', description: 'Complete Blood Count (CBC) and Lipid Profile results uploaded for John Doe.', icon: 'flask', color: '#0284c7', time: new Date(Date.now() - 1800000).toISOString(), read: false },
  { id: 'seed_3', module: 'curexa', title: 'ICU Telemetry vitals alert', description: 'SpO2 level drop detected for Bed 302 (Marcus Vance). Current: 94%.', icon: 'pulse', color: '#ef4444', time: new Date(Date.now() - 3600000).toISOString(), read: false },
  { id: 'seed_4', module: 'curexa', title: 'Pharmacy stock warning', description: 'Amoxicillin 500mg and Paracetamol IV stock running below safety threshold.', icon: 'medkit', color: '#f59e0b', time: new Date(Date.now() - 7200000).toISOString(), read: true },
  { id: 'seed_5', module: 'curexa', title: 'e-Prescription dispatched', description: 'Digital Rx generated and WhatsApp notification sent to Amy Pond.', icon: 'document-text', color: '#059669', time: new Date(Date.now() - 14400000).toISOString(), read: true },
  { id: 'seed_6', module: 'curexa', title: 'Bed cleaning completed', description: 'Bed 204 (General Ward A) sanitized and marked AVAILABLE for admission.', icon: 'bed', color: '#8b5cf6', time: new Date(Date.now() - 28800000).toISOString(), read: true },
];

const NotificationStoreContext = createContext(null);

export function NotificationStoreProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setNotifications(parsed);
          setUnreadCount(parsed.filter((n) => !n.read).length);
          setIsReady(true);
          return;
        } catch {}
      }
      setNotifications(SEED_NOTIFICATIONS);
      setUnreadCount(SEED_NOTIFICATIONS.filter((n) => !n.read).length);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_NOTIFICATIONS));
      setIsReady(true);
    });
  }, []);

  const persist = useCallback((items) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, []);

  const addNotification = useCallback((notification) => {
    const entry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      module: notification.module,
      title: notification.title,
      description: notification.description || '',
      icon: notification.icon || 'notifications',
      color: notification.color || '#6b7280',
      time: new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => {
      const next = [entry, ...prev].slice(0, MAX_NOTIFICATIONS);
      persist(next);
      return next;
    });
    setUnreadCount((prev) => prev + 1);
  }, [persist]);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      persist(next);
      return next;
    });
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, [persist]);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      persist(next);
      return next;
    });
    setUnreadCount(0);
  }, [persist]);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    persist([]);
  }, [persist]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => {
      const target = prev.find((n) => n.id === id);
      const next = prev.filter((n) => n.id !== id);
      persist(next);
      return next;
    });
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, [persist]);

  return (
    <NotificationStoreContext.Provider
      value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll, removeNotification, isReady }}
    >
      {children}
    </NotificationStoreContext.Provider>
  );
}

export function useNotificationStore() {
  const ctx = useContext(NotificationStoreContext);
  if (!ctx) throw new Error('useNotificationStore must be used within NotificationStoreProvider');
  return ctx;
}
