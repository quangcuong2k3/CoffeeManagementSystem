import { productService } from './productService';
import { UserService } from './userService';
import { OrderService } from './orderService';
import { FirestoreOrderRepository } from '@/entities/order';

export type GlobalSearchResultItem =
  | { type: 'product'; item: any }
  | { type: 'order'; item: any }
  | { type: 'user'; item: any };

export interface GlobalSearchResults {
  products: any[];
  orders: any[];
  users: any[];
}

function buildRegex(term: string): RegExp | null {
  const q = term.trim();
  if (!q) return null;
  try {
    return new RegExp(`(${q.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'ig');
  } catch {
    return null;
  }
}

function highlight(text: string | undefined, rx: RegExp | null): string | undefined {
  if (!text || !rx) return text;
  return text.replace(rx, '<mark class="bg-amber-200 dark:bg-amber-900/40 rounded px-0.5">$1</mark>');
}

export class SearchService {
  private orderService: OrderService;
  private userService: UserService;

  constructor() {
    const orderRepo = new FirestoreOrderRepository();
    this.orderService = new OrderService(orderRepo);
    this.userService = new UserService();
  }

  async searchAll(term: string): Promise<GlobalSearchResults> {
    const query = term?.trim();
    if (!query) {
      return { products: [], orders: [], users: [] };
    }

    const rx = buildRegex(query);

    // Run searches in parallel; each search is resilient
    const [productsRaw, ordersRaw, usersRaw] = await Promise.all([
      this.searchProducts(query).catch(() => []),
      this.searchOrders(query).catch(() => []),
      this.searchUsers(query).catch(() => [])
    ]);

    const products = productsRaw.map((p: any) => ({
      ...p,
      __highlight: {
        title: highlight(p.name, rx),
        meta: highlight(`${p.category || ''} • ${p.type || ''}`, rx),
      }
    }));

    const orders = ordersRaw.map((o: any) => ({
      ...o,
      __highlight: {
        title: highlight(`Order #${o.orderNumber || o.id}`, rx),
        meta: highlight(`${o.customer?.name || 'Customer'} • ${o.status || ''}`, rx),
      }
    }));

    const users = usersRaw.map((u: any) => ({
      ...u,
      __highlight: {
        title: highlight(u.displayName || u.name || u.email, rx),
        meta: highlight(u.email, rx),
      }
    }));

    return { products, orders, users };
  }

  private async searchProducts(term: string) {
    try {
      return await productService.searchProducts(term, {});
    } catch {
      return [];
    }
  }

  private async searchOrders(term: string) {
    // Fallback approach: fetch recent orders and filter client-side by orderNumber or customer name
    try {
      const result = await this.orderService.getOrders({}, 1, 50);
      const lower = term.toLowerCase();
      return result.orders.filter((o: any) => {
        const orderNum = (o.orderNumber || '').toString().toLowerCase();
        const customer = (o.customer?.name || '').toLowerCase();
        return orderNum.includes(lower) || customer.includes(lower);
      });
    } catch {
      return [];
    }
  }

  private async searchUsers(term: string) {
    try {
      const result = await this.userService.getUsers({ search: term } as any, 20, 0);
      return result.users || [];
    } catch {
      return [];
    }
  }
}

export const searchService = new SearchService();