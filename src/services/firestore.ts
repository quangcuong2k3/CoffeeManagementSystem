import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  writeBatch,
  Timestamp,
  DocumentSnapshot,
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { 
  User, 
  Product, 
  Order, 
  InventoryItem, 
  StockAlert, 
  StockMovement,
  Review,
  PaginatedResponse,
  ApiResponse 
} from '@/types';

// Collection References - matching your existing Firebase structure
export const collections = {
  users: 'users',
  products: 'products',     // Unified products collection
  coffees: 'coffees',       // Separate coffee collection  
  beans: 'beans',           // Separate bean collection
  orders: 'orders',
  inventory: 'inventory',
  stockAlerts: 'stockAlerts',
  stockMovements: 'stockMovements',
  reviews: 'reviews',
  comments: 'comments',
  userPreferences: 'userPreferences',
} as const;

// Generic Firestore Service Class
class FirestoreService {
  // Generic CRUD operations
  async create<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(firestore, collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  async read<T>(collectionName: string, id: string): Promise<T | null> {
    try {
      const docRef = doc(firestore, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error reading document from ${collectionName}:`, error);
      throw error;
    }
  }

  async update<T>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = doc(firestore, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  }

  async delete(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(firestore, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }

  async list<T>(
    collectionName: string,
    options?: {
      orderByField?: string;
      orderDirection?: 'asc' | 'desc';
      limitCount?: number;
      whereClause?: { field: string; operator: any; value: any };
    }
  ): Promise<T[]> {
    try {
      let q = collection(firestore, collectionName);
      let queryConstraints: any[] = [];

      if (options?.whereClause) {
        queryConstraints.push(
          where(options.whereClause.field, options.whereClause.operator, options.whereClause.value)
        );
      }

      if (options?.orderByField) {
        queryConstraints.push(
          orderBy(options.orderByField, options.orderDirection || 'asc')
        );
      }

      if (options?.limitCount) {
        queryConstraints.push(limit(options.limitCount));
      }

      const queryRef = query(q, ...queryConstraints);
      const querySnapshot = await getDocs(queryRef);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      console.error(`Error listing documents from ${collectionName}:`, error);
      throw error;
    }
  }

  async listPaginated<T>(
    collectionName: string,
    page: number = 1,
    pageSize: number = 10,
    options?: {
      orderByField?: string;
      orderDirection?: 'asc' | 'desc';
      whereClause?: { field: string; operator: any; value: any };
    }
  ): Promise<PaginatedResponse<T>> {
    try {
      let queryConstraints: any[] = [];

      if (options?.whereClause) {
        queryConstraints.push(
          where(options.whereClause.field, options.whereClause.operator, options.whereClause.value)
        );
      }

      if (options?.orderByField) {
        queryConstraints.push(
          orderBy(options.orderByField, options.orderDirection || 'asc')
        );
      }

      // Get total count
      const countQuery = query(collection(firestore, collectionName), ...queryConstraints);
      const countSnapshot = await getDocs(countQuery);
      const total = countSnapshot.size;

      // Get paginated data
      queryConstraints.push(limit(pageSize));
      if (page > 1) {
        const offset = (page - 1) * pageSize;
        const startAtDoc = countSnapshot.docs[offset - 1];
        if (startAtDoc) {
          queryConstraints.push(startAfter(startAtDoc));
        }
      }

      const paginatedQuery = query(collection(firestore, collectionName), ...queryConstraints);
      const paginatedSnapshot = await getDocs(paginatedQuery);

      const data = paginatedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      return {
        success: true,
        data,
        pagination: {
          page,
          limit: pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      console.error(`Error in paginated query for ${collectionName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: [],
        pagination: {
          page,
          limit: pageSize,
          total: 0,
          totalPages: 0,
        },
      };
    }
  }

  // Real-time subscriptions
  subscribe<T>(
    collectionName: string,
    callback: (data: T[]) => void,
    options?: {
      orderByField?: string;
      orderDirection?: 'asc' | 'desc';
      whereClause?: { field: string; operator: any; value: any };
    }
  ): () => void {
    let q = collection(firestore, collectionName);
    let queryConstraints: any[] = [];

    if (options?.whereClause) {
      queryConstraints.push(
        where(options.whereClause.field, options.whereClause.operator, options.whereClause.value)
      );
    }

    if (options?.orderByField) {
      queryConstraints.push(
        orderBy(options.orderByField, options.orderDirection || 'asc')
      );
    }

    const queryRef = query(q, ...queryConstraints);

    return onSnapshot(queryRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
      callback(data);
    });
  }

  // Batch operations
  async batchWrite(operations: Array<{
    type: 'create' | 'update' | 'delete';
    collection: string;
    id?: string;
    data?: any;
  }>): Promise<void> {
    try {
      const batch = writeBatch(firestore);

      operations.forEach(operation => {
        switch (operation.type) {
          case 'create':
            if (operation.data) {
              const docRef = doc(collection(firestore, operation.collection));
              batch.set(docRef, {
                ...operation.data,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
              });
            }
            break;
          case 'update':
            if (operation.id && operation.data) {
              const docRef = doc(firestore, operation.collection, operation.id);
              batch.update(docRef, {
                ...operation.data,
                updatedAt: Timestamp.now(),
              });
            }
            break;
          case 'delete':
            if (operation.id) {
              const docRef = doc(firestore, operation.collection, operation.id);
              batch.delete(docRef);
            }
            break;
        }
      });

      await batch.commit();
    } catch (error) {
      console.error('Error in batch write:', error);
      throw error;
    }
  }
}

// Create and export service instance
export const firestoreService = new FirestoreService();

// Specific service functions for each collection
export const userService = {
  getAll: () => firestoreService.list<User>(collections.users),
  getById: (id: string) => firestoreService.read<User>(collections.users, id),
  create: (data: Omit<User, 'id'>) => firestoreService.create<User>(collections.users, data),
  update: (id: string, data: Partial<User>) => firestoreService.update<User>(collections.users, id, data),
  delete: (id: string) => firestoreService.delete(collections.users, id),
  getPaginated: (page: number, limit: number) => 
    firestoreService.listPaginated<User>(collections.users, page, limit, {
      orderByField: 'createdAt',
      orderDirection: 'desc'
    }),
  subscribe: (callback: (users: User[]) => void) => 
    firestoreService.subscribe<User>(collections.users, callback, {
      orderByField: 'createdAt',
      orderDirection: 'desc'
    }),
};

export const productService = {
  getAll: () => firestoreService.list<Product>(collections.products),
  getById: (id: string) => firestoreService.read<Product>(collections.products, id),
  create: (data: Omit<Product, 'id'>) => firestoreService.create<Product>(collections.products, data),
  update: (id: string, data: Partial<Product>) => firestoreService.update<Product>(collections.products, id, data),
  delete: (id: string) => firestoreService.delete(collections.products, id),
  getPaginated: (page: number, limit: number) => 
    firestoreService.listPaginated<Product>(collections.products, page, limit, {
      orderByField: 'createdAt',
      orderDirection: 'desc'
    }),
  getByCategory: (category: 'coffee' | 'bean') =>
    firestoreService.list<Product>(collections.products, {
      whereClause: { field: 'category', operator: '==', value: category }
    }),
  subscribe: (callback: (products: Product[]) => void) => 
    firestoreService.subscribe<Product>(collections.products, callback, {
      orderByField: 'createdAt',
      orderDirection: 'desc'
    }),
};

export const orderService = {
  getAll: () => firestoreService.list<Order>(collections.orders),
  getById: (id: string) => firestoreService.read<Order>(collections.orders, id),
  create: (data: Omit<Order, 'id'>) => firestoreService.create<Order>(collections.orders, data),
  update: (id: string, data: Partial<Order>) => firestoreService.update<Order>(collections.orders, id, data),
  delete: (id: string) => firestoreService.delete(collections.orders, id),
  getPaginated: (page: number, limit: number) => 
    firestoreService.listPaginated<Order>(collections.orders, page, limit, {
      orderByField: 'orderDate',
      orderDirection: 'desc'
    }),
  getByStatus: (status: string) =>
    firestoreService.list<Order>(collections.orders, {
      whereClause: { field: 'status', operator: '==', value: status }
    }),
  getByUser: (userId: string) =>
    firestoreService.list<Order>(collections.orders, {
      whereClause: { field: 'userId', operator: '==', value: userId }
    }),
  subscribe: (callback: (orders: Order[]) => void) => 
    firestoreService.subscribe<Order>(collections.orders, callback, {
      orderByField: 'orderDate',
      orderDirection: 'desc'
    }),
};

export const inventoryService = {
  getAll: () => firestoreService.list<InventoryItem>(collections.inventory),
  getById: (id: string) => firestoreService.read<InventoryItem>(collections.inventory, id),
  create: (data: Omit<InventoryItem, 'id'>) => firestoreService.create<InventoryItem>(collections.inventory, data),
  update: (id: string, data: Partial<InventoryItem>) => firestoreService.update<InventoryItem>(collections.inventory, id, data),
  delete: (id: string) => firestoreService.delete(collections.inventory, id),
  getPaginated: (page: number, limit: number) => 
    firestoreService.listPaginated<InventoryItem>(collections.inventory, page, limit, {
      orderByField: 'lastUpdated',
      orderDirection: 'desc'
    }),
  getLowStock: () =>
    firestoreService.list<InventoryItem>(collections.inventory, {
      whereClause: { field: 'status', operator: 'in', value: ['low_stock', 'out_of_stock'] }
    }),
  subscribe: (callback: (items: InventoryItem[]) => void) => 
    firestoreService.subscribe<InventoryItem>(collections.inventory, callback, {
      orderByField: 'lastUpdated',
      orderDirection: 'desc'
    }),
};

export const alertService = {
  getAll: () => firestoreService.list<StockAlert>(collections.stockAlerts),
  getById: (id: string) => firestoreService.read<StockAlert>(collections.stockAlerts, id),
  create: (data: Omit<StockAlert, 'id'>) => firestoreService.create<StockAlert>(collections.stockAlerts, data),
  update: (id: string, data: Partial<StockAlert>) => firestoreService.update<StockAlert>(collections.stockAlerts, id, data),
  delete: (id: string) => firestoreService.delete(collections.stockAlerts, id),
  getUnread: () =>
    firestoreService.list<StockAlert>(collections.stockAlerts, {
      whereClause: { field: 'isRead', operator: '==', value: false }
    }),
  subscribe: (callback: (alerts: StockAlert[]) => void) => 
    firestoreService.subscribe<StockAlert>(collections.stockAlerts, callback, {
      orderByField: 'createdAt',
      orderDirection: 'desc'
    }),
};

export const reviewService = {
  getAll: () => firestoreService.list<Review>(collections.reviews),
  getById: (id: string) => firestoreService.read<Review>(collections.reviews, id),
  create: (data: Omit<Review, 'id'>) => firestoreService.create<Review>(collections.reviews, data),
  update: (id: string, data: Partial<Review>) => firestoreService.update<Review>(collections.reviews, id, data),
  delete: (id: string) => firestoreService.delete(collections.reviews, id),
  getByProduct: (productId: string) =>
    firestoreService.list<Review>(collections.reviews, {
      whereClause: { field: 'productId', operator: '==', value: productId }
    }),
  getPending: () =>
    firestoreService.list<Review>(collections.reviews, {
      whereClause: { field: 'reported', operator: '==', value: true }
    }),
  subscribe: (callback: (reviews: Review[]) => void) => 
    firestoreService.subscribe<Review>(collections.reviews, callback, {
      orderByField: 'createdAt',
      orderDirection: 'desc'
    }),
};

// Coffee Service - for separate coffee collection
export const coffeeService = {
  getAll: () => firestoreService.list<Product>(collections.coffees),
  getById: (id: string) => firestoreService.read<Product>(collections.coffees, id),
  create: (data: Omit<Product, 'id'>) => firestoreService.create<Product>(collections.coffees, data),
  update: (id: string, data: Partial<Product>) => firestoreService.update<Product>(collections.coffees, id, data),
  delete: (id: string) => firestoreService.delete(collections.coffees, id),
  getByCategory: (category: string) =>
    firestoreService.list<Product>(collections.coffees, {
      whereClause: { field: 'category', operator: '==', value: category }
    }),
  getInStock: () =>
    firestoreService.list<Product>(collections.coffees, {
      whereClause: { field: 'available', operator: '==', value: true }
    }),
};

// Beans Service - for separate beans collection  
export const beansService = {
  getAll: () => firestoreService.list<Product>(collections.beans),
  getById: (id: string) => firestoreService.read<Product>(collections.beans, id),
  create: (data: Omit<Product, 'id'>) => firestoreService.create<Product>(collections.beans, data),
  update: (id: string, data: Partial<Product>) => firestoreService.update<Product>(collections.beans, id, data),
  delete: (id: string) => firestoreService.delete(collections.beans, id),
  getInStock: () =>
    firestoreService.list<Product>(collections.beans, {
      whereClause: { field: 'available', operator: '==', value: true }
    }),
};

// Stock Movements Service
export const stockMovementService = {
  getAll: () => firestoreService.list<StockMovement>(collections.stockMovements),
  getById: (id: string) => firestoreService.read<StockMovement>(collections.stockMovements, id),
  create: (data: Omit<StockMovement, 'id'>) => firestoreService.create<StockMovement>(collections.stockMovements, data),
  getByProduct: (productId: string) =>
    firestoreService.list<StockMovement>(collections.stockMovements, {
      whereClause: { field: 'productId', operator: '==', value: productId },
      orderByField: 'createdAt',
      orderDirection: 'desc'
    }),
  getRecent: (limitCount = 10) =>
    firestoreService.list<StockMovement>(collections.stockMovements, {
      orderByField: 'createdAt',
      orderDirection: 'desc',
      limitCount
    }),
};

// Analytics helper functions
export const analyticsService = {
  // Get total counts for dashboard
  async getDashboardStats() {
    const [users, orders, products, reviews] = await Promise.all([
      userService.getAll(),
      orderService.getAll(),
      productService.getAll(),
      reviewService.getAll()
    ]);

    return {
      totalUsers: users.length,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalReviews: reviews.length,
      pendingOrders: orders.filter(order => order.status === 'pending').length,
      completedOrders: orders.filter(order => order.status === 'completed').length
    };
  },

  // Get sales data for charts
  async getSalesData(startDate?: Date, endDate?: Date) {
    let ordersQuery = firestoreService.list<Order>(collections.orders, {
      whereClause: { field: 'status', operator: '==', value: 'completed' },
      orderByField: 'createdAt',
      orderDirection: 'desc'
    });

    const orders = await ordersQuery;
    
    // Group by date for chart data
    const salesByDate = orders.reduce((acc: Record<string, number>, order) => {
      // Handle both Date objects and Firestore Timestamps
      let date: string;
      if (order.createdAt instanceof Date) {
        date = order.createdAt.toISOString().split('T')[0];
      } else if (order.createdAt && typeof order.createdAt === 'object' && 'toDate' in order.createdAt) {
        // Handle Firestore Timestamp
        date = (order.createdAt as any).toDate().toISOString().split('T')[0];
      } else {
        date = 'unknown';
      }
      
      acc[date] = (acc[date] || 0) + (order.total || order.totalAmount || 0);
      return acc;
    }, {});

    return Object.entries(salesByDate).map(([date, total]) => ({
      date,
      total
    }));
  },

  // Get popular products
  async getPopularProducts(limit = 5) {
    const orders = await orderService.getAll();
    const productCounts: Record<string, number> = {};

    orders.forEach(order => {
      order.items?.forEach(item => {
        productCounts[item.productId] = (productCounts[item.productId] || 0) + item.quantity;
      });
    });

    const sortedProducts = Object.entries(productCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit);

    return sortedProducts.map(([productId, count]) => ({
      productId,
      count
    }));
  }
};

export default firestoreService;
