import { getFacilityById } from '@/lib/mockData';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Mail, Clock, ShieldCheck, Share2 } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function FacilityDetailsPage({ params }: { params: { id: string } }) {
  const facility = await getFacilityById(params.id);

  if (!facility) {
    notFound();
  }

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
                                {facility.type}
                             </span>
                             <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{facility.name}</h1>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                                 <MapPin size={18} />
                                 {facility.district}, {facility.region}, Somalia
                             </div>
                         </div>
                         <button className="glass" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                             <Share2 size={20} />
                         </button>
                    </div>

                    <div style={{ display: 'flex', gap: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                        <div>
                            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Facility Code</p>
                            <p style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '1.1rem' }}>{facility.code}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Ownership</p>
                            <p style={{ fontWeight: 600 }}>{facility.owner}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Status</p>
                            <span className={`badge ${facility.status === 'Operational' ? 'badge-success' : 'badge-warning'}`}>
                                {facility.status}
                            </span>
                        </div>
                    </div>
                 </div>

                 {/* Services Section (Placeholder) */}
                 <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'white' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Available Services</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {['General Medicine', 'Maternity', 'Pediatrics', 'Emergency Care', 'Laboratory', 'Pharmacy'].map(s => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ShieldCheck size={18} color="var(--primary-500)" />
                                <span>{s}</span>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>

            {/* Sidebar */}
            <div style={{ gridColumn: 'span 4' }}>
                <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'white', position: 'sticky', top: '100px' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Contact Info</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Clock size={20} color="var(--primary-500)" />
                            <div>
                                <p style={{ fontWeight: 600 }}>Opening Hours</p>
                                <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>Mon - Sun: 24 Hours</p>
                            </div>
                        </div>

                         <div style={{ display: 'flex', gap: '1rem' }}>
                            <Phone size={20} color="var(--primary-500)" />
                            <div>
                                <p style={{ fontWeight: 600 }}>Emergency Contact</p>
                                <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>+252 61 500 0000</p>
                            </div>
                        </div>

                         <div style={{ display: 'flex', gap: '1rem' }}>
                            <Mail size={20} color="var(--primary-500)" />
                            <div>
                                <p style={{ fontWeight: 600 }}>Email</p>
                                <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>info@{facility.code.toLowerCase()}.moh.gov.so</p>
                            </div>
                        </div>
                    </div>

                    <button className="btn-primary" style={{ width: '100%', marginTop: '2rem', justifyContent: 'center', display: 'flex' }}>
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
