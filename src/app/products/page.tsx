'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search,
  Plus,
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Coffee,
  BarChart3,
  Building2,
  Edit,
  Trash2,
  ShoppingBag
} from 'lucide-react';
import { InventoryDashboard } from '@/components/products/InventoryDashboard';
import { StockForecasting } from '@/components/products/StockForecasting';
import { SupplierManagement } from '@/components/products/SupplierManagement';
import { productService, coffeeService, beansService } from '@/services/firestore';
import { Product } from '@/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Coffee' | 'Bean'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, filterType, filterStatus]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Load from all collections
      const [coffees, beans, unifiedProducts] = await Promise.all([
        coffeeService.getAll(),
        beansService.getAll(),
        productService.getAll()
      ]);

      // Combine and deduplicate
      const allProducts = [
        ...coffees.map(coffee => ({ ...coffee, type: 'Coffee' as const })),
        ...beans.map(bean => ({ ...bean, type: 'Bean' as const })),
        ...unifiedProducts
      ];

      // Remove duplicates based on ID
      const uniqueProducts = allProducts.filter((product, index, self) =>
        index === self.findIndex(p => p.id === product.id)
      );

      setProducts(uniqueProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(product => product.type === filterType);
    }

    // Filter by stock status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(product => getStockStatus(product) === filterStatus);
    }

    setFilteredProducts(filtered);
  };

  const getStockStatus = (product: Product): 'in_stock' | 'low_stock' | 'out_of_stock' => {
    // Generate a mock stock number based on product ID for demo
    const hash = product.id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
    const stock = Math.abs(hash) % 100;
    
    if (stock === 0) return 'out_of_stock';
    if (stock < 20) return 'low_stock';
    return 'in_stock';
  };

  const getStockBadge = (status: 'in_stock' | 'low_stock' | 'out_of_stock') => {
    const statusConfig = {
      in_stock: { label: 'In Stock', className: 'bg-green-100 text-green-800' },
      low_stock: { label: 'Low Stock', className: 'bg-yellow-100 text-yellow-800' },
      out_of_stock: { label: 'Out of Stock', className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status];
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getPriceRange = (prices: any[]) => {
    if (!prices || prices.length === 0) return 'N/A';
    
    const priceValues = prices.map(p => parseFloat(p.price || p.amount || '0'));
    const min = Math.min(...priceValues);
    const max = Math.max(...priceValues);
    
    if (min === max) return `$${min.toFixed(2)}`;
    return `$${min.toFixed(2)} - $${max.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coffee-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Package className="w-8 h-8 text-coffee-500" />
                Product Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your coffee products, pricing, and inventory
              </p>
            </div>
            <Button className="bg-coffee-500 hover:bg-coffee-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="forecasting" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Forecasting
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Suppliers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{products.length}</div>
                  <p className="text-xs text-muted-foreground">Active products</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Coffee Products</CardTitle>
                  <Coffee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {products.filter(p => p.type === 'Coffee').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Coffee items</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bean Products</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {products.filter(p => p.type === 'Bean').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Bean varieties</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {products.filter(p => getStockStatus(p) === 'low_stock').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Items need restock</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    >
                      <option value="all">All Types</option>
                      <option value="Coffee">Coffee</option>
                      <option value="Bean">Beans</option>
                    </select>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    >
                      <option value="all">All Stock Status</option>
                      <option value="in_stock">In Stock</option>
                      <option value="low_stock">Low Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square relative">
                      <img
                        src={product.imageUrlSquare || product.imageUrlPortrait || '/placeholder-coffee.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        {getStockBadge(stockStatus)}
                      </div>
                      <div className="absolute top-2 left-2">
                        <Badge variant="outline" className="bg-white/90">
                          {product.type === 'Coffee' ? (
                            <Coffee className="w-3 h-3 mr-1" />
                          ) : (
                            <ShoppingBag className="w-3 h-3 mr-1" />
                          )}
                          {product.type}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg leading-tight">{product.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-coffee-600">
                            {getPriceRange(product.prices || [])}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="mr-1">⭐</span>
                            {product.average_rating || 'N/A'}
                          </div>
                        </div>

                        {product.roasted && (
                          <Badge variant="outline" className="text-xs">
                            {product.roasted} Roast
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <DollarSign className="w-3 h-3 mr-1" />
                          Price
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No products found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {searchTerm ? 'Try adjusting your search criteria' : 'Start by adding your first product'}
                  </p>
                  <Button className="bg-coffee-500 hover:bg-coffee-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryDashboard products={products} />
          </TabsContent>

          <TabsContent value="forecasting">
            <StockForecasting products={products} />
          </TabsContent>

          <TabsContent value="suppliers">
            <SupplierManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
