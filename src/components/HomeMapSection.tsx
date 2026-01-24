"use client";

import React from 'react';
import Link from 'next/link';
import { RotateCw, ChevronRight } from 'lucide-react';
import { useFacilities } from '@/hooks/useFacilities';
import type { HomeFilter } from '@/hooks/useDashboard';

// Dynamically import the map component to avoid SSR issues
import dynamic from 'next/dynamic';
const FacilitiesMap = dynamic(() => import('@/components/FacilitiesMap'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      width: '100%', 
      height: '600px', 
      background: 'var(--gray-100)', 
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-secondary)'
    }}>
      Loading map...
    </div>
  )
});

interface HomeMapSectionProps {
  filter?: HomeFilter | null;
}

export default function HomeMapSection({ filter }: HomeMapSectionProps) {
  const params = {
    pageSize: 1000,
    ...(filter?.stateId != null && { stateId: filter.stateId }),
    ...(filter?.regionId != null && { regionId: filter.regionId }),
    ...(filter?.districtId != null && { districtId: filter.districtId }),
  };
  const { data: facilitiesData, isLoading, error, refetch } = useFacilities(params);
  const facilities = facilitiesData?.data?.items || [];

  if (error) {
    // Ideally we might want to just show nothing or a retry button without breaking the homepage flow
    // For now, let's show a simplified error state
    return (
        <div style={{ padding: '4rem 0', textAlign: 'center' }}>
            <div className="container">
                <div style={{ padding: '2rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', color: '#991B1B' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>Unable to load map</h3>
                    <button onClick={() => refetch()} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#991B1B', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <RotateCw size={16} /> Retry
                    </button>
                </div>
            </div>
        </div>
    );
  }

  return (
    <section style={{ padding: '1px' }}>
      <div className="container">
        {/* <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--gray-900)' }}>
              <MapPin size={32} color="var(--primary-500)" />
              Facility Locations
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              Explore {isLoading ? '...' : facilityCount} health facilities across Somalia
            </p>
          </div>
          
          <Link href="/facilities" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            color: 'var(--primary-600)',
            fontWeight: 600,
            textDecoration: 'none'
          }}>
            View All Facilities <ArrowRight size={18} />
          </Link>
        </div> */}

        <div className="glass" style={{ position: 'relative', padding: '1rem', borderRadius: '24px', background: 'white', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)' }}>
          <Link
            href="/facilities"
            style={{
              position: 'absolute',
              top: '0.75rem',
              right: '0.75rem',
              zIndex: 10,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'white',
              background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
              borderRadius: '999px',
              boxShadow: '0 2px 8px rgba(65, 137, 221, 0.3)',
              textDecoration: 'none',
            }}
          >
            Browse All Facilities
            <ChevronRight size={14} strokeWidth={2.5} />
          </Link>
          {isLoading ? (
             <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                 <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ marginBottom: '1rem', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary-500)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                    <p>Loading map data...</p>
                 </div>
                 <style dangerouslySetInnerHTML={{__html: `
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                 `}} />
             </div>
          ) : (
             <FacilitiesMap facilities={facilities} />
          )}
        </div>
      </div>
    </section>
  );
}
