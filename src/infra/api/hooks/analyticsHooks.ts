'use client';

import { useEffect, useMemo, useState } from 'react';
import { analyticsService, AnalyticsDashboardData } from '../service/analyticsService';

export const useAnalytics = (days: number = 30) => {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (range = days) => {
    try {
      setLoading(true);
      setError(null);
      const res = await analyticsService.getDashboardAnalytics(range);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  return { data, loading, error, refresh: fetchData };
};
