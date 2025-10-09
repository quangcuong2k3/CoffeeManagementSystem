'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { searchService, GlobalSearchResults } from '@/infra/api/service/searchServices';

const RECENT_KEY = 'coffee_recent_searches';
const MAX_RECENTS = 8;

export const useGlobalSearch = () => {
  const [results, setResults] = useState<GlobalSearchResults>({ products: [], orders: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);

  const controllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cacheRef = useRef<Map<string, GlobalSearchResults>>(new Map());

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
      if (Array.isArray(saved)) setRecent(saved.slice(0, MAX_RECENTS));
    } catch {}
  }, []);

  const saveRecent = useCallback((term: string) => {
    const t = term.trim();
    if (!t) return;
    setRecent(prev => {
      const next = [t, ...prev.filter(v => v.toLowerCase() !== t.toLowerCase())].slice(0, MAX_RECENTS);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeRecent = useCallback((term: string) => {
    setRecent(prev => {
      const next = prev.filter(v => v.toLowerCase() !== term.toLowerCase());
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
    localStorage.removeItem(RECENT_KEY);
  }, []);

  const search = useCallback(async (term: string) => {
    const query = term.trim();
    if (!query) {
      setResults({ products: [], orders: [], users: [] });
      setError(null);
      return { products: [], orders: [], users: [] } as GlobalSearchResults;
    }

    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();

    // cache hit
    if (cacheRef.current.has(query)) {
      const cached = cacheRef.current.get(query)!;
      setResults(cached);
      setError(null);
      return cached;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await searchService.searchAll(query);
      cacheRef.current.set(query, res);
      setResults(res);
      saveRecent(query);
      return res;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Search failed';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [saveRecent]);

  const searchDebounced = useCallback((term: string, delay = 300) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    return new Promise<GlobalSearchResults>((resolve) => {
      timeoutRef.current = setTimeout(async () => {
        const res = await search(term);
        resolve(res);
      }, delay);
    });
  }, [search]);

  const clear = useCallback(() => {
    setResults({ products: [], orders: [], users: [] });
    setError(null);
  }, []);

  return { results, loading, error, search, searchDebounced, clear, recent, removeRecent, clearRecent };
};


