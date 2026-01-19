"use client";

import React from 'react';
import StatsDashboard from '@/components/StatsDashboard';
import { Activity } from 'lucide-react';

export default function StatisticsPage() {
  return (
    <div style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>
      <div className="container">
        {/* Premium Header */}
        <div 
          style={{ 
            marginBottom: '2.5rem', 
            textAlign: 'center',
            opacity: 0,
            animation: 'fadeInUp 0.6s ease-out forwards',
          }}
        >
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            marginBottom: '0.75rem',
            padding: '0.5rem 1rem',
            background: 'var(--primary-50)',
            borderRadius: '999px',
          }}>
            <Activity size={20} color="var(--primary-500)" />
            <span style={{ 
              fontSize: '0.875rem', 
              fontWeight: 600, 
              color: 'var(--primary-600)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Live Data Dashboard
            </span>
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(1.75rem, 5vw, 2.75rem)', 
            margin: '0.5rem 0',
            background: 'linear-gradient(135deg, var(--gray-900) 0%, var(--gray-700) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            National Health Statistics
          </h1>
          
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            Comprehensive real-time overview of health facilities across Somalia&apos;s regions and states
          </p>
        </div>

        {/* Statistics Dashboard - includes summary cards */}
        <div style={{ 
          opacity: 0, 
          animation: 'fadeInUp 0.6s ease-out 0.2s forwards' 
        }}>
          <StatsDashboard />
        </div>
      </div>
    </div>
  );
}
