'use client';

import React from 'react';
import {
  AlertTriangle,
  Clock,
  Package,
  ShoppingCart,
  ChevronRight,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Badge } from '../../../../shared/ui/badge';
import { Button } from '../../../../shared/ui/button';
import { cn } from '../../../../core/utils/cn';

interface AlertsCardProps {
  lowStockItems: number;
  pendingOrders: number;
}

interface Alert {
  id: string;
  type: 'warning' | 'info';
  title: string;
  description: string;
  count: number;
  icon: React.ElementType;
  action: string;
  href: string;
}

const AlertsCard: React.FC<AlertsCardProps> = ({ lowStockItems, pendingOrders }) => {
  const alerts: Alert[] = [
    {
      id: 'low-stock',
      type: 'warning',
      title: 'Low stock items',
      description: 'Products need restocking',
      count: lowStockItems,
      icon: Package,
      action: 'Manage Inventory',
      href: '/products'
    },
    {
      id: 'pending-orders',
      type: 'info',
      title: 'Pending orders',
      description: 'Orders waiting for processing',
      count: pendingOrders,
      icon: ShoppingCart,
      action: 'View Orders',
      href: '/orders'
    }
  ];

  const getAlertStyles = (type: 'warning' | 'info') => {
    return type === 'warning'
      ? {
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          textColor: 'text-amber-600 dark:text-amber-400',
          borderColor: 'border-l-amber-500'
        }
      : {
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          textColor: 'text-blue-600 dark:text-blue-400',
          borderColor: 'border-l-blue-500'
        };
  };

  const totalAlerts = alerts.reduce((sum, alert) => sum + alert.count, 0);

  return (
    <Card className="shadow-sm border-0 bg-white dark:bg-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            Alerts & Notifications
          </CardTitle>
          <Badge 
            variant={totalAlerts > 0 ? "destructive" : "secondary"}
            className="text-xs"
          >
            {totalAlerts}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Items requiring your attention
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const IconComponent = alert.icon;
          const styles = getAlertStyles(alert.type);
          
          return (
            <div
              key={alert.id}
              className={cn(
                "border-l-4 pl-4 py-3 rounded-r-lg transition-all duration-200 hover:shadow-sm cursor-pointer",
                styles.bgColor,
                styles.borderColor
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    styles.bgColor
                  )}>
                    <IconComponent className={cn("w-4 h-4", styles.textColor)} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {alert.title}
                      </h4>
                      <Badge 
                        variant={alert.type === 'warning' ? "destructive" : "secondary"}
                        className="text-xs px-2 py-0"
                      >
                        {alert.count}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {alert.description}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("text-xs hover:bg-white/50 dark:hover:bg-gray-700/50", styles.textColor)}
                >
                  {alert.action}
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          );
        })}
        
        {totalAlerts === 0 && (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No alerts at the moment
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Everything looks good!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsCard;