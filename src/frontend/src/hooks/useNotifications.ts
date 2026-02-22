import { useState, useEffect } from 'react';
import { useLowStockIngredients } from './useQueries';

export interface Notification {
  id: string;
  type: 'low-stock' | 'subscription-expiry';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: any;
}

export function useNotifications() {
  const { data: lowStockItems } = useLowStockIngredients();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse notifications', e);
      }
    }
  }, []);

  useEffect(() => {
    if (!lowStockItems) return;

    const existingIds = new Set(notifications.map((n) => n.id));
    const newNotifications: Notification[] = [];

    lowStockItems.forEach((item) => {
      const id = `low-stock-${item.id.toString()}`;
      if (!existingIds.has(id)) {
        newNotifications.push({
          id,
          type: 'low-stock',
          title: 'Low Stock Alert',
          message: `${item.name} is running low (${item.quantity.value.toString()} ${
            item.quantity.unit === 'grams' ? 'g' : 'kg'
          } remaining)`,
          timestamp: Date.now(),
          read: false,
          data: { ingredientId: item.id },
        });
      }
    });

    if (newNotifications.length > 0) {
      const updated = [...notifications, ...newNotifications];
      setNotifications(updated);
      localStorage.setItem('notifications', JSON.stringify(updated));
    }
  }, [lowStockItems]);

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const dismiss = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    dismiss,
  };
}
