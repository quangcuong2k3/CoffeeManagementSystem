'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  LineChart,
  BarChart3,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem
} from 'chart.js';
import { Line, Bar, getElementAtEvent, getDatasetAtEvent } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Button } from '../../../../shared/ui/button';
import { Badge } from '../../../../shared/ui/badge';
import { cn } from '../../../../core/utils/cn';
import { useSalesChartData } from '../../../../infra/api/hooks/dashboardHooks';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type ChartType = 'line' | 'bar';

const SalesChart: React.FC = () => {
  const [days, setDays] = useState(7);
  const [chartType, setChartType] = useState<ChartType>('line');
  const { chartData, loading, error, refetch } = useSalesChartData(days);
  const chartRef = useRef<any>(null);

  // Debug log to check data
  useEffect(() => {
    if (chartData) {
      console.log('Chart data received:', chartData);
      console.log('Total revenue:', chartData.reduce((sum, item) => sum + item.revenue, 0));
    }
  }, [chartData]);

  // Calculate derived metrics
  const maxValue = Math.max(...(chartData?.map((d) => d.revenue) || [1]));
  const totalRevenue = chartData?.reduce((sum: number, item) => sum + item.revenue, 0) || 0;
  const totalOrders = chartData?.reduce((sum: number, item) => sum + item.orders, 0) || 0;
  
  // Calculate average growth
  const averageGrowth = useMemo(() => {
    if (!chartData || chartData.length < 2) return 0;
    
    let totalChange = 0;
    for (let i = 1; i < chartData.length; i++) {
      const prevRevenue = chartData[i - 1].revenue;
      const currentRevenue = chartData[i].revenue;
      const change = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
      totalChange += change;
    }
    return totalChange / (chartData.length - 1);
  }, [chartData]);

  // Prepare Chart.js data
  const chartJsData = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;

    const labels = chartData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const revenueData = chartData.map(item => item.revenue);
    const ordersData = chartData.map(item => item.orders);

    return {
      labels,
      datasets: [
        {
          label: 'Revenue ($)',
          data: revenueData,
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: chartType === 'bar' ? 'rgba(245, 158, 11, 0.8)' : 'rgba(245, 158, 11, 0.1)',
          borderWidth: 2,
          fill: chartType === 'line',
          tension: 0.4,
          pointBackgroundColor: 'rgb(245, 158, 11)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          yAxisID: 'y'
        },
        {
          label: 'Orders',
          data: ordersData,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: chartType === 'bar' ? 'rgba(16, 185, 129, 0.8)' : 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: chartType === 'line',
          tension: 0.4,
          pointBackgroundColor: 'rgb(16, 185, 129)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          yAxisID: 'y1'
        }
      ]
    };
  }, [chartData, chartType]);

  // Chart.js options
  const chartOptions: ChartOptions<'line' | 'bar'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: false,
      },
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(245, 158, 11, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: TooltipItem<'line' | 'bar'>) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (label.includes('Revenue')) {
              return `${label}: $${value.toFixed(2)}`;
            } else {
              return `${label}: ${value}`;
            }
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Revenue ($)',
          color: 'rgb(245, 158, 11)',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11
          },
          callback: function(value: any) {
            return '$' + value.toFixed(0);
          }
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Orders',
          color: 'rgb(16, 185, 129)',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          font: {
            size: 11
          },
          callback: function(value: any) {
            return Math.floor(value);
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  }), []);

  const periods = [
    { days: 7, label: '7 Days' },
    { days: 30, label: '30 Days' },
    { days: 90, label: '90 Days' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Export chart functionality
  const exportChart = () => {
    if (chartRef.current) {
      const chart = chartRef.current;
      const canvas = chart.canvas;
      const link = document.createElement('a');
      link.download = `sales-chart-${days}days-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  // Export data as CSV
  const exportData = () => {
    if (!chartData || chartData.length === 0) return;

    const csvContent = [
      ['Date', 'Revenue', 'Orders'],
      ...chartData.map(item => [
        item.date,
        item.revenue.toFixed(2),
        item.orders.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sales-data-${days}days-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <Card className="shadow-sm border-0 bg-white dark:bg-gray-800">
      <CardHeader className="pb-4">
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
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Period Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {periods.map((period) => (
                <Button
                  key={period.days}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-xs px-3 py-1 h-auto transition-all duration-200",
                    days === period.days
                      ? "bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                  )}
                  onClick={() => {
                    console.log(`Switching to ${period.days} days`);
                    setDays(period.days);
                  }}
                  disabled={loading}
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
                title="Line Chart"
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
                title="Bar Chart"
              >
                <BarChart3 className="w-3 h-3" />
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                console.log('Refreshing chart data...');
                refetch();
              }}
              disabled={loading}
              className="flex items-center gap-1"
              title="Refresh Data"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
            
            {/* Export Options */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={exportChart}
                disabled={loading || !chartJsData}
                className="text-xs px-2 py-1 h-auto"
                title="Export Chart as PNG"
              >
                <Download className="w-3 h-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={exportData}
                disabled={loading || !chartData}
                className="text-xs px-2 py-1 h-auto"
                title="Export Data as CSV"
              >
                <Calendar className="w-3 h-3" />
              </Button>
            </div>
            
            <Button variant="ghost" size="sm" title="More Options">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Total Revenue</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Total Orders</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {totalOrders}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Average Growth</p>
            <div className="flex items-center gap-1">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {averageGrowth.toFixed(1)}%
              </p>
              <Badge 
                variant={averageGrowth >= 0 ? "default" : "destructive"}
                className="text-xs"
              >
                {averageGrowth >= 0 ? '+' : ''}{averageGrowth.toFixed(1)}%
              </Badge>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Period</p>
            <p className="text-sm text-gray-900 dark:text-white">
              Last {days} days
              {chartData && chartData.length > 0 && (
                <span className="text-xs text-gray-500 block">
                  {chartData.length} data points
                </span>
              )}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {loading ? (
          <div className="h-80 w-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">Loading chart data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="h-80 w-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-red-600 mb-2">Failed to load chart data</p>
              <p className="text-xs text-gray-500">{error}</p>
            </div>
          </div>
        ) : !chartJsData ? (
          <div className="h-80 w-full flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No sales data available</p>
            </div>
          </div>
        ) : (
          <div className="h-80 w-full relative">
            {chartType === 'line' ? (
              <Line
                ref={chartRef}
                data={chartJsData}
                options={chartOptions}
                key={`line-${days}`}
              />
            ) : (
              <Bar
                ref={chartRef}
                data={chartJsData}
                options={chartOptions}
                key={`bar-${days}`}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesChart;