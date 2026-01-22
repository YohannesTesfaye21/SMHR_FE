"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { 
  useRegions, 
  useDistricts, 
  useFacilityTypes,
  useStates 
} from '@/hooks/useFacilities';
import { facilityService } from '@/services/facilityService';
import { Plus, Edit, Trash2, MapPin, LayoutGrid, ChevronRight, Search, ArrowLeft, RotateCw } from 'lucide-react';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import Modal from '@/components/Modal';
import LookupFormModal from '@/components/LookupFormModal';

type LookupTab = 'states' | 'regions' | 'districts' | 'types';

export default function LookupManagementPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<LookupTab>('states');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any>(null);

  // Data fetching
  const { data: statesData, isLoading: statesLoading, refetch: refetchStates } = useStates();
  const { data: regionsData, isLoading: regionsLoading, refetch: refetchRegions } = useRegions();
  const { data: districtsData, isLoading: districtsLoading, refetch: refetchDistricts } = useDistricts();
  const { data: typesData, isLoading: typesLoading, refetch: refetchTypes } = useFacilityTypes();

  if (authLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const isLoading = statesLoading || regionsLoading || districtsLoading || typesLoading;

  // Get items based on active tab
  const getItems = () => {
    switch (activeTab) {
      case 'states': return statesData?.data?.items || [];
      case 'regions': return regionsData?.data?.items || [];
      case 'districts': return districtsData?.data?.items || [];
      case 'types': return typesData?.data?.items || [];
      default: return [];
    }
  };

  const allItems = getItems();
  const filteredItems = allItems.filter((item: any) => {
    const name = item.stateName || item.regionName || item.districtName || item.typeName || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
  ];

  const getActiveTabLabel = () => {
    return activeTab === 'types' ? 'Facility Type' : activeTab.slice(0, -1).replace('ie', 'y');
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
                Manage registry core data: States, Regions, Districts and Types
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

        {/* Search */}
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
                Total: <b>{filteredItems.length}</b> {activeTab}
            </div>
        </div>

        {/* Table Section */}
        <div style={{ 
            background: 'white', 
            borderRadius: '20px', 
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                            <td colSpan={6} style={{ padding: '4rem', textAlign: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
                                    <RotateCw size={32} className="animate-spin" />
                                    <span>Loading {activeTab}...</span>
                                </div>
                            </td>
                        </tr>
                    ) : filteredItems.length > 0 ? (
                        filteredItems.map((item: any) => {
                            const id = item.stateId || item.regionId || item.districtId || item.facilityTypeId;
                            const name = item.stateName || item.regionName || item.districtName || item.typeName;
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
                                        {new Date(item.createdAt).toLocaleDateString()}
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
                            <td colSpan={6} style={{ padding: '4rem', textAlign: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--gray-400)' }}>
                                    <Search size={48} style={{ opacity: 0.2 }} />
                                    <h3>No {activeTab} found</h3>
                                    <p>Try adjusting your search query.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
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
