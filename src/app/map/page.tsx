import React from 'react';
import { getFacilities } from '@/lib/mockData';
import dynamicImport from 'next/dynamic';
import { MapPin } from 'lucide-react';

// Dynamically import the map component to avoid SSR issues
const FacilityMap = dynamicImport(() => import('@/components/FacilityMap'), {
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

export const dynamic = 'force-dynamic';

export default async function MapPage() {
  const facilities = await getFacilities();

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MapPin size={32} color="var(--primary-500)" />
            Facility Locations
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Interactive map showing {facilities.filter(f => f.latitude && f.longitude).length} health facilities across Somalia
          </p>
        </div>

        <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', background: 'white' }}>
          <FacilityMap facilities={facilities} />
        </div>

        {/* Legend */}
        <div className="glass" style={{ 
          marginTop: '2rem', 
          padding: '1.5rem', 
          borderRadius: '16px', 
          background: 'white',
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              borderRadius: '50%', 
              background: '#22c55e',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--gray-700)' }}>Operational</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              borderRadius: '50%', 
              background: '#ef4444',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--gray-700)' }}>Closed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              borderRadius: '50%', 
              background: '#f59e0b',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--gray-700)' }}>Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}
