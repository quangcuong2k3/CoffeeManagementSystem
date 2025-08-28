'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Upload, 
  Plus, 
  Trash2, 
  Save,
  Coffee,
  ShoppingBag,
  DollarSign
} from 'lucide-react';
import { Product, ProductPrice, ProductFormData } from '@/types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: ProductFormData) => void;
  product?: Product | null;
  mode: 'add' | 'edit';
}

export function AddProductModal({ isOpen, onClose, onSave, product, mode }: AddProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    roasted: '',
    ingredients: '',
    special_ingredient: '',
    type: 'Coffee',
    category: 'coffee',
    prices: [{ size: 'S', price: '', currency: 'USD' }],
    images: {
      square: '',
      portrait: ''
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        roasted: product.roasted || '',
        ingredients: product.ingredients || '',
        special_ingredient: product.special_ingredient || '',
        type: product.type || 'Coffee',
        category: product.category || 'coffee',
        prices: product.prices && product.prices.length > 0 ? product.prices : [{ size: 'S', price: '', currency: 'USD' }],
        images: {
          square: product.imageUrlSquare || '',
          portrait: product.imageUrlPortrait || ''
        }
      });
    } else {
      // Reset form for add mode
      setFormData({
        name: '',
        description: '',
        roasted: '',
        ingredients: '',
        special_ingredient: '',
        type: 'Coffee',
        category: 'coffee',
        prices: [{ size: 'S', price: '', currency: 'USD' }],
        images: {
          square: '',
          portrait: ''
        }
      });
    }
    setErrors({});
  }, [product, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.prices.length === 0) {
      newErrors.prices = 'At least one price is required';
    }

    formData.prices.forEach((price, index) => {
      if (!price.size.trim()) {
        newErrors[`price_size_${index}`] = 'Size is required';
      }
      if (!price.price.trim() || isNaN(parseFloat(price.price))) {
        newErrors[`price_value_${index}`] = 'Valid price is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const addPriceRow = () => {
    setFormData(prev => ({
      ...prev,
      prices: [...prev.prices, { size: '', price: '', currency: 'USD' }]
    }));
  };

  const removePriceRow = (index: number) => {
    if (formData.prices.length > 1) {
      setFormData(prev => ({
        ...prev,
        prices: prev.prices.filter((_, i) => i !== index)
      }));
    }
  };

  const updatePrice = (index: number, field: keyof ProductPrice, value: string) => {
    setFormData(prev => ({
      ...prev,
      prices: prev.prices.map((price, i) => 
        i === index ? { ...price, [field]: value } : price
      )
    }));
  };

  const handleTypeChange = (type: 'Coffee' | 'Bean') => {
    setFormData(prev => ({
      ...prev,
      type,
      category: type === 'Coffee' ? 'coffee' : 'bean'
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">
            {mode === 'add' ? 'Add New Product' : 'Edit Product'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coffee className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Premium Arabica Blend"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Type *</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.type === 'Coffee' ? 'default' : 'outline'}
                      onClick={() => handleTypeChange('Coffee')}
                      className="flex-1"
                    >
                      <Coffee className="w-4 h-4 mr-2" />
                      Coffee
                    </Button>
                    <Button
                      type="button"
                      variant={formData.type === 'Bean' ? 'default' : 'outline'}
                      onClick={() => handleTypeChange('Bean')}
                      className="flex-1"
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Bean
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your product..."
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Roast Level</label>
                  <select
                    value={formData.roasted}
                    onChange={(e) => setFormData(prev => ({ ...prev, roasted: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  >
                    <option value="">Select roast level</option>
                    <option value="Light">Light Roast</option>
                    <option value="Medium">Medium Roast</option>
                    <option value="Medium-Dark">Medium-Dark Roast</option>
                    <option value="Dark">Dark Roast</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Special Ingredient</label>
                  <Input
                    value={formData.special_ingredient}
                    onChange={(e) => setFormData(prev => ({ ...prev, special_ingredient: e.target.value }))}
                    placeholder="e.g., Vanilla, Caramel"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ingredients</label>
                <Input
                  value={formData.ingredients}
                  onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
                  placeholder="e.g., 100% Arabica beans, Natural flavoring"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing
              </CardTitle>
              <CardDescription>Set prices for different sizes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.prices.map((price, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">Size</label>
                    <select
                      value={price.size}
                      onChange={(e) => updatePrice(index, 'size', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500 ${
                        errors[`price_size_${index}`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select size</option>
                      <option value="S">Small (S)</option>
                      <option value="M">Medium (M)</option>
                      <option value="L">Large (L)</option>
                      <option value="250g">250g</option>
                      <option value="500g">500g</option>
                      <option value="1kg">1kg</option>
                    </select>
                    {errors[`price_size_${index}`] && (
                      <p className="text-red-500 text-xs">{errors[`price_size_${index}`]}</p>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">Price</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={price.price}
                      onChange={(e) => updatePrice(index, 'price', e.target.value)}
                      placeholder="0.00"
                      className={errors[`price_value_${index}`] ? 'border-red-500' : ''}
                    />
                    {errors[`price_value_${index}`] && (
                      <p className="text-red-500 text-xs">{errors[`price_value_${index}`]}</p>
                    )}
                  </div>

                  <div className="w-20 space-y-2">
                    <label className="text-sm font-medium">Currency</label>
                    <select
                      value={price.currency}
                      onChange={(e) => updatePrice(index, 'currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="VND">VND</option>
                    </select>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removePriceRow(index)}
                    disabled={formData.prices.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addPriceRow}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Size
              </Button>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Product Images
              </CardTitle>
              <CardDescription>Add square and portrait images for your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Square Image URL</label>
                  <Input
                    value={formData.images.square}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      images: { ...prev.images, square: e.target.value }
                    }))}
                    placeholder="https://example.com/image-square.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Portrait Image URL</label>
                  <Input
                    value={formData.images.portrait}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      images: { ...prev.images, portrait: e.target.value }
                    }))}
                    placeholder="https://example.com/image-portrait.jpg"
                  />
                </div>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                💡 Tip: For best results, use Firebase Storage URLs or public image URLs. 
                Square images work best for grid views, while portrait images are ideal for detailed views.
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-coffee-500 hover:bg-coffee-600">
              <Save className="w-4 h-4 mr-2" />
              {mode === 'add' ? 'Add Product' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
