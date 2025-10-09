import { productService } from './productService';
import { inventoryService } from './inventoryService';
import { OrderService } from './orderService';
import { UserService } from './userService';
import { FirestoreOrderRepository } from '@/entities/order';

export interface KPIStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockItems: number;
}

export interface TimeSeriesPoint {
  date: string; // ISO date
  revenue: number;
  orders: number;
}

export interface AnalyticsDashboardData {
  kpis: KPIStats;
  revenueSeries: TimeSeriesPoint[];
  topProducts: Array<{ id: string; name: string; revenue: number; orders: number }>;
}

export class AnalyticsService {
  private orderService: OrderService;
  private userService: UserService;

  constructor() {
    const orderRepo = new FirestoreOrderRepository();
    this.orderService = new OrderService(orderRepo);
    this.userService = new UserService();
  }

  async getDashboardAnalytics(days: number = 30): Promise<AnalyticsDashboardData> {
    // Fetch base datasets in parallel
    const [productStats, inventoryItems, ordersResult, usersResult] = await Promise.all([
      productService.getProductStats().catch(() => ({ totalProducts: 0 } as any)),
      inventoryService.getInventoryItems({}).catch(() => []),
      this.orderService.getOrders({}, 1, 1000).catch(() => ({ orders: [] } as any)),
      this.userService.getUsers({}, 1_000, 0).catch(() => ({ users: [] } as any))
    ]);

    const orders = (ordersResult as any).orders || [];
    const users = (usersResult as any).users || [];

    // KPIs
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total || o.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const totalCustomers = users.length;
    const totalProducts = productStats.totalProducts || 0;
    const lowStockItems = inventoryItems.filter((i: any) => i.status === 'low_stock' || i.status === 'out_of_stock').length;

    // Time series (by day)
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - (days - 1));

    const seriesMap = new Map<string, { revenue: number; orders: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(fromDate);
      d.setDate(fromDate.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      seriesMap.set(key, { revenue: 0, orders: 0 });
    }

    for (const o of orders) {
      const date = (o.createdAt instanceof Date) ? o.createdAt : (o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt));
      if (!date) continue;
      const key = date.toISOString().slice(0, 10);
      if (seriesMap.has(key)) {
        const curr = seriesMap.get(key)!;
        curr.orders += 1;
        curr.revenue += (o.total || o.totalAmount || 0);
      }
    }

    const revenueSeries: TimeSeriesPoint[] = Array.from(seriesMap.entries()).map(([date, v]) => ({ date, revenue: v.revenue, orders: v.orders }));

    // Top products by revenue (rough: sum item totals if present)
    const productRevenue = new Map<string, { name: string; revenue: number; orders: number }>();
    for (const o of orders) {
      const items = o.items || [];
      for (const it of items) {
        const id = it.productId || it.id || it.name;
        if (!id) continue;
        const price = typeof it.price === 'number' ? it.price : parseFloat(it.price || '0');
        const quantity = it.quantity || 1;
        const name = it.name || id;
        if (!productRevenue.has(id)) productRevenue.set(id, { name, revenue: 0, orders: 0 });
        const agg = productRevenue.get(id)!;
        agg.revenue += (price || 0) * quantity;
        agg.orders += 1;
      }
    }

    const topProducts = Array.from(productRevenue.entries())
      .map(([id, v]) => ({ id, name: v.name, revenue: v.revenue, orders: v.orders }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      kpis: { totalRevenue, totalOrders, totalCustomers, totalProducts, lowStockItems },
      revenueSeries,
      topProducts
    };
  }
}

export const analyticsService = new AnalyticsService();
