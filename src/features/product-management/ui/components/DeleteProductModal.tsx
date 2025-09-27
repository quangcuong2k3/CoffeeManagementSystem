'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../shared/ui/dialog';
import { Button } from '../../../../shared/ui/button';
import { FirebaseImage } from '../../../../shared/ui/firebase-image';
import { formatPrice } from '../../../../shared/lib/currency';
import { Product } from '../../../../entities/product/types';
import { AlertTriangle, Coffee, Leaf, Trash2, X } from 'lucide-react';

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  product: Product | null;
  isLoading?: boolean;
}

export function DeleteProductModal({
  isOpen,
  onClose,
  onConfirm,
  product,
  isLoading = false
}: DeleteProductModalProps) {
  if (!product) return null;

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            Delete Product
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Product Preview */}
          <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="w-16 h-16 flex-shrink-0">
              <FirebaseImage
                src={product.imageUrlSquare}
                alt={product.name}
                width={64}
                height={64}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {product.type === 'Coffee' ? (
                  <Coffee className="w-4 h-4 text-amber-600" />
                ) : (
                  <Leaf className="w-4 h-4 text-green-600" />
                )}
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {product.name}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {product.category} • {product.type}
              </p>
              {product.prices.length > 0 && (
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  From {formatPrice(product.prices[0].price, product.prices[0].currency)}
                </p>
              )}
            </div>
          </div>

          {/* Warning Message */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Warning: This action cannot be undone
                </p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  Deleting this product will permanently remove:
                </p>
                <ul className="list-disc list-inside mt-2 text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>All product information and images</li>
                  <li>Pricing data and availability</li>
                  <li>Customer reviews and ratings</li>
                  <li>Order history references</li>
                </ul>
              </div>
            </div>

            <p className="text-center text-gray-600 dark:text-gray-400 font-medium">
              Are you absolutely sure you want to delete "{product.name}"?
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isLoading ? 'Deleting...' : 'Delete Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}