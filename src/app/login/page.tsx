'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 200px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'linear-gradient(180deg, var(--primary-50) 0%, rgba(255,255,255,0) 100%)'
    }}>
      <div className="glass" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '3rem 2.5rem',
        borderRadius: '24px',
        boxShadow: '0 20px 40px -10px rgba(65, 137, 221, 0.15)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
            borderRadius: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <Lock size={28} color="white" />
          </div>
          <h1 style={{
            fontSize: '1.875rem',
            color: 'var(--gray-900)',
            marginBottom: '0.5rem',
            fontWeight: 700
          }}>
            Welcome Back
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9375rem'
          }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#991b1b'
          }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: '0.875rem' }}>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="email" style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--gray-700)'
            }}>
              Email Address
            </label>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Mail size={20} color="var(--gray-400)" style={{
                position: 'absolute',
                left: '1rem',
                pointerEvents: 'none'
              }} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem 0.875rem 3rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  background: 'white',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary-500)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(65, 137, 221, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label htmlFor="password" style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--gray-700)'
            }}>
              Password
            </label>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Lock size={20} color="var(--gray-400)" style={{
                position: 'absolute',
                left: '1rem',
                pointerEvents: 'none'
              }} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem 0.875rem 3rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  background: 'white',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary-500)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(65, 137, 221, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '12px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </form>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-color)',
          marginTop: '2rem'
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}>
            Don't have an account?{' '}
            <Link href="#" style={{
              color: 'var(--primary-600)',
              fontWeight: 600,
              textDecoration: 'none'
            }}>
              Contact Administrator
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}