'use client';

import { Navigation } from '@/shared/components';
import SearchPage from '../../features/search/ui/SearchPage';
import React, { Suspense } from 'react';

export default function AppSearchPage() {
  return (
    <Navigation>
      <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading search...</div>}>
        <SearchPage />
      </Suspense>
    </Navigation>
  );
}