'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  Target,
  BarChart3,
  Activity,
  Clock,
  Package,
  Zap
} from 'lucide-react';
import { Product, StockForecast, ForecastPeriod, SalesVelocity } from '@/types';

interface StockForecastingProps {
  products: Product[];
}

export function StockForecasting({ products }: StockForecastingProps) {
  const [forecasts, setForecasts] = useState<StockForecast[]>([]);
  const [salesVelocity, setSalesVelocity] = useState<SalesVelocity[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<ForecastPeriod>('monthly');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateForecasts();
    calculateSalesVelocity();
  }, [products, selectedPeriod]);

  const generateForecasts = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockForecasts: StockForecast[] = products.map(product => {
      const currentStock = Math.floor(Math.random() * 500) + 50;
      const avgDailySales = Math.floor(Math.random() * 20) + 5;
      const seasonalMultiplier = 1 + (Math.sin(Date.now() / 1000000) * 0.3);
      const trendMultiplier = 1 + (Math.random() - 0.5) * 0.2;
      
      const forecastDays = selectedPeriod === 'weekly' ? 7 : 
                          selectedPeriod === 'monthly' ? 30 : 90;
      
      const predictedSales = Math.round(avgDailySales * forecastDays * seasonalMultiplier * trendMultiplier);
      const projectedStock = Math.max(0, currentStock - predictedSales);
      const daysUntilStockout = currentStock / avgDailySales;
      
      const confidenceLevel = Math.random() * 0.3 + 0.7; // 70-100%
      
      return {
        id: `forecast-${product.id}`,
        productId: product.id,
        productName: product.name,
        period: selectedPeriod,
        currentStock,
        projectedStock,
        predictedSales,
        daysUntilStockout: Math.round(daysUntilStockout),
        reorderRecommendation: daysUntilStockout < 14,
        recommendedOrderQuantity: daysUntilStockout < 14 ? Math.round(avgDailySales * 30) : 0,
        confidenceLevel: Math.round(confidenceLevel * 100),
        factors: [
          { 
            name: 'Historical Sales', 
            impact: Math.round(Math.random() * 40 + 30),
            description: 'Based on past sales patterns'
          },
          { 
            name: 'Seasonal Trends', 
            impact: Math.round(Math.random() * 30 + 10),
            description: 'Coffee consumption seasonal variations'
          },
          { 
            name: 'Market Trends', 
            impact: Math.round(Math.random() * 20 + 5),
            description: 'Current market demand trends'
          },
          { 
            name: 'Promotions', 
            impact: Math.round(Math.random() * 15 + 5),
            description: 'Impact of promotional activities'
          }
        ],
        lastUpdated: new Date(),
        createdAt: new Date()
      };
    });

    setForecasts(mockForecasts);
    setIsLoading(false);
  };

  const calculateSalesVelocity = () => {
    const mockVelocity: SalesVelocity[] = products.map(product => {
      const current = Math.floor(Math.random() * 20) + 5;
      const previous = Math.floor(Math.random() * 20) + 5;
      const change = ((current - previous) / previous) * 100;
      
      return {
        productId: product.id,
        productName: product.name,
        current,
        previous,
        change: Math.round(change * 10) / 10,
        trend: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
        period: selectedPeriod
      };
    });

    setSalesVelocity(mockVelocity);
  };

  const filteredForecasts = useMemo(() => {
    if (selectedProduct === 'all') return forecasts;
    return forecasts.filter(forecast => forecast.productId === selectedProduct);
  }, [forecasts, selectedProduct]);

  const getForecastStats = () => {
    const totalCurrentStock = forecasts.reduce((sum, f) => sum + f.currentStock, 0);
    const totalProjectedStock = forecasts.reduce((sum, f) => sum + f.projectedStock, 0);
    const itemsNeedingReorder = forecasts.filter(f => f.reorderRecommendation).length;
    const avgConfidence = Math.round(forecasts.reduce((sum, f) => sum + f.confidenceLevel, 0) / forecasts.length);
    
    return { totalCurrentStock, totalProjectedStock, itemsNeedingReorder, avgConfidence };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getUrgencyBadge = (daysUntilStockout: number) => {
    if (daysUntilStockout <= 7) {
      return <Badge variant="destructive">Critical</Badge>;
    } else if (daysUntilStockout <= 14) {
      return <Badge className="bg-orange-500 text-white">Urgent</Badge>;
    } else if (daysUntilStockout <= 30) {
      return <Badge className="bg-yellow-500 text-white">Soon</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Stable</Badge>;
    }
  };

  const stats = getForecastStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedPeriod} onValueChange={(value: ForecastPeriod) => setSelectedPeriod(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Select forecast period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly Forecast</SelectItem>
            <SelectItem value="monthly">Monthly Forecast</SelectItem>
            <SelectItem value="quarterly">Quarterly Forecast</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            {products.map(product => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={generateForecasts} className="w-full sm:w-auto">
          <Zap className="w-4 h-4 mr-2" />
          Refresh Forecast
        </Button>
      </div>

      {/* Forecast Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCurrentStock.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total units in stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Stock</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjectedStock.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              After {selectedPeriod === 'weekly' ? '7 days' : selectedPeriod === 'monthly' ? '30 days' : '90 days'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reorder Needed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.itemsNeedingReorder}</div>
            <p className="text-xs text-muted-foreground">Products need reordering</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgConfidence}%</div>
            <p className="text-xs text-muted-foreground">Forecast accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Velocity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Sales Velocity
          </CardTitle>
          <CardDescription>Rate of sales change compared to previous period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salesVelocity.slice(0, 6).map(velocity => (
              <div key={velocity.productId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getTrendIcon(velocity.trend)}
                  <div>
                    <p className="font-medium">{velocity.productName}</p>
                    <p className="text-sm text-gray-600">
                      {velocity.current} units/day
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    velocity.change > 0 ? 'text-green-600' : 
                    velocity.change < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {velocity.change > 0 ? '+' : ''}{velocity.change}%
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{velocity.trend}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Forecasts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Detailed Forecasts
          </CardTitle>
          <CardDescription>
            Stock projections and reorder recommendations for the next {
              selectedPeriod === 'weekly' ? 'week' : 
              selectedPeriod === 'monthly' ? 'month' : 'quarter'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredForecasts.map(forecast => (
              <div key={forecast.id} className="border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{forecast.productName}</h3>
                    <p className="text-sm text-gray-600">
                      Confidence: {forecast.confidenceLevel}%
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getUrgencyBadge(forecast.daysUntilStockout)}
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Days until stockout</p>
                      <p className="text-2xl font-bold">
                        {forecast.daysUntilStockout > 365 ? '365+' : forecast.daysUntilStockout}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stock Projection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Package className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm text-gray-600">Current Stock</p>
                    <p className="text-2xl font-bold">{forecast.currentStock}</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <TrendingDown className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                    <p className="text-sm text-gray-600">Predicted Sales</p>
                    <p className="text-2xl font-bold">{forecast.predictedSales}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-sm text-gray-600">Projected Stock</p>
                    <p className="text-2xl font-bold">{forecast.projectedStock}</p>
                  </div>
                </div>

                {/* Forecast Factors */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Forecast Factors</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {forecast.factors.map((factor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">{factor.name}</p>
                          <p className="text-sm text-gray-600">{factor.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{factor.impact}%</p>
                          <p className="text-xs text-gray-500">Impact</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reorder Recommendation */}
                {forecast.reorderRecommendation && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <h4 className="font-medium text-orange-800 dark:text-orange-200">Reorder Recommendation</h4>
                    </div>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                      This product will run out in {forecast.daysUntilStockout} days. 
                      Consider reordering {forecast.recommendedOrderQuantity} units to maintain adequate stock levels.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                        <Clock className="w-4 h-4 mr-2" />
                        Create Reorder
                      </Button>
                      <Button size="sm" variant="outline">
                        Set Reminder
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
