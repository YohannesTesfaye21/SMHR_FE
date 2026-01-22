"use client";

import { useFacility } from '@/hooks/useFacilities';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Mail, Clock, ShieldCheck, Share2, User, RotateCw, Users, Briefcase, Calendar, Info, Activity } from 'lucide-react';
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
    <div style={{ paddingBottom: '3rem' }}>
      {/* Breadcrumb / Back */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border-color)', padding: '0.75rem 0' }}>
        <div className="container">
             <Link href="/facilities" style={{ 
                 display: 'inline-flex', alignItems: 'center', gap: '8px', 
                 color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 
             }}>
                 <ArrowLeft size={14} /> Back to Registry
             </Link>
        </div>
      </div>

      <div className="container" style={{ marginTop: '1.5rem' }}>
        {/* Top Row: Info Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem', alignItems: 'stretch', marginBottom: '1rem' }}>
            
            {/* 1. Header Info (Main Facility Identity) */}
            <div style={{ gridColumn: 'span 4' }}>
                 <div className="glass" style={{ padding: '1.25rem', borderRadius: '20px', background: 'white', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: 'auto' }}>
                         <span className="badge" style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', marginBottom: '0.5rem', display: 'inline-block', fontSize: '0.7rem' }}>
                            {facility.facilityType?.typeName || 'Unknown Type'}
                         </span>
                         <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', lineHeight: 1.2 }}>{facility.healthFacilityName}</h1>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                             <MapPin size={14} />
                             {facility.district?.districtName}, {facility.district?.region?.regionName}
                         </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                        <div>
                            <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>Code</p>
                            <p style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.9rem' }}>{facility.facilityId || 'N/A'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>Ownership</p>
                            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{facility.ownership || 'N/A'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>Status</p>
                            <span className={`badge ${isOpen ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                                {facility.operationalStatus || 'Unknown'}
                            </span>
                        </div>
                    </div>
                 </div>
            </div>

            {/* 2. Partners & Projects (Middle) */}
            <div style={{ gridColumn: 'span 5' }}>
                 <div className="glass" style={{ padding: '1.25rem', borderRadius: '20px', background: 'white', height: '100%' }}>
                     <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1rem' }}>
                         <Briefcase size={18} color="var(--primary-500)" />
                         Partners & Projects
                     </h3>

                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                         {/* Health Cluster */}
                         <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--gray-50)', border: '1px solid var(--border-color)' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                 <Activity size={12} /> Health
                             </div>
                             <p style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={facility.hcPartners || 'None'}>
                                 {facility.hcPartners || 'None listed'}
                             </p>
                         </div>

                         {/* Nutrition Cluster */}
                         <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--gray-50)', border: '1px solid var(--border-color)' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                 <Info size={12} /> Nutrition
                             </div>
                             <p style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={facility.nutritionClusterPartners || 'None'}>
                                 {facility.nutritionClusterPartners || 'None listed'}
                             </p>
                         </div>

                         {/* Damal Caafimaad */}
                         {facility.damalCaafimaadPartner && (
                             <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--gray-50)', border: '1px solid var(--border-color)' }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                     <ShieldCheck size={12} /> Damal
                                 </div>
                                 <p style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                     {facility.damalCaafimaadPartner}
                                 </p>
                             </div>
                         )}

                         {/* Better Life */}
                         {facility.betterLifeProjectPartner && (
                             <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--gray-50)', border: '1px solid var(--border-color)' }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                     <User size={12} /> Better Life
                                 </div>
                                 <p style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                     {facility.betterLifeProjectPartner}
                                 </p>
                             </div>
                         )}
                     </div>
                 </div>
            </div>

            {/* 3. Contact Info (Right) */}
            <div style={{ gridColumn: 'span 3' }}>
                <div className="glass" style={{ padding: '1.25rem', borderRadius: '20px', background: 'white', height: '100%' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Contact Info</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                         <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '30px', height: '30px', background: 'var(--primary-50)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                               <Users size={14} color="var(--primary-600)" />
                            </div>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>In-Charge</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>{facility.facilityInChargeName || 'N/A'}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '30px', height: '30px', background: 'var(--primary-50)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                               <Phone size={14} color="var(--primary-600)" />
                            </div>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Number</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>{facility.facilityInChargeNumber || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Bottom Row: Full-width Map */}
        <div className="glass" style={{ padding: '1.25rem', borderRadius: '20px', background: 'white' }}>
            <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                <MapPin size={20} color="var(--primary-500)" /> Location Map
            </h3>
            
            {facility.latitude && facility.longitude ? (
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <FacilityMap 
                        latitude={facility.latitude} 
                        longitude={facility.longitude} 
                        name={facility.healthFacilityName || 'Facility'} 
                        height="350px"
                    />
                </div>
            ) : (
                <div style={{ 
                    height: '200px', 
                    background: 'var(--gray-50)', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                    textAlign: 'center',
                    padding: '1rem'
                }}>
                    <MapPin size={36} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                    <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>Location coordinates not available</p>
                </div>
            )}
        </div>

        {/* Responsive styles */}
        <style>{`
            @media (max-width: 1200px) {
                div[style*="grid-template-columns: repeat(12, 1fr)"] {
                    grid-template-columns: repeat(2, 1fr) !important;
                }
                div[style*="grid-column: span 4"],
                div[style*="grid-column: span 5"],
                div[style*="grid-column: span 3"] {
                    grid-column: span 1 !important;
                }
                div[style*="grid-column: span 5"] {
                    grid-column: span 2 !important;
                    order: 3;
                }
            }
            @media (max-width: 768px) {
                div[style*="grid-template-columns: repeat(12, 1fr)"] {
                    display: flex !important;
                    flex-direction: column !important;
                }
            }
        `}</style>
      </div>
    </div>
  );
}
