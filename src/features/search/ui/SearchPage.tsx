'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useGlobalSearch } from '@/infra/api/hooks/searchHooks';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input } from '@/shared/ui';
import { Search as SearchIcon, Clock, XCircle, AlertCircle, Package, ShoppingCart, Users, Keyboard } from 'lucide-react';

export default function SearchPage() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get('q') || '';
  const { results, loading, error, searchDebounced, search, recent, removeRecent, clearRecent } = useGlobalSearch();
  const [term, setTerm] = useState(q);
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'orders' | 'users'>('all');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (q) {
      setTerm(q);
      search(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const counts = useMemo(() => ({
    products: results.products.length,
    orders: results.orders.length,
    users: results.users.length,
  }), [results]);

  const total = counts.products + counts.orders + counts.users;

  const onSubmit = (next?: string) => {
    const value = (next ?? term).trim();
    if (!value) return;
    router.push(`/search?q=${encodeURIComponent(value)}`);
  };

  const onChange = (v: string) => {
    setTerm(v);
    searchDebounced(v, 300);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header / Search bar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                ref={inputRef as any}
                value={term}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search products, orders, users..."
                className="pl-10 h-12 text-base"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSubmit();
                  if (e.key === 'Escape') setTerm('');
                }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-xs text-gray-400">
                <Keyboard className="w-3.5 h-3.5" />
                <span>Enter to search</span>
              </div>
            </div>
            <Button onClick={() => onSubmit()} className="h-12 px-5">Search</Button>
          </div>

          {/* Recent searches */}
          {recent.length > 0 && !term && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Recent:</span>
              {recent.map((r) => (
                <button
                  key={r}
                  onClick={() => onSubmit(r)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                >
                  {r}
                </button>
              ))}
              <button
                onClick={clearRecent}
                className="ml-2 text-xs text-amber-600 hover:underline"
              >
                clear
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {[
          { key: 'all', label: 'All', count: total },
          { key: 'products', label: 'Products', count: counts.products, icon: Package },
          { key: 'orders', label: 'Orders', count: counts.orders, icon: ShoppingCart },
          { key: 'users', label: 'Users', count: counts.users, icon: Users },
        ].map(({ key, label, count, icon: Icon }: any) => (
          <button
            key={key}
            className={`px-4 py-2 rounded-xl border text-sm transition-colors ${
              activeTab === key
                ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab(key)}
          >
            <span className="inline-flex items-center gap-2">
              {Icon && <Icon className="w-4 h-4" />}
              {label}
              <Badge variant="secondary">{count}</Badge>
            </span>
          </button>
        ))}
      </div>

      {/* States */}
      {loading && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4 flex items-center gap-3 text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {!loading && !error && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {(activeTab === 'all' || activeTab === 'products') && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Products <Badge variant="secondary">{counts.products}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {results.products.length === 0 && <div className="text-sm text-gray-500">No products found</div>}
                {results.products.slice(0, 10).map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="font-medium truncate" dangerouslySetInnerHTML={{ __html: p.__highlight?.title || p.name }} />
                      <div className="text-xs text-gray-500 truncate" dangerouslySetInnerHTML={{ __html: p.__highlight?.meta || '' }} />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/products?focus=${p.id}`)}>View</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {(activeTab === 'all' || activeTab === 'orders') && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Orders <Badge variant="secondary">{counts.orders}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {results.orders.length === 0 && <div className="text-sm text-gray-500">No orders found</div>}
                {results.orders.slice(0, 10).map((o: any) => (
                  <div key={o.id} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="font-medium truncate" dangerouslySetInnerHTML={{ __html: o.__highlight?.title || `Order #${o.orderNumber || o.id}` }} />
                      <div className="text-xs text-gray-500 truncate" dangerouslySetInnerHTML={{ __html: o.__highlight?.meta || '' }} />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/orders?focus=${o.id}`)}>View</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {(activeTab === 'all' || activeTab === 'users') && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Users <Badge variant="secondary">{counts.users}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {results.users.length === 0 && <div className="text-sm text-gray-500">No users found</div>}
                {results.users.slice(0, 10).map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="font-medium truncate" dangerouslySetInnerHTML={{ __html: u.__highlight?.title || (u.displayName || u.name || u.email) }} />
                      <div className="text-xs text-gray-500 truncate" dangerouslySetInnerHTML={{ __html: u.__highlight?.meta || u.email || '' }} />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/customers?focus=${u.id}`)}>View</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}