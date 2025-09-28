'use client';

import { Navigation } from '@/shared/components';
import { BarChart3, TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';
import { Card, CardContent } from '../../shared/ui/card';
import { Button } from '../../shared/ui/button';

function AnalyticsPageContent() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 gradient-text">
            Analytics & Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Insights and performance metrics for your coffee business
          </p>
        </div>
        <Button className="btn-coffee shadow-lg">
          <Calendar className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">$45,230</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +12.5% from last month
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">1,247</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +8.3% from last month
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">892</p>
                <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 rotate-180" />
                  -2.1% from last month
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Order Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">$36.25</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +4.2% from last month
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Trend</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Chart visualization coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Products</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Chart visualization coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-lg font-semibold text-emerald-600">Revenue Growth</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Strong performance this quarter</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-lg font-semibold text-blue-600">Order Volume</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Consistent increase in orders</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-lg font-semibold text-purple-600">Customer Base</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Growing loyal customer base</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Navigation>
      <AnalyticsPageContent />
    </Navigation>
  );
}