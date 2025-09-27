import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp
} from 'firebase/firestore';
import { firestore } from '../../infra/config/firebase';
import { 
  InventoryItem, 
  StockAlert, 
  StockMovement, 
  InventoryFilters,
  InventoryFormData,
  StockForecast 
} from './types';

export class InventoryRepository {
  private inventoryCollection = 'inventory';
  private alertsCollection = 'stockAlerts';
  private movementsCollection = 'stockMovements';
  private forecastsCollection = 'stockForecasts';

  // Inventory Items Management
  async getInventoryItems(filters: InventoryFilters = {}): Promise<InventoryItem[]> {
    try {
      let q = query(collection(firestore, this.inventoryCollection));

      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters.location) {
        q = query(q, where('location', '==', filters.location));
      }

      if (filters.supplier) {
        q = query(q, where('supplier', '==', filters.supplier));
      }

      if (filters.productType) {
        q = query(q, where('productType', '==', filters.productType));
      }

      q = query(q, orderBy('lastUpdated', 'desc'));

      const querySnapshot = await getDocs(q);
      const items: InventoryItem[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
          stockLevels: data.stockLevels?.map((level: any) => ({
            ...level,
            lastRestocked: level.lastRestocked?.toDate() || new Date()
          })) || []
        } as InventoryItem);
      });

      // Apply search filter if provided
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return items.filter(item =>
          item.productName.toLowerCase().includes(searchTerm) ||
          item.sku.toLowerCase().includes(searchTerm) ||
          item.supplier.toLowerCase().includes(searchTerm)
        );
      }

      return items;
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      throw new Error('Failed to fetch inventory items');
    }
  }

  async getInventoryItemById(id: string): Promise<InventoryItem | null> {
    try {
      const docRef = doc(firestore, this.inventoryCollection, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
          stockLevels: data.stockLevels?.map((level: any) => ({
            ...level,
            lastRestocked: level.lastRestocked?.toDate() || new Date()
          })) || []
        } as InventoryItem;
      }

      return null;
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      throw new Error('Failed to fetch inventory item');
    }
  }

  async getInventoryByProductId(productId: string): Promise<InventoryItem | null> {
    try {
      const q = query(
        collection(firestore, this.inventoryCollection),
        where('productId', '==', productId)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return null;

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
        stockLevels: data.stockLevels?.map((level: any) => ({
          ...level,
          lastRestocked: level.lastRestocked?.toDate() || new Date()
        })) || []
      } as InventoryItem;
    } catch (error) {
      console.error('Error fetching inventory by product ID:', error);
      throw new Error('Failed to fetch inventory by product ID');
    }
  }

  async createInventoryItem(itemData: InventoryFormData & { productName: string; productType: 'Coffee' | 'Bean' }): Promise<string> {
    try {
      const now = new Date();
      const totalStock = itemData.stockLevels.reduce((sum, level) => sum + level.currentStock, 0);
      const totalValue = itemData.stockLevels.reduce((sum, level) => sum + (level.currentStock * level.cost), 0);
      
      // Determine status based on stock levels
      let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
      if (totalStock === 0) {
        status = 'out_of_stock';
      } else if (itemData.stockLevels.some(level => level.currentStock <= level.reorderPoint)) {
        status = 'low_stock';
      }

      const inventoryItem = {
        ...itemData,
        sku: this.generateSKU(itemData.productName, itemData.productType),
        totalStock,
        totalValue,
        status,
        createdAt: now,
        lastUpdated: now,
        stockLevels: itemData.stockLevels.map(level => ({
          ...level,
          lastRestocked: now
        }))
      };

      const docRef = await addDoc(collection(firestore, this.inventoryCollection), inventoryItem);
      return docRef.id;
    } catch (error) {
      console.error('Error creating inventory item:', error);
      throw new Error('Failed to create inventory item');
    }
  }

  async updateInventoryItem(id: string, itemData: Partial<InventoryFormData>): Promise<void> {
    try {
      const updateData: any = {
        ...itemData,
        lastUpdated: new Date(),
      };

      // Recalculate totals if stock levels are being updated
      if (itemData.stockLevels) {
        const totalStock = itemData.stockLevels.reduce((sum, level) => sum + level.currentStock, 0);
        const totalValue = itemData.stockLevels.reduce((sum, level) => sum + (level.currentStock * level.cost), 0);
        
        let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
        if (totalStock === 0) {
          status = 'out_of_stock';
        } else if (itemData.stockLevels.some(level => level.currentStock <= level.reorderPoint)) {
          status = 'low_stock';
        }

        updateData.totalStock = totalStock;
        updateData.totalValue = totalValue;
        updateData.status = status;
      }

      const docRef = doc(firestore, this.inventoryCollection, id);
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw new Error('Failed to update inventory item');
    }
  }

  async deleteInventoryItem(id: string): Promise<void> {
    try {
      const docRef = doc(firestore, this.inventoryCollection, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw new Error('Failed to delete inventory item');
    }
  }

  // Stock Alerts Management
  async getStockAlerts(isReadFilter?: boolean): Promise<StockAlert[]> {
    try {
      let q = query(collection(firestore, this.alertsCollection), orderBy('createdAt', 'desc'));

      if (typeof isReadFilter === 'boolean') {
        q = query(q, where('isRead', '==', isReadFilter));
      }

      const querySnapshot = await getDocs(q);
      const alerts: StockAlert[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        alerts.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as StockAlert);
      });

      return alerts;
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
      throw new Error('Failed to fetch stock alerts');
    }
  }

  async createStockAlert(alert: Omit<StockAlert, 'id' | 'createdAt'>): Promise<string> {
    try {
      const alertData = {
        ...alert,
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(firestore, this.alertsCollection), alertData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating stock alert:', error);
      throw new Error('Failed to create stock alert');
    }
  }

  async markAlertAsRead(id: string): Promise<void> {
    try {
      const docRef = doc(firestore, this.alertsCollection, id);
      await updateDoc(docRef, { isRead: true });
    } catch (error) {
      console.error('Error marking alert as read:', error);
      throw new Error('Failed to mark alert as read');
    }
  }

  // Stock Movements Management
  async getStockMovements(productId?: string, limitCount: number = 50): Promise<StockMovement[]> {
    try {
      let q = query(collection(firestore, this.movementsCollection), orderBy('createdAt', 'desc'));

      if (productId) {
        q = query(q, where('productId', '==', productId));
      }

      q = query(q, limit(limitCount));

      const querySnapshot = await getDocs(q);
      const movements: StockMovement[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        movements.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as StockMovement);
      });

      return movements;
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      throw new Error('Failed to fetch stock movements');
    }
  }

  async createStockMovement(movement: Omit<StockMovement, 'id' | 'createdAt'>): Promise<string> {
    try {
      const movementData = {
        ...movement,
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(firestore, this.movementsCollection), movementData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating stock movement:', error);
      throw new Error('Failed to create stock movement');
    }
  }

  // Stock Forecasts Management
  async getStockForecasts(productId?: string): Promise<StockForecast[]> {
    try {
      let q = query(collection(firestore, this.forecastsCollection), orderBy('lastUpdated', 'desc'));

      if (productId) {
        q = query(q, where('productId', '==', productId));
      }

      const querySnapshot = await getDocs(q);
      const forecasts: StockForecast[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        forecasts.push({
          id: doc.id,
          ...data,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
        } as StockForecast);
      });

      return forecasts;
    } catch (error) {
      console.error('Error fetching stock forecasts:', error);
      throw new Error('Failed to fetch stock forecasts');
    }
  }

  async upsertStockForecast(forecast: Omit<StockForecast, 'id' | 'createdAt' | 'lastUpdated'>): Promise<string> {
    try {
      // Check if forecast exists for this product and period
      const q = query(
        collection(firestore, this.forecastsCollection),
        where('productId', '==', forecast.productId),
        where('period', '==', forecast.period)
      );

      const querySnapshot = await getDocs(q);
      const now = new Date();

      if (querySnapshot.empty) {
        // Create new forecast
        const forecastData = {
          ...forecast,
          createdAt: now,
          lastUpdated: now,
        };

        const docRef = await addDoc(collection(firestore, this.forecastsCollection), forecastData);
        return docRef.id;
      } else {
        // Update existing forecast
        const doc = querySnapshot.docs[0];
        await updateDoc(doc.ref, {
          ...forecast,
          lastUpdated: now,
        });
        return doc.id;
      }
    } catch (error) {
      console.error('Error upserting stock forecast:', error);
      throw new Error('Failed to upsert stock forecast');
    }
  }

  // Helper Methods
  private generateSKU(productName: string, productType: 'Coffee' | 'Bean'): string {
    const prefix = productType === 'Coffee' ? 'COF' : 'BEA';
    const nameCode = productName.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}-${nameCode}-${timestamp}`;
  }
}

export const inventoryRepository = new InventoryRepository();
