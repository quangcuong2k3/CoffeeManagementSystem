/**
 * User Detail Modal - Comprehensive User Profile & Management
 * Shows complete user information with management actions
 */

"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  Award,
  Star,
  Gift,
  ShoppingBag,
  Heart,
  Clock,
  Edit3,
  Save,
  Trash2,
  Crown,
  DollarSign,
  TrendingUp,
  Coffee,
  Package,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Shield,
  Bell
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../shared/ui/tabs';

import { User as UserType, UserStatus, AccountType, MembershipTier } from '../../../../entities/user';
import { formatPrice } from '../../../../shared/lib/currency';
import { useUser } from '@/infra/api/hooks/userHook';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<UserType>>({});
  const [pointsToAward, setPointsToAward] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [updating, setUpdating] = useState(false);

  const {
    orderHistory,
    favoriteProducts,
    preferences,
    fetchOrderHistory,
    fetchFavorites,
    fetchPreferences,
    clearError
  } = useUser();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen && user) {
      setEditedUser({
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber
      });
      setIsEditing(false);
      setShowDeleteConfirm(false);
      clearError();
      
      // Fetch additional user data
      fetchOrderHistory(user.id);
      fetchFavorites(user.id);
      fetchPreferences(user.id);
    }
  }, [isOpen, user, fetchOrderHistory, fetchFavorites, fetchPreferences, clearError]);

  if (!isOpen || !user) return null;

  const handleStatusChange = async (newStatus: UserStatus) => {
    try {
      setUpdating(true);
      await onUpdateStatus(user.id, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAccountTypeChange = async (newType: AccountType) => {
    try {
      setUpdating(true);
      await onUpdateAccountType(user.id, newType);
    } catch (error) {
      console.error('Failed to update account type:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAwardPoints = async () => {
    const points = parseInt(pointsToAward);
    if (isNaN(points) || points <= 0) return;

    try {
      setUpdating(true);
      await onAwardPoints(user.id, points);
      setPointsToAward('');
    } catch (error) {
      console.error('Failed to award points:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setUpdating(true);
      await onDeleteUser(user.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setUpdating(false);
      setShowDeleteConfirm(false);
    }
  };

  const getStatusIcon = (status: UserStatus) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <Clock className="w-4 h-4" />;
      case 'suspended': return <XCircle className="w-4 h-4" />;
      case 'pending_verification': return <AlertTriangle className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending_verification': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTierIcon = (tier: MembershipTier) => {
    switch (tier) {
      case 'platinum': return <Crown className="w-5 h-5 text-purple-600" />;
      case 'gold': return <Crown className="w-5 h-5 text-yellow-600" />;
      case 'silver': return <Award className="w-5 h-5 text-gray-600" />;
      case 'bronze': return <Award className="w-5 h-5 text-orange-600" />;
      default: return <Star className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTierColor = (tier: MembershipTier) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'bronze': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatJoinDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getLastActiveText = (date?: Date) => {
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
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.displayName}</h2>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`${getStatusColor(user.status)} flex items-center gap-1`}>
                  {getStatusIcon(user.status)}
                  <span className="capitalize">{user.status.replace('_', ' ')}</span>
                </Badge>
                <Badge className={`${getTierColor(user.membershipTier)} flex items-center gap-1`}>
                  {getTierIcon(user.membershipTier)}
                  <span className="capitalize">{user.membershipTier}</span>
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
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start px-6 bg-gray-50 border-b">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Orders ({orderHistory.length})
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Favorites ({favoriteProducts.length})
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="management" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Management
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="p-6 space-y-6">
              {/* Personal Information */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                    {isEditing ? (
                      <Input
                        value={editedUser.displayName || ''}
                        onChange={(e) => setEditedUser(prev => ({...prev, displayName: e.target.value}))}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-gray-900">{user.displayName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{user.email}</p>
                      {user.isEmailVerified && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    {isEditing ? (
                      <Input
                        value={editedUser.firstName || ''}
                        onChange={(e) => setEditedUser(prev => ({...prev, firstName: e.target.value}))}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-gray-900">{user.firstName || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    {isEditing ? (
                      <Input
                        value={editedUser.lastName || ''}
                        onChange={(e) => setEditedUser(prev => ({...prev, lastName: e.target.value}))}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-gray-900">{user.lastName || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    {isEditing ? (
                      <Input
                        value={editedUser.phoneNumber || ''}
                        onChange={(e) => setEditedUser(prev => ({...prev, phoneNumber: e.target.value}))}
                        className="w-full"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">{user.phoneNumber || 'Not provided'}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{formatJoinDate(user.joinDate)}</p>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-3 mt-6">
                    <Button
                      onClick={() => {
                        // Handle save logic here
                        setIsEditing(false);
                      }}
                      disabled={updating}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </Card>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">Total Orders</p>
                      <p className="text-2xl font-bold text-blue-900">{user.totalOrders}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-green-700">Total Spent</p>
                      <p className="text-2xl font-bold text-green-900">{formatPrice(user.totalSpent)}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-amber-700">Loyalty Points</p>
                      <p className="text-2xl font-bold text-amber-900">{user.loyaltyPoints}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-700">Avg Order Value</p>
                      <p className="text-2xl font-bold text-purple-900">{formatPrice(user.averageOrderValue)}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Activity Information */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Active</label>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{getLastActiveText(user.lastActiveDate)}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Order</label>
                    <div className="flex items-center gap-2">
                      <Coffee className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">
                        {user.lastOrderDate 
                          ? new Date(user.lastOrderDate).toLocaleDateString()
                          : 'No orders yet'
                        }
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Favorite Products</label>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{user.favoriteProductsCount} products</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900 capitalize">{user.accountType}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="p-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                {orderHistory.length > 0 ? (
                  <div className="space-y-4">
                    {orderHistory.map((order, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Order #{order.id}</p>
                          <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatPrice(order.total)}</p>
                          <Badge className="mt-1">
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No orders found</p>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="favorites" className="p-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Favorite Products</h3>
                {favoriteProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favoriteProducts.map((productId, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Package className="w-8 h-8 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Product {productId}</p>
                          <p className="text-sm text-gray-600">Added to favorites</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No favorite products</p>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="p-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Preferences</h3>
                {preferences ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Notifications</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Order Updates</span>
                          <Badge variant={preferences.notifications?.orderUpdates ? "default" : "secondary"}>
                            {preferences.notifications?.orderUpdates ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Promotions</span>
                          <Badge variant={preferences.notifications?.promotions ? "default" : "secondary"}>
                            {preferences.notifications?.promotions ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No preferences configured</p>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="management" className="p-6 space-y-6">
              {/* Status Management */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Management</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">User Status</label>
                    <Select
                      value={user.status}
                      onValueChange={handleStatusChange}
                      disabled={updating}
                    >
                      <SelectTrigger className="w-full">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                    <Select
                      value={user.accountType}
                      onValueChange={handleAccountTypeChange}
                      disabled={updating}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Loyalty Points Management */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Loyalty Points</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Current Points: <span className="font-medium text-amber-600">{user.loyaltyPoints}</span></p>
                    <div className="flex gap-3">
                      <Input
                        type="number"
                        placeholder="Points to award"
                        value={pointsToAward}
                        onChange={(e) => setPointsToAward(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleAwardPoints}
                        disabled={updating || !pointsToAward || parseInt(pointsToAward) <= 0}
                        className="flex items-center gap-2"
                      >
                        <Gift className="w-4 h-4" />
                        Award Points
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Danger Zone */}
              <Card className="p-6 border-red-200 bg-red-50">
                <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
                <div className="space-y-4">
                  {!showDeleteConfirm ? (
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete User Account
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-red-800">
                        Are you sure you want to delete this user account? This action cannot be undone.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          variant="destructive"
                          onClick={handleDeleteUser}
                          disabled={updating}
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Yes, Delete Account
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowDeleteConfirm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;