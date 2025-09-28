/**
 * Create Order Modal - Intuitive Order Creation
 * Modern, user-friendly interface for creating new orders
 */

"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Search,
  User,
  CreditCard,
  Coffee,
  ShoppingCart,
  Calculator,
  Star,
  Package,
  Clock,
  Check
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

import { OrderFormData, Customer, PaymentMethod, Order } from '../../../../entities/order';
import { formatPrice } from '../../../../shared/lib/currency';

interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOrder: (orderData: OrderFormData) => Promise<Order>;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onCreateOrder
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Customer Step
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');

  // Items Step
  const [productSearch, setProductSearch] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // Payment Step
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  // Mock data - in real app, these would come from API
  const mockCustomers: Customer[] = [
    {
      id: 'cust_1',
      name: 'John Smith',
      email: 'john@example.com',
      phone: '+1234567890',
      loyaltyLevel: 'gold',
      totalOrders: 25,
      avatar: ''
    },
    {
      id: 'cust_2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1234567891',
      loyaltyLevel: 'silver',
      totalOrders: 12,
      avatar: ''
    },
    {
      id: 'cust_3',
      name: 'Mike Brown',
      email: 'mike@example.com',
      phone: '+1234567892',
      loyaltyLevel: 'platinum',
      totalOrders: 50,
      avatar: ''
    }
  ];

  const mockProducts = [
    { id: 'C1', name: 'Espresso', price: 3.50, category: 'coffee' },
    { id: 'C2', name: 'Cappuccino', price: 4.25, category: 'coffee' },
    { id: 'C3', name: 'Latte', price: 4.75, category: 'coffee' },
    { id: 'C4', name: 'Americano', price: 3.25, category: 'coffee' },
    { id: 'C5', name: 'Mocha', price: 5.00, category: 'coffee' },
    { id: 'C6', name: 'Flat White', price: 4.50, category: 'coffee' },
    { id: 'B1', name: 'Arabica Beans', price: 15.99, category: 'beans' },
    { id: 'B2', name: 'Robusta Beans', price: 12.99, category: 'beans' }
  ];

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setCurrentStep(1);
      setSelectedCustomer(null);
      setCustomerSearch('');
      setNewCustomerName('');
      setNewCustomerEmail('');
      setNewCustomerPhone('');
      setProductSearch('');
      setOrderItems([]);
      setPaymentMethod('cash');
      setDiscount(0);
      setNotes('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.email?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const subtotal = orderItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax - discount;

  const addProductToOrder = (product: typeof mockProducts[0]) => {
    const existingItem = orderItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      setOrderItems(items =>
        items.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setOrderItems(items => [
        ...items,
        {
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity: 1
        }
      ]);
    }
    setProductSearch('');
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems(items => items.filter(item => item.productId !== productId));
    } else {
      setOrderItems(items =>
        items.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeItem = (productId: string) => {
    setOrderItems(items => items.filter(item => item.productId !== productId));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedFromStep1 = selectedCustomer || (newCustomerName.trim().length > 0);
  const canProceedFromStep2 = orderItems.length > 0;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const customer: Customer = selectedCustomer || {
        id: 'new_customer',
        name: newCustomerName,
        email: newCustomerEmail || undefined,
        phone: newCustomerPhone || undefined,
        loyaltyLevel: 'bronze',
        totalOrders: 0,
        avatar: ''
      };

      const orderData: OrderFormData = {
        customerId: customer.id,
        items: orderItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productImage: '',
          size: 'Regular',
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          specialInstructions: undefined
        })),
        paymentMethod,
        notes: notes || undefined,
        discount: discount > 0 ? discount : undefined
      };

      await onCreateOrder(orderData);
      onClose();
    } catch (error) {
      console.error('Failed to create order:', error);
    } finally {
      setLoading(false);
    }
  };

  const stepIndicators = [
    { step: 1, title: 'Customer', icon: User, completed: currentStep > 1 || canProceedFromStep1 },
    { step: 2, title: 'Items', icon: Coffee, completed: currentStep > 2 || canProceedFromStep2 },
    { step: 3, title: 'Payment', icon: CreditCard, completed: false }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Create New Order</h2>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              disabled={loading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center gap-4">
            {stepIndicators.map(({ step, title, icon: Icon, completed }, index) => (
              <React.Fragment key={step}>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  currentStep === step 
                    ? 'bg-white/20 text-white' 
                    : completed 
                      ? 'bg-white/10 text-white/90' 
                      : 'text-white/60'
                }`}>
                  <div className={`p-1 rounded-full ${
                    completed ? 'bg-green-500' : currentStep === step ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                    {completed ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="font-medium">{title}</span>
                </div>
                {index < stepIndicators.length - 1 && (
                  <div className={`h-0.5 w-8 ${completed ? 'bg-green-400' : 'bg-white/20'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {/* Step 1: Customer Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Select or Add Customer</h3>
                
                {/* Search Existing Customers */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <Input
                      placeholder="Search existing customers..."
                      value={customerSearch}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Customer List */}
                {customerSearch && (
                  <div className="space-y-2 mb-6">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        onClick={() => setSelectedCustomer(customer)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedCustomer?.id === customer.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{customer.name}</h4>
                            <p className="text-sm text-slate-600">{customer.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                {customer.loyaltyLevel}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                {customer.totalOrders} orders
                              </span>
                            </div>
                          </div>
                          {selectedCustomer?.id === customer.id && (
                            <div className="bg-blue-500 p-1 rounded-full">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Customer */}
                <Card className="p-4">
                  <h4 className="font-medium mb-3">Or add new customer</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">
                        Name *
                      </label>
                      <Input
                        placeholder="Customer name"
                        value={newCustomerName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCustomerName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">
                        Email
                      </label>
                      <Input
                        placeholder="customer@email.com"
                        type="email"
                        value={newCustomerEmail}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCustomerEmail(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-slate-700 mb-1 block">
                        Phone
                      </label>
                      <Input
                        placeholder="+1234567890"
                        value={newCustomerPhone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCustomerPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Step 2: Add Items */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Add Items to Order</h3>
                
                {/* Search Products */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <Input
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Product Grid */}
                {productSearch && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => addProductToOrder(product)}
                        className="p-4 border rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{product.name}</h4>
                            <p className="text-sm text-slate-600 capitalize">{product.category}</p>
                            <p className="font-bold text-lg text-blue-600">
                              {formatPrice(product.price, 'USD')}
                            </p>
                          </div>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Order Items */}
                <Card className="p-4">
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Order Items ({orderItems.length})
                  </h4>
                  
                  {orderItems.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                      <p>No items added yet</p>
                      <p className="text-sm">Search and add products above</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orderItems.map((item) => (
                        <div key={item.productId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <h5 className="font-medium">{item.productName}</h5>
                            <p className="text-sm text-slate-600">
                              {formatPrice(item.unitPrice, 'USD')} each
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="font-medium w-8 text-center">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="text-right min-w-[80px]">
                              <p className="font-bold">
                                {formatPrice(item.unitPrice * item.quantity, 'USD')}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeItem(item.productId)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* Step 3: Payment & Summary */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment & Notes */}
                <div className="space-y-6">
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Payment Method
                    </h3>
                    <Select value={paymentMethod} onValueChange={(value: string) => setPaymentMethod(value as PaymentMethod)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Discount</h4>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={discount || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDiscount(Number(e.target.value) || 0)}
                      min="0"
                      max={subtotal}
                      step="0.01"
                    />
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Order Notes</h4>
                    <textarea
                      placeholder="Special instructions, allergies, etc."
                      value={notes}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                      className="w-full p-3 border rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </Card>
                </div>

                {/* Order Summary */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Order Summary
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Customer Info */}
                    <div className="pb-4 border-b">
                      <h4 className="font-medium text-slate-700 mb-2">Customer</h4>
                      <p className="font-medium">
                        {selectedCustomer?.name || newCustomerName}
                      </p>
                      {(selectedCustomer?.email || newCustomerEmail) && (
                        <p className="text-sm text-slate-600">
                          {selectedCustomer?.email || newCustomerEmail}
                        </p>
                      )}
                      {selectedCustomer && (
                        <Badge variant="outline" className="text-xs mt-1">
                          <Star className="w-3 h-3 mr-1" />
                          {selectedCustomer.loyaltyLevel}
                        </Badge>
                      )}
                    </div>

                    {/* Items */}
                    <div className="pb-4 border-b">
                      <h4 className="font-medium text-slate-700 mb-2">Items ({orderItems.length})</h4>
                      <div className="space-y-1">
                        {orderItems.map((item) => (
                          <div key={item.productId} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.productName}</span>
                            <span>{formatPrice(item.unitPrice * item.quantity, 'USD')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Subtotal:</span>
                        <span>{formatPrice(subtotal, 'USD')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Tax (10%):</span>
                        <span>{formatPrice(tax, 'USD')}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>-{formatPrice(discount, 'USD')}</span>
                        </div>
                      )}
                      <hr />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>{formatPrice(total, 'USD')}</span>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Payment:</span>
                        <Badge variant="outline" className="capitalize">
                          {paymentMethod.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-slate-50 p-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4" />
            Estimated prep time: 15-20 minutes
          </div>
          
          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <Button
                onClick={handleBack}
                variant="outline"
                disabled={loading}
              >
                Back
              </Button>
            )}
            
            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={
                  (currentStep === 1 && !canProceedFromStep1) ||
                  (currentStep === 2 && !canProceedFromStep2)
                }
              >
                Next Step
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white px-8"
                disabled={loading || total <= 0}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Order...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Create Order ({formatPrice(total, 'USD')})
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderModal;