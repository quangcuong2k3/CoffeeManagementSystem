'use client';

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  BarChart3,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Button } from '../../../../shared/ui/button';
import { Badge } from '../../../../shared/ui/badge';
import { cn } from '../../../../core/utils/cn';

interface ChartData {
  label: string;
  value: number;
  change: number;
}

type ChartPeriod = '7d' | '30d' | '90d' | '1y';
type ChartType = 'line' | 'bar';

const SalesChart: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('30d');
  const [chartType, setChartType] = useState<ChartType>('line');

  // Mock data - replace with real data from your API
  const mockData: Record<ChartPeriod, ChartData[]> = {
    '7d': [
      { label: 'Mon', value: 2400, change: 12 },
      { label: 'Tue', value: 3200, change: 18 },
      { label: 'Wed', value: 2800, change: -5 },
      { label: 'Thu', value: 4100, change: 25 },
      { label: 'Fri', value: 3800, change: 8 },
      { label: 'Sat', value: 4500, change: 15 },
      { label: 'Sun', value: 3900, change: 10 }
    ],
    '30d': [
      { label: 'Week 1', value: 18500, change: 12 },
      { label: 'Week 2', value: 22300, change: 18 },
      { label: 'Week 3', value: 19800, change: -8 },
      { label: 'Week 4', value: 26100, change: 22 }
    ],
    '90d': [
      { label: 'Month 1', value: 65000, change: 15 },
      { label: 'Month 2', value: 78000, change: 20 },
      { label: 'Month 3', value: 84000, change: 8 }
    ],
    '1y': [
      { label: 'Q1', value: 187000, change: 12 },
      { label: 'Q2', value: 223000, change: 19 },
      { label: 'Q3', value: 198000, change: -11 },
      { label: 'Q4', value: 267000, change: 35 }
    ]
  };

  const currentData = mockData[selectedPeriod];
  const maxValue = Math.max(...currentData.map(d => d.value));
  
  const totalRevenue = currentData.reduce((sum, item) => sum + item.value, 0);
  const averageChange = currentData.reduce((sum, item) => sum + item.change, 0) / currentData.length;

  const periods = [
    { key: '7d' as ChartPeriod, label: '7 Days' },
    { key: '30d' as ChartPeriod, label: '30 Days' },
    { key: '90d' as ChartPeriod, label: '90 Days' },
    { key: '1y' as ChartPeriod, label: '1 Year' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  return (
    <Card className="shadow-sm border-0 bg-white dark:bg-gray-800">
      <CardHeader className="pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Sales Overview
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Revenue trends and performance metrics
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Period Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {periods.map((period) => (
                <Button
                  key={period.key}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-xs px-3 py-1 h-auto",
                    selectedPeriod === period.key
                      ? "bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                  onClick={() => setSelectedPeriod(period.key)}
                >
                  {period.label}
                </Button>
              ))}
            </div>
            
            {/* Chart Type Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-xs px-2 py-1 h-auto",
                  chartType === 'line'
                    ? "bg-white dark:bg-gray-600 shadow-sm"
                    : "text-gray-600 dark:text-gray-400"
                )}
                onClick={() => setChartType('line')}
              >
                <LineChart className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-xs px-2 py-1 h-auto",
                  chartType === 'bar'
                    ? "bg-white dark:bg-gray-600 shadow-sm"
                    : "text-gray-600 dark:text-gray-400"
                )}
                onClick={() => setChartType('bar')}
              >
                <BarChart3 className="w-3 h-3" />
              </Button>
            </div>
            
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="flex flex-wrap gap-6 mt-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Average Growth</p>
            <div className="flex items-center gap-1">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {averageChange.toFixed(1)}%
              </p>
              <Badge 
                variant={averageChange >= 0 ? "default" : "destructive"}
                className="text-xs"
              >
                {averageChange >= 0 ? '+' : ''}{averageChange.toFixed(1)}%
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Chart Container */}
        <div className="h-64 w-full relative">
          <div className="absolute inset-0 flex items-end justify-between gap-2 px-2">
            {currentData.map((item, index) => {
              const height = (item.value / maxValue) * 100;
              const isPositive = item.change >= 0;
              
              return (
                <div key={item.label} className="flex-1 flex flex-col items-center">
                  {/* Bar/Line representation */}
                  <div className="w-full relative group cursor-pointer">
                    {chartType === 'bar' ? (
                      <div 
                        className="w-full bg-gradient-to-t from-amber-400 to-amber-500 rounded-t-lg transition-all duration-500 hover:from-amber-500 hover:to-amber-600 relative"
                        style={{ height: `${height}%` }}
                      >
                        {/* Hover tooltip */}
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                          {formatCurrency(item.value)}
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-full flex items-end">
                        <div 
                          className="w-2 bg-gradient-to-t from-amber-400 to-amber-500 rounded-full mx-auto"
                          style={{ height: `${height}%` }}
                        />
                        {index < currentData.length - 1 && (
                          <div className="absolute top-1/2 -right-2 w-4 h-0.5 bg-amber-400" />
                        )}
                        {/* Hover tooltip */}
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                          {formatCurrency(item.value)}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Labels */}
                  <div className="mt-3 text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                      {item.label}
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className={cn(
                        "text-xs font-semibold",
                        isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                      )}>
                        {isPositive ? '+' : ''}{item.change}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Export Button */}
        <div className="flex justify-end mt-6">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesChart;