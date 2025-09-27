'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../shared/ui/dialog';
import { Button } from '../../../../shared/ui/button';
import { Badge } from '../../../../shared/ui/badge';
import { Card, CardContent } from '../../../../shared/ui/card';
import { FirebaseImage } from '../../../../shared/ui/firebase-image';
import { formatPrice } from '../../../../shared/lib/currency';
import { Product } from '../../../../entities/product/types';
import { 
  Coffee, 
  Leaf, 
  Star, 
  DollarSign, 
  Package, 
  Info, 
  Calendar,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { cn } from '../../../../shared/lib/utils';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ProductDetailModal({
  isOpen,
  onClose,
  product,
  onEdit,
  onDelete
}: ProductDetailModalProps) {
  if (!product) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            {product.type === 'Coffee' ? (
              <Coffee className="w-8 h-8 text-amber-600" />
            ) : (
              <Leaf className="w-8 h-8 text-green-600" />
            )}
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">{product.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={product.type === 'Coffee' ? 'default' : 'secondary'}>
                  {product.type}
                </Badge>
                <Badge variant="outline">
                  {product.category.toUpperCase()}
                </Badge>
                {product.favourite && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    ⭐ Favourite
                  </Badge>
                )}
              </div>
            </div>
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Images and Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Images */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Product Images</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Square Format</p>
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <FirebaseImage
                        src={product.imageUrlSquare}
                        alt={`${product.name} - Square`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Portrait Format</p>
                    <div className="aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <FirebaseImage
                        src={product.imageUrlPortrait}
                        alt={`${product.name} - Portrait`}
                        width={150}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ratings and Stats */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Performance Stats</h3>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-lg font-semibold">{product.average_rating.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    ({product.ratings_count} reviews)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Package className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Product ID</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{product.id}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Info className="w-6 h-6 text-green-600 mx-auto mb-1" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Index</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">#{product.index}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {formatDate(product.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>Updated: {formatDate(product.updatedAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {product.description}
              </p>
            </CardContent>
          </Card>

          {/* Ingredients and Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Ingredients</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Main Ingredients</p>
                    <p className="text-gray-900 dark:text-white">{product.ingredients || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Special Ingredients</p>
                    <p className="text-gray-900 dark:text-white">{product.special_ingredient || 'None'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Roasted Level</p>
                    <p className="text-gray-900 dark:text-white">{product.roasted || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Pricing Options
                </h3>
                <div className="space-y-2">
                  {product.prices.map((price, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {price.size}
                        </Badge>
                      </div>
                      <div className="font-semibold text-green-600">
                        {formatPrice(price.price, price.currency)}
                      </div>
                    </div>
                  ))}
                </div>
                
                {product.prices.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 italic text-center py-4">
                    No pricing information available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            {onEdit && (
              <Button
                onClick={onEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Product
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={onDelete}
                variant="destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Product
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}