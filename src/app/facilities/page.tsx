import React from 'react';
import { getFacilities, getFilterOptions } from '@/lib/mockData';
import FacilityCard from '@/components/FacilityCard';
import FilterPanelWrapper from '@/components/FilterPanelWrapper'; // New wrapper for client logic
import { Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function FacilitiesPage({
  searchParams,
}: {
  searchParams: { q?: string; region?: string; district?: string; type?: string; owner?: string; status?: string };
}) {
  const query = searchParams.q || '';
  const facilities = await getFacilities(searchParams);
  const filterOptions = await getFilterOptions();

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="container">
        <FilterPanelWrapper 
          options={filterOptions} 
          resultCount={facilities.length} 
          query={query}
        >
          {/* Results Grid */}
          {facilities.length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {facilities.map((f) => (
                <FacilityCard key={f.id} facility={f} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
              <Search size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <h3>No facilities found</h3>
              <p>Try adjusting your search terms or filters.</p>
            </div>
          )}
        </FilterPanelWrapper>
      </div>
    </div>
  );
}
