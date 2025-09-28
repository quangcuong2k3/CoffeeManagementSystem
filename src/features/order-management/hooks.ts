/**
 * Order Management Hooks
 * Custom React hooks for order operations
 */

import { useState, useCallback } from 'react';
import { OrderService } from '../../infra/api/service';
import { FirestoreOrderRepository } from '@/entities/order';
import { 
  Order, 
  OrderFormData, 
  OrderFilters, 
  OrderSearchResult, 
  OrderStats,
  OrderStatus,
  PaymentStatus 
} from '../../entities/order';

// Initialize service with Firestore repository
const orderRepository = new FirestoreOrderRepository();
const orderService = new OrderService(orderRepository);

export interface UseOrdersResult {
  orders: Order[];
  loading: boolean;
  error: string | null;
  totalOrders: number;
  currentPage: number;
  stats: OrderStats | null;
  
  // Actions
  fetchOrders: (filters?: OrderFilters, page?: number) => Promise<void>;
  refreshOrders: () => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  updatePaymentStatus: (id: string, status: PaymentStatus) => Promise<void>;
  cancelOrder: (id: string, reason?: string) => Promise<void>;
  addOrderNote: (id: string, note: string) => Promise<void>;
  updatePrepTime: (id: string, minutes: number) => Promise<void>;
  clearError: () => void;
}

export const useOrders = (initialFilters?: OrderFilters, limit = 20): UseOrdersResult => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState<OrderStats | null>(null);

  const fetchOrders = useCallback(async (filters?: OrderFilters, page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await orderService.getOrders(filters, page, limit);
      
      setOrders(result.orders);
      setTotalOrders(result.total);
      setCurrentPage(page);
      setStats(result.stats);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const refreshOrders = useCallback(() => {
    return fetchOrders(initialFilters, currentPage);
  }, [fetchOrders, initialFilters, currentPage]);

  const updateOrderStatus = useCallback(async (id: string, status: OrderStatus) => {
    try {
      setError(null);
      const updatedOrder = await orderService.updateOrderStatus(id, status);
      
      setOrders(prev => prev.map(order => 
        order.id === id ? updatedOrder : order
      ));
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update order status';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const updatePaymentStatus = useCallback(async (id: string, status: PaymentStatus) => {
    try {
      setError(null);
      const updatedOrder = await orderService.updatePaymentStatus(id, status);
      
      setOrders(prev => prev.map(order => 
        order.id === id ? updatedOrder : order
      ));
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update payment status';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const cancelOrder = useCallback(async (id: string, reason?: string) => {
    try {
      setError(null);
      const cancelledOrder = await orderService.cancelOrder(id, reason);
      
      setOrders(prev => prev.map(order => 
        order.id === id ? cancelledOrder : order
      ));
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to cancel order';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const deleteOrder = useCallback(async (id: string) => {
    try {
      setError(null);
      await orderService.deleteOrder(id);
      
      setOrders(prev => prev.filter(order => order.id !== id));
      setTotalOrders(prev => prev - 1);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete order';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const addOrderNote = useCallback(async (id: string, note: string) => {
    try {
      setError(null);
      const updatedOrder = await orderService.addOrderNote(id, note);
      
      setOrders(prev => prev.map(order => 
        order.id === id ? updatedOrder : order
      ));
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add note';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const updatePrepTime = useCallback(async (id: string, minutes: number) => {
    try {
      setError(null);
      const updatedOrder = await orderService.updateEstimatedPrepTime(id, minutes);
      
      setOrders(prev => prev.map(order => 
        order.id === id ? updatedOrder : order
      ));
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update prep time';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    orders,
    loading,
    error,
    totalOrders,
    currentPage,
    stats,
    
    fetchOrders,
    refreshOrders,
    updateOrderStatus,
    updatePaymentStatus,
    cancelOrder,
    addOrderNote,
    updatePrepTime,
    clearError
  };
};

export interface UseOrderResult {
  order: Order | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchOrder: (id: string) => Promise<void>;
  updateStatus: (status: OrderStatus) => Promise<void>;
  updatePaymentStatus: (status: PaymentStatus) => Promise<void>;
  addNote: (note: string) => Promise<void>;
  updatePrepTime: (minutes: number) => Promise<void>;
  clearError: () => void;
}

export const useOrder = (orderId?: string): UseOrderResult => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedOrder = await orderService.getOrderById(id);
      setOrder(fetchedOrder);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (status: OrderStatus) => {
    if (!order) return;
    
    try {
      setError(null);
      const updatedOrder = await orderService.updateOrderStatus(order.id, status);
      setOrder(updatedOrder);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update status';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [order]);

  const updatePaymentStatus = useCallback(async (status: PaymentStatus) => {
    if (!order) return;
    
    try {
      setError(null);
      const updatedOrder = await orderService.updatePaymentStatus(order.id, status);
      setOrder(updatedOrder);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update payment status';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [order]);

  const addNote = useCallback(async (note: string) => {
    if (!order) return;
    
    try {
      setError(null);
      const updatedOrder = await orderService.addOrderNote(order.id, note);
      setOrder(updatedOrder);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add note';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [order]);

  const updatePrepTime = useCallback(async (minutes: number) => {
    if (!order) return;
    
    try {
      setError(null);
      const updatedOrder = await orderService.updateEstimatedPrepTime(order.id, minutes);
      setOrder(updatedOrder);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update prep time';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [order]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch on mount if orderId provided
  useState(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  });

  return {
    order,
    loading,
    error,
    
    fetchOrder,
    updateStatus,
    updatePaymentStatus,
    addNote,
    updatePrepTime,
    clearError
  };
};

export interface UseOrderStatsResult {
  stats: OrderStats | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchStats: (dateRange?: { start: Date; end: Date }) => Promise<void>;
  fetchDailyStats: (date: Date) => Promise<void>;
  fetchWeeklyStats: (weekStart: Date) => Promise<void>;
  fetchMonthlyStats: (year: number, month: number) => Promise<void>;
  clearError: () => void;
}

export const useOrderStats = (): UseOrderStatsResult => {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (dateRange?: { start: Date; end: Date }) => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedStats = await orderService.getOrderStats(dateRange);
      setStats(fetchedStats);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDailyStats = useCallback(async (date: Date) => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedStats = await orderService.getDailyStats(date);
      setStats(fetchedStats);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch daily stats');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWeeklyStats = useCallback(async (weekStart: Date) => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedStats = await orderService.getWeeklyStats(weekStart);
      setStats(fetchedStats);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weekly stats');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMonthlyStats = useCallback(async (year: number, month: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedStats = await orderService.getMonthlyStats(year, month);
      setStats(fetchedStats);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch monthly stats');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    stats,
    loading,
    error,
    
    fetchStats,
    fetchDailyStats,
    fetchWeeklyStats,
    fetchMonthlyStats,
    clearError
  };
};