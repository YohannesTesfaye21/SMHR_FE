"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Activity, User, LogOut, ChevronDown, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user, logout } = useAuth();

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setProfileMenuOpen(false);
  };

  return (
    <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 1000, width: '100%' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{ 
                width: '50px', 
                height: '50px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {logoError ? (
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
                ) : (
                    <img
                        src="/logo.jpg"
                        alt="Federal Government of Somalia Logo"
                        width={50}
                        height={50}
                        style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
                        onError={() => setLogoError(true)}
                        onLoad={() => setLogoError(false)}
                    />
                )}
            </div>
            <div>
                <h1 style={{ fontSize: '1.25rem', color: 'var(--primary-800)', margin: 0, lineHeight: 1.2 }}>SMHF</h1>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.05em', margin: 0 }}>SOMALIA REGISTRY</p>
            </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="desktop-nav" style={{ display: 'none' }}>
            <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none' }}>
                <li><Link href="/" style={{ fontWeight: 500, color: 'var(--gray-700)' }}>Home</Link></li>
                <li><Link href="/facilities" style={{ fontWeight: 500, color: 'var(--gray-700)' }}>Facilities</Link></li>

                <li><Link href="/statistics" style={{ fontWeight: 500, color: 'var(--gray-700)' }}>Statistics</Link></li>
            </ul>
        </nav>

        {/* Action Button (Desktop) */}
        <div className="desktop-action" style={{ display: 'none', position: 'relative' }} ref={profileMenuRef}>
            {isAuthenticated ? (
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: 'white',
                            border: '1px solid var(--border-color)',
                            borderRadius: '999px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            color: 'var(--gray-700)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--gray-50)';
                            e.currentTarget.style.borderColor = 'var(--gray-300)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                        }}
                    >
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--primary-500)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <User size={16} />
                        </div>
                        <span>{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.name || user?.email || 'Profile'}</span>
                        <ChevronDown size={16} style={{ 
                            transform: profileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s'
                        }} />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {profileMenuOpen && (
                        <div style={{
                            position: 'absolute',
                            top: 'calc(100% + 0.5rem)',
                            right: 0,
                            background: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            border: '1px solid var(--border-color)',
                            minWidth: '200px',
                            zIndex: 1000,
                            animation: 'fadeInDown 0.2s ease-out',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                padding: '0.75rem 1rem',
                                borderBottom: '1px solid var(--border-color)',
                                background: 'var(--gray-50)'
                            }}>
                                <p style={{
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: 'var(--gray-900)',
                                    margin: 0
                                }}>
                                    {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.name || 'User'}
                                </p>
                                <p style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--gray-500)',
                                    margin: '0.25rem 0 0 0'
                                }}>
                                    {user?.email}
                                </p>
                            </div>
                            <div style={{ padding: '0.5rem' }}>
                                <Link
                                    href="/admin"
                                    onClick={() => setProfileMenuOpen(false)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '8px',
                                        color: 'var(--gray-700)',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--gray-50)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <Activity size={16} />
                                    <span>Admin Dashboard</span>
                                </Link>
                                <Link
                                    href="/admin/lookups"
                                    onClick={() => setProfileMenuOpen(false)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '8px',
                                        color: 'var(--gray-700)',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--gray-50)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <MapPin size={16} />
                                    <span>Lookup Management</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '8px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#DC2626',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        transition: 'background 0.2s',
                                        textAlign: 'left'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#FEF2F2';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <LogOut size={16} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <Link href="/login" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-block' }}>
                    Login
                </Link>
            )}
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

                <li><Link href="/statistics" onClick={() => setIsOpen(false)} style={{ display: 'block', padding: '0.5rem 0', fontWeight: 500 }}>Statistics</Link></li>
                {isAuthenticated ? (
                    <>
                        <li><Link href="/admin" onClick={() => setIsOpen(false)} style={{ display: 'block', padding: '0.5rem 0', fontWeight: 500 }}>Admin Dashboard</Link></li>
                        <li>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsOpen(false);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 0',
                                    fontWeight: 500,
                                    background: 'none',
                                    border: 'none',
                                    color: '#DC2626',
                                    cursor: 'pointer',
                                    width: '100%',
                                    textAlign: 'left'
                                }}
                            >
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </li>
                    </>
                ) : (
                    <li><Link href="/login" onClick={() => setIsOpen(false)} style={{ display: 'block', padding: '0.5rem 0', fontWeight: 500 }}>Login</Link></li>
                )}
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
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}} />
    </header>
  );
}
