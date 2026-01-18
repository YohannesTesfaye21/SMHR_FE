import Hero from "@/components/Hero";
import StatsDashboard from "@/components/StatsDashboard";
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <Hero />
      
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            {/* Feature 1 */}
            <div className="glass card-hover" style={{ padding: '2rem', borderRadius: '24px', background: 'white' }}>
              <div style={{ 
                width: '50px', height: '50px', background: 'var(--primary-50)', 
                borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.5rem', color: 'var(--primary-600)'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3h18v18H3zM12 8v8M8 12h8"/>
                </svg>
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>Comprehensive Data</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Access detailed profiles for over 1,200 health facilities across all regions of Somalia.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass card-hover" style={{ padding: '2rem', borderRadius: '24px', background: 'white' }}>
               <div style={{ 
                width: '50px', height: '50px', background: 'var(--primary-50)', 
                borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.5rem', color: 'var(--primary-600)'
              }}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                 </svg>
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>Real-time Status</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Check operational status, hours of service, and availability of key resources.
              </p>
            </div>

            {/* Feature 3 */}
             <div className="glass card-hover" style={{ padding: '2rem', borderRadius: '24px', background: 'white' }}>
               <div style={{ 
                width: '50px', height: '50px', background: 'var(--primary-50)', 
                borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.5rem', color: 'var(--primary-600)'
              }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>Verified & Official</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Data maintained directly by the Ministry of Health and Federal Member States.
              </p>
            </div>

          </div>

          <div style={{ marginTop: '4rem', textAlign: 'center' }}>
            <Link href="/facilities" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Browse All Facilities
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      {/* <section style={{ padding: '4rem 0', background: 'var(--gray-50)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>National Statistics</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
              Quick overview of health facilities across Somalia
            </p>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            <div className="glass card-hover" style={{ 
              padding: '1.5rem', 
              borderRadius: '16px', 
              background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.9 }}>
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span style={{ fontSize: '2rem', fontWeight: 700 }}>1,244</span>
              </div>
              <h3 style={{ fontSize: '0.875rem', opacity: 0.9, fontWeight: 600, color: 'white' }}>Total Facilities</h3>
            </div>

            <div className="glass card-hover" style={{ padding: '1.5rem', borderRadius: '16px', background: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-500)' }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gray-900)' }}>1,244</span>
              </div>
              <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Districts Covered</h3>
            </div>

            <div className="glass card-hover" style={{ padding: '1.5rem', borderRadius: '16px', background: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-500)' }}>
                  <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gray-900)' }}>6</span>
              </div>
              <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>States</h3>
            </div>

            <div className="glass card-hover" style={{ padding: '1.5rem', borderRadius: '16px', background: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-500)' }}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gray-900)' }}>13</span>
              </div>
              <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Regions</h3>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link href="/statistics" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                View Detailed Statistics
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
            </Link>
          </div>
        </div>
      </section> */}
    </div>
  );
}
