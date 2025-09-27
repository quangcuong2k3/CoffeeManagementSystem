'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Plus,
  ArrowRight,
  Zap,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Button } from '../../../../shared/ui/button';
import { cn } from '../../../../core/utils/cn';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  bgColor: string;
}

const QuickActionsCard: React.FC = () => {
  const router = useRouter();

  const quickActions: QuickAction[] = [
    {
      id: 'inventory',
      title: 'Manage Inventory',
      description: 'Update stock levels and add new products',
      icon: Package,
      href: '/products',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      id: 'orders',
      title: 'View Orders',
      description: 'Check recent orders and process them',
      icon: ShoppingCart,
      href: '/orders',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      id: 'customers',
      title: 'Customer Management',
      description: 'Manage customer data and relationships',
      icon: Users,
      href: '/customers',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      description: 'Check sales reports and insights',
      icon: BarChart3,
      href: '/analytics',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20'
    }
  ];

  const handleActionClick = (href: string) => {
    router.push(href);
  };

  return (
    <Card className="shadow-sm border-0 bg-white dark:bg-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Quick Actions
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Common management tasks
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Button
              key={action.id}
              variant="ghost"
              className="w-full h-auto p-4 justify-start hover:bg-gray-50 dark:hover:bg-gray-700/50 group transition-all duration-200"
              onClick={() => handleActionClick(action.href)}
            >
              <div className="flex items-center gap-4 w-full">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110",
                  action.bgColor
                )}>
                  <IconComponent className={cn("w-5 h-5", action.color)} />
                </div>
                
                <div className="flex-1 text-left">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {action.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
                
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200 group-hover:translate-x-1 transform" />
              </div>
            </Button>
          );
        })}
        
        {/* Quick Add Button */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
          <Button
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium"
            onClick={() => handleActionClick('/products')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;