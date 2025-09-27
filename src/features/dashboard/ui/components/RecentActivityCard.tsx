'use client';

import React from 'react';
import {
  Activity,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Button } from '../../../../shared/ui/button';
import { Badge } from '../../../../shared/ui/badge';
import { cn } from '../../../../core/utils/cn';

interface ActivityItem {
  id: string;
  type: 'order' | 'customer' | 'product' | 'payment';
  title: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'pending' | 'warning';
  amount?: number;
  user?: string;
}

const RecentActivityCard: React.FC = () => {
  // Mock data - replace with real data from your API
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'order',
      title: 'New Order Received',
      description: 'Order #ORD-2024-001 placed by John Doe',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: 'success',
      amount: 45.50,
      user: 'John Doe'
    },
    {
      id: '2',
      type: 'product',
      title: 'Low Stock Alert',
      description: 'Colombian Supremo beans running low (8 units left)',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      status: 'warning'
    },
    {
      id: '3',
      type: 'payment',
      title: 'Payment Received',
      description: 'Payment for Order #ORD-2024-002 processed',
      timestamp: new Date(Date.now() - 32 * 60 * 1000),
      status: 'success',
      amount: 78.25
    },
    {
      id: '4',
      type: 'customer',
      title: 'New Customer Registration',
      description: 'Sarah Wilson joined the Coffee House community',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      status: 'success',
      user: 'Sarah Wilson'
    },
    {
      id: '5',
      type: 'order',
      title: 'Order Processing',
      description: 'Order #ORD-2024-003 is being prepared',
      timestamp: new Date(Date.now() - 67 * 60 * 1000),
      status: 'pending',
      amount: 32.75
    }
  ];

  const getActivityIcon = (type: ActivityItem['type']) => {
    const iconMap = {
      order: ShoppingCart,
      customer: Users,
      product: Package,
      payment: DollarSign
    };
    return iconMap[type];
  };

  const getActivityColor = (type: ActivityItem['type'], status: ActivityItem['status']) => {
    if (status === 'warning') {
      return {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800'
      };
    }
    
    if (status === 'pending') {
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800'
      };
    }

    const colorMap = {
      order: {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800'
      },
      customer: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800'
      },
      product: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800'
      },
      payment: {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800'
      }
    };
    
    return colorMap[type];
  };

  const getStatusIcon = (status: ActivityItem['status']) => {
    switch (status) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertCircle;
      case 'pending':
        return Clock;
      default:
        return CheckCircle;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card className="shadow-sm border-0 bg-white dark:bg-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            Recent Activity
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Live
            </Badge>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Latest updates from your coffee shop
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const IconComponent = getActivityIcon(activity.type);
            const StatusIcon = getStatusIcon(activity.status);
            const colors = getActivityColor(activity.type, activity.status);
            
            return (
              <div key={activity.id} className="flex items-start gap-4 group">
                {/* Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-200 group-hover:scale-105",
                  colors.bg,
                  colors.border
                )}>
                  <IconComponent className={cn("w-5 h-5", colors.text)} />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {activity.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {activity.description}
                      </p>
                      
                      {/* Additional info */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <StatusIcon className={cn("w-3 h-3", colors.text)} />
                          <span className="text-xs text-gray-500 dark:text-gray-500 capitalize">
                            {activity.status}
                          </span>
                        </div>
                        
                        {activity.amount && (
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(activity.amount)}
                          </span>
                        )}
                        
                        {activity.user && (
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            by {activity.user}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Timeline connector */}
                {index < activities.length - 1 && (
                  <div className="absolute left-5 top-12 w-0.5 h-6 bg-gray-200 dark:bg-gray-700" />
                )}
              </div>
            );
          })}
        </div>
        
        {/* View All Button */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button variant="outline" className="w-full">
            View All Activity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivityCard;