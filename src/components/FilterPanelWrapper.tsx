"use client";

import React, { useState } from 'react';
import FilterPanel from './FilterPanel';
import { Filter } from 'lucide-react';

type FilterOptions = {
    regions: string[];
    districts: string[];
    types: string[];
    owners: string[];
    statuses: string[];
};

export default function FilterPanelWrapper({ 
  children, 
  options, 
  resultCount, 
  query 
}: { 
  children: React.ReactNode; 
  options: FilterOptions;
  resultCount: number;
  query: string;
}) {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
                 <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Health Facilities</h1>
                 <p style={{ color: 'var(--text-secondary)' }}>
                    Showing {resultCount} results {query && `for "${query}"`}
                 </p>
            </div>
            
            <div>
                <button 
                    onClick={() => setFilterOpen(true)}
                    className="glass" 
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.5rem', 
                        padding: '0.75rem 1.25rem', borderRadius: '12px',
                        cursor: 'pointer', background: 'white', fontSize: '0.9rem', fontWeight: 500,
                        border: 'none'
                    }}
                >
                    <Filter size={18} /> Filters
                </button>
            </div>
       </div>

       <FilterPanel options={options} isOpen={filterOpen} onClose={() => setFilterOpen(false)} />

       <main>
            {children}
       </main>
    </>
  );
}
