"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FilterPanel, { FilterOptionItem } from './FilterPanel';
import { Filter, Search } from 'lucide-react';

type FilterOptions = {
    regions: FilterOptionItem[];
    districts: FilterOptionItem[];
    types: FilterOptionItem[];
    owners: FilterOptionItem[];
    statuses: FilterOptionItem[];
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
  const [localQuery, setLocalQuery] = useState(query);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (localQuery) {
        params.set('q', localQuery);
    } else {
        params.delete('q');
    }
    params.delete('pageNumber');
    router.push(`/facilities?${params.toString()}`);
  };

  return (
    <>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
                 <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Health Facilities</h1>
                 <p style={{ color: 'var(--text-secondary)' }}>
                    Showing {resultCount} results {query && `for "${query}"`}
                 </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <form onSubmit={handleSearch} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--gray-400)' }} />
                    <input 
                        type="text" 
                        placeholder="Search facilities..." 
                        value={localQuery}
                        onChange={(e) => setLocalQuery(e.target.value)}
                        style={{ 
                            padding: '0.75rem 0.75rem 0.75rem 2.5rem', 
                            borderRadius: '12px', 
                            border: '1px solid var(--gray-200)',
                            fontSize: '0.9rem',
                            width: '240px',
                            background: 'white'
                        }}
                    />
                </form>

                <button 
                    onClick={() => setFilterOpen(true)}
                    className="glass" 
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.5rem', 
                        padding: '0.75rem 1.25rem', borderRadius: '12px',
                        cursor: 'pointer', background: 'white', fontSize: '0.9rem', fontWeight: 500,
                        border: 'none',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
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

