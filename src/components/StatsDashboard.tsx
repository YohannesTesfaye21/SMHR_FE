"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { REGIONAL_STATISTICS, getStatsByState } from '@/lib/statistics';
import { Building2, MapPin, TrendingUp, Award, ChevronDown, ChevronUp, Users, Layers, Search } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, Treemap } from 'recharts';

// Premium color palette
const COLORS = {
  primary: ['#4189DD', '#36a4f9', '#7cc2fb', '#026aa2', '#025583', '#06486c'],
  gradient: {
    blue: ['#4189DD', '#026aa2'],
    teal: ['#0d9488', '#0f766e'],
    purple: ['#8b5cf6', '#6d28d9'],
  }
};

// Animated Counter with easing
function AnimatedCounter({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const easeOutExpo = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(easeOutExpo(progress) * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

// Progress bar component
function ProgressBar({ value, max, color = 'var(--primary-500)' }: { value: number; max: number; color?: string }) {
  const percentage = (value / max) * 100;
  
  return (
    <div style={{ 
      width: '100%', 
      height: '8px', 
      background: 'var(--gray-100)', 
      borderRadius: '4px',
      overflow: 'hidden'
    }}>
      <div style={{
        width: `${percentage}%`,
        height: '100%',
        background: `linear-gradient(90deg, ${color}, ${color}dd)`,
        borderRadius: '4px',
        transition: 'width 1s ease-out',
      }} />
    </div>
  );
}

// Custom tooltip for charts
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div style={{
      background: 'white',
      padding: '12px 16px',
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
      border: '1px solid var(--gray-100)',
    }}>
      <p style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--gray-800)' }}>{label}</p>
      {payload.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
          <span style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
            {item.name}: <strong style={{ color: 'var(--gray-900)' }}>{item.value?.toLocaleString()}</strong>
          </span>
        </div>
      ))}
    </div>
  );
}

// Chart card wrapper
function ChartCard({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <div 
      className="glass-premium shadow-premium"
      style={{ 
        padding: '1.5rem',
        borderRadius: '20px',
        opacity: 0,
        animation: `fadeInUp 0.6s ease-out ${delay}s forwards`,
      }}
    >
      <h3 style={{ 
        fontSize: '1.125rem', 
        fontWeight: 700, 
        marginBottom: '1.5rem',
        color: 'var(--gray-900)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        {title}
      </h3>
      <div className="chart-container">
        {children}
      </div>
    </div>
  );
}

// State accordion card
function StateCard({ 
  state, 
  regions, 
  totalFacilities,
  maxFacilities,
  isExpanded, 
  onToggle,
  delay = 0,
}: {
  state: string;
  regions: typeof REGIONAL_STATISTICS;
  totalFacilities: number;
  maxFacilities: number;
  isExpanded: boolean;
  onToggle: () => void;
  delay?: number;
}) {
  return (
    <div 
      className={`glass-premium shadow-premium touch-target ${isExpanded ? 'shadow-glow' : ''}`}
      style={{ 
        borderRadius: '20px',
        overflow: 'hidden',
        opacity: 0,
        animation: `fadeInUp 0.5s ease-out ${delay}s forwards`,
        border: isExpanded ? '2px solid var(--primary-400)' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header - Always visible */}
      <div 
        onClick={onToggle}
        style={{ 
          padding: '1.25rem 1.5rem',
          cursor: 'pointer',
          background: isExpanded ? 'linear-gradient(135deg, var(--primary-50), white)' : 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              margin: 0,
              color: 'var(--gray-900)',
              marginBottom: '0.5rem',
            }}>
              {state}
            </h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.35rem',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
              }}>
                <MapPin size={14} />
                {regions.length} region{regions.length > 1 ? 's' : ''}
              </span>
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.35rem',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
              }}>
                <Building2 size={14} />
                <AnimatedCounter end={totalFacilities} duration={1500} /> facilities
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              fontSize: '1.75rem', 
              fontWeight: 800,
              background: 'linear-gradient(135deg, var(--primary-500), var(--primary-400))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {totalFacilities}
            </div>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: isExpanded ? 'var(--primary-500)' : 'var(--gray-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
            }}>
              {isExpanded 
                ? <ChevronUp size={18} color="white" />
                : <ChevronDown size={18} color="var(--gray-500)" />
              }
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <ProgressBar value={totalFacilities} max={maxFacilities} />
      </div>

      {/* Expandable content */}
      <div style={{
        maxHeight: isExpanded ? '1000px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.4s ease-out',
        marginTop: '1rem',
      }}>
        <div style={{ 
          padding: '0 1.5rem 1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1rem',
        }}>
          {regions.map((region, idx) => (
            <div 
              key={idx}
              style={{
                padding: '1rem',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, var(--gray-50), white)',
                border: '1px solid var(--gray-100)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative accent */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                background: 'linear-gradient(180deg, var(--primary-400), var(--primary-600))',
                borderRadius: '4px 0 0 4px',
              }} />
              
              <div style={{ marginLeft: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, var(--primary-500), var(--primary-400))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(65, 137, 221, 0.25)',
                  }}>
                    <MapPin size={16} color="white" />
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--gray-800)' }}>
                    {region.region}
                  </h4>
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '0.75rem',
                }}>
                  {[
                    { label: 'Facilities', value: region.facilityCount, color: 'var(--primary-600)' },
                    { label: 'Districts', value: region.districtCount, color: 'var(--gray-700)' },
                    { label: 'Partners', value: region.partnerCount, color: 'var(--gray-700)' },
                  ].map((stat, i) => (
                    <div key={i} style={{ 
                      textAlign: 'center', 
                      padding: '0.5rem',
                      background: 'white',
                      borderRadius: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}>
                      <div style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: 700, 
                        color: stat.color,
                        lineHeight: 1.2,
                      }}>
                        {stat.value}
                      </div>
                      <div style={{ 
                        fontSize: '0.65rem', 
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        marginTop: '2px',
                      }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StatsDashboard() {
  const stateStats = getStatsByState();
  const [expandedState, setExpandedState] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Prepare chart data
  const barChartData = stateStats.map(stat => ({
    name: stat.state,
    facilities: stat.facilityCount,
    regions: stat.regionCount
  }));

  const donutChartData = stateStats.map(stat => ({
    name: stat.state,
    value: stat.facilityCount
  }));

  // Treemap data
  const treemapData = stateStats.map((stat, idx) => ({
    name: stat.state,
    size: stat.facilityCount,
    fill: COLORS.primary[idx % COLORS.primary.length],
  }));

  // Area chart data - simulated trend
  const trendData = stateStats.map(stat => ({
    name: stat.state,
    facilities: stat.facilityCount,
    target: Math.round(stat.facilityCount * 1.15),
  }));

  // Group regions by state
  const regionsByState = useMemo(() => {
    return REGIONAL_STATISTICS.reduce((acc, region) => {
      if (!acc[region.state]) {
        acc[region.state] = [];
      }
      acc[region.state].push(region);
      return acc;
    }, {} as Record<string, typeof REGIONAL_STATISTICS>);
  }, []);

  // Find top performing regions
  const topRegions = [...REGIONAL_STATISTICS]
    .sort((a, b) => b.facilityCount - a.facilityCount)
    .slice(0, 3);

  // Calculate total for percentage
  const totalFacilities = stateStats.reduce((sum, s) => sum + s.facilityCount, 0);
  const maxStateFacilities = Math.max(...stateStats.map(s => s.facilityCount));

  // Filter states based on search
  const filteredStates = Object.entries(regionsByState).filter(([state]) => 
    state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Top Performers Highlight */}
      <div 
        className="glass-dark"
        style={{ 
          padding: '1.5rem',
          borderRadius: '24px',
          marginBottom: '2rem',
          opacity: 0,
          animation: 'fadeInUp 0.6s ease-out 0.1s forwards',
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          marginBottom: '1.25rem',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Award size={22} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'white', margin: 0, fontWeight: 700 }}>
              Top Performing Regions
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
              Leading healthcare coverage
            </p>
          </div>
        </div>

        {/* Mobile carousel / Desktop grid */}
        <div 
          className="snap-scroll"
          style={{ 
            display: 'flex',
            gap: '1rem',
            margin: '-0.5rem',
            padding: '0.5rem',
          }}
        >
          {topRegions.map((region, idx) => (
            <div 
              key={idx} 
              style={{ 
                flex: '0 0 auto',
                width: 'clamp(200px, 30%, 280px)',
                background: 'rgba(255,255,255,0.12)', 
                backdropFilter: 'blur(10px)',
                padding: '1.25rem', 
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.15)',
                transition: 'transform 0.3s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '0.75rem',
              }}>
                <span style={{ fontSize: '2rem' }}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                </span>
                <div style={{
                  padding: '4px 10px',
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '20px',
                  fontSize: '0.7rem',
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 600,
                }}>
                  #{idx + 1}
                </div>
              </div>
              
              <h3 style={{ 
                fontSize: '1.1rem', 
                fontWeight: 600, 
                margin: 0,
                color: 'white',
              }}>
                {region.region}
              </h3>
              <p style={{ 
                fontSize: '0.8rem', 
                color: 'rgba(255,255,255,0.7)', 
                margin: '0.25rem 0 0.75rem',
              }}>
                {region.state}
              </p>
              
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 800, 
                color: 'white',
                lineHeight: 1,
              }}>
                <AnimatedCounter end={region.facilityCount} />
              </div>
              <p style={{ 
                fontSize: '0.7rem', 
                color: 'rgba(255,255,255,0.6)',
                margin: '0.25rem 0 0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                facilities
              </p>
              
              {/* Mini progress */}
              <div style={{ marginTop: '0.75rem' }}>
                <ProgressBar 
                  value={region.facilityCount} 
                  max={topRegions[0].facilityCount} 
                  color="rgba(255,255,255,0.8)"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid - Responsive */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2rem' 
      }}>
        
        {/* Bar Chart */}
        <ChartCard title="📊 Facilities by State" delay={0.2}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4189DD" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#026aa2" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: 'var(--gray-500)' }}
                axisLine={{ stroke: 'var(--gray-200)' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'var(--gray-500)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(65, 137, 221, 0.08)' }} />
              <Bar 
                dataKey="facilities" 
                fill="url(#barGradient)" 
                radius={[6, 6, 0, 0]} 
                name="Facilities"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Donut Chart */}
        <ChartCard title="🎯 Distribution by State" delay={0.3}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={donutChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                animationBegin={0}
                animationDuration={1000}
              >
                {donutChartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS.primary[index % COLORS.primary.length]}
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span style={{ color: 'var(--gray-600)', fontSize: '0.75rem' }}>{value}</span>}
              />
              {/* Center text */}
              <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '1.5rem', fontWeight: 700, fill: 'var(--gray-900)' }}>
                {totalFacilities}
              </text>
              <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '0.7rem', fill: 'var(--gray-500)' }}>
                Total
              </text>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Area Chart - Coverage Trend */}
        <ChartCard title="📈 Coverage vs Target" delay={0.4}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4189DD" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="#4189DD" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: 'var(--gray-500)' }}
                axisLine={{ stroke: 'var(--gray-200)' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'var(--gray-500)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="facilities" 
                stroke="#4189DD" 
                strokeWidth={2}
                fill="url(#areaGradient)" 
                name="Current"
              />
              <Area 
                type="monotone" 
                dataKey="target" 
                stroke="#7cc2fb" 
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="transparent" 
                name="Target"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Treemap */}
        <ChartCard title="🗺️ Facility Landscape" delay={0.5}>
          <ResponsiveContainer width="100%" height={280}>
            <Treemap
              data={treemapData}
              dataKey="size"
              aspectRatio={4/3}
              stroke="white"
              animationDuration={500}
              content={({ x, y, width, height, name, fill }) => (
                <g>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={fill}
                    rx={4}
                    style={{ 
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                      transition: 'opacity 0.2s',
                    }}
                  />
                  {width > 40 && height > 30 && (
                    <text
                      x={x + width / 2}
                      y={y + height / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize={width > 80 ? 12 : 10}
                      fontWeight={600}
                    >
                      {name}
                    </text>
                  )}
                </g>
              )}
            />
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Regional Breakdown Section */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary-500), var(--primary-400))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(65, 137, 221, 0.3)',
            }}>
              <Layers size={20} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--gray-900)' }}>
                Regional Breakdown
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                Tap a state to explore its regions
              </p>
            </div>
          </div>
          
          {/* Search */}
          <div style={{ 
            position: 'relative',
            maxWidth: '400px',
          }}>
            <Search 
              size={18} 
              style={{ 
                position: 'absolute', 
                left: '14px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--gray-400)',
              }} 
            />
            <input
              type="text"
              placeholder="Search states..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px 12px 44px',
                borderRadius: '12px',
                border: '2px solid var(--gray-200)',
                fontSize: '0.9375rem',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                background: 'white',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary-400)';
                e.target.style.boxShadow = '0 0 0 3px rgba(65, 137, 221, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--gray-200)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* State Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredStates.map(([state, regions], idx) => {
            const totalFacilities = regions.reduce((sum, r) => sum + r.facilityCount, 0);
            
            return (
              <StateCard
                key={state}
                state={state}
                regions={regions}
                totalFacilities={totalFacilities}
                maxFacilities={maxStateFacilities}
                isExpanded={expandedState === state}
                onToggle={() => setExpandedState(expandedState === state ? null : state)}
                delay={0.1 + idx * 0.05}
              />
            );
          })}
          
          {filteredStates.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              color: 'var(--text-secondary)',
            }}>
              No states found matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
