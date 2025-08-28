// Core Coffee Application Types
// Based on your Firebase collections and app structure

export interface User {
  uid: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  profileImageUrl?: string;
  avatarInitials?: string;
  avatarBackgroundColor?: string;
  favoriteItems: string[];
  cartItems: CartItem[];
  orderHistory: string[];
  orders?: string[];
  preferences: UserPreferences;
  lastLoginAt?: Date;
  loginAttempts?: number;
  lockedUntil?: Date;
  emailVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
  isAdmin?: boolean;
  role?: 'admin' | 'user' | 'moderator';
}

export interface UserPreferences {
  notifications: boolean;
  theme: 'light' | 'dark';
  language: string;
  defaultPaymentMethod?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  roasted: string;
  imageUrlSquare: string;
  imageUrlPortrait: string;
  ingredients: string;
  special_ingredient: string;
  prices: ProductPrice[];
  average_rating: number;
  ratings_count: string;
  favourite: boolean;
  type: 'Coffee' | 'Bean';
  index: number;
  category: 'coffee' | 'bean';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductPrice {
  size: string;
  price: string;
  currency: string;
  quantity?: number;
}

export interface CartItem extends Product {
  ItemPrice: string;
}

export interface Order {
  id?: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  total: number; // Added total field for compatibility
  paymentMethod: 'stripe' | 'momo' | 'cash';
  orderDate: Date;
  status: OrderStatus;
  deliveryAddress: string;
  paymentId?: string;
  customerInfo: CustomerInfo;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  id: string;
  productId: string; // Added productId
  name: string;
  description: string;
  roasted: string;
  imageUrlSquare: string;
  imageUrlPortrait: string;
  ingredients: string;
  special_ingredient: string;
  prices: ProductPrice[];
  average_rating: number;
  ratings_count: string;
  favourite: boolean;
  type: string;
  index: number;
  category: string;
  quantity: number; // Added quantity
  price: number;    // Added price
  size?: string;    // Added size
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address?: string;
}

export type OrderStatus = 
  | 'pending'
  | 'paid'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'shipped'
  | 'delivered'
  | 'completed' // Added completed status
  | 'cancelled'
  | 'failed';

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

export interface Review {
  id?: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  content: string;
  images: string[];
  verified: boolean;
  helpful: number;
  reported: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id?: string;
  reviewId: string;
  userId: string;
  userName: string;
  userEmail: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard Analytics Types
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  orderGrowth: number;
  customerGrowth: number;
  avgOrderValue: number;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  image: string;
}

export interface RevenueByPaymentMethod {
  method: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface OrderStatusStats {
  status: OrderStatus;
  count: number;
  percentage: number;
}

// Admin Management Types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'staff';
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

// Notification Types
export interface NotificationTemplate {
  id: string;
  type: 'push' | 'email' | 'sms';
  title: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'promotion' | 'notification' | 'announcement';
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
  targetAudience: 'all' | 'vip' | 'new' | 'inactive';
  content: string;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  metrics?: CampaignMetrics;
}

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
}

// Report Types
export interface ReportFilter {
  dateRange: {
    start: Date;
    end: Date;
  };
  products?: string[];
  customers?: string[];
  paymentMethods?: string[];
  orderStatus?: OrderStatus[];
}

export interface SalesReport {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    growth: number;
  };
  dailyData: SalesData[];
  topProducts: TopProduct[];
  paymentMethods: RevenueByPaymentMethod[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface ProductFormData {
  name: string;
  description: string;
  roasted: string;
  ingredients: string;
  special_ingredient: string;
  type: 'Coffee' | 'Bean';
  category: 'coffee' | 'bean';
  prices: ProductPrice[];
  images: {
    square: string;
    portrait: string;
  };
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  role?: 'admin' | 'user' | 'moderator';
  isActive: boolean;
}

export interface InventoryFormData {
  productId: string;
  supplier: string;
  location: string;
  stockLevels: StockLevel[];
  notes?: string;
}

// Stock Forecasting Types
export type ForecastPeriod = 'weekly' | 'monthly' | 'quarterly';

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
