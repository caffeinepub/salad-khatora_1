import { useState, useEffect } from 'react';
import { useLowStockIngredients, useExpiringSubscriptions, useCustomers } from './useQueries';

export interface Notification {
  id: string;
  type: 'low-stock' | 'subscription-expiry' | 'calendar';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: any;
}

export function useNotifications() {
  const { data: lowStockItems } = useLowStockIngredients();
  const { data: expiringSubscriptions = [] } = useExpiringSubscriptions();
  const { data: customers = [] } = useCustomers();
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
    if (!lowStockItems && !expiringSubscriptions) return;

    const existingIds = new Set(notifications.map((n) => n.id));
    const newNotifications: Notification[] = [];

    // Low stock notifications
    if (lowStockItems) {
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
    }

    // Expiring subscription notifications
    if (expiringSubscriptions) {
      expiringSubscriptions.forEach((subscription) => {
        const id = `subscription-expiry-${subscription.id.toString()}`;
        if (!existingIds.has(id)) {
          const customer = customers.find((c) => c.id === subscription.customerId);
          const customerName = customer?.name || 'Unknown Customer';
          const endDate = new Date(subscription.endDate);
          const today = new Date();
          const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          const planType = subscription.planType === 'weekly6days' ? 'Weekly' : 'Monthly';
          const bowlSize = subscription.bowlSize === 'small' ? '250gm' : subscription.bowlSize === 'medium' ? '350gm' : '500gm';

          newNotifications.push({
            id,
            type: 'calendar',
            title: `Subscription Expiring Soon`,
            message: `${customerName}'s ${planType} subscription (${bowlSize}) expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`,
            timestamp: Date.now(),
            read: false,
            data: { subscriptionId: subscription.id, customerId: subscription.customerId },
          });
        }
      });
    }

    if (newNotifications.length > 0) {
      const updated = [...notifications, ...newNotifications].sort((a, b) => b.timestamp - a.timestamp);
      setNotifications(updated);
      localStorage.setItem('notifications', JSON.stringify(updated));
    }
  }, [lowStockItems, expiringSubscriptions, customers]);

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
