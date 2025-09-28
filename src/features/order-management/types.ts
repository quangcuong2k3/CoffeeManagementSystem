/**
 * Order Management Feature Types
 * Feature-specific types and interfaces
 */

// Re-export order entity types for convenience
export type {
  Order,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  OrderFormData,
  OrderFilters,
  OrderStats,
  OrderItem,
  Customer,
  Payment
} from '../../entities/order';

import type { Order,OrderFilters } from '@/entities/order/types';

// Feature-specific UI types
export interface OrderManagementState {
  selectedOrder: Order | null;
  showCreateModal: boolean;
  showDetailModal: boolean;
  filters: OrderFilters;
}

export interface OrderActionResult {
  success: boolean;
  message?: string;
  order?: Order;
}