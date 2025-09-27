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
  LineChart
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
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 45230.50,
    revenueChange: 12.5,
    totalOrders: 1247,
    ordersChange: 8.3,
    activeCustomers: 892,
    customersChange: -2.1,
    totalProducts: 45,
    productsChange: 5.2,
    lowStockItems: 3,
    pendingOrders: 12
  });

  const [currentTime, setCurrentTime] = useState(new Date());

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
          
          <Button className="btn-coffee shadow-lg">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
            <Badge variant="destructive" className="ml-2 animate-pulse">3</Badge>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            change={stats.revenueChange}
            icon={DollarSign}
            trend="up"
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
            trend="up"
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
            trend="down"
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
            trend="up"
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
          <div className="animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <AlertsCard lowStockItems={stats.lowStockItems} pendingOrders={stats.pendingOrders} />
          </div>
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
    </div>
  );
};

export default DashboardContent;