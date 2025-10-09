'use client';

import { Navigation } from '@/shared/components/layout/Navigation';
import { BarChart3, TrendingUp, DollarSign, Users, Calendar, AlertCircle, Package } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { useAnalytics } from '@/infra/api/hooks/analyticsHooks';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';

export default function AnalyticsPageContent() {
  const { data, loading, error, refresh } = useAnalytics(30);

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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refresh(30)}>Last 30 days</Button>
          <Button className="btn-coffee shadow-lg" onClick={() => window.print()}>
            <Calendar className="w-4 h-4 mr-2" />
            Export / Print
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4 flex items-center gap-3 text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? '—' : `$${(data?.kpis.totalRevenue || 0).toLocaleString()}`}
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '—' : data?.kpis.totalOrders}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Customers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '—' : data?.kpis.totalCustomers}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Products</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '—' : data?.kpis.totalProducts}</p>
              </div>
              <Package className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low/Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '—' : data?.kpis.lowStockItems}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-500 rotate-180" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue & Orders (Last 30 days)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.revenueSeries || []} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={8} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} dot={false} name="Revenue" />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={2} dot={false} name="Orders" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Products by Revenue</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.topProducts || []} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#f59e0b" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
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
              <p className="text-lg font-semibold text-emerald-600">Revenue</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{loading ? '—' : `$${(data?.kpis.totalRevenue || 0).toLocaleString()}`}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-lg font-semibold text-blue-600">Orders</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{loading ? '—' : data?.kpis.totalOrders}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-lg font-semibold text-purple-600">Customers</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{loading ? '—' : data?.kpis.totalCustomers}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}