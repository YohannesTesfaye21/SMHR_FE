"use client";

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, MapPin, Loader2, X } from 'lucide-react';
import { useStates, useRegions, useDistricts } from '@/hooks/useFacilities';
import { State, Region, District } from '@/types/apiTypes';
import type { HomeFilter } from '@/hooks/useDashboard';

const rowBase = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 0.75rem',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: 500,
  color: 'var(--gray-800)',
  transition: 'background 0.15s, color 0.15s',
} as const;

const initialFilter: HomeFilter = { stateId: null, regionId: null, districtId: null };

interface LocationHierarchyProps {
  filter: HomeFilter;
  onFilterChange: (f: HomeFilter) => void;
  hasFilter: boolean;
}

export default function LocationHierarchy({ filter, onFilterChange, hasFilter }: LocationHierarchyProps) {
  const [expandedStateId, setExpandedStateId] = useState<number | null>(null);
  const [expandedRegionId, setExpandedRegionId] = useState<number | null>(null);

  const { data: statesRes, isLoading: statesLoading } = useStates();
  const { data: regionsRes, isLoading: regionsLoading } = useRegions(
    expandedStateId ?? undefined,
    undefined,
    { enabled: !!expandedStateId }
  );
  const { data: districtsRes, isLoading: districtsLoading } = useDistricts(
    expandedRegionId ?? undefined,
    undefined,
    { enabled: !!expandedRegionId }
  );

  const states = (statesRes?.data?.items ?? []) as State[];
  const regions = (regionsRes?.data?.items ?? []) as Region[];
  const districts = (districtsRes?.data?.items ?? []) as District[];

  const handleStateClick = (stateId: number) => {
    const collapsing = expandedStateId === stateId;
    setExpandedStateId(collapsing ? null : stateId);
    setExpandedRegionId(null);
    if (collapsing) {
      onFilterChange(initialFilter);
    } else {
      onFilterChange({ stateId, regionId: null, districtId: null });
    }
  };

  const handleRegionClick = (regionId: number) => {
    if (!expandedStateId) return;
    const collapsing = expandedRegionId === regionId;
    setExpandedRegionId(collapsing ? null : regionId);
    if (collapsing) {
      onFilterChange({ stateId: expandedStateId, regionId: null, districtId: null });
    } else {
      onFilterChange({ stateId: expandedStateId, regionId, districtId: null });
    }
  };

  const handleDistrictClick = (districtId: number) => {
    if (!expandedStateId || !expandedRegionId) return;
    onFilterChange({ stateId: expandedStateId, regionId: expandedRegionId, districtId });
  };

  const handleClearFilter = () => {
    setExpandedStateId(null);
    setExpandedRegionId(null);
    onFilterChange(initialFilter);
  };

  return (
    <aside
      style={{
        width: '280px',
        minWidth: '280px',
        flexShrink: 0,
        background: 'white',
        borderRight: '1px solid var(--border-color)',
        padding: '1rem 0',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
      }}
    >
      <h3
        style={{
          padding: '0 1rem 0.75rem',
          fontSize: '0.8rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <MapPin size={16} />
        Location Hierarchy
      </h3>

      {hasFilter && (
        <button
          type="button"
          onClick={handleClearFilter}
          style={{
            ...rowBase,
            margin: '0 0.5rem 0.5rem',
            background: 'var(--gray-100)',
            color: 'var(--gray-700)',
            border: '1px solid var(--border-color)',
            width: 'calc(100% - 1rem)',
            justifyContent: 'center',
            fontSize: '0.8rem',
          }}
        >
          <X size={14} />
          Show all
        </button>
      )}

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 0.5rem' }}>
        {statesLoading && (
          <div style={{ ...rowBase, cursor: 'default', color: 'var(--text-secondary)' }}>
            <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} />
            Loading states…
          </div>
        )}

        {!statesLoading && states.length === 0 && (
          <div style={{ ...rowBase, cursor: 'default', color: 'var(--text-secondary)' }}>
            No states found
          </div>
        )}

        {!statesLoading &&
          states.map((state) => {
            const isStateExpanded = expandedStateId === state.stateId;
            const isStateSelected = filter.stateId === state.stateId && filter.regionId == null && filter.districtId == null;
            return (
              <div key={state.stateId} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button
                  type="button"
                  onClick={() => handleStateClick(state.stateId)}
                  style={{
                    ...rowBase,
                    background: isStateSelected ? 'var(--primary-100)' : isStateExpanded ? 'var(--primary-50)' : 'transparent',
                    color: isStateSelected ? 'var(--primary-800)' : isStateExpanded ? 'var(--primary-700)' : 'var(--gray-800)',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                    boxShadow: isStateSelected ? 'inset 0 0 0 1px var(--primary-200)' : undefined,
                  }}
                  onMouseEnter={(e) => {
                    if (!isStateExpanded && !isStateSelected) {
                      e.currentTarget.style.background = 'var(--gray-50)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isStateExpanded && !isStateSelected) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {isStateExpanded ? (
                    <ChevronDown size={18} style={{ flexShrink: 0 }} />
                  ) : (
                    <ChevronRight size={18} style={{ flexShrink: 0 }} />
                  )}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {state.stateName}
                  </span>
                </button>

                {isStateExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginLeft: '1rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.5rem' }}>
                    {regionsLoading && (
                      <div style={{ ...rowBase, cursor: 'default', color: 'var(--text-secondary)', paddingLeft: '1rem' }}>
                        <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                        Loading regions…
                      </div>
                    )}

                    {!regionsLoading && regions.length === 0 && (
                      <div style={{ ...rowBase, cursor: 'default', color: 'var(--text-secondary)', paddingLeft: '1rem', fontSize: '0.85rem' }}>
                        No regions
                      </div>
                    )}

                    {!regionsLoading &&
                      regions.map((region) => {
                        const isRegionExpanded = expandedRegionId === region.regionId;
                        const isRegionSelected = filter.regionId === region.regionId && filter.districtId == null;
                        return (
                          <div key={region.regionId} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <button
                              type="button"
                              onClick={() => handleRegionClick(region.regionId)}
                              style={{
                                ...rowBase,
                                paddingLeft: '1rem',
                                background: isRegionSelected ? 'var(--primary-100)' : isRegionExpanded ? 'var(--primary-50)' : 'transparent',
                                color: isRegionSelected ? 'var(--primary-800)' : isRegionExpanded ? 'var(--primary-700)' : 'var(--gray-700)',
                                border: 'none',
                                width: '100%',
                                textAlign: 'left',
                                fontSize: '0.85rem',
                                boxShadow: isRegionSelected ? 'inset 0 0 0 1px var(--primary-200)' : undefined,
                              }}
                              onMouseEnter={(e) => {
                                if (!isRegionExpanded && !isRegionSelected) {
                                  e.currentTarget.style.background = 'var(--gray-50)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isRegionExpanded && !isRegionSelected) {
                                  e.currentTarget.style.background = 'transparent';
                                }
                              }}
                            >
                              {isRegionExpanded ? (
                                <ChevronDown size={16} style={{ flexShrink: 0 }} />
                              ) : (
                                <ChevronRight size={16} style={{ flexShrink: 0 }} />
                              )}
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {region.regionName}
                              </span>
                            </button>

                            {isRegionExpanded && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginLeft: '1rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.5rem' }}>
                                {districtsLoading && (
                                  <div style={{ ...rowBase, cursor: 'default', color: 'var(--text-secondary)', paddingLeft: '1.25rem', fontSize: '0.8rem' }}>
                                    <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
                                    Loading districts…
                                  </div>
                                )}

                                {!districtsLoading && districts.length === 0 && (
                                  <div style={{ ...rowBase, cursor: 'default', color: 'var(--text-secondary)', paddingLeft: '1.25rem', fontSize: '0.8rem' }}>
                                    No districts
                                  </div>
                                )}

                                {!districtsLoading &&
                                  districts.map((district) => {
                                    const isDistrictSelected = filter.districtId === district.districtId;
                                    return (
                                      <button
                                        key={district.districtId}
                                        type="button"
                                        onClick={() => handleDistrictClick(district.districtId)}
                                        style={{
                                          ...rowBase,
                                          paddingLeft: '1.25rem',
                                          cursor: 'pointer',
                                          fontSize: '0.8rem',
                                          color: isDistrictSelected ? 'var(--primary-800)' : 'var(--gray-600)',
                                          background: isDistrictSelected ? 'var(--primary-100)' : 'transparent',
                                          border: 'none',
                                          width: '100%',
                                          textAlign: 'left',
                                          boxShadow: isDistrictSelected ? 'inset 0 0 0 1px var(--primary-200)' : undefined,
                                        }}
                                        onMouseEnter={(e) => {
                                          if (!isDistrictSelected) {
                                            e.currentTarget.style.background = 'var(--gray-50)';
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          if (!isDistrictSelected) {
                                            e.currentTarget.style.background = 'transparent';
                                          }
                                        }}
                                      >
                                        <span style={{ width: 16, flexShrink: 0 }} />
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                          {district.districtName}
                                        </span>
                                      </button>
                                    );
                                  })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
      </nav>

      <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` }} />
    </aside>
  );
}
