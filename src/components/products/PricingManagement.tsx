'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Percent,
  Tag,
  Edit,
  Save,
  X,
  Plus,
  Calendar,
  Target
} from 'lucide-react';
import { Product, ProductPrice } from '@/types';

interface PricingManagementProps {
  products: Product[];
  onUpdatePricing: (productId: string, prices: ProductPrice[]) => void;
}

interface PromotionalPrice {
  id: string;
  productId: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  description: string;
}

export function PricingManagement({ products, onUpdatePricing }: PricingManagementProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingPrices, setEditingPrices] = useState<ProductPrice[]>([]);
  const [bulkUpdatePercent, setBulkUpdatePercent] = useState<number>(0);
  const [promotionalPrices, setPromotionalPrices] = useState<PromotionalPrice[]>([]);
  const [showPromotionModal, setShowPromotionModal] = useState(false);

  useEffect(() => {
    // Load promotional prices from storage or API
    // For now, using mock data
    setPromotionalPrices([
      {
        id: '1',
        productId: 'C1',
        originalPrice: 4.50,
        discountedPrice: 3.99,
        discountPercent: 11,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        description: 'Weekly Special'
      }
    ]);
  }, []);

  const handleEditPrices = (product: Product) => {
    setSelectedProduct(product);
    setEditingPrices([...product.prices]);
  };

  const handleSavePrices = () => {
    if (selectedProduct) {
      onUpdatePricing(selectedProduct.id, editingPrices);
      setSelectedProduct(null);
      setEditingPrices([]);
    }
  };

  const handleCancelEdit = () => {
    setSelectedProduct(null);
    setEditingPrices([]);
  };

  const updatePrice = (index: number, field: keyof ProductPrice, value: string) => {
    setEditingPrices(prev => 
      prev.map((price, i) => 
        i === index ? { ...price, [field]: value } : price
      )
    );
  };

  const addPriceSize = () => {
    setEditingPrices(prev => [
      ...prev,
      { size: '', price: '', currency: 'USD' }
    ]);
  };

  const removePriceSize = (index: number) => {
    if (editingPrices.length > 1) {
      setEditingPrices(prev => prev.filter((_, i) => i !== index));
    }
  };

  const applyBulkPriceUpdate = (type: 'increase' | 'decrease') => {
    const multiplier = type === 'increase' ? (1 + bulkUpdatePercent / 100) : (1 - bulkUpdatePercent / 100);
    
    setEditingPrices(prev => 
      prev.map(price => ({
        ...price,
        price: (parseFloat(price.price) * multiplier).toFixed(2)
      }))
    );
  };

  const getAveragePrice = (prices: ProductPrice[]) => {
    if (!prices || prices.length === 0) return 0;
    const total = prices.reduce((sum, price) => sum + (parseFloat(price.price) || 0), 0);
    return total / prices.length;
  };

  const getPriceRange = (prices: ProductPrice[]) => {
    if (!prices || prices.length === 0) return 'N/A';
    const values = prices.map(p => parseFloat(p.price) || 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    if (min === max) {
      return `$${min.toFixed(2)}`;
    }
    return `$${min.toFixed(2)} - $${max.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Pricing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Product Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(products.reduce((sum, p) => sum + getAveragePrice(p.prices), 0) / (products.length || 1)).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Across all products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Promotions</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {promotionalPrices.filter(p => p.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Running promotions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price Variants</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.reduce((sum, p) => sum + (p.prices?.length || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total price options</p>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Price Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Bulk Price Management
          </CardTitle>
          <CardDescription>Apply percentage changes to multiple products</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                type="number"
                value={bulkUpdatePercent}
                onChange={(e) => setBulkUpdatePercent(parseFloat(e.target.value) || 0)}
                placeholder="Enter percentage"
                className="max-w-xs"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => applyBulkPriceUpdate('increase')}
              className="text-green-600 hover:text-green-700"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Increase by {bulkUpdatePercent}%
            </Button>
            <Button 
              variant="outline" 
              onClick={() => applyBulkPriceUpdate('decrease')}
              className="text-red-600 hover:text-red-700"
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Decrease by {bulkUpdatePercent}%
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Note: Bulk changes apply to the currently selected product only. Select a product below to apply changes.
          </p>
        </CardContent>
      </Card>

      {/* Active Promotions */}
      {promotionalPrices.filter(p => p.isActive).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Active Promotions
              </span>
              <Button size="sm" onClick={() => setShowPromotionModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Promotion
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {promotionalPrices.filter(p => p.isActive).map(promo => (
                <div key={promo.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="bg-green-600">
                      -{promo.discountPercent}%
                    </Badge>
                    <div>
                      <p className="font-medium">{promo.description}</p>
                      <p className="text-sm text-gray-600">
                        ${promo.originalPrice.toFixed(2)} → ${promo.discountedPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      Ends {promo.endDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Pricing Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Pricing</CardTitle>
          <CardDescription>Manage individual product prices and variants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.map(product => (
              <div key={product.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-600">{getPriceRange(product.prices)}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPrices(product)}
                    disabled={selectedProduct?.id === product.id}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Prices
                  </Button>
                </div>

                {selectedProduct?.id === product.id && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Edit Pricing</h4>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSavePrices}>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {editingPrices.map((price, index) => (
                        <div key={index} className="flex gap-4 items-center">
                          <div className="flex-1">
                            <Input
                              value={price.size}
                              onChange={(e) => updatePrice(index, 'size', e.target.value)}
                              placeholder="Size"
                            />
                          </div>
                          <div className="flex-1">
                            <Input
                              type="number"
                              step="0.01"
                              value={price.price}
                              onChange={(e) => updatePrice(index, 'price', e.target.value)}
                              placeholder="Price"
                            />
                          </div>
                          <div className="w-20">
                            <select
                              value={price.currency}
                              onChange={(e) => updatePrice(index, 'currency', e.target.value)}
                              className="w-full px-2 py-1 border rounded"
                            >
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                              <option value="VND">VND</option>
                            </select>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removePriceSize(index)}
                            disabled={editingPrices.length === 1}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      
                      <Button variant="outline" onClick={addPriceSize} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Size Variant
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
