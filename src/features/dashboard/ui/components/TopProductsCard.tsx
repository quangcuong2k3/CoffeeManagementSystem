'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Star,
  Coffee,
  Crown,
  Award,
  MoreHorizontal,
  Eye,
  ShoppingCart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Button } from '../../../../shared/ui/button';
import { Badge } from '../../../../shared/ui/badge';
import { cn } from '../../../../core/utils/cn';

interface Product {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
  growth: number;
  rating: number;
  image: string;
  rank: number;
}

type SortBy = 'sales' | 'revenue' | 'growth' | 'rating';

const TopProductsCard: React.FC = () => {
  const [sortBy, setSortBy] = useState<SortBy>('sales');

  // Mock data - replace with real data from your API
  const products: Product[] = [
    {
      id: '1',
      name: 'Colombian Supremo',
      category: 'Coffee Beans',
      sales: 156,
      revenue: 2340,
      growth: 15.2,
      rating: 4.8,
      image: '☕',
      rank: 1
    },
    {
      id: '2',
      name: 'Cappuccino Premium',
      category: 'Hot Beverages',
      sales: 134,
      revenue: 2010,
      growth: 12.8,
      rating: 4.7,
      image: '☕',
      rank: 2
    },
    {
      id: '3',
      name: 'Ethiopian Yirgacheffe',
      category: 'Coffee Beans',
      sales: 98,
      revenue: 1764,
      growth: 18.5,
      rating: 4.9,
      image: '☕',
      rank: 3
    },
    {
      id: '4',
      name: 'Iced Americano',
      category: 'Cold Beverages',
      sales: 87,
      revenue: 1305,
      growth: 8.3,
      rating: 4.5,
      image: '🧊',
      rank: 4
    },
    {
      id: '5',
      name: 'Espresso Blend',
      category: 'Coffee Beans',
      sales: 76,
      revenue: 1140,
      growth: 22.1,
      rating: 4.6,
      image: '☕',
      rank: 5
    }
  ];

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'sales':
        return b.sales - a.sales;
      case 'revenue':
        return b.revenue - a.revenue;
      case 'growth':
        return b.growth - a.growth;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const sortOptions = [
    { key: 'sales' as SortBy, label: 'Sales', icon: ShoppingCart },
    { key: 'revenue' as SortBy, label: 'Revenue', icon: TrendingUp },
    { key: 'growth' as SortBy, label: 'Growth', icon: Award },
    { key: 'rating' as SortBy, label: 'Rating', icon: Star }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 2:
        return <Award className="w-4 h-4 text-gray-400" />;
      case 3:
        return <Award className="w-4 h-4 text-amber-600" />;
      default:
        return <span className="w-4 h-4 flex items-center justify-center text-xs font-semibold text-gray-500">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800';
      case 2:
        return 'from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 border-gray-200 dark:border-gray-700';
      case 3:
        return 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800';
      default:
        return 'from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 border-gray-200 dark:border-gray-700';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card className="shadow-sm border-0 bg-white dark:bg-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Top Products
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Sort Options */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {sortOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <Button
                    key={option.key}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "text-xs px-2 py-1 h-auto",
                      sortBy === option.key
                        ? "bg-white dark:bg-gray-600 shadow-sm"
                        : "text-gray-600 dark:text-gray-400"
                    )}
                    onClick={() => setSortBy(option.key)}
                  >
                    <IconComponent className="w-3 h-3 mr-1" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Best performing products this month
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {sortedProducts.map((product, index) => (
            <div
              key={product.id}
              className={cn(
                "relative p-4 rounded-lg border bg-gradient-to-r transition-all duration-200 hover:shadow-md cursor-pointer group",
                getRankColor(product.rank)
              )}
            >
              <div className="flex items-center gap-4">
                {/* Rank & Product Image */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center">
                    {getRankIcon(product.rank)}
                  </div>
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-lg">
                    {product.image}
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {product.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {product.category}
                  </p>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {product.rating}
                    </span>
                  </div>
                </div>
                
                {/* Metrics */}
                <div className="text-right">
                  <div className="space-y-1">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Sales</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {product.sales}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Revenue</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {formatCurrency(product.revenue)}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Growth Badge */}
                <div className="flex flex-col items-end gap-1">
                  <Badge 
                    variant={product.growth >= 0 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {product.growth >= 0 ? '+' : ''}{product.growth}%
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              {/* Hover overlay for top 3 */}
              {product.rank <= 3 && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-white/10 dark:via-gray-800/5 dark:to-gray-800/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg pointer-events-none" />
              )}
            </div>
          ))}
        </div>
        
        {/* View All Products Button */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button variant="outline" className="w-full">
            View All Products
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopProductsCard;