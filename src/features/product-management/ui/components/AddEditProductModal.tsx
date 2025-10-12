'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../shared/ui/dialog';
import { Button } from '../../../../shared/ui/button';
import { Input } from '../../../../shared/ui/input';
import { Label } from '../../../../shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../shared/ui/select';
import { Card, CardContent } from '../../../../shared/ui/card';
import { FirebaseImage } from '../../../../shared/ui/firebase-image';
import { Product, ProductFormData, ProductPrice } from '../../../../entities/product/types';
import { Upload, X, Plus, Coffee, Leaf, Star, DollarSign, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../../../shared/lib/utils';

interface AddEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: ProductFormData) => Promise<void>;
  product?: Product | null;
  mode: 'add' | 'edit';
}

export function AddEditProductModal({
  isOpen,
  onClose,
  onSave,
  product,
  mode
}: AddEditProductModalProps) {
  const [isLoading, setIsLoading] = useState(false);
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

  // Image upload states
  const [imageFiles, setImageFiles] = useState<{
    square?: File;
    portrait?: File;
  }>({});
  const [imagePreviewUrls, setImagePreviewUrls] = useState<{
    square?: string;
    portrait?: string;
  }>({});

  // Reset form when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && product) {
        setFormData({
          name: product.name,
          description: product.description,
          roasted: product.roasted,
          ingredients: product.ingredients,
          special_ingredient: product.special_ingredient,
          type: product.type,
          category: product.category,
          prices: product.prices.length > 0 ? product.prices : [{ size: 'S', price: '', currency: 'USD' }],
          images: {
            square: product.imageUrlSquare,
            portrait: product.imageUrlPortrait
          }
        });
        setImagePreviewUrls({
          square: product.imageUrlSquare,
          portrait: product.imageUrlPortrait
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
        setImagePreviewUrls({});
      }
      setImageFiles({});
    }
  }, [isOpen, mode, product]);

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTypeChange = (type: 'Coffee' | 'Bean') => {
    setFormData(prev => ({
      ...prev,
      type,
      category: type === 'Coffee' ? 'coffee' : 'bean'
    }));
  };

  const handlePriceChange = (index: number, field: keyof ProductPrice, value: string) => {
    const newPrices = [...formData.prices];
    newPrices[index] = { ...newPrices[index], [field]: value };
    setFormData(prev => ({ ...prev, prices: newPrices }));
  };

  const addPriceOption = () => {
    setFormData(prev => ({
      ...prev,
      prices: [...prev.prices, { size: '', price: '', currency: 'USD' }]
    }));
  };

  const removePriceOption = (index: number) => {
    if (formData.prices.length > 1) {
      const newPrices = formData.prices.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, prices: newPrices }));
    }
  };

  const handleImageUpload = (type: 'square' | 'portrait', file: File) => {
    setImageFiles(prev => ({ ...prev, [type]: file }));
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreviewUrls(prev => ({
        ...prev,
        [type]: e.target?.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (type: 'square' | 'portrait') => {
    setImageFiles(prev => ({ ...prev, [type]: undefined }));
    setImagePreviewUrls(prev => ({ ...prev, [type]: undefined }));
    setFormData(prev => ({
      ...prev,
      images: { ...prev.images, [type]: '' }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Include both image URLs and File objects for upload
      const finalFormData: ProductFormData = {
        ...formData,
        images: {
          square: formData.images.square || '',
          portrait: formData.images.portrait || ''
        },
        imageFiles: imageFiles // Pass the actual File objects for Firebase Storage upload
      };

      await onSave(finalFormData);
      onClose();
    } catch (error) {
      console.error('Failed to save product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {formData.type === 'Coffee' ? (
              <Coffee className="w-6 h-6 text-amber-600" />
            ) : (
              <Leaf className="w-6 h-6 text-green-600" />
            )}
            {mode === 'add' ? 'Add New Product' : `Edit ${product?.name}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Product Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'Coffee' | 'Bean') => handleTypeChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Coffee">
                        <div className="flex items-center gap-2">
                          <Coffee className="w-4 h-4" />
                          Coffee
                        </div>
                      </SelectItem>
                      <SelectItem value="Bean">
                        <div className="flex items-center gap-2">
                          <Leaf className="w-4 h-4" />
                          Bean
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                  placeholder="Enter product description"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roasted">Roasted Level</Label>
                  <Input
                    id="roasted"
                    value={formData.roasted}
                    onChange={(e) => handleInputChange('roasted', e.target.value)}
                    placeholder="e.g., Medium Roast, Light Roast"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ingredients">Main Ingredients</Label>
                  <Input
                    id="ingredients"
                    value={formData.ingredients}
                    onChange={(e) => handleInputChange('ingredients', e.target.value)}
                    placeholder="e.g., Arabica, Robusta"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="special_ingredient">Special Ingredients</Label>
                <Input
                  id="special_ingredient"
                  value={formData.special_ingredient}
                  onChange={(e) => handleInputChange('special_ingredient', e.target.value)}
                  placeholder="Any special or unique ingredients"
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Product Images
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Square Image */}
                <div className="space-y-2">
                  <Label>Square Image (1:1 ratio)</Label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                    {imagePreviewUrls.square ? (
                      <div className="relative">
                        <div className="w-full h-48 relative mb-2">
                          <FirebaseImage
                            src={imagePreviewUrls.square}
                            alt="Square preview"
                            width={200}
                            height={200}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeImage('square')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="py-8">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 mb-2">Square format image</p>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload('square', file);
                          }}
                          className="max-w-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Portrait Image */}
                <div className="space-y-2">
                  <Label>Portrait Image (3:4 ratio)</Label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                    {imagePreviewUrls.portrait ? (
                      <div className="relative">
                        <div className="w-full h-48 relative mb-2">
                          <FirebaseImage
                            src={imagePreviewUrls.portrait}
                            alt="Portrait preview"
                            width={150}
                            height={200}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeImage('portrait')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="py-8">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 mb-2">Portrait format image</p>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload('portrait', file);
                          }}
                          className="max-w-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pricing Options
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPriceOption}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Price
                </Button>
              </div>

              <div className="space-y-3">
                {formData.prices.map((price, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <Select
                        value={price.size}
                        onValueChange={(value) => handlePriceChange(index, 'size', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                          {sizeOptions.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type="number"
                          step="0.01"
                          value={price.price}
                          onChange={(e) => handlePriceChange(index, 'price', e.target.value)}
                          placeholder="Price"
                          className="pl-8"
                        />
                      </div>
                      
                      <Select
                        value={price.currency}
                        onValueChange={(value) => handlePriceChange(index, 'currency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="VND">VND</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {formData.prices.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePriceOption(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </form>

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !formData.name || !formData.description}
            className="btn-coffee"
          >
            {isLoading ? 'Saving...' : mode === 'add' ? 'Add Product' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}