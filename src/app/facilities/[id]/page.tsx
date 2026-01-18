"use client";

import { useFacility } from '@/hooks/useFacilities';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Mail, Clock, ShieldCheck, Share2, User, RotateCw } from 'lucide-react';
import { notFound } from 'next/navigation';

// Dynamic import for Map to avoid SSR issues
import dynamic from 'next/dynamic';
const FacilityMap = dynamic(() => import('@/components/FacilityMap'), {
  loading: () => <div style={{ height: '300px', width: '100%', background: 'var(--gray-100)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>,
  ssr: false
});

export default function FacilityDetailsPage({ params }: { params: { id: string } }) {
  const facilityId = Number(params.id);

  const { 
    data: response, 
    isLoading, 
    error,
    refetch 
  } = useFacility(facilityId);

  if (isNaN(facilityId)) {
      return notFound();
  }

  if (isLoading) {
      return (
          <div style={{ paddingTop: '8rem', paddingBottom: '8rem', textAlign: 'center' }}>
               <div className="spinner" style={{ marginBottom: '1rem', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary-500)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
               <p>Loading details...</p>
               <style dangerouslySetInnerHTML={{__html: `
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                 `}} />
          </div>
      );
  }

  if (error || !response?.success || !response?.data) {
     const apiError = (error as any)?.response?.data?.message || (error as any)?.message || "Failed to load facility details";
     return (
        <div style={{ paddingTop: '4rem', paddingBottom: '4rem', textAlign: 'center' }}>
            <div className="container">
                <div style={{ padding: '2rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', color: '#991B1B' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>Failed to Load Facility</h3>
                    <p>We encountered an error while retrieving the facility details.</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '1rem', opacity: 0.8 }}>Technical Details: {apiError}</p>
                    <button onClick={() => refetch()} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#991B1B', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <RotateCw size={16} /> Retry
                    </button>
                    <div style={{ marginTop: '2rem' }}>
                         <Link href="/facilities" style={{ textDecoration: 'underline' }}>Back to List</Link>
                    </div>
                </div>
            </div>
        </div>
     );
  }

  const facility = response.data;
  const isOpen = facility.operationalStatus === 'Operational';

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Breadcrumb / Back */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border-color)', padding: '1rem 0' }}>
        <div className="container">
             <Link href="/facilities" style={{ 
                 display: 'inline-flex', alignItems: 'center', gap: '8px', 
                 color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 
             }}>
                 <ArrowLeft size={16} /> Back to Registry
             </Link>
        </div>
      </div>

      <div className="container" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem' }}>
            
            {/* Main Content */}
            <div style={{ gridColumn: 'span 8' }}>
                 <div className="glass" style={{ padding: '2.5rem', borderRadius: '24px', background: 'white', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                         <div>
                             <span className="badge" style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', marginBottom: '1rem', display: 'inline-block' }}>
                                {facility.facilityType?.typeName || 'Unknown Type'}
                             </span>
                             <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{facility.healthFacilityName}</h1>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                                 <MapPin size={18} />
                                 {facility.district?.districtName}, {facility.district?.region?.regionName}, Somalia
                             </div>
                         </div>
                         <button className="glass" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                             <Share2 size={20} />
                         </button>
                    </div>

                    <div style={{ display: 'flex', gap: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                        <div>
                            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Facility Code</p>
                            <p style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '1.1rem' }}>{facility.facilityId || 'N/A'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Ownership</p>
                            <p style={{ fontWeight: 600 }}>{facility.ownership || 'N/A'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Status</p>
                            <span className={`badge ${isOpen ? 'badge-success' : 'badge-warning'}`}>
                                {facility.operationalStatus || 'Unknown'}
                            </span>
                        </div>
                    </div>
                 </div>
            </div>

            {/* Sidebar */}
            <div style={{ gridColumn: 'span 4' }}>
                <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'white', position: 'sticky', top: '100px' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Contact Info</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                         <div style={{ display: 'flex', gap: '1rem' }}>
                            <Phone size={20} color="var(--primary-500)" />
                            <div>
                                <p style={{ fontWeight: 600 }}>Contact Number</p>
                                <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>{facility.facilityInChargeNumber || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={18} /> Location
                        </h4>
                        
                        {facility.latitude && facility.longitude ? (
                            <FacilityMap 
                                latitude={facility.latitude} 
                                longitude={facility.longitude} 
                                name={facility.healthFacilityName || 'Facility'} 
                            />
                        ) : (
                            <div style={{ 
                                height: '200px', 
                                background: 'var(--gray-50)', 
                                borderRadius: '16px', 
                                display: 'flex', 
                                flexDirection: 'column',
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: 'var(--text-secondary)',
                                textAlign: 'center',
                                padding: '1rem'
                            }}>
                                <MapPin size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                <p style={{ fontSize: '0.9rem' }}>Location coordinates not available</p>
                            </div>
                        )}
                    </div>

                    <button className="btn-primary" style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center', display: 'flex' }}>
                        Get Directions
                    </button>
                </div>
            </div>

            {/* Responsive styles */}
            <style>{`
                @media (max-width: 768px) {
                    div[style*="grid-template-columns: repeat(12, 1fr)"] {
                        display: flex !important;
                        flex-direction: column !important;
                    }
                }
            `}</style>
        </div>
      </div>
    </div>
  );
}
