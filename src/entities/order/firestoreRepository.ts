/**
 * Order Firestore Repository
 * Real Firestore implementation for order data access
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  startAfter,
  Timestamp,
  DocumentSnapshot
} from 'firebase/firestore';
import { firestore } from '../../infra/config/firebase';
import { OrderRepository } from './repository';
import { 
  Order, 
  OrderFormData, 
  OrderFilters, 
  OrderSearchResult, 
  OrderStats,
  OrderStatus,
  PaymentStatus,
  Customer,
  Payment,
  OrderItem
} from './types';

export class FirestoreOrderRepository implements OrderRepository {
  private collectionName = 'orders';

  async findAll(filters?: OrderFilters, page = 1, limit = 20): Promise<OrderSearchResult> {
    try {
      let q = query(collection(firestore, this.collectionName));
      
      // Count active filters to avoid complex queries that need indexes
      const activeFilters = [
        filters?.status && filters.status.length > 0,
        filters?.paymentStatus && filters.paymentStatus.length > 0,
        filters?.dateRange,
        filters?.customer,
        filters?.minAmount,
        filters?.maxAmount
      ].filter(Boolean).length;

      // To avoid Firebase index requirements, we'll fetch all orders and filter client-side
      // This is more suitable for small to medium datasets
      
      // Simple query with just a limit - no filters at Firestore level
      q = query(collection(firestore, this.collectionName), firestoreLimit(200));

      const querySnapshot = await getDocs(q);
      let orders = querySnapshot.docs.map(doc => this.mapFirestoreDocToOrder(doc));

      // Apply all filtering client-side to completely avoid index requirements
      orders = this.applyClientSideFilters(orders, filters);
      
      // Sort by date (most recent first)
      orders = orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Apply pagination after filtering
      const startIndex = (page - 1) * limit;
      const paginatedOrders = orders.slice(startIndex, startIndex + limit);
      const total = orders.length;

      // Generate stats
      const stats = await this.calculateStatsFromOrders(orders);

      return {
        orders,
        total,
        page,
        limit,
        stats
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Failed to fetch orders from database');
    }
  }

  async findById(id: string): Promise<Order | null> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return this.mapFirestoreDocToOrder(docSnap);
      }
      return null;
    } catch (error) {
      console.error('Error fetching order by ID:', error);
      throw new Error('Failed to fetch order');
    }
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        where('orderNumber', '==', orderNumber)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return this.mapFirestoreDocToOrder(querySnapshot.docs[0]);
      }
      return null;
    } catch (error) {
      console.error('Error fetching order by number:', error);
      throw new Error('Failed to fetch order');
    }
  }

  async findByCustomerId(customerId: string, filters?: OrderFilters): Promise<Order[]> {
    try {
      let q = query(
        collection(firestore, this.collectionName),
        where('userId', '==', customerId)
      );

      if (filters?.status && filters.status.length > 0) {
        q = query(q, where('status', 'in', filters.status));
      }

      q = query(q, orderBy('orderDate', 'desc'));
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.mapFirestoreDocToOrder(doc));
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      throw new Error('Failed to fetch customer orders');
    }
  }

  async create(orderData: OrderFormData): Promise<Order> {
    // Since we cannot create orders, this will throw an error
    throw new Error('Order creation is not allowed. Orders can only be viewed and updated.');
  }

  async update(id: string, updates: Partial<Order>): Promise<Order> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      
      // Convert Order updates to Firestore format
      const firestoreUpdates: any = {};
      
      if (updates.status) {
        firestoreUpdates.status = updates.status;
      }
      
      if (updates.payment?.status) {
        firestoreUpdates.paymentStatus = updates.payment.status;
      }
      
      if (updates.notes !== undefined) {
        firestoreUpdates.notes = updates.notes || '';
      }
      
      if (updates.estimatedPrepTime) {
        firestoreUpdates.estimatedPrepTime = updates.estimatedPrepTime;
      }

      // Always update the updatedAt timestamp
      firestoreUpdates.updatedAt = Timestamp.now();

      await updateDoc(docRef, firestoreUpdates);
      
      // Fetch and return the updated order
      const updatedOrder = await this.findById(id);
      if (!updatedOrder) {
        throw new Error('Order not found after update');
      }
      
      return updatedOrder;
    } catch (error) {
      console.error('Error updating order:', error);
      throw new Error('Failed to update order');
    }
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return this.update(id, { status });
  }

  async delete(id: string): Promise<void> {
    // Since we cannot delete orders from Firestore in this context
    throw new Error('Order deletion is not allowed.');
  }

  async getStats(dateRange?: { start: Date; end: Date }): Promise<OrderStats> {
    try {
      let q = query(collection(firestore, this.collectionName));

      if (dateRange) {
        const startDate = Timestamp.fromDate(dateRange.start);
        const endDate = Timestamp.fromDate(dateRange.end);
        q = query(q, where('orderDate', '>=', startDate), where('orderDate', '<=', endDate));
      }

      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map(doc => this.mapFirestoreDocToOrder(doc));

      return this.calculateStatsFromOrders(orders);
    } catch (error) {
      console.error('Error calculating stats:', error);
      throw new Error('Failed to calculate order statistics');
    }
  }

  async getRecentOrders(limit = 10): Promise<Order[]> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        orderBy('orderDate', 'desc'),
        firestoreLimit(limit)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.mapFirestoreDocToOrder(doc));
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      throw new Error('Failed to fetch recent orders');
    }
  }

  private mapFirestoreDocToOrder(doc: DocumentSnapshot): Order {
    const data = doc.data()!;
    
    // Map Firestore document to Order interface
    return {
      id: doc.id,
      orderNumber: data.orderNumber || `ORD-${doc.id.slice(-4).toUpperCase()}`,
      customer: {
        id: data.userId || 'unknown',
        name: data.customerName || data.userName || 'Unknown Customer',
        email: data.customerEmail || data.userEmail || undefined,
        phone: data.customerPhone || data.userPhone || undefined,
        loyaltyLevel: this.mapLoyaltyLevel(data.customerLoyalty || 'bronze'),
        totalOrders: data.customerTotalOrders || 1,
        avatar: data.customerAvatar || ''
      },
      items: this.mapOrderItems(data.items || data.cartItems || []),
      status: this.mapOrderStatus(data.status || 'pending'),
      payment: {
        id: data.paymentId || `pay_${doc.id}`,
        method: this.mapPaymentMethod(data.paymentMethod || 'cash'),
        status: this.mapPaymentStatus(data.paymentStatus || 'pending'),
        amount: data.totalAmount || 0,
        currency: data.currency || 'USD',
        transactionId: data.transactionId,
        processedAt: data.paymentDate?.toDate(),
        failureReason: data.paymentFailureReason
      },
      subtotal: data.subtotal || data.totalAmount || 0,
      tax: data.tax || 0,
      discount: data.discount || 0,
      total: data.totalAmount || 0,
      notes: data.notes || data.specialInstructions || undefined,
      estimatedPrepTime: data.estimatedPrepTime || 15,
      actualPrepTime: data.actualPrepTime,
      createdAt: data.orderDate?.toDate() || data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      completedAt: data.completedAt?.toDate(),
      assignedStaff: data.assignedStaff
    };
  }

  private mapOrderItems(firestoreItems: any[]): OrderItem[] {
    return firestoreItems.map((item, index) => {
      // Extract price, quantity, and size from prices array or fallback to direct fields
      let unitPrice = 0;
      let size = 'Regular';
      let quantity = 1;
      
      if (item.prices && Array.isArray(item.prices) && item.prices.length > 0) {
        // Use the first price entry (assuming single size per order item)
        const priceEntry = item.prices[0];
        unitPrice = parseFloat(priceEntry.price || '0');
        size = priceEntry.size || 'Regular';
        // Some Firestore data has quantity in prices array, others at item level
        quantity = item.quantity || priceEntry.quantity || 1;
      } else {
        // Fallback to direct price fields
        unitPrice = parseFloat(item.price || item.unitPrice || '0');
        size = item.size || 'Regular';
        quantity = item.quantity || 1;
      }
      
      return {
        id: item.id || `item_${index}`,
        productId: item.productId || item.id || `prod_${index}`,
        productName: item.name || item.productName || 'Unknown Product',
        productImage: item.image || item.productImage || '',
        size: size,
        quantity: quantity,
        unitPrice: unitPrice,
        totalPrice: unitPrice * quantity,
        specialInstructions: item.specialInstructions || item.notes
      };
    });
  }

  private mapOrderStatus(firestoreStatus: string): OrderStatus {
    const statusMap: Record<string, OrderStatus> = {
      'pending': 'pending',
      'confirmed': 'confirmed',
      'preparing': 'preparing',
      'ready': 'ready',
      'completed': 'completed',
      'cancelled': 'cancelled',
      'delivered': 'completed',
      'paid': 'completed'
    };
    
    return statusMap[firestoreStatus.toLowerCase()] || 'pending';
  }

  private mapPaymentStatus(firestoreStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'pending': 'pending',
      'processing': 'processing',
      'paid': 'paid',
      'completed': 'paid',
      'failed': 'failed',
      'refunded': 'refunded'
    };
    
    return statusMap[firestoreStatus.toLowerCase()] || 'pending';
  }

  private mapPaymentMethod(firestoreMethod: string): 'cash' | 'card' | 'digital_wallet' | 'bank_transfer' {
    const methodMap: Record<string, 'cash' | 'card' | 'digital_wallet' | 'bank_transfer'> = {
      'cash': 'cash',
      'card': 'card',
      'credit_card': 'card',
      'debit_card': 'card',
      'digital_wallet': 'digital_wallet',
      'paypal': 'digital_wallet',
      'apple_pay': 'digital_wallet',
      'google_pay': 'digital_wallet',
      'bank_transfer': 'bank_transfer',
      'wire_transfer': 'bank_transfer'
    };
    
    return methodMap[firestoreMethod.toLowerCase()] || 'cash';
  }

  private mapLoyaltyLevel(level: string): 'bronze' | 'silver' | 'gold' | 'platinum' {
    const levelMap: Record<string, 'bronze' | 'silver' | 'gold' | 'platinum'> = {
      'bronze': 'bronze',
      'silver': 'silver',
      'gold': 'gold',
      'platinum': 'platinum'
    };
    
    return levelMap[level.toLowerCase()] || 'bronze';
  }

  private async calculateStatsFromOrders(orders: Order[]): Promise<OrderStats> {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Status breakdown
    const statusBreakdown: Record<OrderStatus, number> = {
      pending: 0,
      confirmed: 0,
      preparing: 0,
      ready: 0,
      completed: 0,
      cancelled: 0
    };

    orders.forEach(order => {
      statusBreakdown[order.status]++;
    });

    // Payment method breakdown
    const paymentMethodBreakdown = {
      cash: 0,
      card: 0,
      digital_wallet: 0,
      bank_transfer: 0
    };

    orders.forEach(order => {
      paymentMethodBreakdown[order.payment.method]++;
    });

    // Top products
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();

    orders.forEach(order => {
      order.items.forEach(item => {
        const existing = productMap.get(item.productId) || { 
          name: item.productName, 
          quantity: 0, 
          revenue: 0 
        };
        existing.quantity += item.quantity;
        existing.revenue += item.totalPrice;
        productMap.set(item.productId, existing);
      });
    });

    const topProducts = Array.from(productMap.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        quantity: data.quantity,
        revenue: data.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      statusBreakdown,
      paymentMethodBreakdown,
      topProducts
    };
  }

  /**
   * Apply client-side filters to avoid Firestore index requirements
   * This is used when multiple filters are applied simultaneously
   */
  private applyClientSideFilters(orders: Order[], filters?: OrderFilters): Order[] {
    if (!filters) return orders;

    return orders.filter(order => {
      // Payment status filter
      if (filters.paymentStatus && filters.paymentStatus.length > 0 && 
          !filters.paymentStatus.includes(order.payment.status)) {
        return false;
      }

      // Status filter (already applied at DB level, but double-check)
      if (filters.status && filters.status.length > 0 && 
          !filters.status.includes(order.status)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const orderDate = order.createdAt;
        if (orderDate < filters.dateRange.start || orderDate > filters.dateRange.end) {
          return false;
        }
      }

      // Customer filter (name search)
      if (filters.customer) {
        const customerName = order.customer.name.toLowerCase();
        const searchTerm = filters.customer.toLowerCase();
        if (!customerName.includes(searchTerm)) {
          return false;
        }
      }

      // Amount filters
      if (filters.minAmount && order.total < filters.minAmount) {
        return false;
      }

      if (filters.maxAmount && order.total > filters.maxAmount) {
        return false;
      }

      // Search filter (if provided)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = [
          order.orderNumber,
          order.customer.name,
          order.customer.email || '',
          order.customer.phone || '',
          order.items.map(item => item.productName).join(' '),
          order.notes || ''
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }
}