'use client';

import React, { useState, useEffect } from 'react';
import { 
  Coffee, 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Package, 
  AlertTriangle,
  DollarSign,
  Activity,
  ChevronRight,
  Calendar,
  Clock,
  Bell,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Button } from '../../../../shared/ui/button';
import { Badge } from '../../../../shared/ui/badge';
import StatsCard from './StatsCard';
import QuickActionsCard from './QuickActionsCard';
import AlertsCard from './AlertsCard';
import RecentActivityCard from './RecentActivityCard';
import SalesChart from './SalesChart';
import TopProductsCard from './TopProductsCard';
import { useDashboardStats, useDashboardAlerts } from '../../../../infra/api/hooks/dashboardHooks';

interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  activeCustomers: number;
  customersChange: number;
  totalProducts: number;
  productsChange: number;
  lowStockItems: number;
  pendingOrders: number;
}

const DashboardContent: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Fetch real dashboard data
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { alerts, loading: alertsLoading } = useDashboardAlerts();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 animate-slide-in">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 gradient-text">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              {formatDate(currentTime)}
            </div>
            <div className="flex items-center gap-2 text-lg font-mono font-semibold text-gray-900 dark:text-white">
              <Clock className="w-4 h-4" />
              {formatTime(currentTime)}
            </div>
          </div>
          
          <Button 
            onClick={refetchStats}
            variant="outline"
            className="flex items-center gap-2"
            disabled={statsLoading}
          >
            <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button className="btn-coffee shadow-lg">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
            {alerts && alerts.length > 0 && (
              <Badge variant="destructive" className="ml-2 animate-pulse">{alerts.length}</Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {statsLoading && !stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : statsError ? (
        <Card className="p-8 bg-red-50 border-red-200">
          <div className="flex items-center justify-center text-center">
            <div>
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
              <p className="text-red-600 mb-4">{statsError}</p>
              <Button onClick={refetchStats} className="bg-red-600 hover:bg-red-700 text-white">
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      ) : stats ? (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <StatsCard
                title="Total Revenue"
                value={formatCurrency(stats.totalRevenue)}
                change={stats.revenueChange}
                icon={DollarSign}
                trend={stats.revenueChange >= 0 ? 'up' : 'down'}
                description="from last month"
                color="emerald"
              />
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <StatsCard
                title="Total Orders"
                value={stats.totalOrders.toLocaleString()}
                change={stats.ordersChange}
                icon={ShoppingCart}
                trend={stats.ordersChange >= 0 ? 'up' : 'down'}
                description="from last month"
                color="blue"
              />
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <StatsCard
                title="Active Customers"
                value={stats.activeCustomers.toLocaleString()}
                change={stats.customersChange}
                icon={Users}
                trend={stats.customersChange >= 0 ? 'up' : 'down'}
                description="from last month"
                color="purple"
              />
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <StatsCard
                title="Products"
                value={stats.totalProducts.toString()}
                change={stats.productsChange}
                icon={Package}
                trend={stats.productsChange >= 0 ? 'up' : 'down'}
                description="total products"
                color="amber"
              />
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Sales Chart - Takes up 2 columns */}
            <div className="xl:col-span-2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <SalesChart />
            </div>
            
            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <QuickActionsCard />
              </div>
              {/* <div className="animate-fade-in" style={{ animationDelay: '0.7s' }}>
                <AlertsCard lowStockItems={stats.lowStockItems} pendingOrders={stats.pendingOrders} />
              </div> */}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <RecentActivityCard />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.9s' }}>
              <TopProductsCard />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default DashboardContent;