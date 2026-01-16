"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Activity } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 1000, width: '100%' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
                width: '40px', 
                height: '40px', 
                background: 'var(--primary-500)', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
            }}>
                <Activity size={24} />
            </div>
            <div>
                <h1 style={{ fontSize: '1.25rem', color: 'var(--primary-800)' }}>SMHF</h1>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.05em' }}>SOMALIA REGISTRY</p>
            </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="desktop-nav" style={{ display: 'none' }}>
            <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none' }}>
                <li><Link href="/" style={{ fontWeight: 500, color: 'var(--gray-700)' }}>Home</Link></li>
                <li><Link href="/facilities" style={{ fontWeight: 500, color: 'var(--gray-700)' }}>Facilities</Link></li>
                <li><Link href="/map" style={{ fontWeight: 500, color: 'var(--gray-700)' }}>Map</Link></li>
                <li><Link href="/statistics" style={{ fontWeight: 500, color: 'var(--gray-700)' }}>Statistics</Link></li>
            </ul>
        </nav>

        {/* Action Button (Desktop) */}
        <div className="desktop-action" style={{ display: 'none' }}>
            <button className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
                Login
            </button>
        </div>

        {/* Mobile Toggle */}
        <button 
            className="mobile-toggle"
            onClick={() => setIsOpen(!isOpen)}
            style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                color: 'var(--gray-700)'
            }}
        >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div style={{ 
            position: 'absolute', 
            top: '80px', 
            left: 0, 
            width: '100%', 
            background: 'var(--surface-color)', 
            borderBottom: '1px solid var(--border-color)',
            padding: '1rem 0',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}>
             <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none', padding: '0 1.5rem' }}>
                <li><Link href="/" onClick={() => setIsOpen(false)} style={{ display: 'block', padding: '0.5rem 0', fontWeight: 500 }}>Home</Link></li>
                <li><Link href="/facilities" onClick={() => setIsOpen(false)} style={{ display: 'block', padding: '0.5rem 0', fontWeight: 500 }}>Facilities</Link></li>
                <li><Link href="/map" onClick={() => setIsOpen(false)} style={{ display: 'block', padding: '0.5rem 0', fontWeight: 500 }}>Map</Link></li>
                <li><Link href="/statistics" onClick={() => setIsOpen(false)} style={{ display: 'block', padding: '0.5rem 0', fontWeight: 500 }}>Statistics</Link></li>
                <li><Link href="#" onClick={() => setIsOpen(false)} style={{ display: 'block', padding: '0.5rem 0', fontWeight: 500 }}>Login</Link></li>
            </ul>
        </div>
      )}

      {/* Responsive Styles Injection for this component */}
      <style jsx>{`
        @media (min-width: 768px) {
            .desktop-nav, .desktop-action {
                display: flex !important;
            }
            .mobile-toggle {
                display: none !important;
            }
        }
      `}</style>
    </header>
  );
}
