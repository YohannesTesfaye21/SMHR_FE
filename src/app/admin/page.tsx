'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useFacilities } from '@/hooks/useFacilities';
import { facilityService } from '@/services/facilityService';
import { HealthFacilityDTO } from '@/types/apiTypes';
import { Plus, Edit, Trash2, RotateCw, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

export default function AdminPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'date' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [clearAllModalOpen, setClearAllModalOpen] = useState(false);
  const [facilityToDelete, setFacilityToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [includeUsers, setIncludeUsers] = useState(false);

  // Debounce search term to avoid too many API calls
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPageNumber(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch facilities with API-based search - this searches ALL facilities across all pages
  const { 
    data: facilitiesData, 
    isLoading: isFacilitiesLoading, 
    error: facilitiesError,
    refetch 
  } = useFacilities({ 
    pageNumber: debouncedSearchTerm ? 1 : pageNumber, // Reset to page 1 when searching (we'll fetch more for sorting)
    pageSize: (debouncedSearchTerm || sortField) ? 1000 : pageSize, // Fetch more when searching/sorting for client-side operations
    facilityName: debouncedSearchTerm || undefined // API-based search - searches ALL facilities
  });

  // Client-side sorting on API-filtered results
  let sortedFacilities = [...(facilitiesData?.data?.items || [])];

  // Apply sorting (client-side on API results)
  if (sortField) {
    sortedFacilities.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === 'name') {
        aValue = (a.healthFacilityName || '').toLowerCase();
        bValue = (b.healthFacilityName || '').toLowerCase();
      } else if (sortField === 'date') {
        aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Use total count from API for search results, otherwise use API pagination
  const totalCount = facilitiesData?.data?.totalCount || 0;
  let facilities = sortedFacilities;
  let totalPages = facilitiesData?.data?.totalPages || 1;
  
  // Calculate startIndex for pagination display
  const startIndex = (pageNumber - 1) * pageSize;
  
  // If we fetched many results (for search or sort), do client-side pagination
  if ((debouncedSearchTerm || sortField) && sortedFacilities.length > pageSize) {
    facilities = sortedFacilities.slice(startIndex, startIndex + pageSize);
    totalPages = Math.ceil(sortedFacilities.length / pageSize);
  }

  const handleSort = (field: 'name' | 'date') => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with ascending direction
      setSortField(field);
      setSortDirection('asc');
    }
    setPageNumber(1); // Reset to first page when sorting
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value); // Debounced search will trigger API call
  };

  const handleEdit = (facility: HealthFacilityDTO) => {
    router.push(`/admin/facilities/${facility.healthFacilityId}/edit`);
  };

  const handleDeleteClick = (facilityId: number, facilityName: string) => {
    setFacilityToDelete({ id: facilityId, name: facilityName });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!facilityToDelete) return;

    try {
      await facilityService.deleteFacility(facilityToDelete.id);
      // After successful delete, refetch the data
      refetch();
      setDeleteModalOpen(false);
      setFacilityToDelete(null);
      showNotification('Facility deleted successfully.', 'success');
    } catch (error: any) {
      console.error('Error deleting facility:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete facility. Please try again.';
      showNotification(errorMessage, 'error');
      setDeleteModalOpen(false);
      setFacilityToDelete(null);
    }
  };

  const handleDeleteAllClick = () => {
    setBulkDeleteModalOpen(true);
  };

  const handleDeleteAllConfirm = async () => {
    setIsDeletingAll(true);
    try {
      const response = await facilityService.deleteAllFacilities();
      refetch();
      setBulkDeleteModalOpen(false);
      
      const successMessage = (response as any)?.message || 'All facilities have been deleted successfully.';
      showNotification(successMessage, 'success');
    } catch (error: any) {
      console.error('Error deleting all facilities:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete all facilities. Please try again.';
      showNotification(errorMessage, 'error');
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleClearAllClick = () => {
    setIncludeUsers(false);
    setClearAllModalOpen(true);
  };

  const handleClearAllConfirm = async () => {
    setIsDeletingAll(true);
    try {
      const response = await facilityService.clearAllFacilities(includeUsers);
      refetch();
      setClearAllModalOpen(false);
      
      const successMessage = (response as any)?.message || 'All facilities have been cleared successfully.';
      showNotification(successMessage, 'success');
    } catch (error: any) {
      console.error('Error clearing all facilities:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to clear all facilities. Please try again.';
      showNotification(errorMessage, 'error');
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleCreate = () => {
    router.push('/admin/facilities/new');
  };

  // Only show loading on initial load, not during search/pagination
  if (authLoading || (isFacilitiesLoading && !facilitiesData)) {
    return (
      <div style={{ paddingTop: '4rem', paddingBottom: '4rem', textAlign: 'center' }}>
        <div className="container">
          <div className="spinner" style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3', 
            borderTop: '4px solid var(--primary-500)', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite', 
            margin: '0 auto' 
          }}></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading...</p>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (facilitiesError) {
    const apiError = (facilitiesError as any).response?.data?.message || (facilitiesError as any).message || "Failed to load data";
    return (
      <div style={{ paddingTop: '4rem', paddingBottom: '4rem', textAlign: 'center' }}>
        <div className="container">
          <div style={{ padding: '2rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', color: '#991B1B' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Error Loading Facilities</h3>
            <p>{apiError}</p>
            <button onClick={() => refetch()} style={{ 
              marginTop: '1rem', 
              padding: '0.5rem 1rem', 
              background: '#991B1B', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}>
              <RotateCw size={16} /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="container">
        {/* Header with Search and Post Button */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '2rem',
          gap: '1.5rem'
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ 
              fontSize: '2rem', 
              color: 'var(--gray-900)', 
              marginBottom: '0.5rem' 
            }}>
              Manage Facilities
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Total: {totalCount} facilities
            </p>
            {/* Search Input */}
            <div style={{
              position: 'relative',
              maxWidth: '400px'
            }}>
              <Search size={20} color="var(--gray-400)" style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }} />
              <input
                type="text"
                placeholder="Search by facility name or ID..."
                value={searchTerm}
                onChange={(e) => {
                  handleSearchChange(e.target.value);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 3rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  outline: 'none',
                  background: 'white',
                  transition: 'all 0.2s'
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
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleClearAllClick}
                className="btn-danger"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                  background: 'white',
                  border: '1px solid #FECACA',
                  borderRadius: '12px',
                  color: '#EA580C',
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FEF2F2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                }}
              >
                <Trash2 size={20} />
                Clear All
              </button>
              <button
                onClick={handleDeleteAllClick}
                className="btn-danger"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                  background: 'white',
                  border: '1px solid #FECACA',
                  borderRadius: '12px',
                  color: '#DC2626',
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FEF2F2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                }}
              >
                <Trash2 size={20} />
                Delete All
              </button>

              <button
                onClick={() => router.push('/admin/facilities/import')}
                className="btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                  background: 'white',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  color: 'var(--gray-700)',
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
              >
                <Plus size={20} />
                Bulk Import
              </button>
              <button
                onClick={handleCreate}
                className="btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  alignSelf: 'flex-start'
                }}
              >
                <Plus size={20} />
                Post New Facility
              </button>
            </div>
        </div>

        {/* Facilities Table */}
        <div className="glass" style={{ 
          borderRadius: '16px', 
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              background: 'white'
            }}>
              <thead>
                <tr style={{ 
                  background: 'var(--gray-50)', 
                  borderBottom: '2px solid var(--border-color)' 
                }}>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'left', 
                    fontWeight: 600, 
                    color: 'var(--gray-700)',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Facility ID
                  </th>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'left', 
                    fontWeight: 600, 
                    color: 'var(--gray-700)',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    <button
                      onClick={() => handleSort('name')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--gray-700)',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        padding: 0
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--primary-600)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--gray-700)';
                      }}
                    >
                      Name
                      {sortField === 'name' ? (
                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      ) : (
                        <ArrowUpDown size={14} style={{ opacity: 0.3 }} />
                      )}
                    </button>
                  </th>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'left', 
                    fontWeight: 600, 
                    color: 'var(--gray-700)',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    District
                  </th>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'left', 
                    fontWeight: 600, 
                    color: 'var(--gray-700)',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Type
                  </th>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'left', 
                    fontWeight: 600, 
                    color: 'var(--gray-700)',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Ownership
                  </th>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'left', 
                    fontWeight: 600, 
                    color: 'var(--gray-700)',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Status
                  </th>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'left', 
                    fontWeight: 600, 
                    color: 'var(--gray-700)',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    <button
                      onClick={() => handleSort('date')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--gray-700)',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        padding: 0
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--primary-600)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--gray-700)';
                      }}
                    >
                      Date Created
                      {sortField === 'date' ? (
                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      ) : (
                        <ArrowUpDown size={14} style={{ opacity: 0.3 }} />
                      )}
                    </button>
                  </th>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'right', 
                    fontWeight: 600, 
                    color: 'var(--gray-700)',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isFacilitiesLoading && facilities.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ 
                      padding: '3rem', 
                      textAlign: 'center', 
                      color: 'var(--text-secondary)' 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <div className="spinner" style={{ 
                          width: '20px', 
                          height: '20px', 
                          border: '2px solid #f3f3f3', 
                          borderTop: '2px solid var(--primary-500)', 
                          borderRadius: '50%', 
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        <span>Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : facilities.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ 
                      padding: '3rem', 
                      textAlign: 'center', 
                      color: 'var(--text-secondary)' 
                    }}>
                      No facilities found
                    </td>
                  </tr>
                ) : (
                  facilities.map((facility: HealthFacilityDTO, index: number) => (
                    <tr 
                      key={facility.healthFacilityId}
                      style={{ 
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--gray-50)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                      }}
                    >
                      <td style={{ padding: '1rem', color: 'var(--gray-700)' }}>
                        {facility.facilityId || `#${facility.healthFacilityId}`}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--gray-900)', fontWeight: 500 }}>
                        {facility.healthFacilityName || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--gray-700)' }}>
                        {facility.district?.districtName || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--gray-700)' }}>
                        {facility.facilityType?.typeName || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--gray-700)' }}>
                        {facility.ownership?.ownershipType || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: facility.operationalStatus?.statusName === 'Operational' 
                            ? '#D1FAE5' 
                            : facility.operationalStatus?.statusName === 'Closed'
                            ? '#FEE2E2'
                            : '#FEF3C7',
                          color: facility.operationalStatus?.statusName === 'Operational'
                            ? '#065F46'
                            : facility.operationalStatus?.statusName === 'Closed'
                            ? '#991B1B'
                            : '#92400E'
                        }}>
                          {facility.operationalStatus?.statusName || 'Unknown'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--gray-700)', fontSize: '0.875rem' }}>
                        {facility.createdAt ? new Date(facility.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'flex-end', 
                          gap: '0.5rem' 
                        }}>
                          <button
                            onClick={() => handleEdit(facility)}
                            style={{
                              padding: '0.5rem',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              background: 'white',
                              color: 'var(--primary-600)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--primary-50)';
                              e.currentTarget.style.borderColor = 'var(--primary-300)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'white';
                              e.currentTarget.style.borderColor = 'var(--border-color)';
                            }}
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(facility.healthFacilityId, facility.healthFacilityName || 'this facility')}
                            style={{
                              padding: '0.5rem',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              background: 'white',
                              color: '#DC2626',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#FEF2F2';
                              e.currentTarget.style.borderColor = '#FECACA';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'white';
                              e.currentTarget.style.borderColor = 'var(--border-color)';
                            }}
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ 
              padding: '1.5rem', 
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--gray-50)'
            }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Showing {startIndex + 1} to {Math.min(startIndex + pageSize, totalCount)} of {totalCount} facilities
              </div><div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPageNumber(1); // Reset to first page when size changes
                  }}
                  style={{
                    padding: '0.6rem 2.5rem 0.6rem 0.75rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'white',
                    fontSize: '0.9rem',
                    color: 'var(--gray-700)',
                    cursor: 'pointer',
                    outline: 'none',
                    appearance: 'none',
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1rem',
                  }}
                >
                  {[5, 10, 15, 25, 30, 50, 100].map(size => (
                    <option key={size} value={size}>{size} per page</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                  disabled={pageNumber === 1}
                  className="btn-primary"
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    opacity: pageNumber === 1 ? 0.5 : 1,
                    cursor: pageNumber === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
                  disabled={pageNumber === totalPages}
                  className="btn-primary"
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    opacity: pageNumber === totalPages ? 0.5 : 1,
                    cursor: pageNumber === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setFacilityToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        facilityName={facilityToDelete?.name}
      />

      <DeleteConfirmModal
        isOpen={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        onConfirm={handleDeleteAllConfirm}
        facilityName="ALL FACILITIES"
        isDeletingAll={isDeletingAll}
        message="Are you sure you want to delete ALL facilities? This action cannot be undone."
      />

      <DeleteConfirmModal
        isOpen={clearAllModalOpen}
        onClose={() => setClearAllModalOpen(false)}
        onConfirm={handleClearAllConfirm}
        facilityName="ALL FACILITIES"
        isDeletingAll={isDeletingAll}
        message="Are you sure you want to clear ALL facilities using the new clear method? This action cannot be undone."
        title="Clear All Facilities"
      >
        <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            cursor: 'pointer',
            padding: '0.75rem',
            background: includeUsers ? '#FEF2F2' : 'var(--gray-50)',
            border: `1px solid ${includeUsers ? '#FECACA' : 'var(--border-color)'}`,
            borderRadius: '8px',
            transition: 'all 0.2s'
          }}>
            <input 
              type="checkbox"
              checked={includeUsers}
              onChange={(e) => setIncludeUsers(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                cursor: 'pointer'
              }}
            />
            <span style={{ 
              fontWeight: 500, 
              color: includeUsers ? '#991B1B' : 'var(--gray-700)',
              fontSize: '0.95rem' 
            }}>
              Also delete all associated users?
            </span>
          </label>
        </div>
      </DeleteConfirmModal>
    </div>
  );
}
