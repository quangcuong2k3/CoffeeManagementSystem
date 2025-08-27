import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string, format: 'short' | 'long' | 'time' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'time':
      return dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    default:
      return dateObj.toLocaleDateString('en-US');
  }
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncateText(text: string, length: number = 100): string {
  if (text.length <= length) return text;
  return text.substr(0, length) + '...';
}

export function generateRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function getStatusColor(status: string): { bg: string; text: string; border: string } {
  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    pending: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
    paid: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
    confirmed: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
    preparing: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
    ready: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
    shipped: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
    delivered: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' },
    failed: { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-200' },
  };
  
  return statusColors[status] || statusColors.pending;
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 5);
  return `ORDER-${timestamp}-${randomStr}`.toUpperCase();
}

export function parseSearchParams(searchParams: URLSearchParams) {
  const params: Record<string, any> = {};
  
  for (const [key, value] of searchParams.entries()) {
    // Try to parse as number
    if (!isNaN(Number(value)) && value !== '') {
      params[key] = Number(value);
    }
    // Try to parse as boolean
    else if (value === 'true' || value === 'false') {
      params[key] = value === 'true';
    }
    // Keep as string
    else {
      params[key] = value;
    }
  }
  
  return params;
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
