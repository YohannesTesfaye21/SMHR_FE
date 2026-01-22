"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FacilityCard from '@/components/FacilityCard';
import FilterPanelWrapper from '@/components/FilterPanelWrapper';
import { Search, RotateCw, Map, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { FacilityFilterParams, HealthFacilityDTO } from '@/types/apiTypes';
import { useFacilities, useRegions, useDistricts, useFacilityTypes } from '@/hooks/useFacilities';

// Dynamic import for Map
import dynamic from 'next/dynamic';
const FacilitiesMap = dynamic(() => import('@/components/FacilitiesMap'), {
  loading: () => <div style={{ height: '600px', width: '100%', background: 'var(--gray-100)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>,
  ssr: false
});

export default function FacilitiesPage({
  searchParams,
}: {
  searchParams: { 
    q?: string; 
    regionId?: string; 
    districtId?: string; 
    facilityTypeId?: string; 
    ownership?: string; 
    operationalStatus?: string;
    pageNumber?: string;
    pageSize?: string;
  };
}) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const query = searchParams.q || '';
  
  const filters: FacilityFilterParams = {
    facilityName: query,
    regionId: searchParams.regionId ? Number(searchParams.regionId) : undefined,
    districtId: searchParams.districtId ? Number(searchParams.districtId) : undefined,
    facilityTypeId: searchParams.facilityTypeId ? Number(searchParams.facilityTypeId) : undefined,
    ownership: searchParams.ownership,
    operationalStatus: searchParams.operationalStatus,
    pageNumber: searchParams.pageNumber ? Number(searchParams.pageNumber) : 1,
    pageSize: searchParams.pageSize ? Number(searchParams.pageSize) : 10
  };

  const { 
    data: facilitiesData, 
    isLoading: isFacilitiesLoading, 
    error: facilitiesError,
    refetch 
  } = useFacilities(filters);

  const { data: regionsData } = useRegions();
  const { data: districtsData } = useDistricts(filters.regionId);
  const { data: typesData } = useFacilityTypes();

  const facilities = facilitiesData?.data?.items || [];
  const totalCount = facilitiesData?.data?.totalCount || 0;

  const filterOptions = {
    regions: (regionsData?.data?.items || []).map(r => ({ id: r.regionId, name: r.regionName })),
    districts: (districtsData?.data?.items || []).map(d => ({ id: d.districtId, name: d.districtName })),
    types: (typesData?.data?.items || []).map(t => ({ id: t.facilityTypeId, name: t.typeName })),
    owners: ['Government', 'Private', 'NGO', 'Other'],
    statuses: ['Operational', 'Closed', 'Pending']
  };

  if (facilitiesError) {
      const apiError = (facilitiesError as any).response?.data?.message || (facilitiesError as any).message || "Failed to load data";
      return (
          <div style={{ paddingTop: '4rem', paddingBottom: '4rem', textAlign: 'center' }}>
              <div className="container">
                  <div style={{ padding: '2rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', color: '#991B1B' }}>
                      <h3 style={{ marginBottom: '0.5rem' }}>Service Unavailable</h3>
                      <p>We are having trouble connecting to the server. Please check your connection or try again later.</p>
                      <p style={{ fontSize: '0.8rem', marginTop: '1rem', opacity: 0.8 }}>Technical Details: {apiError}</p>
                      <button onClick={() => refetch()} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#991B1B', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <RotateCw size={16} /> Retry
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="container">
        
        {/* View Toggle */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <div style={{ 
                background: 'white', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px', 
                padding: '4px',
                display: 'inline-flex',
                gap: '4px'
            }}>
                <button 
                    onClick={() => setViewMode('list')}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: viewMode === 'list' ? 'var(--primary-100)' : 'transparent',
                        color: viewMode === 'list' ? 'var(--primary-700)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.9rem',
                        fontWeight: 500
                    }}
                >
                    <List size={18} /> List
                </button>
                <button 
                    onClick={() => setViewMode('map')}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: viewMode === 'map' ? 'var(--primary-100)' : 'transparent',
                        color: viewMode === 'map' ? 'var(--primary-700)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.9rem',
                        fontWeight: 500
                    }}
                >
                    <Map size={18} /> Map
                </button>
            </div>
        </div>

        <FilterPanelWrapper 
          options={filterOptions} 
          resultCount={totalCount} 
          query={query}
        >
          {isFacilitiesLoading ? (
             <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
                 <div className="spinner" style={{ marginBottom: '1rem', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary-500)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                 <p>Loading facilities...</p>
                 <style dangerouslySetInnerHTML={{__html: `
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                 `}} />
             </div>
          ) : (
             <>
                {viewMode === 'map' ? (
                    <FacilitiesMap facilities={facilities} />
                ) : (
                    <>
                        {/* Results Grid */}
                        {facilities.length > 0 ? (
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                                gap: '1.5rem',
                                marginBottom: '2rem'
                            }}>
                                {facilities.map((f: HealthFacilityDTO) => (
                                    <FacilityCard key={f.healthFacilityId} facility={f} />
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
                                <Search size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                                <h3>No facilities found</h3>
                                <p>Try adjusting your filters or search query.</p>
                            </div>
                        )}
                    </>
                )}

                {/* Pagination - Visible in both Map and List views */}
                {totalCount > 0 && (
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: '1rem',
                        marginTop: '2rem',
                        padding: '1.5rem',
                        background: 'white',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        flexWrap: 'wrap'
                    }}>
                        <button
                            disabled={filters.pageNumber === 1}
                            onClick={() => {
                                const params = new URLSearchParams(window.location.search);
                                params.set('pageNumber', String(filters.pageNumber! - 1));
                                router.push(`/facilities?${params.toString()}`);
                            }}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                background: 'white',
                                color: filters.pageNumber === 1 ? 'var(--gray-300)' : 'var(--gray-700)',
                                cursor: filters.pageNumber === 1 ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <ChevronLeft size={18} /> Previous
                        </button>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Show:</span>
                                <select
                                    value={filters.pageSize}
                                    onChange={(e) => {
                                        const params = new URLSearchParams(window.location.search);
                                        params.set('pageSize', e.target.value);
                                        params.set('pageNumber', '1');
                                        router.push(`/facilities?${params.toString()}`);
                                    }}
                                    style={{
                                        padding: '0.4rem 0.6rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        background: 'white',
                                        fontSize: '0.9rem',
                                        color: 'var(--gray-700)',
                                        cursor: 'pointer',
                                        outline: 'none'
                                    }}
                                >
                                    {[5, 10, 20, 50, 100].map(size => (
                                        <option key={size} value={size}>{size} per page</option>
                                    ))}
                                </select>
                            </div>

                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                Page <span style={{ color: 'var(--gray-900)', fontWeight: 600 }}>{filters.pageNumber}</span> of <span style={{ color: 'var(--gray-900)', fontWeight: 600 }}>{Math.ceil(totalCount / filters.pageSize!)}</span>
                            </span>
                        </div>

                        <button
                            disabled={filters.pageNumber! * filters.pageSize! >= totalCount}
                            onClick={() => {
                                const params = new URLSearchParams(window.location.search);
                                params.set('pageNumber', String(filters.pageNumber! + 1));
                                router.push(`/facilities?${params.toString()}`);
                            }}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                background: 'white',
                                color: filters.pageNumber! * filters.pageSize! >= totalCount ? 'var(--gray-300)' : 'var(--gray-700)',
                                cursor: filters.pageNumber! * filters.pageSize! >= totalCount ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            Next <ChevronRight size={18} />
                        </button>
                    </div>
                )}
             </>
          )}
        </FilterPanelWrapper>
      </div>
    </div>
  );
}
