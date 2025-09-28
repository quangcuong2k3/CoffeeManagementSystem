/**
 * User Management Page - Modern implementation with enhanced UX
 */

"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, 
  Users, 
  UserCheck, 
  Crown,
  Eye,
  Edit3,
  Calendar,
  Phone,
  Mail,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  MoreVertical,
  Star,
  MapPin,
  Activity,
  Zap,
  RefreshCw,
  Download
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

import { useUsers } from '../../../../infra/api/hooks/userHook';
import { User, UserFilters, UserStatus, AccountType } from '../../../../entities/user';
import { formatPrice } from '../../../../shared/lib/currency';
import UserDetailModal from '../components/UserDetailModal';
import UserCreateModal from '../components/UserCreateModal';

const UserManagementPage: React.FC = () => {
  // State management with optimizations
  const [filters, setFilters] = useState<UserFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<UserStatus | 'all'>('all');
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);

  const { 
    users, 
    loading, 
    error, 
    stats,
    fetchUsers,
    refreshUsers,
    updateUserStatus,
    updateUserAccount,
    deleteUser,
    awardPoints,
    clearError 
  } = useUsers(filters, itemsPerPage);

  // Debug logging
//   console.log('Hook returned:', { 
//     users, 
//     usersCount: users?.length, 
//     loading, 
//     error, 
//     stats,
//     filters,
//     itemsPerPage 
//   });

  // Memoized utility functions for performance
  const getStatusIcon = useCallback((status: UserStatus) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <Clock className="w-4 h-4" />;
      case 'suspended': return <XCircle className="w-4 h-4" />;
      case 'pending_verification': return <AlertTriangle className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  }, []);

  const getStatusColor = useCallback((status: UserStatus) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100';
      case 'inactive': return 'bg-slate-50 text-slate-600 border-slate-200 shadow-slate-100';
      case 'suspended': return 'bg-red-50 text-red-700 border-red-200 shadow-red-100';
      case 'pending_verification': return 'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-200 shadow-slate-100';
    }
  }, []);

  const getAccountTypeColor = useCallback((accountType: AccountType) => {
    switch (accountType) {
      case 'premium': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200';
      case 'vip': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-orange-200';
      default: return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-200';
    }
  }, []);

  const formatJoinDate = useCallback((date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
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

  const getUserInitials = useCallback((user: User) => {
    if (user.displayName) {
      const names = user.displayName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.displayName.substring(0, 2).toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  }, []);

  const getAvatarGradient = useCallback((userId: string) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-green-400 to-green-600',
      'from-yellow-400 to-orange-600',
      'from-indigo-400 to-indigo-600',
      'from-red-400 to-red-600',
      'from-teal-400 to-teal-600'
    ];
    const index = userId.charCodeAt(0) % colors.length;
    return colors[index];
  }, []);

  // Memoized filtered and sorted users for performance
  const processedUsers = useMemo(() => {
    //console.log('Processing users:', { users, usersLength: users?.length, loading, error });
    if (!users || users.length === 0) return [];
    return users.map(user => ({
      ...user,
      initials: getUserInitials(user),
      avatarGradient: getAvatarGradient(user.id)
    }));
  }, [users, getUserInitials, getAvatarGradient]);

  // Event handlers with useCallback for optimization
  const handleViewUser = useCallback((user: User) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  }, []);

  const handleStatusChange = useCallback(async (userId: string, newStatus: UserStatus) => {
    try {
      await updateUserStatus(userId, newStatus);
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  }, [updateUserStatus]);

  const handleAccountTypeChange = useCallback(async (userId: string, newType: AccountType) => {
    try {
      await updateUserAccount(userId, newType);
    } catch (error) {
      console.error('Failed to update account type:', error);
    }
  }, [updateUserAccount]);

  const handleRefresh = useCallback(() => {
    refreshUsers();
  }, [refreshUsers]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Debounced filter application
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const appliedFilters: UserFilters = {
        ...(searchTerm && { search: searchTerm }),
        ...(selectedStatus !== 'all' && { status: [selectedStatus] }),
        ...(selectedAccountType !== 'all' && { accountType: [selectedAccountType] })
      };
      
      setFilters(appliedFilters);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedStatus, selectedAccountType]);

  // Fetch users when filters change
  useEffect(() => {
    fetchUsers(filters, 1);
    setCurrentPage(1);
  }, [filters, fetchUsers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Enhanced Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  User Management
                </h1>
                <p className="text-slate-600 mt-1">Manage your customers and their experiences</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="flex items-center gap-2 hover:bg-slate-50 border-slate-200"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center gap-2 hover:bg-slate-50 border-slate-200"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            
            <Button
              onClick={() => setShowCreateUser(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalUsers.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2 text-blue-100 text-xs">
                    <TrendingUp className="w-3 h-3" />
                    <span>+12% from last month</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-blue-400/30 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Users className="w-7 h-7" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Active Users</p>
                  <p className="text-3xl font-bold mt-1">{stats.activeUsers.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2 text-emerald-100 text-xs">
                    <Activity className="w-3 h-3" />
                    <span>85% active rate</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-emerald-400/30 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <UserCheck className="w-7 h-7" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Premium Users</p>
                  <p className="text-3xl font-bold mt-1">{stats.premiumUsers.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2 text-purple-100 text-xs">
                    <Crown className="w-3 h-3" />
                    <span>VIP customers</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-purple-400/30 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Crown className="w-7 h-7" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">New This Month</p>
                  <p className="text-3xl font-bold mt-1">{stats.newUsersThisMonth.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2 text-orange-100 text-xs">
                    <Zap className="w-3 h-3" />
                    <span>Growing fast</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-orange-400/30 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Star className="w-7 h-7" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Enhanced Search and Filters */}
        <Card className="p-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search users by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-12 pr-4 py-4 text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-white shadow-sm"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <Select value={selectedStatus} onValueChange={(value: UserStatus | 'all') => setSelectedStatus(value)}>
                  <SelectTrigger className="w-40 rounded-lg border-slate-200 bg-white shadow-sm">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending_verification">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedAccountType} onValueChange={(value: AccountType | 'all') => setSelectedAccountType(value)}>
                  <SelectTrigger className="w-40 rounded-lg border-slate-200 bg-white shadow-sm">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 rounded-lg border-slate-200 hover:bg-slate-50"
                >
                  <Filter className="w-4 h-4" />
                  More Filters
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="flex items-center gap-2 rounded-md"
                  >
                    <List className="w-4 h-4" />
                    List
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="flex items-center gap-2 rounded-md"
                  >
                    <Grid className="w-4 h-4" />
                    Grid
                  </Button>
                </div>
                <span className="text-sm text-slate-600">
                  {processedUsers.length} {processedUsers.length === 1 ? 'user' : 'users'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Enhanced Content Area */}
        {error && (
          <Card className="p-8 bg-red-50/80 border-red-100 backdrop-blur-sm shadow-lg">
            <div className="flex items-center justify-center text-center">
              <div>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Users</h3>
                <p className="text-red-600 mb-6 max-w-md">{error}</p>
                <Button 
                  onClick={() => {
                    clearError();
                    fetchUsers(filters, currentPage);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </Card>
        )}

        {loading && (!users || users.length === 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <Card key={index} className="p-6 animate-pulse border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-slate-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded mb-2" />
                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-slate-200 rounded" />
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                  <div className="h-8 bg-slate-200 rounded" />
                </div>
              </Card>
            ))}
          </div>
        ) : !loading && processedUsers.length === 0 ? (
          <Card className="p-12 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-3">No Users Found</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                {searchTerm || selectedStatus !== 'all' || selectedAccountType !== 'all'
                  ? "No users match your current filters. Try adjusting your search criteria."
                  : "You haven't added any users yet. Create your first user to get started."
                }
              </p>
              <div className="flex justify-center gap-4">
                {(searchTerm || selectedStatus !== 'all' || selectedAccountType !== 'all') && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedStatus('all');
                      setSelectedAccountType('all');
                    }}
                    className="border-slate-200 hover:bg-slate-50"
                  >
                    Clear Filters
                  </Button>
                )}
                <Button 
                  onClick={() => setShowCreateUser(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add First User
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* Enhanced Users Display */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {processedUsers.map((user: any) => (
                  <Card key={user.id} className="group p-6 hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:-translate-y-1">
                    {/* User Avatar and Basic Info */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className={`w-14 h-14 bg-gradient-to-br ${user.avatarGradient} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {user.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate text-lg group-hover:text-blue-600 transition-colors">
                          {user.displayName || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-slate-600 truncate">{user.email}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                          <MapPin className="w-3 h-3" />
                          <span>Joined {formatJoinDate(user.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status and Account Type */}
                    <div className="flex gap-2 mb-5">
                      <Badge className={`${getStatusColor(user.status)} flex items-center gap-1 shadow-sm`}>
                        {getStatusIcon(user.status)}
                        <span className="capitalize font-medium">{user.status.replace('_', ' ')}</span>
                      </Badge>
                      <Badge className={`${getAccountTypeColor(user.accountType)} shadow-sm font-medium`}>
                        <span className="capitalize">{user.accountType}</span>
                      </Badge>
                    </div>

                    {/* Enhanced User Stats */}
                    <div className="space-y-3 mb-5">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-slate-600 mb-1">
                            <ShoppingBag className="w-4 h-4" />
                            <span>Orders</span>
                          </div>
                          <span className="font-semibold text-slate-900">{user.totalOrders || 0}</span>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-slate-600 mb-1">
                            <DollarSign className="w-4 h-4" />
                            <span>Spent</span>
                          </div>
                          <span className="font-semibold text-slate-900">
                            {formatPrice(user.totalSpent || 0)}
                            {/* Debug info - remove in production */}
                            {process.env.NODE_ENV === 'development' && user.totalSpent === 0 && (
                              <span className="text-xs text-red-500 ml-2">No spending data</span>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-amber-700">
                          <Star className="w-4 h-4" />
                          <span>Loyalty Points</span>
                        </div>
                        <span className="font-bold text-amber-800">{user.loyaltyPoints || 0}</span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        <span>Last active: {getLastActiveText(user.lastActiveDate)}</span>
                      </div>
                    </div>

                    {/* Enhanced Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewUser(user)}
                        className="flex-1 flex items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewUser(user)}
                        className="flex-1 flex items-center justify-center gap-2 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              /* Enhanced List View */
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50/80 border-b border-slate-200">
                      <tr>
                        <th className="text-left py-5 px-6 font-semibold text-slate-700">User</th>
                        <th className="text-left py-5 px-6 font-semibold text-slate-700">Status</th>
                        <th className="text-left py-5 px-6 font-semibold text-slate-700">Account Type</th>
                        <th className="text-left py-5 px-6 font-semibold text-slate-700">Activity</th>
                        <th className="text-left py-5 px-6 font-semibold text-slate-700">Orders</th>
                        <th className="text-left py-5 px-6 font-semibold text-slate-700">Total Spent</th>
                        <th className="text-left py-5 px-6 font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {processedUsers.map((user: any) => (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors duration-150 group">
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 bg-gradient-to-br ${user.avatarGradient} rounded-full flex items-center justify-center text-white font-semibold shadow-md`}>
                                {user.initials}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                  {user.displayName || 'Unknown User'}
                                </div>
                                <div className="text-sm text-slate-600">{user.email}</div>
                                <div className="text-xs text-slate-500 mt-1">
                                  Joined {formatJoinDate(user.createdAt)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <Badge className={`${getStatusColor(user.status)} flex items-center gap-1 w-fit shadow-sm`}>
                              {getStatusIcon(user.status)}
                              <span className="capitalize font-medium">{user.status.replace('_', ' ')}</span>
                            </Badge>
                          </td>
                          <td className="py-5 px-6">
                            <Badge className={`${getAccountTypeColor(user.accountType)} shadow-sm font-medium`}>
                              <span className="capitalize">{user.accountType}</span>
                            </Badge>
                          </td>
                          <td className="py-5 px-6">
                            <div className="text-sm">
                              <div className="font-medium text-slate-900">{getLastActiveText(user.lastActiveDate)}</div>
                              <div className="text-slate-500 flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3" />
                                {user.loyaltyPoints || 0} points
                              </div>
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="w-4 h-4 text-slate-400" />
                              <span className="font-medium text-slate-900">{user.totalOrders || 0}</span>
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-slate-400" />
                              <span className="font-medium text-slate-900">{formatPrice(user.totalSpent || 0)}</span>
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewUser(user)}
                                className="p-2 hover:bg-blue-50 hover:text-blue-600 transition-all"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewUser(user)}
                                className="p-2 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-2 hover:bg-slate-50 hover:text-slate-600 transition-all"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Enhanced Pagination */}
        {stats && stats.totalUsers > itemsPerPage && (
          <Card className="p-6 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Show:</span>
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12</SelectItem>
                      <SelectItem value="24">24</SelectItem>
                      <SelectItem value="48">48</SelectItem>
                      <SelectItem value="96">96</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-600">per page</span>
                </div>
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, stats.totalUsers)} of {stats.totalUsers} users
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                      fetchUsers(filters, currentPage - 1);
                    }
                  }}
                  disabled={currentPage <= 1 || loading}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, Math.ceil(stats.totalUsers / itemsPerPage)) }, (_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    const totalPages = Math.ceil(stats.totalUsers / itemsPerPage);
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setCurrentPage(pageNum);
                          fetchUsers(filters, pageNum);
                        }}
                        className="w-10 h-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const totalPages = Math.ceil(stats.totalUsers / itemsPerPage);
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                      fetchUsers(filters, currentPage + 1);
                    }
                  }}
                  disabled={currentPage >= Math.ceil(stats.totalUsers / itemsPerPage) || loading}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Enhanced Modals */}
        <UserDetailModal
          user={selectedUser}
          isOpen={showUserDetail}
          onClose={() => {
            setShowUserDetail(false);
            setSelectedUser(null);
          }}
          onUpdateStatus={handleStatusChange}
          onUpdateAccountType={handleAccountTypeChange}
          onAwardPoints={awardPoints}
          onDeleteUser={deleteUser}
        />

        <UserCreateModal
          isOpen={showCreateUser}
          onClose={() => setShowCreateUser(false)}
          onUserCreated={() => {
            fetchUsers(filters, currentPage);
            setShowCreateUser(false);
          }}
        />
      </div>
    </div>
  );
};

export default UserManagementPage;