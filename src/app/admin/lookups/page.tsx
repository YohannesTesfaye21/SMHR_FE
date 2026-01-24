"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { 
  useRegions, 
  useDistricts, 
  useFacilityTypes,
  useStates,
  useOwnerships,
  useOperationalStatuses
} from '@/hooks/useFacilities';
import { facilityService } from '@/services/facilityService';
import { Plus, Edit, Trash2, MapPin, LayoutGrid, ChevronRight, ChevronLeft, Search, ArrowLeft, RotateCw, Briefcase, CheckCircle } from 'lucide-react';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import Modal from '@/components/Modal';
import LookupFormModal from '@/components/LookupFormModal';

type LookupTab = 'states' | 'regions' | 'districts' | 'types' | 'ownerships' | 'operationalStatuses';

export default function LookupManagementPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<LookupTab>('states');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search term to trigger server-side fetch
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset pagination when switching tabs
  React.useEffect(() => {
    setPageNumber(1);
    setSearchQuery('');
    setDebouncedSearch('');
  }, [activeTab]);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any>(null);

  // Data fetching - using server-side search and pagination
  // Note: We use any here to avoid tanstack-query v4/v5 generic issues and because we're handling different return types dynamically.
  const { data: statesData, isLoading: statesLoading, refetch: refetchStates } = (useStates as any)({ searchTerm: debouncedSearch, pageNumber, pageSize }, { enabled: activeTab === 'states' });
  const { data: regionsData, isLoading: regionsLoading, refetch: refetchRegions } = (useRegions as any)(undefined, { searchTerm: debouncedSearch, pageNumber, pageSize }, { enabled: activeTab === 'regions' });
  const { data: districtsData, isLoading: districtsLoading, refetch: refetchDistricts } = (useDistricts as any)(undefined, { searchTerm: debouncedSearch, pageNumber, pageSize }, { enabled: activeTab === 'districts' });
  const { data: typesData, isLoading: typesLoading, refetch: refetchTypes } = (useFacilityTypes as any)({ searchTerm: debouncedSearch, pageNumber, pageSize }, { enabled: activeTab === 'types' });
  const { data: ownershipsData, isLoading: ownershipsLoading, refetch: refetchOwnerships } = (useOwnerships as any)({ searchTerm: debouncedSearch, pageNumber, pageSize }, { enabled: activeTab === 'ownerships' });
  const { data: operationalStatusesData, isLoading: operationalStatusesLoading, refetch: refetchOperationalStatuses } = (useOperationalStatuses as any)({ searchTerm: debouncedSearch, pageNumber, pageSize }, { enabled: activeTab === 'operationalStatuses' });

  if (authLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const isLoading = 
    (activeTab === 'states' && statesLoading) || 
    (activeTab === 'regions' && regionsLoading) || 
    (activeTab === 'districts' && districtsLoading) || 
    (activeTab === 'types' && typesLoading) ||
    (activeTab === 'ownerships' && ownershipsLoading) ||
    (activeTab === 'operationalStatuses' && operationalStatusesLoading);

  // Get items based on active tab
  const getItems = () => {
    switch (activeTab) {
      case 'states': return (statesData as any)?.data?.items || [];
      case 'regions': return (regionsData as any)?.data?.items || [];
      case 'districts': return (districtsData as any)?.data?.items || [];
      case 'types': return (typesData as any)?.data?.items || [];
      case 'ownerships': return (ownershipsData as any)?.data?.items || [];
      case 'operationalStatuses': return (operationalStatusesData as any)?.data?.items || [];
      default: return [];
    }
  };

  const getPaginationData = () => {
    switch (activeTab) {
      case 'states': return (statesData as any)?.data;
      case 'regions': return (regionsData as any)?.data;
      case 'districts': return (districtsData as any)?.data;
      case 'types': return (typesData as any)?.data;
      case 'ownerships': return (ownershipsData as any)?.data;
      case 'operationalStatuses': return (operationalStatusesData as any)?.data;
      default: return null;
    }
  };

  const filteredItems = getItems();
  const paginationData = getPaginationData();
  const totalCount = paginationData?.totalCount || 0;
  const totalPages = paginationData?.totalPages || 1;

  const handleDeleteClick = (id: number, name: string) => {
    setItemToDelete({ id, name });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      switch (activeTab) {
        case 'states':
          await facilityService.deleteState(itemToDelete.id);
          refetchStates();
          break;
        case 'regions':
          await facilityService.deleteRegion(itemToDelete.id);
          refetchRegions();
          break;
        case 'districts':
          await facilityService.deleteDistrict(itemToDelete.id);
          refetchDistricts();
          break;
        case 'types':
          await facilityService.deleteFacilityType(itemToDelete.id);
          refetchTypes();
          break;
        case 'ownerships':
          await facilityService.deleteOwnership(itemToDelete.id);
          refetchOwnerships();
          break;
        case 'operationalStatuses':
          await facilityService.deleteOperationalStatus(itemToDelete.id);
          refetchOperationalStatuses();
          break;
      }
      showNotification(`${itemToDelete.name} deleted successfully`, 'success');
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error: any) {
      console.error('Delete failed:', error);
      showNotification(error.response?.data?.message || 'Failed to delete item', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const tabs = [
    { id: 'states', label: 'States', icon: <MapPin size={20} /> },
    { id: 'regions', label: 'Regions', icon: <ChevronRight size={20} /> },
    { id: 'districts', label: 'Districts', icon: <ChevronRight size={20} /> },
    { id: 'types', label: 'Facility Types', icon: <LayoutGrid size={20} /> },
    { id: 'ownerships', label: 'Ownership', icon: <Briefcase size={20} /> },
    { id: 'operationalStatuses', label: 'Operational Status', icon: <CheckCircle size={20} /> },
  ];

  const getActiveTabLabel = () => {
    if (activeTab === 'types') return 'Facility Type';
    if (activeTab === 'ownerships') return 'Ownership';
    if (activeTab === 'operationalStatuses') return 'Operational Status';
    return activeTab.slice(0, -1).replace('ie', 'y');
  };

  const getTableColSpan = () => {
    if (activeTab === 'regions' || activeTab === 'districts') return 5;
    return 4;
  };

  const getTabPluralLabel = () => {
    if (activeTab === 'operationalStatuses') return 'operational statuses';
    if (activeTab === 'ownerships') return 'ownership';
    return activeTab;
  };

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Header Section */}
      <div style={{ 
        background: 'white', 
        padding: '2.5rem 0', 
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '2rem'
      }}>
        <div className="container">
          <button 
            onClick={() => router.push('/admin')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: 'var(--text-secondary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '1rem',
              fontSize: '0.9rem',
              padding: 0
            }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                Lookup Management
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                Manage registry core data: States, Regions, Districts, Types, Ownership and Operational Status
              </p>
            </div>
            
            <button 
              className="btn-primary"
              onClick={() => {
                setItemToEdit(null);
                setFormModalOpen(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={20} />
              Add New {getActiveTabLabel()}
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem',
          padding: '0.5rem',
          background: 'var(--gray-50)',
          borderRadius: '16px',
          width: 'fit-content',
          flexWrap: 'wrap'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as LookupTab);
                setSearchQuery('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === tab.id ? 'white' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary-600)' : 'var(--gray-500)',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: activeTab === tab.id ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search - Commented out as requested but kept functionality */}
        {/* 
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                <Search size={20} style={{ 
                    position: 'absolute', 
                    left: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: 'var(--gray-400)'
                }} />
                <input 
                    type="text" 
                    placeholder={`Search ${activeTab}...`}
                    style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.8rem',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.95rem',
                        outline: 'none',
                        background: 'white'
                    }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Total: <b>{totalCount}</b> {activeTab}
            </div>
        </div>
        */}

        {/* Table Section */}
        <div style={{ 
            background: 'white', 
            borderRadius: '20px', 
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }}>
            <table key={activeTab} style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>ID</th>
                        <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Name</th>
                        {activeTab === 'regions' && <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>State</th>}
                        {activeTab === 'districts' && <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Region</th>}
                        <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Created At</th>
                        <th style={{ textAlign: 'right', padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                </thead>
                <tbody style={{ position: 'relative' }}>
                    {isLoading ? (
                        <tr>
                            <td colSpan={getTableColSpan()} style={{ padding: '4rem', textAlign: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
                                    <RotateCw size={32} className="animate-spin" />
                                    <span>Loading {activeTab}...</span>
                                </div>
                            </td>
                        </tr>
                    ) : filteredItems.length > 0 ? (
                        filteredItems.map((item: any) => {
                            const id = item.stateId ?? item.regionId ?? item.districtId ?? item.facilityTypeId ?? item.ownershipId ?? item.operationalStatusId;
                            const name = item.stateName ?? item.regionName ?? item.districtName ?? item.typeName ?? item.ownershipType ?? item.statusName;
                            return (
                                <tr key={id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1.25rem 1.5rem', color: 'var(--gray-500)', fontSize: '0.9rem' }}>#{id}</td>
                                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--gray-900)' }}>{name}</td>
                                    {activeTab === 'regions' && (
                                        <td style={{ padding: '1.25rem 1.5rem', color: 'var(--gray-700)' }}>
                                            {item.state?.stateName || <span style={{ color: 'var(--gray-400)', fontStyle: 'italic' }}>N/A</span>}
                                        </td>
                                    )}
                                    {activeTab === 'districts' && (
                                        <td style={{ padding: '1.25rem 1.5rem', color: 'var(--gray-700)' }}>
                                            {item.region?.regionName || <span style={{ color: 'var(--gray-400)', fontStyle: 'italic' }}>N/A</span>}
                                        </td>
                                    )}
                                    <td style={{ padding: '1.25rem 1.5rem', color: 'var(--gray-500)', fontSize: '0.9rem' }}>
                                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button 
                                                className="btn-icon" 
                                                title="Edit"
                                                onClick={() => {
                                                  setItemToEdit(item);
                                                  setFormModalOpen(true);
                                                }}
                                                style={{ padding: '0.5rem', color: 'var(--primary-600)' }}
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button 
                                                className="btn-icon" 
                                                title="Delete"
                                                onClick={() => handleDeleteClick(id, name)}
                                                style={{ padding: '0.5rem', color: '#DC2626' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={getTableColSpan()} style={{ padding: '4rem', textAlign: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--gray-400)' }}>
                                    <Search size={48} style={{ opacity: 0.2 }} />
                                    <h3>No {activeTab.replace('operationalStatuses', 'operational statuses').replace('ownerships', 'ownership')} found</h3>
                                    <p>Try adjusting your search query.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={{ 
                    padding: '1.25rem 1.5rem', 
                    background: 'var(--gray-50)', 
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                        Showing <b>{(pageNumber - 1) * pageSize + 1}</b> to <b>{Math.min(pageNumber * pageSize, totalCount)}</b> of <b>{totalCount}</b> {getTabPluralLabel()}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Rows per page:</span>
                            <select 
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setPageNumber(1);
                                }}
                                style={{
                                    padding: '0.4rem 0.6rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    background: 'white',
                                    fontSize: '0.875rem',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {[5, 10, 20, 50].map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button 
                                disabled={pageNumber === 1}
                                onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                                style={{
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    background: 'white',
                                    fontSize: '0.875rem',
                                    color: pageNumber === 1 ? 'var(--gray-300)' : 'var(--gray-700)',
                                    cursor: pageNumber === 1 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <ChevronLeft size={16} />
                                Previous
                            </button>
                            <div style={{ color: 'var(--gray-700)', fontSize: '0.875rem', fontWeight: 500, padding: '0 0.5rem' }}>
                                Page {pageNumber} of {totalPages}
                            </div>
                            <button 
                                disabled={pageNumber >= totalPages}
                                onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
                                style={{
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    background: 'white',
                                    fontSize: '0.875rem',
                                    color: pageNumber >= totalPages ? 'var(--gray-300)' : 'var(--gray-700)',
                                    cursor: pageNumber >= totalPages ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      <DeleteConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${getActiveTabLabel()}`}
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone and may affect related data.`}
        isDeletingAll={isDeleting}
      />

      <LookupFormModal 
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        type={activeTab}
        item={itemToEdit}
        onSuccess={() => {
          switch (activeTab) {
            case 'states': refetchStates(); break;
            case 'regions': refetchRegions(); break;
            case 'districts': refetchDistricts(); break;
            case 'types': refetchTypes(); break;
            case 'ownerships': refetchOwnerships(); break;
            case 'operationalStatuses': refetchOperationalStatuses(); break;
          }
        }}
      />

      <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
