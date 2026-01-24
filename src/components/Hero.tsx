"use client";

import React from 'react';
import { Search, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Hero() {
  const router = useRouter();
  const [term, setTerm] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (term.trim()) {
      router.push(`/facilities?q=${encodeURIComponent(term)}`);
    }
  };

  return (
    <div style={{ 
        position: 'relative', 
        padding: '1rem 0', 
        overflow: 'hidden',
        background: 'linear-gradient(180deg, var(--primary-50) 0%, rgba(255,255,255,0) 100%)'
    }}>
      <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        
        <h3 style={{ 
            fontSize: 'clamp(1.5rem, 5vw, 2rem)',
            color: 'var(--gray-900)', 
            marginBottom: '1rem',
            letterSpacing: '-0.02em'
        }}>
            Find Health Facilities <br />
            <span style={{ color: 'var(--primary-500)' }}>Across Somalia</span>
        </h3>

        <form onSubmit={handleSearch} style={{ 
            maxWidth: '600px', 
            margin: '0 auto', 
            position: 'relative',
        }}>
            <div className="glass" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '8px', 
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.95)',
                boxShadow: '0 20px 40px -10px rgba(65, 137, 221, 0.15)'
            }}>
                <MapPin size={24} color="var(--primary-400)" style={{ marginLeft: '12px' }} />
                <input 
                    type="text" 
                    placeholder="Search by name, region, or code..." 
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    style={{ 
                        flex: 1, 
                        border: 'none', 
                        outline: 'none', 
                        padding: '12px 16px',
                        fontSize: '1rem',
                        background: 'transparent',
                        color: 'var(--gray-900)'
                    }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px' }}>
                    <Search size={20} />
                </button>
            </div>
        </form> 
        <div style={{ textAlign: 'center', padding:'2em 0' }}>
            <Link href="/facilities" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Browse All Facilities
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
            </Link>
          </div>
      </div>

      {/* Decorative Background Elements */}
      <div style={{ 
          position: 'absolute', 
          top: '-10%', 
          left: '-5%', 
          width: '400px', 
          height: '400px', 
          background: 'radial-gradient(circle, var(--primary-200) 0%, rgba(255,255,255,0) 70%)', 
          opacity: 0.5,
          zIndex: 0 
      }} />
      <div style={{ 
          position: 'absolute', 
          bottom: '0%', 
          right: '-5%', 
          width: '500px', 
          height: '500px', 
          background: 'radial-gradient(circle, var(--primary-100) 0%, rgba(255,255,255,0) 70%)', 
          opacity: 0.6,
          zIndex: 0 
      }} />
    </div>
  );
}
