'use client';

import { useCallback, useEffect, useState } from 'react';
import { inventoryService } from '@/infra/api/service/inventoryService';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
}

export const useNotifications = () => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const alerts = await inventoryService.getStockAlerts(false);
      const mapped: NotificationItem[] = alerts.map((a: any) => ({
        id: a.id,
        title: a.alertType === 'out_of_stock' ? 'Out of stock' : a.alertType === 'reorder_point' ? 'Reorder point' : 'Low stock',
        message: a.message,
        severity: a.severity,
        createdAt: a.createdAt || new Date()
      }));
      setItems(mapped);
      setUnreadCount(alerts.filter((a: any) => !a.isRead).length);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  return { items, unreadCount, loading, error, refresh: fetchNotifications };
};


