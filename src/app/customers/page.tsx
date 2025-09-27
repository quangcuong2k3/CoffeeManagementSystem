'use client';

import { Navigation } from '../../shared/components/layout/NavigationEnhanced';
import { Users, UserPlus, Star, TrendingUp, Coffee } from 'lucide-react';
import { Card, CardContent } from '../../shared/ui/card';
import { Badge } from '../../shared/ui/badge';
import { Button } from '../../shared/ui/button';

function CustomersPageContent() {
  const mockCustomers = [
    { id: 'CUST-001', name: 'John Doe', email: 'john@example.com', orders: 24, spent: 450.50, joined: '2 months ago', status: 'vip' },
    { id: 'CUST-002', name: 'Sarah Wilson', email: 'sarah@example.com', orders: 18, spent: 320.25, joined: '1 month ago', status: 'regular' },
    { id: 'CUST-003', name: 'Mike Johnson', email: 'mike@example.com', orders: 6, spent: 89.75, joined: '2 weeks ago', status: 'new' }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      vip: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      regular: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      new: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
    };
    return <Badge className={`text-xs ${variants[status as keyof typeof variants]}`}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 gradient-text">
            Customer Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your valued customers and their preferences
          </p>
        </div>
        <Button className="btn-coffee shadow-lg">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">892</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">VIP Customers</p>
                <p className="text-2xl font-bold text-purple-600">156</p>
              </div>
              <Star className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New This Month</p>
                <p className="text-2xl font-bold text-emerald-600">47</p>
              </div>
              <UserPlus className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Orders</p>
                <p className="text-2xl font-bold text-amber-600">12.4</p>
              </div>
              <Coffee className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Customers</h3>
          <div className="space-y-4">
            {mockCustomers.map((customer, index) => (
              <div 
                key={customer.id} 
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {customer.name[0]}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{customer.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{customer.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">${customer.spent}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{customer.orders} orders</p>
                  </div>
                  {getStatusBadge(customer.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Navigation>
      <CustomersPageContent />
    </Navigation>
  );
}