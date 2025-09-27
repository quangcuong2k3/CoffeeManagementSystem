import { 
  InventoryItem, 
  StockAlert, 
  StockMovement, 
  InventoryFilters, 
  InventoryFormData, 
  InventoryStats,
  StockForecast,
  SalesVelocity,
  ForecastPeriod
} from '../../../entities/inventory/types';
import { inventoryRepository } from '../../../entities/inventory/repository';

/**
 * Inventory Service - Business Logic Layer
 * Handles all business rules and operations for inventory management
 */
export class InventoryService {
  
  /**
   * Get all inventory items with business rules
   */
  async getInventoryItems(filters: InventoryFilters = {}): Promise<InventoryItem[]> {
    return await inventoryRepository.getInventoryItems(filters);
  }

  /**
   * Get inventory item by ID with validation
   */
  async getInventoryItemById(id: string): Promise<InventoryItem | null> {
    if (!id || id.trim() === '') {
      throw new Error('Inventory item ID is required');
    }

    return await inventoryRepository.getInventoryItemById(id);
  }

  /**
   * Get inventory for a specific product
   */
  async getInventoryByProductId(productId: string): Promise<InventoryItem | null> {
    if (!productId || productId.trim() === '') {
      throw new Error('Product ID is required');
    }

    return await inventoryRepository.getInventoryByProductId(productId);
  }

  /**
   * Create new inventory item with business rules
   */
  async createInventoryItem(
    itemData: InventoryFormData & { productName: string; productType: 'Coffee' | 'Bean' }
  ): Promise<string> {
    // Validate required fields
    this.validateInventoryData(itemData);

    // Business rule: Check if inventory already exists for this product
    const existingInventory = await inventoryRepository.getInventoryByProductId(itemData.productId);
    if (existingInventory) {
      throw new Error('Inventory already exists for this product');
    }

    // Business rule: Validate stock levels
    this.validateStockLevels(itemData.stockLevels);

    const inventoryId = await inventoryRepository.createInventoryItem(itemData);

    // Generate alerts for low stock items
    await this.checkAndCreateStockAlerts(inventoryId);

    return inventoryId;
  }

  /**
   * Update inventory item with business rules
   */
  async updateInventoryItem(id: string, itemData: Partial<InventoryFormData>): Promise<void> {
    if (!id || id.trim() === '') {
      throw new Error('Inventory item ID is required');
    }

    // Check if item exists
    const existingItem = await inventoryRepository.getInventoryItemById(id);
    if (!existingItem) {
      throw new Error('Inventory item not found');
    }

    // Validate stock levels if provided
    if (itemData.stockLevels) {
      this.validateStockLevels(itemData.stockLevels);
    }

    await inventoryRepository.updateInventoryItem(id, itemData);

    // Check for stock alerts after update
    await this.checkAndCreateStockAlerts(id);

    // Log stock movement if stock levels changed
    if (itemData.stockLevels) {
      await this.logStockAdjustment(existingItem, itemData.stockLevels);
    }
  }

  /**
   * Delete inventory item with business rules
   */
  async deleteInventoryItem(id: string): Promise<void> {
    if (!id || id.trim() === '') {
      throw new Error('Inventory item ID is required');
    }

    const existingItem = await inventoryRepository.getInventoryItemById(id);
    if (!existingItem) {
      throw new Error('Inventory item not found');
    }

    // Business rule: Check if there's remaining stock
    if (existingItem.totalStock > 0) {
      throw new Error('Cannot delete inventory item with remaining stock. Please adjust stock to zero first.');
    }

    await inventoryRepository.deleteInventoryItem(id);
  }

  /**
   * Adjust stock levels with proper logging
   */
  async adjustStock(
    inventoryId: string, 
    adjustments: { size: string; quantity: number; reason: string; cost?: number }[],
    userId: string,
    userEmail: string
  ): Promise<void> {
    const inventoryItem = await inventoryRepository.getInventoryItemById(inventoryId);
    if (!inventoryItem) {
      throw new Error('Inventory item not found');
    }

    // Apply adjustments to stock levels
    const updatedStockLevels = inventoryItem.stockLevels.map(level => {
      const adjustment = adjustments.find(adj => adj.size === level.size);
      if (adjustment) {
        const newStock = Math.max(0, level.currentStock + adjustment.quantity);
        return {
          ...level,
          currentStock: newStock,
          cost: adjustment.cost || level.cost,
          lastRestocked: adjustment.quantity > 0 ? new Date() : level.lastRestocked
        };
      }
      return level;
    });

    await inventoryRepository.updateInventoryItem(inventoryId, {
      stockLevels: updatedStockLevels
    });

    // Log each adjustment as a stock movement
    for (const adjustment of adjustments) {
      await inventoryRepository.createStockMovement({
        productId: inventoryItem.productId,
        productName: inventoryItem.productName,
        productType: inventoryItem.productType,
        movementType: adjustment.quantity > 0 ? 'in' : 'out',
        reason: 'adjustment',
        quantity: Math.abs(adjustment.quantity),
        cost: adjustment.cost,
        notes: adjustment.reason,
        userId,
        userEmail,
        location: inventoryItem.location
      });
    }

    // Check for alerts after adjustment
    await this.checkAndCreateStockAlerts(inventoryId);
  }

  /**
   * Process stock movement (sale, purchase, etc.)
   */
  async processStockMovement(
    productId: string,
    size: string,
    quantity: number,
    movementType: 'in' | 'out',
    reason: string,
    userId: string,
    userEmail: string,
    reference?: string,
    cost?: number
  ): Promise<void> {
    const inventoryItem = await inventoryRepository.getInventoryByProductId(productId);
    if (!inventoryItem) {
      throw new Error('Inventory not found for this product');
    }

    // Find the specific stock level for the size
    const stockLevel = inventoryItem.stockLevels.find(level => level.size === size);
    if (!stockLevel) {
      throw new Error(`Stock level not found for size: ${size}`);
    }

    // Business rule: Check if there's enough stock for 'out' movements
    if (movementType === 'out' && stockLevel.currentStock < quantity) {
      throw new Error(`Insufficient stock. Available: ${stockLevel.currentStock}, Required: ${quantity}`);
    }

    // Calculate new stock level
    const newStock = movementType === 'in' 
      ? stockLevel.currentStock + quantity 
      : stockLevel.currentStock - quantity;

    // Update stock level
    const updatedStockLevels = inventoryItem.stockLevels.map(level => 
      level.size === size 
        ? { ...level, currentStock: newStock, lastRestocked: movementType === 'in' ? new Date() : level.lastRestocked }
        : level
    );

    await inventoryRepository.updateInventoryItem(inventoryItem.id!, {
      stockLevels: updatedStockLevels
    });

    // Log the movement
    await inventoryRepository.createStockMovement({
      productId,
      productName: inventoryItem.productName,
      productType: inventoryItem.productType,
      movementType,
      reason: reason as any,
      quantity,
      cost,
      reference,
      userId,
      userEmail,
      location: inventoryItem.location
    });

    // Check for alerts after movement
    await this.checkAndCreateStockAlerts(inventoryItem.id!);
  }

  /**
   * Get inventory statistics
   */
  async getInventoryStats(): Promise<InventoryStats> {
    const allItems = await inventoryRepository.getInventoryItems();
    const alerts = await inventoryRepository.getStockAlerts(false);

    return {
      totalItems: allItems.length,
      totalValue: allItems.reduce((sum, item) => sum + item.totalValue, 0),
      lowStockItems: allItems.filter(item => item.status === 'low_stock').length,
      outOfStockItems: allItems.filter(item => item.status === 'out_of_stock').length,
      alertsCount: alerts.length,
      averageStockLevel: allItems.length > 0 
        ? allItems.reduce((sum, item) => sum + item.totalStock, 0) / allItems.length 
        : 0
    };
  }

  /**
   * Get stock alerts with business logic
   */
  async getStockAlerts(unreadOnly: boolean = false): Promise<StockAlert[]> {
    return await inventoryRepository.getStockAlerts(unreadOnly ? false : undefined);
  }

  /**
   * Mark alert as read
   */
  async markAlertAsRead(alertId: string): Promise<void> {
    if (!alertId || alertId.trim() === '') {
      throw new Error('Alert ID is required');
    }

    await inventoryRepository.markAlertAsRead(alertId);
  }

  /**
   * Get stock movements with filtering
   */
  async getStockMovements(productId?: string, limit: number = 50): Promise<StockMovement[]> {
    if (limit > 200) limit = 200; // Business rule: limit maximum results
    
    return await inventoryRepository.getStockMovements(productId, limit);
  }

  /**
   * Generate stock forecast
   */
  async generateStockForecast(productId: string, period: ForecastPeriod): Promise<StockForecast> {
    const inventoryItem = await inventoryRepository.getInventoryByProductId(productId);
    if (!inventoryItem) {
      throw new Error('Inventory not found for this product');
    }

    // Get historical movements for analysis
    const movements = await inventoryRepository.getStockMovements(productId, 100);
    const outMovements = movements.filter(m => m.movementType === 'out');

    // Calculate sales velocity
    const salesVelocity = this.calculateSalesVelocity(outMovements, period);
    const currentStock = inventoryItem.totalStock;

    // Simple forecasting logic
    const daysUntilStockout = salesVelocity.current > 0 
      ? Math.floor(currentStock / salesVelocity.current) 
      : 999;

    const projectedStock = Math.max(0, currentStock - (salesVelocity.current * this.getPeriodDays(period)));
    const reorderRecommendation = daysUntilStockout <= this.getReorderThreshold(period);

    // Calculate recommended order quantity
    const minStockLevel = inventoryItem.stockLevels.reduce((sum, level) => sum + level.minStock, 0);
    const maxStockLevel = inventoryItem.stockLevels.reduce((sum, level) => sum + level.maxStock, 0);
    const recommendedOrderQuantity = reorderRecommendation 
      ? Math.max(maxStockLevel - projectedStock, minStockLevel)
      : 0;

    const forecast: Omit<StockForecast, 'id' | 'createdAt' | 'lastUpdated'> = {
      productId,
      productName: inventoryItem.productName,
      period,
      currentStock,
      projectedStock,
      predictedSales: salesVelocity.current * this.getPeriodDays(period),
      daysUntilStockout,
      reorderRecommendation,
      recommendedOrderQuantity,
      confidenceLevel: this.calculateConfidenceLevel(outMovements, period),
      factors: [
        {
          name: 'Historical Sales',
          impact: 0.7,
          description: 'Based on recent sales patterns'
        },
        {
          name: 'Stock Status',
          impact: 0.2,
          description: 'Current stock level analysis'
        },
        {
          name: 'Seasonality',
          impact: 0.1,
          description: 'Seasonal demand patterns'
        }
      ]
    };

    // Save or update the forecast
    const forecastId = await inventoryRepository.upsertStockForecast(forecast);

    return {
      id: forecastId,
      ...forecast,
      createdAt: new Date(),
      lastUpdated: new Date()
    };
  }

  /**
   * Get stock forecasts
   */
  async getStockForecasts(productId?: string): Promise<StockForecast[]> {
    return await inventoryRepository.getStockForecasts(productId);
  }

  // Private helper methods

  private validateInventoryData(itemData: InventoryFormData & { productName: string; productType: 'Coffee' | 'Bean' }): void {
    if (!itemData.productId || itemData.productId.trim() === '') {
      throw new Error('Product ID is required');
    }

    if (!itemData.productName || itemData.productName.trim() === '') {
      throw new Error('Product name is required');
    }

    if (!itemData.supplier || itemData.supplier.trim() === '') {
      throw new Error('Supplier is required');
    }

    if (!itemData.location || itemData.location.trim() === '') {
      throw new Error('Location is required');
    }

    if (!itemData.stockLevels || itemData.stockLevels.length === 0) {
      throw new Error('At least one stock level must be specified');
    }
  }

  private validateStockLevels(stockLevels: any[]): void {
    for (const level of stockLevels) {
      if (!level.size || level.size.trim() === '') {
        throw new Error('Stock level size is required');
      }

      if (typeof level.currentStock !== 'number' || level.currentStock < 0) {
        throw new Error('Valid current stock amount is required');
      }

      if (typeof level.minStock !== 'number' || level.minStock < 0) {
        throw new Error('Valid minimum stock amount is required');
      }

      if (typeof level.maxStock !== 'number' || level.maxStock < level.minStock) {
        throw new Error('Maximum stock must be greater than minimum stock');
      }

      if (typeof level.reorderPoint !== 'number' || level.reorderPoint < 0) {
        throw new Error('Valid reorder point is required');
      }

      if (typeof level.cost !== 'number' || level.cost < 0) {
        throw new Error('Valid cost is required');
      }
    }
  }

  private async checkAndCreateStockAlerts(inventoryId: string): Promise<void> {
    const inventoryItem = await inventoryRepository.getInventoryItemById(inventoryId);
    if (!inventoryItem) return;

    for (const stockLevel of inventoryItem.stockLevels) {
      let alertType: 'low_stock' | 'out_of_stock' | 'reorder_point' | null = null;
      let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
      let threshold = 0;

      if (stockLevel.currentStock === 0) {
        alertType = 'out_of_stock';
        severity = 'critical';
        threshold = 0;
      } else if (stockLevel.currentStock <= stockLevel.reorderPoint) {
        alertType = 'reorder_point';
        severity = 'high';
        threshold = stockLevel.reorderPoint;
      } else if (stockLevel.currentStock <= stockLevel.minStock) {
        alertType = 'low_stock';
        severity = 'medium';
        threshold = stockLevel.minStock;
      }

      if (alertType) {
        await inventoryRepository.createStockAlert({
          productId: inventoryItem.productId,
          productName: inventoryItem.productName,
          size: stockLevel.size,
          alertType,
          severity,
          currentStock: stockLevel.currentStock,
          threshold,
          message: this.generateAlertMessage(alertType, inventoryItem.productName, stockLevel.size, stockLevel.currentStock, threshold),
          isRead: false
        });
      }
    }
  }

  private async logStockAdjustment(
    existingItem: InventoryItem, 
    newStockLevels: any[]
  ): Promise<void> {
    // Compare old vs new stock levels and log differences
    for (const newLevel of newStockLevels) {
      const oldLevel = existingItem.stockLevels.find(level => level.size === newLevel.size);
      if (oldLevel && oldLevel.currentStock !== newLevel.currentStock) {
        const difference = newLevel.currentStock - oldLevel.currentStock;
        
        await inventoryRepository.createStockMovement({
          productId: existingItem.productId,
          productName: existingItem.productName,
          productType: existingItem.productType,
          movementType: difference > 0 ? 'in' : 'out',
          reason: 'adjustment',
          quantity: Math.abs(difference),
          userId: 'system', // In real app, get from context
          userEmail: 'system@coffeehouse.com',
          location: existingItem.location,
          notes: 'Inventory adjustment'
        });
      }
    }
  }

  private calculateSalesVelocity(movements: StockMovement[], period: ForecastPeriod): SalesVelocity {
    const periodDays = this.getPeriodDays(period);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);

    const recentMovements = movements.filter(m => m.createdAt >= cutoffDate);
    const totalSales = recentMovements.reduce((sum, movement) => sum + movement.quantity, 0);
    const dailyAverage = totalSales / periodDays;

    return {
      productId: movements[0]?.productId || '',
      productName: movements[0]?.productName || '',
      current: dailyAverage,
      previous: dailyAverage * 0.9, // Simplified calculation
      change: 0.1,
      trend: 'stable',
      period
    };
  }

  private getPeriodDays(period: ForecastPeriod): number {
    switch (period) {
      case 'weekly': return 7;
      case 'monthly': return 30;
      case 'quarterly': return 90;
      default: return 30;
    }
  }

  private getReorderThreshold(period: ForecastPeriod): number {
    switch (period) {
      case 'weekly': return 7;
      case 'monthly': return 14;
      case 'quarterly': return 30;
      default: return 14;
    }
  }

  private calculateConfidenceLevel(movements: StockMovement[], period: ForecastPeriod): number {
    // Simple confidence calculation based on data availability
    const minMovementsRequired = this.getPeriodDays(period) / 2;
    const confidenceRatio = Math.min(movements.length / minMovementsRequired, 1);
    return Math.round(confidenceRatio * 100);
  }

  private generateAlertMessage(
    alertType: 'low_stock' | 'out_of_stock' | 'reorder_point',
    productName: string,
    size: string,
    currentStock: number,
    threshold: number
  ): string {
    switch (alertType) {
      case 'out_of_stock':
        return `${productName} (${size}) is out of stock`;
      case 'low_stock':
        return `${productName} (${size}) is running low: ${currentStock} remaining (minimum: ${threshold})`;
      case 'reorder_point':
        return `${productName} (${size}) has reached reorder point: ${currentStock} remaining (reorder at: ${threshold})`;
      default:
        return `Stock alert for ${productName} (${size})`;
    }
  }
}

// Export singleton instance
export const inventoryService = new InventoryService();