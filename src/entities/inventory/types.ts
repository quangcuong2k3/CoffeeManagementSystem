/**
 * Inventory Entity Types
 * Domain-specific types for inventory management
 */

export interface InventoryItem {
  id?: string;
  productId: string;
  productName: string;
  productType: 'Coffee' | 'Bean';
  sku: string;
  supplier: string;
  location: string;
  stockLevels: StockLevel[];
  totalStock: number;
  totalValue: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  notes?: string;
  createdAt: Date;
  lastUpdated: Date;
}

export interface StockLevel {
  size: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  cost: number;
  lastRestocked: Date;
}

export interface StockAlert {
  id?: string;
  productId: string;
  productName: string;
  size: string;
  alertType: 'low_stock' | 'out_of_stock' | 'reorder_point';
  severity: 'low' | 'medium' | 'high' | 'critical';
  currentStock: number;
  threshold: number;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface StockMovement {
  id?: string;
  productId: string;
  productName: string;
  productType: 'Coffee' | 'Bean';
  movementType: 'in' | 'out' | 'adjustment' | 'transfer';
  reason: 'purchase' | 'sale' | 'return' | 'waste' | 'adjustment' | 'transfer';
  quantity: number;
  cost?: number;
  notes?: string;
  reference?: string; // Order ID, Purchase ID, etc.
  userId: string;
  userEmail: string;
  location: string;
  createdAt: Date;
}

export interface StockForecast {
  id: string;
  productId: string;
  productName: string;
  period: ForecastPeriod;
  currentStock: number;
  projectedStock: number;
  predictedSales: number;
  daysUntilStockout: number;
  reorderRecommendation: boolean;
  recommendedOrderQuantity: number;
  confidenceLevel: number;
  factors: ForecastFactor[];
  lastUpdated: Date;
  createdAt: Date;
}

export interface ForecastFactor {
  name: string;
  impact: number;
  description: string;
}

export interface SalesVelocity {
  productId: string;
  productName: string;
  current: number;
  previous: number;
  change: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  period: ForecastPeriod;
}

export type ForecastPeriod = 'weekly' | 'monthly' | 'quarterly';

export interface InventoryFormData {
  productId: string;
  supplier: string;
  location: string;
  stockLevels: StockLevel[];
  notes?: string;
}

export interface InventoryFilters {
  status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  location?: string;
  supplier?: string;
  productType?: 'Coffee' | 'Bean';
  search?: string;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  alertsCount: number;
  averageStockLevel: number;
}