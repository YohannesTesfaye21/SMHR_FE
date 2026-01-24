"use client";

import React from 'react';
import { Building2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useDashboardStatistics, type HomeFilter } from '@/hooks/useDashboard';
import { stringToColor, stringToColorLight } from '@/lib/colors';

const cardBase = {
  borderRadius: '16px',
  boxShadow: '0 4px 16px -4px rgba(0,0,0,0.1), 0 2px 6px -2px rgba(0,0,0,0.06)',
  border: '1px solid var(--gray-200)',
};

interface HeroProps {
  filter?: HomeFilter | null;
}

export default function Hero({ filter }: HeroProps) {
  const { data: statsResponse, isLoading, error } = useDashboardStatistics(filter);
  const stats = statsResponse?.data;

  return (
    <div style={{
      position: 'relative',
      padding: '1rem 0 1.5rem',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, var(--primary-50) 0%, rgba(255,255,255,0) 100%)',
    }}>
      <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>

        <h3 style={{
          fontSize: 'clamp(1.5rem, 5vw, 2rem)',
          color: 'var(--gray-900)',
          marginBottom: '1rem',
          letterSpacing: '-0.02em',
        }}>
          Find Health Facilities <br />
          <span style={{ color: 'var(--primary-500)' }}>Across Somalia</span>
        </h3>

        {isLoading && (
          <div style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Loading statistics…
          </div>
        )}

        {error && (
          <div style={{
            ...cardBase,
            padding: '1rem 1.25rem',
            background: '#FEF2F2',
            borderColor: '#FECACA',
            color: '#991B1B',
            maxWidth: '480px',
            margin: '0 auto 1rem',
          }}>
            <p style={{ margin: 0 }}>Unable to load dashboard statistics. Please try again later.</p>
          </div>
        )}

        {!isLoading && !error && stats && (() => {
          const numTypes = stats.byFacilityType?.length ?? 0;
          const numStatuses = stats.byOperationalStatus?.length ?? 0;
          const isSmallData = numTypes <= 3 && (numStatuses <= 2 || (stats.totalFacilities ?? 0) <= 25);

          return (
          <>
            {/* Row 1: Total Facilities + horizontally scrollable facility type cards */}
            <div
              className="dashboard-row-1"
              style={{
                display: 'flex',
                alignItems: 'stretch',
                gap: '1rem',
                marginBottom: isSmallData ? '0.75rem' : '1.5rem',
                minHeight: isSmallData ? undefined : '88px',
                justifyContent: isSmallData ? 'center' : undefined,
                flexWrap: 'wrap',
              }}
            >
              <div
                className="hero-total-card"
                style={{
                  ...cardBase,
                  flex: '0 0 auto',
                  width: '168px',
                  padding: '0.85rem 1.15rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.7rem',
                  background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)',
                  color: 'white',
                  border: 'none',
                  boxShadow: '0 8px 24px -4px rgba(65, 137, 221, 0.45), 0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <Building2 size={26} style={{ opacity: 0.95, flexShrink: 0 }} />
                <div style={{ textAlign: 'left', minWidth: 0 }}>
                  <div style={{ fontSize: '0.7rem', opacity: 0.92, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Total Facilities
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                    {stats.totalFacilities.toLocaleString()}
                  </div>
                </div>
              </div>

              {stats.byFacilityType && stats.byFacilityType.length > 0 && (
                <div
                  style={{
                    flex: isSmallData ? '0 0 auto' : 1,
                    minWidth: 0,
                    maxWidth: isSmallData ? undefined : '100%',
                    display: 'flex',
                    gap: '0.85rem',
                    overflowX: 'auto',
                    paddingBottom: '6px',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'var(--gray-300) var(--gray-100)',
                  }}
                  className="hero-facility-types-scroll"
                >
                  {stats.byFacilityType.map((t) => {
                    const color = stringToColor(t.typeName);
                    const bg = stringToColorLight(t.typeName);
                    return (
                      <div
                        key={t.facilityTypeId}
                        style={{
                          ...cardBase,
                          flex: '0 0 auto',
                          width: '136px',
                          padding: '0.7rem 0.9rem',
                          background: bg,
                          borderLeft: `4px solid ${color}`,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          justifyContent: 'center',
                          gap: '0.2rem',
                        }}
                      >
                        <div style={{ fontSize: '0.68rem', color: 'var(--gray-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.25 }}>
                          {t.typeName}
                        </div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 700, color, letterSpacing: '-0.01em' }}>
                          {t.count.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Row 2: Operational status only */}
            {stats.byOperationalStatus && stats.byOperationalStatus.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  marginTop: isSmallData ? 0 : undefined,
                }}
              >
                {stats.byOperationalStatus.map((s) => {
                  const isOperational = s.statusName === 'Operational';
                  const isClosed = s.statusName === 'Closed';
                  const isGap = s.statusName === 'Gap';
                  const Icon = isOperational ? CheckCircle : isClosed ? XCircle : AlertCircle;
                  const bg = isOperational ? '#DCFCE7' : isClosed ? '#FEE2E2' : '#FEF9C3';
                  const fg = isOperational ? '#166534' : isClosed ? '#991B1B' : '#854D0E';
                  return (
                    <div
                      key={s.operationalStatusId}
                      style={{
                        ...cardBase,
                        flex: isSmallData ? '1 1 120px' : '1 1 140px',
                        maxWidth: isSmallData ? '280px' : '200px',
                        padding: '0.75rem 1.15rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: bg,
                        border: `1px solid ${isOperational ? '#BBF7D0' : isClosed ? '#FECACA' : '#FDE68A'}`,
                        boxShadow: '0 4px 16px -4px rgba(0,0,0,0.1), 0 2px 6px -2px rgba(0,0,0,0.06)',
                      }}
                    >
                      <Icon size={22} color={fg} style={{ flexShrink: 0 }} />
                      <div style={{ textAlign: 'left', minWidth: 0 }}>
                        <div style={{ fontSize: '0.68rem', color: fg, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.25 }}>
                          {s.statusName}
                        </div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: fg, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                          {s.count.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </>
          );
        })()}

        {!isLoading && !error && !stats && (
          <div style={{ padding: '1.5rem', color: 'var(--text-secondary)' }}>
            No statistics available.
          </div>
        )}
      </div>

      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, var(--primary-200) 0%, rgba(255,255,255,0) 70%)',
        opacity: 0.5,
        zIndex: 0,
      }} />
      <div style={{
        position: 'absolute',
        bottom: '0%',
        right: '-5%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, var(--primary-100) 0%, rgba(255,255,255,0) 70%)',
        opacity: 0.6,
        zIndex: 0,
      }} />
    </div>
  );
}
