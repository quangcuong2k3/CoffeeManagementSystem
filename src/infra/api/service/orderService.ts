/**
 * Order Service - Business Logic Layer
 * Handles order operations with business rules and validation
 */

import { OrderRepository } from "@/entities/order";
import { 
  Order, 
  OrderFormData, 
  OrderFilters, 
  OrderSearchResult, 
  OrderStats,
  OrderStatus,
  PaymentStatus,
  OrderItem 
} from '../../../entities/order';

export class OrderService {
  constructor(private repository: OrderRepository) {}

  // Order Retrieval
  async getOrders(filters?: OrderFilters, page = 1, limit = 20): Promise<OrderSearchResult> {
    return this.repository.findAll(filters, page, limit);
  }

  async getOrderById(id: string): Promise<Order | null> {
    return this.repository.findById(id);
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    return this.repository.findByOrderNumber(orderNumber);
  }

  async getCustomerOrders(customerId: string, filters?: OrderFilters): Promise<Order[]> {
    return this.repository.findByCustomerId(customerId, filters);
  }

  async getRecentOrders(limit = 10): Promise<Order[]> {
    return this.repository.getRecentOrders(limit);
  }

  // Order Creation
  async createOrder(orderData: OrderFormData): Promise<Order> {
    // Validation
    this.validateOrderData(orderData);
    
    // Business rules
    if (orderData.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    // Calculate totals and create order
    return this.repository.create(orderData);
  }

  // Order Updates
  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    // Business rules for status transitions
    this.validateStatusTransition(order.status, status);

    return this.repository.updateStatus(id, status);
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order> {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    const updatedPayment = { ...order.payment, status: paymentStatus };
    return this.repository.update(id, { payment: updatedPayment });
  }

  async addOrderNote(id: string, note: string): Promise<Order> {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    const currentNotes = order.notes || '';
    const newNotes = currentNotes ? `${currentNotes}\n${note}` : note;
    
    return this.repository.update(id, { notes: newNotes });
  }

  async updateEstimatedPrepTime(id: string, minutes: number): Promise<Order> {
    if (minutes < 0) {
      throw new Error('Preparation time must be positive');
    }

    return this.repository.update(id, { estimatedPrepTime: minutes });
  }

  // Order Deletion
  async cancelOrder(id: string, reason?: string): Promise<Order> {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    if (!this.canCancelOrder(order)) {
      throw new Error('Order cannot be cancelled at this stage');
    }

    const cancellationNote = reason 
      ? `Order cancelled: ${reason}` 
      : 'Order cancelled';
    
    const updatedNotes = order.notes 
      ? `${order.notes}\n${cancellationNote}` 
      : cancellationNote;

    return this.repository.update(id, { 
      status: 'cancelled',
      notes: updatedNotes,
      payment: { ...order.payment, status: 'failed' }
    });
  }

  async deleteOrder(id: string): Promise<void> {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    // Business rule: can only delete cancelled orders or very old completed orders
    if (order.status !== 'cancelled' && !(order.status === 'completed' && this.isOldOrder(order))) {
      throw new Error('Can only delete cancelled orders or old completed orders');
    }

    return this.repository.delete(id);
  }

  // Analytics & Reporting
  async getOrderStats(dateRange?: { start: Date; end: Date }): Promise<OrderStats> {
    return this.repository.getStats(dateRange);
  }

  async getDailyStats(date: Date): Promise<OrderStats> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.repository.getStats({ start: startOfDay, end: endOfDay });
  }

  async getWeeklyStats(weekStart: Date): Promise<OrderStats> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return this.repository.getStats({ start: weekStart, end: weekEnd });
  }

  async getMonthlyStats(year: number, month: number): Promise<OrderStats> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    return this.repository.getStats({ start, end });
  }

  // Business Logic Helpers
  private validateOrderData(orderData: OrderFormData): void {
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    if (orderData.items.some((item: Omit<OrderItem, 'id' | 'totalPrice'>) => item.quantity <= 0)) {
      throw new Error('All items must have positive quantities');
    }

    if (orderData.items.some((item: Omit<OrderItem, 'id' | 'totalPrice'>) => item.unitPrice <= 0)) {
      throw new Error('All items must have positive prices');
    }

    if (orderData.discount && orderData.discount < 0) {
      throw new Error('Discount cannot be negative');
    }
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['completed', 'cancelled'],
      completed: [], // Cannot transition from completed
      cancelled: [] // Cannot transition from cancelled
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(`Cannot transition from ${currentStatus} to ${newStatus}`);
    }
  }

  private canCancelOrder(order: Order): boolean {
    return ['pending', 'confirmed', 'preparing'].includes(order.status);
  }

  private isOldOrder(order: Order): boolean {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return order.createdAt < thirtyDaysAgo;
  }

  // Convenience methods for common operations
  async confirmOrder(id: string): Promise<Order> {
    return this.updateOrderStatus(id, 'confirmed');
  }

  async startPreparation(id: string): Promise<Order> {
    return this.updateOrderStatus(id, 'preparing');
  }

  async markOrderReady(id: string): Promise<Order> {
    return this.updateOrderStatus(id, 'ready');
  }

  async completeOrder(id: string): Promise<Order> {
    const order = await this.updateOrderStatus(id, 'completed');
    
    // Auto-update payment status if paid by cash
    if (order.payment.method === 'cash' && order.payment.status === 'pending') {
      await this.updatePaymentStatus(id, 'paid');
    }
    
    return order;
  }

  async processPayment(id: string): Promise<Order> {
    return this.updatePaymentStatus(id, 'paid');
  }

  async refundPayment(id: string): Promise<Order> {
    return this.updatePaymentStatus(id, 'refunded');
  }
}