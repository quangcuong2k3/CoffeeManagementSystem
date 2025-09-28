/**
 * Order Detail Modal - Comprehensive View & Actions
 * Shows complete order information with status management
 */

"use client";

import React, { useState } from 'react';
import {
  X,
  Clock,
  User,
  MapPin,
  CreditCard,
  Coffee,
  Star,
  Package,
  MessageCircle,
  Timer,
  CheckCircle,
  AlertTriangle,
  Edit3,
  Trash2,
  Receipt,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';

import { Button } from '../../../../shared/components/ui/button';
import { Badge } from '../../../../shared/components/ui/badge';
import { Card } from '../../../../shared/ui/card';
import { Input } from '../../../../shared/components/ui/input';

import { Order, OrderStatus, PaymentStatus } from '@/entities/order';
import { formatPrice } from '../../../../shared/lib/currency';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onUpdatePaymentStatus: (orderId: string, status: PaymentStatus) => Promise<void>;
  onAddNote: (orderId: string, note: string) => Promise<void>;
  onUpdatePrepTime: (orderId: string, minutes: number) => Promise<void>;
  onCancelOrder: (orderId: string, reason?: string) => Promise<void>;
  onDeleteOrder?: (orderId: string) => Promise<void>; // Made optional since we don't delete orders
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdatePaymentStatus,
  onAddNote,
  onUpdatePrepTime,
  onCancelOrder,
  onDeleteOrder
}) => {
  const [newNote, setNewNote] = useState('');
  const [newPrepTime, setNewPrepTime] = useState(0);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingPrepTime, setEditingPrepTime] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !order) return null;

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
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'paid': return 'bg-green-50 text-green-700 border-green-200';
      case 'failed': return 'bg-red-50 text-red-700 border-red-200';
      case 'refunded': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
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

  const getNextStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    switch (currentStatus) {
      case 'pending': return ['confirmed', 'cancelled'];
      case 'confirmed': return ['preparing', 'cancelled'];
      case 'preparing': return ['ready', 'cancelled'];
      case 'ready': return ['completed', 'cancelled'];
      default: return [];
    }
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    setLoading(true);
    try {
      await onUpdateStatus(order.id, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentUpdate = async (newStatus: PaymentStatus) => {
    setLoading(true);
    try {
      await onUpdatePaymentStatus(order.id, newStatus);
    } catch (error) {
      console.error('Failed to update payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    setLoading(true);
    try {
      await onAddNote(order.id, newNote);
      setNewNote('');
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrepTime = async () => {
    setLoading(true);
    try {
      await onUpdatePrepTime(order.id, newPrepTime);
      setEditingPrepTime(false);
    } catch (error) {
      console.error('Failed to update prep time:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    setLoading(true);
    try {
      await onCancelOrder(order.id, cancelReason || undefined);
      setShowCancelDialog(false);
      setCancelReason('');
    } catch (error) {
      console.error('Failed to cancel order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!onDeleteOrder) return;
    
    setLoading(true);
    try {
      await onDeleteOrder(order.id);
      setShowDeleteDialog(false);
      onClose();
    } catch (error) {
      console.error('Failed to delete order:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Order #{order.orderNumber}</h2>
              <div className="flex items-center gap-4">
                <Badge className={`${getStatusColor(order.status)} border text-sm`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
                <span className="text-slate-300 text-sm">
                  Created {formatTimeAgo(order.createdAt)}
                </span>
                <span className="text-slate-300 text-sm flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  {order.estimatedPrepTime} min prep
                </span>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <Card className="p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Name</p>
                    <p className="font-medium">{order.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Loyalty Level</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      <Star className="w-3 h-3 mr-1" />
                      {order.customer.loyaltyLevel}
                    </Badge>
                  </div>
                  {order.customer.email && (
                    <div>
                      <p className="text-sm text-slate-600">Email</p>
                      <p className="font-medium flex items-center gap-1">
                        <Mail className="w-4 h-4 text-slate-500" />
                        {order.customer.email}
                      </p>
                    </div>
                  )}
                  {order.customer.phone && (
                    <div>
                      <p className="text-sm text-slate-600">Phone</p>
                      <p className="font-medium flex items-center gap-1">
                        <Phone className="w-4 h-4 text-slate-500" />
                        {order.customer.phone}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-slate-600">Total Orders</p>
                    <p className="font-medium">{order.customer.totalOrders}</p>
                  </div>
                </div>
              </Card>

              {/* Order Items */}
              <Card className="p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-amber-600" />
                  Order Items ({order.items.length})
                </h3>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-100 p-2 rounded-lg">
                          <Package className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-slate-600">
                            {formatPrice(item.unitPrice, order.payment.currency)} each
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">×{item.quantity}</p>
                        <p className="font-bold text-lg">
                          {formatPrice(item.totalPrice, order.payment.currency)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Order Notes */}
              <Card className="p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  Order Notes
                </h3>
                {order.notes ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <p className="text-amber-800 whitespace-pre-wrap">{order.notes}</p>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm mb-4">No notes added yet</p>
                )}
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewNote(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleAddNote} disabled={!newNote.trim() || loading}>
                    Add Note
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right Column - Actions & Payment */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card className="p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-purple-600" />
                  Order Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal:</span>
                    <span>{formatPrice(order.subtotal, order.payment.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tax:</span>
                    <span>{formatPrice(order.tax, order.payment.currency)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-{formatPrice(order.discount, order.payment.currency)}</span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatPrice(order.total, order.payment.currency)}</span>
                  </div>
                </div>
              </Card>

              {/* Payment Information */}
              <Card className="p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Payment
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Method:</span>
                    <span className="capitalize">{order.payment.method.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Status:</span>
                    <Badge className={`${getPaymentStatusColor(order.payment.status)} border text-xs`}>
                      {order.payment.status}
                    </Badge>
                  </div>
                  
                  {order.payment.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handlePaymentUpdate('paid')}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white flex-1"
                        disabled={loading}
                      >
                        Mark Paid
                      </Button>
                      <Button
                        onClick={() => handlePaymentUpdate('failed')}
                        size="sm"
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50 flex-1"
                        disabled={loading}
                      >
                        Mark Failed
                      </Button>
                    </div>
                  )}
                  
                  {order.payment.status === 'paid' && (
                    <Button
                      onClick={() => handlePaymentUpdate('refunded')}
                      size="sm"
                      variant="outline"
                      className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
                      disabled={loading}
                    >
                      Process Refund
                    </Button>
                  )}
                </div>
              </Card>

              {/* Status Actions */}
              <Card className="p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  Order Status
                </h3>
                
                {/* Prep Time Editor */}
                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Estimated Prep Time:</span>
                    <Button
                      onClick={() => {
                        setEditingPrepTime(!editingPrepTime);
                        setNewPrepTime(order.estimatedPrepTime);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  {editingPrepTime ? (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={newPrepTime}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPrepTime(Number(e.target.value))}
                        className="flex-1"
                        min="1"
                        max="120"
                      />
                      <Button onClick={handleUpdatePrepTime} size="sm" disabled={loading}>
                        Save
                      </Button>
                    </div>
                  ) : (
                    <p className="font-medium">{order.estimatedPrepTime} minutes</p>
                  )}
                </div>

                {/* Status Update Buttons */}
                <div className="space-y-2">
                  {getNextStatuses(order.status).filter(status => status !== 'cancelled').map((status) => (
                    <Button
                      key={status}
                      onClick={() => handleStatusUpdate(status)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={loading}
                    >
                      Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </Card>

              {/* Danger Zone */}
              {['pending', 'confirmed', 'preparing'].includes(order.status) && (
                <Card className="p-4 border-red-200">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    Actions
                  </h3>
                  <div className="space-y-2">
                    <Button
                      onClick={() => setShowCancelDialog(true)}
                      variant="outline"
                      className="w-full border-red-200 text-red-600 hover:bg-red-50"
                      disabled={loading}
                    >
                      Cancel Order
                    </Button>
                    
                    {order.status === 'cancelled' && onDeleteOrder && (
                      <Button
                        onClick={() => setShowDeleteDialog(true)}
                        variant="outline"
                        className="w-full border-red-300 text-red-700 hover:bg-red-50"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Order
                      </Button>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Cancel Dialog */}
        {showCancelDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="font-semibold text-lg mb-4 text-red-600">Cancel Order</h3>
              <p className="text-slate-600 mb-4">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
              <Input
                placeholder="Reason for cancellation (optional)"
                value={cancelReason}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCancelReason(e.target.value)}
                className="mb-4"
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowCancelDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Keep Order
                </Button>
                <Button
                  onClick={handleCancelOrder}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={loading}
                >
                  Cancel Order
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Dialog */}
        {showDeleteDialog && onDeleteOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="font-semibold text-lg mb-4 text-red-600">Delete Order</h3>
              <p className="text-slate-600 mb-4">
                This will permanently delete the order and all associated data. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDeleteDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteOrder}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Forever
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailModal;