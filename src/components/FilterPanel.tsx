"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Filter } from 'lucide-react';

type FilterOptions = {
    regions: string[];
    districts: string[];
    types: string[];
    owners: string[];
    statuses: string[];
};

export default function FilterPanel({ options, isOpen, onClose }: { options: FilterOptions, isOpen: boolean, onClose: () => void }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Local state for filters
    const [filters, setFilters] = useState({
        region: searchParams.get('region') || '',
        district: searchParams.get('district') || '',
        type: searchParams.get('type') || '',
        owner: searchParams.get('owner') || '',
        status: searchParams.get('status') || '',
    });

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        router.push(`/facilities?${params.toString()}`);
        onClose();
    };

    const clearFilters = () => {
        setFilters({
            region: '',
            district: '',
            type: '',
            owner: '',
            status: ''
        });
        router.push('/facilities');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                onClick={onClose}
                style={{ 
                    position: 'fixed', 
                    inset: 0, 
                    background: 'rgba(0,0,0,0.3)', 
                    zIndex: 1999, 
                    backdropFilter: 'blur(2px)' 
                }}
            />

            {/* Filter Panel - Horizontal */}
            <div 
                className="glass"
                style={{ 
                    position: 'fixed',
                    top: '100px',
                    right: '20px',
                    left: '20px',
                    maxWidth: '900px',
                    marginLeft: 'auto',
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    zIndex: 2000,
                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.2)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        <Filter size={18} /> Filters
                    </h3>
                    <button 
                        onClick={onClose} 
                        style={{ 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Horizontal Filter Grid */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                    gap: '1rem',
                    marginBottom: '1.5rem'
                }}>
                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block', color: 'var(--gray-700)' }}>
                            Region
                        </label>
                        <select
                            value={filters.region}
                            onChange={(e) => handleFilterChange('region', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                background: 'white'
                            }}
                        >
                            <option value="">All Regions</option>
                            {options.regions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block', color: 'var(--gray-700)' }}>
                            District
                        </label>
                        <select
                            value={filters.district}
                            onChange={(e) => handleFilterChange('district', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                background: 'white'
                            }}
                        >
                            <option value="">All Districts</option>
                            {options.districts.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block', color: 'var(--gray-700)' }}>
                            Facility Type
                        </label>
                        <select
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                background: 'white'
                            }}
                        >
                            <option value="">All Types</option>
                            {options.types.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block', color: 'var(--gray-700)' }}>
                            Ownership
                        </label>
                        <select
                            value={filters.owner}
                            onChange={(e) => handleFilterChange('owner', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                background: 'white'
                            }}
                        >
                            <option value="">All Owners</option>
                            {options.owners.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block', color: 'var(--gray-700)' }}>
                            Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                background: 'white'
                            }}
                        >
                            <option value="">All Statuses</option>
                            {options.statuses.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button 
                        onClick={clearFilters}
                        style={{ 
                            padding: '0.6rem 1.5rem', 
                            borderRadius: '8px', 
                            border: '1px solid var(--border-color)', 
                            background: 'white',
                            cursor: 'pointer', 
                            fontWeight: 500
                        }}
                    >
                        Reset
                    </button>
                    <button 
                        onClick={applyFilters}
                        className="btn-primary"
                        style={{ borderRadius: '8px', padding: '0.6rem 1.5rem' }}
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </>
    );
}
