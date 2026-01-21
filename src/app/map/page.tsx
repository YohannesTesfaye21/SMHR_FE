"use client";

import React from 'react';
import { MapPin, RotateCw } from 'lucide-react';
import { useFacilities } from '@/hooks/useFacilities';

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

export default function MapPage() {
  // Fetch all facilities (up to 1000) for the map
  const { 
    data: facilitiesData, 
    isLoading, 
    error,
    refetch 
  } = useFacilities({ pageSize: 1000 });

  const facilities = facilitiesData?.data?.items || [];
  const facilityCount = facilities.length;

  if (error) {
    const apiError = (error as any).response?.data?.message || (error as any).message || "Failed to load facilities";
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
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MapPin size={32} color="var(--primary-500)" />
            Facility Locations
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Interactive map showing {isLoading ? '...' : facilityCount} health facilities across Somalia
          </p>
        </div>

        <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', background: 'white' }}>
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
    </div>
  );
}
