'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Package,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Plus,
  Minus,
  BarChart3,
  Calendar,
  Truck,
  DollarSign,
  Users
} from 'lucide-react';
import { InventoryItem, StockMovement, Product, StockAlert } from '@/types';

interface InventoryDashboardProps {
  products: Product[];
}

export function InventoryDashboard({ products }: InventoryDashboardProps) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    loadInventoryData();
    loadStockMovements();
    loadStockAlerts();
  }, [products]);

  const loadInventoryData = () => {
    // Mock inventory data based on products
    const mockInventory: InventoryItem[] = products.map((product, index) => ({
      id: `inv-${product.id}`,
      productId: product.id,
      productName: product.name,
      productType: product.type,
      sku: `SKU-${product.id}-${Date.now()}`,
      supplier: ['Premium Coffee Co.', 'Bean Masters', 'Roast Excellence'][index % 3],
      location: ['Warehouse A', 'Warehouse B', 'Store Front'][index % 3],
      stockLevels: product.prices.map(price => ({
        size: price.size,
        currentStock: Math.floor(Math.random() * 200) + 10,
        minStock: 20,
        maxStock: 500,
        reorderPoint: 50,
        cost: parseFloat(price.price) * 0.6, // Mock cost at 60% of selling price
        lastRestocked: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      })),
      totalStock: 0,
      totalValue: 0,
      status: 'in_stock',
      createdAt: new Date(),
      lastUpdated: new Date()
    }));

    // Calculate totals and status
    mockInventory.forEach(item => {
      item.totalStock = item.stockLevels.reduce((sum, level) => sum + level.currentStock, 0);
      item.totalValue = item.stockLevels.reduce((sum, level) => sum + (level.currentStock * level.cost), 0);
      
      const hasLowStock = item.stockLevels.some(level => level.currentStock <= level.reorderPoint);
      const hasOutOfStock = item.stockLevels.some(level => level.currentStock === 0);
      
      if (hasOutOfStock) {
        item.status = 'out_of_stock';
      } else if (hasLowStock) {
        item.status = 'low_stock';
      } else {
        item.status = 'in_stock';
      }
    });

    setInventoryItems(mockInventory);
  };

  const loadStockMovements = () => {
    // Mock stock movements
    const mockMovements: StockMovement[] = [];
    const movementTypes = ['in', 'out', 'adjustment'] as const;
    const reasons = ['purchase', 'sale', 'return', 'waste', 'adjustment'] as const;

    for (let i = 0; i < 20; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      mockMovements.push({
        id: `mov-${i}`,
        productId: product.id,
        productName: product.name,
        productType: product.type,
        movementType: movementTypes[Math.floor(Math.random() * movementTypes.length)],
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        quantity: Math.floor(Math.random() * 100) + 1,
        cost: Math.random() * 100,
        userId: 'admin',
        userEmail: 'admin@coffeehouse.com',
        location: 'Warehouse A',
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      });
    }

    setStockMovements(mockMovements.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
  };

  const loadStockAlerts = () => {
    const alerts: StockAlert[] = [];
    
    inventoryItems.forEach(item => {
      item.stockLevels.forEach(level => {
        if (level.currentStock <= level.reorderPoint) {
          alerts.push({
            id: `alert-${item.id}-${level.size}`,
            productId: item.productId,
            productName: item.productName,
            size: level.size,
            alertType: level.currentStock === 0 ? 'out_of_stock' : 'low_stock',
            severity: level.currentStock === 0 ? 'critical' : level.currentStock < 10 ? 'high' : 'medium',
            currentStock: level.currentStock,
            threshold: level.reorderPoint,
            message: `${item.productName} (${level.size}) is ${level.currentStock === 0 ? 'out of stock' : 'running low'}`,
            isRead: false,
            createdAt: new Date()
          });
        }
      });
    });

    setStockAlerts(alerts);
  };

  const getInventoryStats = () => {
    const totalValue = inventoryItems.reduce((sum, item) => sum + item.totalValue, 0);
    const totalItems = inventoryItems.reduce((sum, item) => sum + item.totalStock, 0);
    const lowStockCount = inventoryItems.filter(item => item.status === 'low_stock').length;
    const outOfStockCount = inventoryItems.filter(item => item.status === 'out_of_stock').length;

    return { totalValue, totalItems, lowStockCount, outOfStockCount };
  };

  const getStockStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
      case 'low_stock':
        return <Badge className="bg-orange-100 text-orange-800">Low Stock</Badge>;
      case 'out_of_stock':
        return <Badge variant="destructive">Out of Stock</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getAlertSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-500 text-white">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 text-white">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const stats = getInventoryStats();

  return (
    <div className="space-y-6">
      {/* Inventory Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Current stock value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Units in stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Need reordering</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStockCount}</div>
            <p className="text-xs text-muted-foreground">Critical items</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Alerts */}
      {stockAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Stock Alerts ({stockAlerts.length})
            </CardTitle>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stockAlerts.slice(0, 5).map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getAlertSeverityBadge(alert.severity)}
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-gray-600">
                        Current: {alert.currentStock} | Threshold: {alert.threshold}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Reorder
                  </Button>
                </div>
              ))}
              {stockAlerts.length > 5 && (
                <Button variant="outline" className="w-full">
                  View All {stockAlerts.length} Alerts
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Items */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>Current stock levels and product information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inventoryItems.map(item => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">{item.productName}</h3>
                      <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                      <p className="text-sm text-gray-600">Supplier: {item.supplier}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStockStatusBadge(item.status)}
                    <p className="text-sm text-gray-600 mt-1">
                      Total: {item.totalStock} units
                    </p>
                    <p className="text-sm font-medium">
                      Value: ${item.totalValue.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Stock Levels by Size */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {item.stockLevels.map((level, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Size {level.size}</span>
                        <Badge variant={level.currentStock <= level.reorderPoint ? 'destructive' : 'default'}>
                          {level.currentStock} units
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Min Stock:</span>
                          <span>{level.minStock}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reorder Point:</span>
                          <span>{level.reorderPoint}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Unit Cost:</span>
                          <span>${level.cost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Restocked:</span>
                          <span>{level.lastRestocked.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Stock
                  </Button>
                  <Button size="sm" variant="outline">
                    <Minus className="w-4 h-4 mr-2" />
                    Remove Stock
                  </Button>
                  <Button size="sm" variant="outline">
                    <Truck className="w-4 h-4 mr-2" />
                    Reorder
                  </Button>
                  <Button size="sm" variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View History
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Stock Movements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Stock Movements
          </CardTitle>
          <CardDescription>Latest inventory changes and transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stockMovements.slice(0, 10).map(movement => (
              <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    movement.movementType === 'in' ? 'bg-green-100 text-green-600' :
                    movement.movementType === 'out' ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {movement.movementType === 'in' ? <Plus className="w-4 h-4" /> :
                     movement.movementType === 'out' ? <Minus className="w-4 h-4" /> :
                     <BarChart3 className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium">{movement.productName}</p>
                    <p className="text-sm text-gray-600">
                      {movement.reason} - {movement.quantity} units
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {movement.movementType === 'in' ? '+' : movement.movementType === 'out' ? '-' : '±'}{movement.quantity}
                  </p>
                  <p className="text-sm text-gray-600">
                    {movement.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
