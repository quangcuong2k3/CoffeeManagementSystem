'use client';

import { useState } from 'react';
import { inventoryService } from '../service';
import { InventoryItem, InventoryFilters, InventoryFormData, StockAlert } from '../../../entities/inventory/types';

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async (filters: InventoryFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const items = await inventoryService.getInventoryItems(filters);
      setInventory(items);
      return items;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const stockAlerts = await inventoryService.getStockAlerts();
      setAlerts(stockAlerts);
      return stockAlerts;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock alerts');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId: string, data: InventoryFormData) => {
    setLoading(true);
    setError(null);
    try {
      const item = await inventoryService.getInventoryByProductId(productId);
      if (item && item.id) {
        await inventoryService.updateInventoryItem(item.id, data);
      } else {
        // For creating new inventory, we need product name and type
        await inventoryService.createInventoryItem({
          ...data,
          productName: 'Unknown Product', // This should be passed from the calling component
          productType: 'Coffee' // This should be passed from the calling component
        });
      }
      // Refresh inventory data
      await fetchInventory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stock');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const recordStockMovement = async (productId: string, quantity: number, type: 'in' | 'out', reason: string) => {
    setLoading(true);
    setError(null);
    try {
      // For now, we'll use a default size and system user
      // In a real app, these should be passed as parameters
      await inventoryService.processStockMovement(
        productId,
        'default', // size - should be passed as parameter
        quantity,
        type,
        reason,
        'system', // userId - should be passed as parameter
        'system@coffeehouse.com', // userEmail - should be passed as parameter
        undefined, // reference
        undefined // cost
      );
      // Refresh inventory data
      await fetchInventory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record stock movement');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getForecast = async (productId: string, period: 'week' | 'month' | 'quarter' = 'month') => {
    setLoading(true);
    setError(null);
    try {
      // Convert period to match ForecastPeriod type
      const forecastPeriod = period === 'week' ? 'weekly' : 
                           period === 'month' ? 'monthly' : 'quarterly';
      const forecast = await inventoryService.generateStockForecast(productId, forecastPeriod);
      return forecast;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get forecast');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    inventory,
    alerts,
    loading,
    error,
    fetchInventory,
    fetchAlerts,
    updateStock,
    recordStockMovement,
    getForecast
  };
};