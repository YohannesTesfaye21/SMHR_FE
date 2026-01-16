"use client";

import React from 'react';
import StatsDashboard from '@/components/StatsDashboard';
import { Building2, MapPin, Globe, Users, BarChart3, TrendingUp, Activity } from 'lucide-react';
import { getStatisticsSummary } from '@/lib/statistics';

// Animated number component with easing
function AnimatedNumber({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const [hasAnimated, setHasAnimated] = React.useState(false);

  React.useEffect(() => {
    if (hasAnimated) return;
    
    let startTime: number;
    let animationFrame: number;

    const easeOutExpo = (t: number): number => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = easeOutExpo(progress);
      
      setDisplayValue(Math.floor(easedProgress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setHasAnimated(true);
      }
    };

    // Small delay before starting animation
    const timeout = setTimeout(() => {
      animationFrame = requestAnimationFrame(animate);
    }, 100);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(animationFrame);
    };
  }, [value, duration, hasAnimated]);

  return <span>{displayValue.toLocaleString()}</span>;
}

// Premium stat card component
function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  isPrimary = false,
  delay = 0 
}: { 
  icon: React.ElementType;
  value: number;
  label: string;
  isPrimary?: boolean;
  delay?: number;
}) {
  return (
    <div 
      className={`touch-target ${isPrimary ? 'glass-dark' : 'glass-premium shadow-premium'}`}
      style={{ 
        padding: '1.5rem',
        borderRadius: '20px',
        position: 'relative',
        overflow: 'hidden',
        opacity: 0,
        animation: `fadeInUp 0.6s ease-out ${delay}s forwards`,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Shimmer overlay */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s infinite',
          pointerEvents: 'none',
        }}
      />
      
      {/* Floating decorative element */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: isPrimary 
          ? 'rgba(255,255,255,0.1)' 
          : 'radial-gradient(circle, var(--primary-100) 0%, transparent 70%)',
        animation: 'float 4s ease-in-out infinite',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Icon with glow */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: isPrimary 
              ? 'rgba(255,255,255,0.2)' 
              : 'linear-gradient(135deg, var(--primary-500), var(--primary-400))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isPrimary 
              ? '0 4px 15px rgba(0,0,0,0.1)' 
              : '0 8px 20px rgba(65, 137, 221, 0.35)',
          }}>
            <Icon size={24} color={isPrimary ? 'white' : 'white'} />
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '20px',
            background: isPrimary ? 'rgba(255,255,255,0.15)' : 'var(--primary-50)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: isPrimary ? 'rgba(255,255,255,0.9)' : 'var(--primary-600)',
          }}>
            <TrendingUp size={12} />
            <span>Live</span>
          </div>
        </div>

        {/* Value */}
        <div 
          className="text-stat-value"
          style={{ 
            color: isPrimary ? 'white' : 'var(--gray-900)',
            marginBottom: '0.25rem',
            lineHeight: 1.1,
          }}
        >
          <AnimatedNumber value={value} />
        </div>

        {/* Label */}
        <p style={{ 
          fontSize: '0.875rem',
          fontWeight: 500,
          color: isPrimary ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)',
          margin: 0,
        }}>
          {label}
        </p>
      </div>
    </div>
  );
}

export default function StatisticsPage() {
  const summary = getStatisticsSummary();

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

        {/* Summary Cards - Mobile First Grid */}
        <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
          <StatCard 
            icon={Building2}
            value={summary.totalFacilities}
            label="Total Facilities"
            isPrimary={true}
            delay={0.1}
          />
          <StatCard 
            icon={MapPin}
            value={summary.totalDistricts}
            label="Districts Covered"
            delay={0.2}
          />
          <StatCard 
            icon={Globe}
            value={summary.totalStates}
            label="Federal States"
            delay={0.3}
          />
          <StatCard 
            icon={Users}
            value={summary.totalRegions}
            label="Regions"
            delay={0.4}
          />
        </div>

        {/* Detailed Statistics Dashboard */}
        <div style={{ 
          opacity: 0, 
          animation: 'fadeInUp 0.6s ease-out 0.5s forwards' 
        }}>
          <StatsDashboard />
        </div>
      </div>
    </div>
  );
}
