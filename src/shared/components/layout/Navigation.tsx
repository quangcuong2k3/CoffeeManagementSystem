'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '../../../infra/api/hooks/authHooks';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Badge } from '../ui';
import { cn } from '../../../core/utils/cn';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Coffee,
  Menu,
  X,
  Bell,
  Search,
  User,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
  Home,
  HelpCircle,
  Zap,
  Keyboard
} from 'lucide-react';
import { useNotifications } from '@/infra/api/hooks/notificationsHooks';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and analytics',
    isActive: true
  },
  {
    name: 'Products',
    href: '/products',
    icon: Package,
    description: 'Product & inventory management',
    badge: '45'
  },
  {
    name: 'Orders',
    href: '/orders',
    icon: ShoppingCart,
    description: 'Order management system',
    badge: '12'
  },
  {
    name: 'Customers',
    href: '/customers',
    icon: Users,
    description: 'Customer management'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Reports and insights'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'System settings'
  }
];

interface NavigationProps {
  children: React.ReactNode;
}

export function Navigation({ children }: NavigationProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const pathname = usePathname();
  const { user, logout } = useAuthContext();
  const router = useRouter();
  const { items: notificationItems, unreadCount } = useNotifications();

  useEffect(() => {
    // Check for saved theme preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  useEffect(() => {
    // Keyboard shortcuts
    const onKey = (e: KeyboardEvent) => {
      // Focus search with '/'
      if (e.key === '/' && (e.target as HTMLElement)?.tagName !== 'INPUT' && (e.target as HTMLElement)?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Open global search page with Cmd/Ctrl+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        router.push('/search');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const submitSearch = () => {
    const q = searchTerm.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
      setSearchTerm('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 border-r border-gray-200 dark:border-gray-700",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-amber-500 to-orange-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Coffee className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Coffee House</h1>
              <p className="text-xs text-amber-100">Management System</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white hover:bg-white/20"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 text-amber-700 dark:text-amber-300 shadow-sm border border-amber-200 dark:border-amber-800"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                  )}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                      isActive 
                        ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" 
                        : "group-hover:bg-gray-100 dark:group-hover:bg-gray-600"
                    )}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  {item.badge && (
                    <Badge 
                      variant={isActive ? "default" : "secondary"}
                      className={cn(
                        "text-xs px-2 py-0.5",
                        isActive && "bg-amber-600 text-white"
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              Quick Actions
            </p>
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-3 h-auto text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <Zap className="w-4 h-4 mr-3 text-emerald-500" />
                <div className="text-left">
                  <p>Add Product</p>
                  <p className="text-xs text-gray-500">Create new item</p>
                </div>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-3 h-auto text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <HelpCircle className="w-4 h-4 mr-3 text-blue-500" />
                <div className="text-left">
                  <p>Help Center</p>
                  <p className="text-xs text-gray-500">Get support</p>
                </div>
              </Button>
            </div>
          </div>
        </nav>

        {/* User profile section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-700 shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.name || 'Admin User'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {user?.email || 'admin@coffeehouse.com'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform duration-200",
                isUserMenuOpen && "rotate-180"
              )} />
            </Button>
          </div>
          
          {isUserMenuOpen && (
            <div className="mt-2 py-2 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600">
              <Button
                variant="ghost"
                onClick={toggleTheme}
                className="w-full justify-start px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                {isDarkMode ? <Sun className="w-4 h-4 mr-3" /> : <Moon className="w-4 h-4 mr-3" />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-72">
        {/* Top navigation */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-6">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Breadcrumbs */}
            <div className="hidden lg:flex items-center gap-2 text-sm">
              <Home className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">/</span>
              <span className="text-gray-600 dark:text-gray-300 capitalize">
                {pathname.split('/').pop() || 'dashboard'}
              </span>
            </div>

            {/* Search bar */}
            <div className="flex-1 max-w-md mx-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef as any}
                  type="text"
                  placeholder="Search products, orders, customers"
                  className="w-full pl-10 pr-16 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(); }}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-[10px] text-gray-400">
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>Ctrl/⌘ + K</span>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3 relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                onClick={() => setNotificationsOpen((v) => !v)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs p-0 animate-pulse"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              {notificationsOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-2 z-40">
                  <div className="px-2 py-1 text-sm font-semibold">Notifications</div>
                  <div className="max-h-80 overflow-y-auto">
                    {notificationItems.length === 0 && (
                      <div className="p-3 text-sm text-gray-500">No notifications</div>
                    )}
                    {notificationItems.map((n) => (
                      <div key={n.id} className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <div className="text-sm font-medium">{n.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{n.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div
                className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => setUserMenuOpen((v) => !v)}
              >
                {user?.name?.[0] || 'A'}
              </div>
              {userMenuOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-2 z-40">
                  <button onClick={toggleTheme} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </button>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}