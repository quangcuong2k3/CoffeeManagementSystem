'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '../../../../shared/ui/card';
import { Badge } from '../../../../shared/ui/badge';
import { cn } from '../../../../core/utils/cn';

interface StatsCardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  trend: 'up' | 'down';
  description: string;
  color: 'emerald' | 'blue' | 'purple' | 'amber' | 'red';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  trend,
  description,
  color
}) => {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
  };

  const trendColors = {
    up: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20',
    down: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
  };

  return (
    <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-lg border-0 bg-white dark:bg-gray-800 shadow-sm card-hover">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {title}
            </p>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {value}
              </h3>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs font-semibold px-2 py-1 flex items-center gap-1",
                  trendColors[trend]
                )}
              >
                {trend === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(change)}%
              </Badge>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {description}
            </p>
          </div>
          
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110",
            colorClasses[color]
          )}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        
        {/* Progress bar indicator */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <div 
              className={cn(
                "h-1 rounded-full transition-all duration-500",
                color === 'emerald' && "bg-emerald-500",
                color === 'blue' && "bg-blue-500",
                color === 'purple' && "bg-purple-500",
                color === 'amber' && "bg-amber-500",
                color === 'red' && "bg-red-500"
              )}
              style={{ 
                width: `${Math.min(Math.abs(change) * 5, 100)}%` 
              }}
            />
          </div>
        </div>
      </CardContent>
      
      {/* Decorative gradient */}
      <div className={cn(
        "absolute inset-0 opacity-5 pointer-events-none transition-opacity duration-300 group-hover:opacity-10",
        color === 'emerald' && "bg-gradient-to-br from-emerald-400 to-emerald-600",
        color === 'blue' && "bg-gradient-to-br from-blue-400 to-blue-600",
        color === 'purple' && "bg-gradient-to-br from-purple-400 to-purple-600",
        color === 'amber' && "bg-gradient-to-br from-amber-400 to-amber-600",
        color === 'red' && "bg-gradient-to-br from-red-400 to-red-600"
      )} />
    </Card>
  );
};

export default StatsCard;