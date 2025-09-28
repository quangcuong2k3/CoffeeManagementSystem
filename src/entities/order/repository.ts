/**
 * Order Repository Interface
 * Defines data access methods for orders
 */

import { Order, OrderFilters, OrderSearchResult, OrderFormData, OrderStats } from './types';

export interface OrderRepository {
  findAll(filters?: OrderFilters, page?: number, limit?: number): Promise<OrderSearchResult>;
  findById(id: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  findByCustomerId(customerId: string, filters?: OrderFilters): Promise<Order[]>;
  create(orderData: OrderFormData): Promise<Order>;
  update(id: string, updates: Partial<Order>): Promise<Order>;
  updateStatus(id: string, status: Order['status']): Promise<Order>;
  delete(id: string): Promise<void>;
  getStats(dateRange?: { start: Date; end: Date }): Promise<OrderStats>;
  getRecentOrders(limit?: number): Promise<Order[]>;
}

// Mock implementation for development
export class MockOrderRepository implements OrderRepository {
  private orders: Order[] = [];

  async findAll(filters?: OrderFilters, page = 1, limit = 20): Promise<OrderSearchResult> {
    // Mock implementation
    const filteredOrders = this.applyFilters(this.orders, filters);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    return {
      orders: paginatedOrders,
      total: filteredOrders.length,
      page,
      limit,
      stats: await this.getStats()
    };
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.find(order => order.id === id) || null;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return this.orders.find(order => order.orderNumber === orderNumber) || null;
  }

  async findByCustomerId(customerId: string, filters?: OrderFilters): Promise<Order[]> {
    const customerOrders = this.orders.filter(order => order.customer.id === customerId);
    return this.applyFilters(customerOrders, filters);
  }

  async create(orderData: OrderFormData): Promise<Order> {
    const order: Order = {
      id: `ord_${Date.now()}`,
      orderNumber: `ORD-${String(this.orders.length + 1).padStart(4, '0')}`,
      customer: {} as any, // Would be populated from customer service
      items: orderData.items.map((item, index) => ({
        ...item,
        id: `item_${index}`,
        totalPrice: item.unitPrice * item.quantity
      })),
      status: 'pending',
      payment: {
        id: `pay_${Date.now()}`,
        method: orderData.paymentMethod,
        status: 'pending',
        amount: 0,
        currency: 'USD'
      },
      subtotal: 0,
      tax: 0,
      discount: orderData.discount || 0,
      total: 0,
      notes: orderData.notes,
      estimatedPrepTime: 15,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Calculate totals
    order.subtotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0);
    order.tax = order.subtotal * 0.1; // 10% tax
    order.total = order.subtotal + order.tax - order.discount;
    order.payment.amount = order.total;

    this.orders.push(order);
    return order;
  }

  async update(id: string, updates: Partial<Order>): Promise<Order> {
    const index = this.orders.findIndex(order => order.id === id);
    if (index === -1) {
      throw new Error('Order not found');
    }

    this.orders[index] = { ...this.orders[index], ...updates, updatedAt: new Date() };
    return this.orders[index];
  }

  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    return this.update(id, { 
      status, 
      completedAt: status === 'completed' ? new Date() : undefined 
    });
  }

  async delete(id: string): Promise<void> {
    this.orders = this.orders.filter(order => order.id !== id);
  }

  async getStats(dateRange?: { start: Date; end: Date }): Promise<OrderStats> {
    const filteredOrders = dateRange 
      ? this.orders.filter(order => 
          order.createdAt >= dateRange.start && order.createdAt <= dateRange.end
        )
      : this.orders;

    return {
      totalOrders: filteredOrders.length,
      totalRevenue: filteredOrders.reduce((sum, order) => sum + order.total, 0),
      averageOrderValue: filteredOrders.length > 0 
        ? filteredOrders.reduce((sum, order) => sum + order.total, 0) / filteredOrders.length 
        : 0,
      statusBreakdown: this.getStatusBreakdown(filteredOrders),
      paymentMethodBreakdown: this.getPaymentMethodBreakdown(filteredOrders),
      topProducts: this.getTopProducts(filteredOrders)
    };
  }

  async getRecentOrders(limit = 10): Promise<Order[]> {
    return this.orders
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  private applyFilters(orders: Order[], filters?: OrderFilters): Order[] {
    if (!filters) return orders;

    return orders.filter(order => {
      if (filters.status && !filters.status.includes(order.status)) return false;
      if (filters.paymentStatus && !filters.paymentStatus.includes(order.payment.status)) return false;
      if (filters.customer && !order.customer.name.toLowerCase().includes(filters.customer.toLowerCase())) return false;
      if (filters.minAmount && order.total < filters.minAmount) return false;
      if (filters.maxAmount && order.total > filters.maxAmount) return false;
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          order.orderNumber.toLowerCase().includes(searchTerm) ||
          order.customer.name.toLowerCase().includes(searchTerm) ||
          order.items.some(item => item.productName.toLowerCase().includes(searchTerm))
        );
      }
      if (filters.dateRange) {
        return order.createdAt >= filters.dateRange.start && order.createdAt <= filters.dateRange.end;
      }
      return true;
    });
  }

  private getStatusBreakdown(orders: Order[]): Record<Order['status'], number> {
    const breakdown: Record<Order['status'], number> = {
      pending: 0, confirmed: 0, preparing: 0, ready: 0, completed: 0, cancelled: 0
    };
    
    orders.forEach(order => {
      breakdown[order.status]++;
    });
    
    return breakdown;
  }

  private getPaymentMethodBreakdown(orders: Order[]): Record<string, number> {
    const breakdown: Record<string, number> = {
      cash: 0, card: 0, digital_wallet: 0, bank_transfer: 0
    };
    
    orders.forEach(order => {
      breakdown[order.payment.method]++;
    });
    
    return breakdown;
  }

  private getTopProducts(orders: Order[]): OrderStats['topProducts'] {
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const existing = productMap.get(item.productId) || { name: item.productName, quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
        existing.revenue += item.totalPrice;
        productMap.set(item.productId, existing);
      });
    });
    
    return Array.from(productMap.entries())
      .map(([productId, data]) => ({ productId, productName: data.name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }
}