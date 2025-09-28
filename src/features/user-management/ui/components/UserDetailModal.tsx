/**
 * Enhanced User Detail Modal - Complete user profile with real data
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ShoppingBag,
  Heart,
  Settings,
  Shield,
  Edit3,
  Save,
  Trash2,
  Award,
  Star,
  Crown,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Eye,
  Plus,
  Minus,
  Package
} from 'lucide-react';

import { Button } from '../../../../shared/components/ui/button';
import { Input } from '../../../../shared/components/ui/input';
import { Badge } from '../../../../shared/components/ui/badge';
import { Card } from '../../../../shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../shared/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '../../../../shared/ui/select';

import { User as UserType, UserStatus, AccountType, MembershipTier } from '../../../../entities/user';
import { useUserDetails } from '../../../../infra/api/hooks/userHook';
import { formatPrice } from '../../../../shared/lib/currency';

interface UserDetailModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (userId: string, status: UserStatus) => Promise<void>;
  onUpdateAccountType: (userId: string, accountType: AccountType) => Promise<void>;
  onAwardPoints: (userId: string, points: number) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdateAccountType,
  onAwardPoints,
  onDeleteUser
}) => {
  // State management - hooks must always be called
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<UserType>>({});
  const [pointsToAward, setPointsToAward] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Debug logging
  //console.log('Modal state:', { activeTab, isOpen, user: user?.id });

  // User details hook - always call this hook
  const {
    user: detailedUser,
    preferences,
    favoriteProducts,
    orderHistory,
    loading: detailsLoading,
    error: detailsError,
    realStats,
    fetchUserDetails,
    updateUserInfo,
    clearError
  } = useUserDetails();

  // Memoized utility functions
  const getStatusIcon = useCallback((status: UserStatus) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <Clock className="w-4 h-4" />;
      case 'suspended': return <XCircle className="w-4 h-4" />;
      case 'pending_verification': return <AlertTriangle className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  }, []);

  const getStatusColor = useCallback((status: UserStatus) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'inactive': return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'suspended': return 'bg-red-50 text-red-700 border-red-200';
      case 'pending_verification': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  }, []);

  const getTierColor = useCallback((tier: MembershipTier) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'gold': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'silver': return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'bronze': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  }, []);

  const formatJoinDate = useCallback((date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }, []);

  const getLastActiveText = useCallback((date?: Date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const lastActive = new Date(date);
    const diffMs = now.getTime() - lastActive.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }, []);

  // Memoized computed values
  const displayUser = useMemo(() => detailedUser || user, [detailedUser, user]);

  // Event handlers - moved before useEffect to ensure all hooks are called first
  const handleSaveEdit = useCallback(async () => {
    if (!displayUser) return;
    
    try {
      setUpdating(true);
      await updateUserInfo(displayUser.id, editedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setUpdating(false);
    }
  }, [displayUser, editedUser, updateUserInfo]);

  const handleStatusChange = useCallback(async (newStatus: UserStatus) => {
    if (!displayUser) return;
    
    try {
      setUpdating(true);
      await onUpdateStatus(displayUser.id, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdating(false);
    }
  }, [displayUser, onUpdateStatus]);

  const handleAccountTypeChange = useCallback(async (newType: AccountType) => {
    if (!displayUser) return;
    
    try {
      setUpdating(true);
      await onUpdateAccountType(displayUser.id, newType);
    } catch (error) {
      console.error('Failed to update account type:', error);
    } finally {
      setUpdating(false);
    }
  }, [displayUser, onUpdateAccountType]);

  const handleAwardPoints = useCallback(async () => {
    if (!displayUser || !pointsToAward) return;
    
    const points = parseInt(pointsToAward);
    if (isNaN(points) || points <= 0) return;
    
    try {
      setUpdating(true);
      await onAwardPoints(displayUser.id, points);
      setPointsToAward('');
    } catch (error) {
      console.error('Failed to award points:', error);
    } finally {
      setUpdating(false);
    }
  }, [displayUser, pointsToAward, onAwardPoints]);

  const handleDelete = useCallback(async () => {
    if (!displayUser) return;
    
    try {
      setUpdating(true);
      await onDeleteUser(displayUser.id);
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setUpdating(false);
    }
  }, [displayUser, onDeleteUser, onClose]);

  // Reset state when modal opens/closes - Fixed dependencies
  useEffect(() => {
    if (isOpen && user) {
      console.log('Modal opening for user:', user.id);
      setEditedUser({
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber
      });
      setIsEditing(false);
      setShowDeleteConfirm(false);
      setActiveTab('overview');
      
      // Call functions directly to avoid dependency issues
      if (clearError) clearError();
      if (fetchUserDetails) fetchUserDetails(user.id);
    }
  }, [isOpen, user?.id]); // Only depend on isOpen and user.id

  // Early return after all hooks have been called
  if (!isOpen || !displayUser) return null;



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
              {displayUser.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{displayUser.displayName}</h2>
              <p className="text-gray-600">{displayUser.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`${getStatusColor(displayUser.status)} flex items-center gap-1`}>
                  {getStatusIcon(displayUser.status)}
                  <span className="capitalize">{displayUser.status.replace('_', ' ')}</span>
                </Badge>
                <Badge className={`${getTierColor(displayUser.membershipTier)} flex items-center gap-1`}>
                  <Crown className="w-3 h-3" />
                  <span className="capitalize">{displayUser.membershipTier}</span>
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Custom Tab Navigation */}
          <div className="w-full">
            <div className="flex justify-start px-6 bg-gray-50 border-b">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === 'overview' 
                    ? 'border-blue-500 text-blue-600 bg-blue-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className="w-4 h-4" />
                Overview
              </button>
              <button 
                onClick={() => {
                  console.log('Clicking orders tab');
                  setActiveTab('orders');
                }}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === 'orders' 
                    ? 'border-blue-500 text-blue-600 bg-blue-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                Orders ({orderHistory.length})
              </button>
              <button 
                onClick={() => setActiveTab('favorites')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === 'favorites' 
                    ? 'border-blue-500 text-blue-600 bg-blue-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Heart className="w-4 h-4" />
                Favorites ({favoriteProducts.length})
              </button>
              <button 
                onClick={() => setActiveTab('preferences')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === 'preferences' 
                    ? 'border-blue-500 text-blue-600 bg-blue-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-4 h-4" />
                Preferences
              </button>
              <button 
                onClick={() => setActiveTab('management')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === 'management' 
                    ? 'border-blue-500 text-blue-600 bg-blue-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Shield className="w-4 h-4" />
                Management
              </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="p-6 space-y-6">
              {/* Personal Information */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2"
                    disabled={updating}
                  >
                    <Edit3 className="w-4 h-4" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Display Name</label>
                        <Input
                          value={editedUser.displayName || ''}
                          onChange={(e) => setEditedUser(prev => ({...prev, displayName: e.target.value}))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <Input
                          value={displayUser.email}
                          disabled
                          className="mt-1 bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">First Name</label>
                        <Input
                          value={editedUser.firstName || ''}
                          onChange={(e) => setEditedUser(prev => ({...prev, firstName: e.target.value}))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Last Name</label>
                        <Input
                          value={editedUser.lastName || ''}
                          onChange={(e) => setEditedUser(prev => ({...prev, lastName: e.target.value}))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                        <Input
                          value={editedUser.phoneNumber || ''}
                          onChange={(e) => setEditedUser(prev => ({...prev, phoneNumber: e.target.value}))}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={handleSaveEdit}
                          disabled={updating}
                          className="flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {updating ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Display Name:</span>
                          <span className="font-medium">{displayUser.displayName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{displayUser.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">First Name:</span>
                          <span className="font-medium">{displayUser.firstName || 'Not provided'}</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Name:</span>
                          <span className="font-medium">{displayUser.lastName || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{displayUser.phoneNumber || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Join Date:</span>
                          <span className="font-medium">{formatJoinDate(displayUser.joinDate)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* User Stats with Real Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Total Orders</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {realStats?.totalOrders ?? displayUser.totalOrders ?? 0}
                      </p>
                    </div>
                    <ShoppingBag className="w-8 h-8 text-blue-600" />
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Total Spent</p>
                      <p className="text-2xl font-bold text-green-700">
                        {formatPrice(realStats?.totalSpent ?? displayUser.totalSpent ?? 0)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Loyalty Points</p>
                      <p className="text-2xl font-bold text-purple-700">{displayUser.loyaltyPoints ?? 0}</p>
                    </div>
                    <Star className="w-8 h-8 text-purple-600" />
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 text-sm font-medium">Avg Order</p>
                      <p className="text-2xl font-bold text-orange-700">
                        {formatPrice(realStats?.averageOrderValue ?? displayUser.averageOrderValue ?? 0)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-600" />
                  </div>
                </Card>
              </div>

              {/* Activity Information */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Active:</span>
                      <span className="font-medium">{getLastActiveText(displayUser.lastActiveDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Order:</span>
                      <span className="font-medium">{displayUser.lastOrderDate ? formatJoinDate(displayUser.lastOrderDate) : 'No orders yet'}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Favorite Products:</span>
                      <span className="font-medium">{displayUser.favoriteProductsCount} products</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Type:</span>
                      <Badge className="capitalize">{displayUser.accountType}</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="p-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Order History ({orderHistory.length} orders)
                </h3>
                {detailsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : orderHistory.length > 0 ? (
                  <div className="space-y-4">
                    {orderHistory.map((order) => (
                      <div key={order.id} className="border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between p-4 border-b">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold">Order #{order.orderId || order.id}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {order.orderDate.toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                                <span>{order.items.length} items</span>
                                <span>Payment: {order.paymentMethod}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-xl text-green-600">{formatPrice(order.totalAmount)}</p>
                            <Badge 
                              className={
                                order.status === 'delivered' || order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Order Items */}
                        <div className="p-4">
                          <p className="text-sm font-medium text-gray-700 mb-3">Items ordered:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {order.items.slice(0, 4).map((item, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                                  <span className="text-white text-sm font-bold">
                                    {item.name?.[0] || 'P'}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{item.name || 'Product'}</p>
                                  <p className="text-xs text-gray-600 capitalize">{item.type || 'Item'}</p>
                                  {item.prices?.[0] && (
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                      <span>Size: {item.prices[0].size}</span>
                                      <span>Qty: {item.prices[0].quantity}</span>
                                      <span className="font-medium text-green-600">
                                        {item.prices[0].currency}{item.prices[0].price}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                            {order.items.length > 4 && (
                              <div className="col-span-full text-center text-sm text-gray-500 py-2">
                                +{order.items.length - 4} more items
                              </div>
                            )}
                          </div>
                          
                          {/* Delivery Address */}
                          {order.deliveryAddress && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Delivery to:</span> {order.deliveryAddress}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No orders found</p>
                    <p className="text-sm text-gray-500 mt-2">
                      This user hasn't placed any orders yet
                    </p>
                  </div>
                )}
              </Card>
            </div>
            )}

            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <div className="p-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Favorite Products ({preferences?.favorites?.length || 0})
                </h3>
                {detailsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : preferences?.favorites && preferences.favorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {preferences.favorites.map((productId) => (
                      <div key={productId} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                          <Heart className="w-6 h-6 text-white fill-current" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Product {productId}</p>
                          <p className="text-sm text-gray-600">Product ID: {productId}</p>
                          <Badge variant="secondary" className="mt-1">
                            Favorited
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No favorite products</p>
                    <p className="text-sm text-gray-500 mt-2">
                      User hasn't added any products to favorites yet
                    </p>
                  </div>
                )}
              </Card>
            </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="p-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Preferences</h3>
                {preferences ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Recent Searches</p>
                        {preferences.recentSearches.length > 0 ? (
                          <div className="space-y-2">
                            {preferences.recentSearches.slice(0, 5).map((search, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                <Eye className="w-4 h-4 text-gray-400" />
                                <span className="text-sm">{JSON.stringify(search)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-600 text-sm">No recent searches</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Preferences</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Account created:</span>
                            <span className="text-sm font-medium">{preferences.createdAt?.toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Last updated:</span>
                            <span className="text-sm font-medium">{preferences.updatedAt?.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No preferences found</p>
                  </div>
                )}
              </Card>
            </div>
            )}

            {/* Management Tab */}
            {activeTab === 'management' && (
              <div className="p-6 space-y-6">
              {/* Status Management */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Management</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">User Status</label>
                    <Select value={displayUser.status} onValueChange={handleStatusChange} disabled={updating}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="pending_verification">Pending Verification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Account Type</label>
                    <Select value={displayUser.accountType} onValueChange={handleAccountTypeChange} disabled={updating}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Points Management */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Loyalty Points</h3>
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Award Points</label>
                    <Input
                      type="number"
                      placeholder="Enter points to award"
                      value={pointsToAward}
                      onChange={(e) => setPointsToAward(e.target.value)}
                      min="1"
                    />
                  </div>
                  <Button
                    onClick={handleAwardPoints}
                    disabled={!pointsToAward || updating}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Award Points
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Current balance: <span className="font-medium">{displayUser.loyaltyPoints} points</span>
                </p>
              </Card>

              {/* Danger Zone */}
              <Card className="p-6 border-red-200 bg-red-50">
                <h3 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h3>
                {!showDeleteConfirm ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete User Account
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-red-100 border border-red-200 rounded-lg">
                      <p className="text-red-800 font-medium">Are you sure you want to delete this user?</p>
                      <p className="text-red-700 text-sm mt-1">This action cannot be undone. All user data will be permanently removed.</p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={updating}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleDelete}
                        disabled={updating}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {updating ? 'Deleting...' : 'Delete User'}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;