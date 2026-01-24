"use client";

import React, { useState, useCallback } from 'react';
import Hero from '@/components/Hero';
import HomeMapSection from '@/components/HomeMapSection';
import LocationHierarchy from '@/components/LocationHierarchy';
import type { HomeFilter } from '@/hooks/useDashboard';

const initialFilter: HomeFilter = {
  stateId: null,
  regionId: null,
  districtId: null,
};

export default function HomePageWithFilter() {
  const [filter, setFilter] = useState<HomeFilter>(initialFilter);

  const onFilterChange = useCallback((next: HomeFilter) => {
    setFilter(next);
  }, []);

  const hasFilter = filter.stateId != null || filter.regionId != null || filter.districtId != null;

  return (
    <div style={{ display: 'flex', flexDirection: 'row', minHeight: '100%', width: '100%' }}>
      <LocationHierarchy
        filter={filter}
        onFilterChange={onFilterChange}
        hasFilter={hasFilter}
      />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Hero filter={hasFilter ? filter : undefined} />
        <HomeMapSection filter={hasFilter ? filter : undefined} />
      </div>
    </div>
  );
}
