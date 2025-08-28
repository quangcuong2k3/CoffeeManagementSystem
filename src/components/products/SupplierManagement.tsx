'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Building2,
  Phone,
  Mail,
  MapPin,
  Package,
  DollarSign,
  Calendar,
  Truck,
  Plus,
  Edit,
  Trash2,
  FileText,
  User,
  Star,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  contactPerson: string;
  paymentTerms: string;
  deliveryTime: number; // days
  minimumOrder: number;
  rating: number;
  totalOrders: number;
  totalValue: number;
  products: string[];
  status: 'active' | 'inactive' | 'suspended';
  lastOrder: Date;
  createdAt: Date;
  notes?: string;
}

interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  orderNumber: string;
  status: 'draft' | 'sent' | 'confirmed' | 'delivered' | 'cancelled';
  orderDate: Date;
  expectedDelivery: Date;
  actualDelivery?: Date;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export function SupplierManagement() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [activeTab, setActiveTab] = useState<'suppliers' | 'orders'>('suppliers');

  useEffect(() => {
    loadSuppliers();
    loadPurchaseOrders();
  }, []);

  const loadSuppliers = () => {
    // Mock supplier data
    const mockSuppliers: Supplier[] = [
      {
        id: 'sup-1',
        name: 'Premium Coffee Co.',
        company: 'Premium Coffee Co. Ltd',
        email: 'orders@premiumcoffee.com',
        phone: '+1-555-0101',
        address: '123 Coffee Street',
        city: 'Seattle',
        country: 'USA',
        contactPerson: 'John Smith',
        paymentTerms: 'Net 30',
        deliveryTime: 7,
        minimumOrder: 500,
        rating: 4.8,
        totalOrders: 156,
        totalValue: 89450.75,
        products: ['Premium Arabica', 'Organic Espresso', 'Fair Trade Blend'],
        status: 'active',
        lastOrder: new Date('2024-01-15'),
        createdAt: new Date('2023-06-01'),
        notes: 'Excellent quality, reliable delivery'
      },
      {
        id: 'sup-2',
        name: 'Bean Masters',
        company: 'Bean Masters International',
        email: 'supply@beanmasters.com',
        phone: '+1-555-0202',
        address: '456 Roaster Avenue',
        city: 'Portland',
        country: 'USA',
        contactPerson: 'Sarah Johnson',
        paymentTerms: 'Net 15',
        deliveryTime: 5,
        minimumOrder: 300,
        rating: 4.6,
        totalOrders: 89,
        totalValue: 45230.20,
        products: ['Single Origin', 'Medium Roast', 'Dark Roast'],
        status: 'active',
        lastOrder: new Date('2024-01-20'),
        createdAt: new Date('2023-08-15'),
        notes: 'Fast delivery, competitive prices'
      },
      {
        id: 'sup-3',
        name: 'Roast Excellence',
        company: 'Roast Excellence Corp',
        email: 'info@roastexcellence.com',
        phone: '+1-555-0303',
        address: '789 Bean Boulevard',
        city: 'San Francisco',
        country: 'USA',
        contactPerson: 'Mike Wilson',
        paymentTerms: 'Net 45',
        deliveryTime: 10,
        minimumOrder: 1000,
        rating: 4.2,
        totalOrders: 67,
        totalValue: 78900.50,
        products: ['Gourmet Blend', 'Decaf Options', 'Specialty Drinks'],
        status: 'active',
        lastOrder: new Date('2024-01-10'),
        createdAt: new Date('2023-04-20'),
        notes: 'High quality specialty products'
      }
    ];

    setSuppliers(mockSuppliers);
  };

  const loadPurchaseOrders = () => {
    // Mock purchase order data
    const mockOrders: PurchaseOrder[] = [
      {
        id: 'po-1',
        supplierId: 'sup-1',
        supplierName: 'Premium Coffee Co.',
        orderNumber: 'PO-2024-001',
        status: 'confirmed',
        orderDate: new Date('2024-01-15'),
        expectedDelivery: new Date('2024-01-22'),
        items: [
          { productId: 'prod-1', productName: 'Premium Arabica', quantity: 100, unitCost: 12.50, total: 1250 },
          { productId: 'prod-2', productName: 'Organic Espresso', quantity: 50, unitCost: 15.00, total: 750 }
        ],
        subtotal: 2000,
        tax: 160,
        total: 2160,
        notes: 'Rush order for weekend promotion'
      },
      {
        id: 'po-2',
        supplierId: 'sup-2',
        supplierName: 'Bean Masters',
        orderNumber: 'PO-2024-002',
        status: 'delivered',
        orderDate: new Date('2024-01-20'),
        expectedDelivery: new Date('2024-01-25'),
        actualDelivery: new Date('2024-01-25'),
        items: [
          { productId: 'prod-3', productName: 'Single Origin', quantity: 75, unitCost: 14.00, total: 1050 }
        ],
        subtotal: 1050,
        tax: 84,
        total: 1134
      }
    ];

    setPurchaseOrders(mockOrders);
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800">Sent</Badge>;
      case 'confirmed':
        return <Badge className="bg-orange-100 text-orange-800">Confirmed</Badge>;
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getSupplierStats = () => {
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
    const totalValue = suppliers.reduce((sum, s) => sum + s.totalValue, 0);
    const avgRating = suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length;

    return { totalSuppliers, activeSuppliers, totalValue, avgRating };
  };

  const stats = getSupplierStats();

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'suppliers'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          <Building2 className="w-4 h-4 inline mr-2" />
          Suppliers
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'orders'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Purchase Orders
        </button>
      </div>

      {activeTab === 'suppliers' && (
        <>
          {/* Supplier Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSuppliers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeSuppliers} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Lifetime purchases</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
                <div className="flex">{getRatingStars(stats.avgRating)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,450</div>
                <p className="text-xs text-muted-foreground">+8.2% from last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
          </div>

          {/* Suppliers List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSuppliers.map(supplier => (
              <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{supplier.name}</CardTitle>
                        <CardDescription>{supplier.company}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(supplier.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{supplier.contactPerson}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{supplier.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{supplier.phone}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{supplier.city}, {supplier.country}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>Payment: {supplier.paymentTerms}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="w-4 h-4 text-gray-500" />
                        <span>Delivery: {supplier.deliveryTime} days</span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600">Rating</p>
                        <div className="flex justify-center">{getRatingStars(supplier.rating)}</div>
                        <p className="text-sm font-medium">{supplier.rating}/5</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Orders</p>
                        <p className="text-lg font-bold">{supplier.totalOrders}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Value</p>
                        <p className="text-lg font-bold">${supplier.totalValue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div>
                    <p className="text-sm font-medium mb-2">Products:</p>
                    <div className="flex flex-wrap gap-1">
                      {supplier.products.slice(0, 3).map((product, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {product}
                        </Badge>
                      ))}
                      {supplier.products.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{supplier.products.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {supplier.notes && (
                    <div className="border-t pt-3">
                      <p className="text-sm text-gray-600">{supplier.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Package className="w-4 h-4 mr-2" />
                      Create Order
                    </Button>
                    <Button size="sm" variant="outline">
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {activeTab === 'orders' && (
        <>
          {/* Purchase Orders Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{purchaseOrders.length}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {purchaseOrders.filter(po => po.status === 'sent' || po.status === 'confirmed').length}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting delivery</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${purchaseOrders.reduce((sum, po) => sum + po.total, 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">All orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(purchaseOrders.reduce((sum, po) => sum + po.total, 0) / purchaseOrders.length).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Per order</p>
              </CardContent>
            </Card>
          </div>

          {/* Create Order Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Purchase Orders</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Order
            </Button>
          </div>

          {/* Purchase Orders List */}
          <div className="space-y-4">
            {purchaseOrders.map(order => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {order.orderNumber}
                        {getOrderStatusBadge(order.status)}
                      </CardTitle>
                      <CardDescription>
                        {order.supplierName} • Order Date: {order.orderDate.toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${order.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">
                        Expected: {order.expectedDelivery.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Order Items */}
                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium">Items:</h4>
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity} × ${item.unitCost.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-medium">${item.total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax:</span>
                      <span>${order.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    {order.status === 'draft' && (
                      <Button size="sm">
                        Send Order
                      </Button>
                    )}
                    {order.status === 'confirmed' && (
                      <Button size="sm">
                        Mark Delivered
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
