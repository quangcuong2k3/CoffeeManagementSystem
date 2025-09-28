/**
 * Order Management Page - Modern & Comprehensive UI
 * Features: Real-time updates, intuitive workflow, minimal operations, sophisticated design
 */

"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Eye,
  Edit3,
  MoreHorizontal,
  Coffee,
  CreditCard,
  Timer,
  Bell,
  Star,
  MapPin,
  Package,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { Button } from '../../../../shared/components/ui/button';
import { Input } from '../../../../shared/components/ui/input';
import { Badge } from '../../../../shared/components/ui/badge';
import { Card } from '../../../../shared/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '../../../../shared/ui/select';

import { useOrders,useOrderStats } from '@/infra/api/hooks';
import { Order, OrderStatus, PaymentStatus, OrderFilters } from '../../../../entities/order';
import { formatPrice } from '../../../../shared/lib/currency';
import OrderDetailModal from '../components/OrderDetailModal';

const OrdersPage: React.FC = () => {
  const [filters, setFilters] = useState<OrderFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [ordersPerPage, setOrdersPerPage] = useState(20);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const { 
    orders, 
    loading, 
    error, 
    totalOrders, 
    stats,
    fetchOrders,
    updateOrderStatus,
    updatePaymentStatus,
    cancelOrder,
    addOrderNote,
    updatePrepTime,
    clearError 
  } = useOrders(filters, ordersPerPage);

  const { stats: globalStats, fetchStats } = useOrderStats();

  // Fetch orders and stats on mount and filter changes
  useEffect(() => {
    const appliedFilters: OrderFilters = {
      ...(searchTerm && { search: searchTerm }),
      ...(selectedStatus !== 'all' && { status: [selectedStatus] }),
      ...(selectedPaymentStatus !== 'all' && { paymentStatus: [selectedPaymentStatus] })
    };
    
    setFilters(appliedFilters);
    setCurrentPage(1); // Reset to first page when filters change
    fetchOrders(appliedFilters, 1);
  }, [searchTerm, selectedStatus, selectedPaymentStatus, ordersPerPage, fetchOrders]);

  // Fetch orders when page changes
  useEffect(() => {
    fetchOrders(filters, currentPage);
  }, [currentPage, fetchOrders]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Real-time updates simulation (in production, use WebSocket or polling)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(filters, currentPage);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [filters, currentPage, fetchOrders]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700';
      case 'paid': return 'bg-green-50 text-green-700';
      case 'failed': return 'bg-red-50 text-red-700';
      case 'refunded': return 'bg-purple-50 text-purple-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'preparing': return <Coffee className="w-4 h-4" />;
      case 'ready': return <Bell className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleQuickStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleQuickPaymentUpdate = async (orderId: string, newStatus: PaymentStatus) => {
    try {
      await updatePaymentStatus(orderId, newStatus);
    } catch (error) {
      console.error('Failed to update payment:', error);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getPriorityLevel = (order: Order): 'high' | 'medium' | 'low' => {
    const customerOrders = order.customer.totalOrders;
    const orderAge = new Date().getTime() - order.createdAt.getTime();
    const ageInMinutes = orderAge / (1000 * 60);

    if (order.customer.loyaltyLevel === 'platinum' || order.total > 50 || ageInMinutes > 30) {
      return 'high';
    }
    if (order.customer.loyaltyLevel === 'gold' || customerOrders > 10 || ageInMinutes > 15) {
      return 'medium';
    }
    return 'low';
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case 'pending': return 'confirmed';
      case 'confirmed': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'completed';
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Order Management
              </h1>
              <p className="text-slate-600 text-lg">
                View and manage all coffee orders in real-time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      {globalStats && (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Orders</p>
                  <p className="text-3xl font-bold text-blue-900">{globalStats.totalOrders}</p>
                </div>
                <div className="bg-blue-500 p-3 rounded-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-sm font-medium">Revenue</p>
                  <p className="text-3xl font-bold text-emerald-900">
                    {formatPrice(globalStats.totalRevenue, 'USD')}
                  </p>
                </div>
                <div className="bg-emerald-500 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600 text-sm font-medium">Avg Order Value</p>
                  <p className="text-3xl font-bold text-amber-900">
                    {formatPrice(globalStats.averageOrderValue, 'USD')}
                  </p>
                </div>
                <div className="bg-amber-500 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Active Orders</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {(globalStats.statusBreakdown.pending || 0) + 
                     (globalStats.statusBreakdown.confirmed || 0) + 
                     (globalStats.statusBreakdown.preparing || 0) + 
                     (globalStats.statusBreakdown.ready || 0)}
                  </p>
                </div>
                <div className="bg-purple-500 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200/60">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  placeholder="Search orders, customers, or items..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedStatus} onValueChange={(value: string) => setSelectedStatus(value as OrderStatus | 'all')}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPaymentStatus} onValueChange={(value: string) => setSelectedPaymentStatus(value as PaymentStatus | 'all')}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Payments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('all');
                  setSelectedPaymentStatus('all');
                }}
                className="border-slate-200 hover:bg-slate-50"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* View Controls & Pagination Controls */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left side - Results count */}
          <div className="text-sm text-slate-600">
            Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, totalOrders)} of {totalOrders} orders
          </div>

          {/* Right side - View controls */}
          <div className="flex items-center gap-4">
            {/* Orders per page */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Show:</span>
              <Select value={ordersPerPage.toString()} onValueChange={(value: string) => {
                setOrdersPerPage(Number(value));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View mode toggle */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <Button
                onClick={() => setViewMode('list')}
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                className="h-7 px-2"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setViewMode('grid')}
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                className="h-7 px-2"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-slate-600">Loading orders...</span>
          </div>
        ) : error ? (
          <Card className="p-8 bg-red-50 border-red-200">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Orders</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button onClick={clearError} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                Try Again
              </Button>
            </div>
          </Card>
        ) : orders.length === 0 ? (
          <Card className="p-12 bg-slate-50 border-slate-200">
            <div className="text-center">
              <Coffee className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No Orders Found</h3>
              <p className="text-slate-600 mb-6">No orders match your current filters.</p>
            </div>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 
            "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" : 
            "space-y-4"
          }>
            {orders.map((order: Order) => {
              const priority = getPriorityLevel(order);
              const nextStatus = getNextStatus(order.status);
              
              return viewMode === 'grid' ? (
                // Grid View Card
                <Card 
                  key={order.id} 
                  className={`p-6 bg-white border transition-all duration-200 hover:shadow-lg cursor-pointer ${
                    priority === 'high' ? 'border-l-4 border-l-red-500' :
                    priority === 'medium' ? 'border-l-4 border-l-yellow-500' :
                    'border-l-4 border-l-green-500'
                  }`}
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowOrderDetail(true);
                  }}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(order.status).replace('text-', 'bg-').replace('800', '500')}`}>
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            #{order.orderNumber}
                          </h3>
                          <Badge className={`${getStatusColor(order.status)} text-xs font-medium mt-1`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      {priority === 'high' && (
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          High Priority
                        </Badge>
                      )}
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="w-4 h-4" />
                        {order.customer.name}
                        <Badge variant="outline" className="text-xs">
                          {order.customer.loyaltyLevel}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4" />
                        {formatTimeAgo(order.createdAt)}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-slate-100">
                      <div className="text-center">
                        <p className="text-xs text-slate-600">Items</p>
                        <p className="font-semibold text-slate-900">{order.items.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-600">Total</p>
                        <p className="font-bold text-slate-900">
                          {formatPrice(order.total, order.payment.currency)}
                        </p>
                      </div>
                    </div>

                    {/* Payment & Prep Time */}
                    <div className="flex items-center justify-between">
                      <Badge className={`${getPaymentStatusColor(order.payment.status)} text-xs`}>
                        {order.payment.status}
                      </Badge>
                      <span className="text-sm text-slate-600 flex items-center gap-1">
                        <Timer className="w-4 h-4" />
                        {order.estimatedPrepTime}m
                      </span>
                    </div>

                    {/* Items Preview */}
                    <div className="text-xs text-slate-600">
                      <Coffee className="w-3 h-3 inline mr-1" />
                      {order.items.slice(0, 2).map((item: any, idx: number) => 
                        `${item.quantity}x ${item.productName}`
                      ).join(', ')}
                      {order.items.length > 2 && ` +${order.items.length - 2} more`}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {nextStatus && (
                        <Button
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleQuickStatusUpdate(order.id, nextStatus);
                          }}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white text-xs flex-1"
                        >
                          Mark {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                        </Button>
                      )}
                      <Button
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                          setShowOrderDetail(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="text-slate-600 hover:text-slate-900"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                // List View Card (original layout)
                <Card 
                  key={order.id} 
                  className={`p-6 bg-white border transition-all duration-200 hover:shadow-lg cursor-pointer ${
                    priority === 'high' ? 'border-l-4 border-l-red-500' :
                    priority === 'medium' ? 'border-l-4 border-l-yellow-500' :
                    'border-l-4 border-l-green-500'
                  }`}
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowOrderDetail(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(order.status).replace('text-', 'bg-').replace('800', '500')}`}>
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-slate-900 text-lg">
                              #{order.orderNumber}
                            </h3>
                            <Badge className={`${getStatusColor(order.status)} text-xs font-medium`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-slate-600 flex items-center gap-2 mt-1">
                            <Users className="w-4 h-4" />
                            {order.customer.name}
                            <Badge variant="outline" className="text-xs">
                              {order.customer.loyaltyLevel}
                            </Badge>
                            <Clock className="w-4 h-4 ml-2" />
                            {formatTimeAgo(order.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-slate-600">Items</p>
                        <p className="font-semibold text-slate-900">{order.items.length}</p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-slate-600">Total</p>
                        <p className="font-bold text-xl text-slate-900">
                          {formatPrice(order.total, order.payment.currency)}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-slate-600">Payment</p>
                        <Badge className={`${getPaymentStatusColor(order.payment.status)} text-xs`}>
                          {order.payment.status}
                        </Badge>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-slate-600">Prep Time</p>
                        <p className="font-semibold text-slate-900 flex items-center gap-1">
                          <Timer className="w-4 h-4" />
                          {order.estimatedPrepTime}m
                        </p>
                      </div>

                      {nextStatus && (
                        <Button
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleQuickStatusUpdate(order.id, nextStatus);
                          }}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2"
                        >
                          Mark {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                        </Button>
                      )}

                      <Button
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                          setShowOrderDetail(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="text-slate-600 hover:text-slate-900"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Order Items Preview - only for list view */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Coffee className="w-4 h-4" />
                          {order.items.map((item: any, idx: number) => 
                            `${item.quantity}x ${item.productName} (${formatPrice(item.unitPrice, order.payment.currency)})`
                          ).join(', ')}
                        </span>
                        {order.notes && (
                          <span className="flex items-center gap-1 text-amber-600">
                            <AlertCircle className="w-4 h-4" />
                            Has Notes
                          </span>
                        )}
                      </div>
                      
                      {priority === 'high' && (
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          High Priority
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalOrders > 20 && (
        <div className="max-w-7xl mx-auto px-6 pb-8">
          <div className="flex items-center justify-center space-x-2">
            {Array.from({ length: Math.ceil(totalOrders / 20) }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => setCurrentPage(page)}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className={currentPage === page ? "bg-blue-600 text-white" : ""}
              >
                {page}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions Floating Panel - for Active Orders */}
      {orders.filter((o: Order) => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length > 0 && (
        <div className="fixed bottom-6 right-6">
          <Card className="p-4 bg-white shadow-lg border border-slate-200">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700 mb-2">Active Orders</p>
              <p className="text-2xl font-bold text-blue-600">
                {orders.filter((o: Order) => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length}
              </p>
              <p className="text-xs text-slate-600">Need attention</p>
            </div>
          </Card>
        </div>
      )}
      
      {/* Modals */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={showOrderDetail}
        onClose={() => {
          setShowOrderDetail(false);
          setSelectedOrder(null);
        }}
        onUpdateStatus={updateOrderStatus}
        onUpdatePaymentStatus={updatePaymentStatus}
        onAddNote={addOrderNote}
        onUpdatePrepTime={updatePrepTime}
        onCancelOrder={cancelOrder}
      />
    </div>
  );
};

export default OrdersPage;