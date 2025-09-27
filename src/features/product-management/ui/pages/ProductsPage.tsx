'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../../../../shared/components/ui/button';
import { Input } from '../../../../shared/components/ui/input';
import { Badge } from '../../../../shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { LoadingSpinner } from '../../../../shared/ui/loading';
import { useProducts } from '../../../../infra/api/hooks/productHooks';
// import { AddProductModal } from '../components/AddProductModal';
import { Product } from '../../../../entities/product/types';
import { cn } from '../../../../core/utils/cn';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Package, 
  Coffee,
  ShoppingBag,
  DollarSign,
  Grid,
  List,
  Eye,
  Star,
  AlertCircle,
  MoreHorizontal,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'category' | 'price' | 'created';

export default function ProductsPage() {
  const { products, loading, error, fetchProducts, createProduct, updateProduct, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (productData: any) => {
    try {
      if (modalMode === 'add') {
        await createProduct(productData);
      } else if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Failed to save product:', err);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
      } catch (err) {
        console.error('Failed to delete product:', err);
      }
    }
  };

  // Enhanced filtering and sorting
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'category':
        return a.category.localeCompare(b.category);
      case 'price':
        const aPrice = a.prices.find(p => p.size === 'S')?.price || '0';
        const bPrice = b.prices.find(p => p.size === 'S')?.price || '0';
        return parseFloat(bPrice) - parseFloat(aPrice);
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  const totalProducts = products.length;
  const coffeeProducts = products.filter(p => p.category === 'coffee').length;
  const beanProducts = products.filter(p => p.category === 'bean').length;
  const totalValue = products.reduce((sum, p) => {
    const smallPrice = p.prices.find(price => price.size === 'S');
    return sum + (smallPrice ? parseFloat(smallPrice.price) : 0);
  }, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getProductMainPrice = (product: Product) => {
    const mainPrice = product.prices.find(p => p.size === 'S') || product.prices[0];
    return mainPrice ? parseFloat(mainPrice.price) : 0;
  };

  if (loading && products.length === 0) {
    return (
      <div className="p-6 animate-fade-in">
        <LoadingSpinner size="lg" variant="coffee" text="Loading products..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 animate-slide-in">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 gradient-text">
            Product Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your coffee products and inventory
          </p>
        </div>
        <Button
          onClick={handleAddProduct}
          className="btn-coffee shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-hover animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalProducts}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  All categories
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Coffee Products
                </p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {coffeeProducts}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Ready to serve
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                <Coffee className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Bean Products
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {beanProducts}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Premium beans
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Value
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(totalValue)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Base prices
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Search and Filters */}
      <Card className="border-0 shadow-sm animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search products by name, category, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 focus-ring"
              />
            </div>

            {/* Category Filter */}
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-ring"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-ring"
            >
              <option value="name">Sort by Name</option>
              <option value="category">Sort by Category</option>
              <option value="price">Sort by Price</option>
              <option value="created">Sort by Date</option>
            </select>

            {/* View Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "px-3 py-2",
                  viewMode === 'grid' && "bg-white dark:bg-gray-600 shadow-sm"
                )}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "px-3 py-2",
                  viewMode === 'list' && "bg-white dark:bg-gray-600 shadow-sm"
                )}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 animate-fade-in">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Grid/List */}
      {sortedProducts.length === 0 ? (
        <Card className="border-0 shadow-sm animate-fade-in">
          <CardContent className="p-12 text-center">
            <Coffee className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first product.'}
            </p>
            {!searchTerm && (
              <Button onClick={handleAddProduct} className="btn-coffee">
                <Plus className="w-4 h-4 mr-2" />
                Add First Product
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          "grid gap-6",
          viewMode === 'grid' 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "grid-cols-1"
        )}>
          {sortedProducts.map((product, index) => (
            <Card 
              key={product.id} 
              className="card-hover border-0 shadow-sm animate-fade-in group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                {viewMode === 'grid' ? (
                  // Grid View
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                        <Coffee className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button variant="ghost" size="sm" className="p-2">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-2"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-2 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {product.category}
                      </Badge>
                      {product.favourite && (
                        <Badge className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          Featured
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      {product.prices.map((price, priceIndex) => (
                        <div key={priceIndex} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Size {price.size}:
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(parseFloat(price.price))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // List View  
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Coffee className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {product.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {product.category}
                        </Badge>
                        {product.favourite && (
                          <Badge className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="space-y-1">
                        {product.prices.map((price, priceIndex) => (
                          <div key={priceIndex} className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {price.size}:
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(parseFloat(price.price))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button variant="ghost" size="sm" className="p-2">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-2"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-2 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {/* <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
        mode={modalMode}
      /> */}
    </div>
  );
}