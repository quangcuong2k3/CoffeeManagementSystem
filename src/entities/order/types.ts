/**
 * Order Entity Types
 * Domain-specific types for order management
 */

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'digital_wallet' | 'bank_transfer';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  loyaltyLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalOrders: number;
  avatar?: string;
}

export interface Payment {
  id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  transactionId?: string;
  processedAt?: Date;
  failureReason?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  items: OrderItem[];
  status: OrderStatus;
  payment: Payment;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  estimatedPrepTime: number; // in minutes
  actualPrepTime?: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  assignedStaff?: string;
}

export interface OrderFilters {
  status?: OrderStatus[];
  paymentStatus?: PaymentStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  customer?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  statusBreakdown: Record<OrderStatus, number>;
  paymentMethodBreakdown: Record<PaymentMethod, number>;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface OrderFormData {
  customerId: string;
  items: Omit<OrderItem, 'id' | 'totalPrice'>[];
  paymentMethod: PaymentMethod;
  notes?: string;
  discount?: number;
}

export interface OrderSearchResult {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  stats: OrderStats;
}