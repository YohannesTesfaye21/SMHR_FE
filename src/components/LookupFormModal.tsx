'use client';

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useStates, useRegions } from '@/hooks/useFacilities';
import { facilityService } from '@/services/facilityService';
import { useNotification } from '@/contexts/NotificationContext';
import { RotateCw } from 'lucide-react';

interface LookupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'states' | 'regions' | 'districts' | 'types' | 'ownerships' | 'operationalStatuses';
  item?: any;
  onSuccess: () => void;
}

export default function LookupFormModal({
  isOpen,
  onClose,
  type,
  item,
  onSuccess
}: LookupFormModalProps) {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

  // Fetch parent options if needed
  const { data: statesData } = useStates();
  const { data: regionsData } = useRegions(formData.stateId);

  const isEdit = !!item;

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({});
    }
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      switch (type) {
        case 'states':
          if (isEdit) response = await facilityService.updateState(item.stateId, formData);
          else response = await facilityService.createState(formData);
          break;
        case 'regions':
          if (isEdit) response = await facilityService.updateRegion(item.regionId, formData);
          else response = await facilityService.createRegion(formData);
          break;
        case 'districts':
          if (isEdit) response = await facilityService.updateDistrict(item.districtId, formData);
          else response = await facilityService.createDistrict(formData);
          break;
        case 'types':
          if (isEdit) response = await facilityService.updateFacilityType(item.facilityTypeId, formData);
          else response = await facilityService.createFacilityType(formData);
          break;
        case 'ownerships':
          if (isEdit) response = await facilityService.updateOwnership(item.ownershipId, formData);
          else response = await facilityService.createOwnership(formData);
          break;
        case 'operationalStatuses':
          if (isEdit) response = await facilityService.updateOperationalStatus(item.operationalStatusId, formData);
          else response = await facilityService.createOperationalStatus(formData);
          break;
      }

      const label = type === 'types' ? 'Facility type' : type === 'ownerships' ? 'Ownership' : type === 'operationalStatuses' ? 'Operational status' : type.slice(0, -1).replace('ie', 'y');
      showNotification(`${label} ${isEdit ? 'updated' : 'created'} successfully`, 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Submit failed:', error);
      showNotification(error.response?.data?.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    const label = type === 'types' ? 'Facility Type' : type === 'ownerships' ? 'Ownership' : type === 'operationalStatuses' ? 'Operational Status' : type.slice(0, -1).replace('ie', 'y');
    return `${isEdit ? 'Edit' : 'Add New'} ${label}`;
  };

  const getFieldLabel = () => {
    if (type === 'types') return 'Type Name';
    if (type === 'ownerships') return 'Ownership Type';
    if (type === 'operationalStatuses') return 'Status Name';
    return `${type.slice(0, -1).replace('ie', 'y')} Name`;
  };

  const getFieldValue = () => {
    if (type === 'states') return formData.stateName || '';
    if (type === 'regions') return formData.regionName || '';
    if (type === 'districts') return formData.districtName || '';
    if (type === 'types') return formData.typeName || '';
    if (type === 'ownerships') return formData.ownershipType || '';
    if (type === 'operationalStatuses') return formData.statusName || '';
    return '';
  };

  const setFieldValue = (val: string) => {
    if (type === 'states') setFormData({ ...formData, stateName: val });
    else if (type === 'regions') setFormData({ ...formData, regionName: val });
    else if (type === 'districts') setFormData({ ...formData, districtName: val });
    else if (type === 'types') setFormData({ ...formData, typeName: val });
    else if (type === 'ownerships') setFormData({ ...formData, ownershipType: val });
    else if (type === 'operationalStatuses') setFormData({ ...formData, statusName: val });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Name Field */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
            {getFieldLabel()}
          </label>
          <input
            type="text"
            required
            placeholder="Enter name..."
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              fontSize: '0.95rem',
              outline: 'none'
            }}
            value={getFieldValue()}
            onChange={(e) => setFieldValue(e.target.value)}
          />
        </div>

        {/* Parent State Field (for Region and District) */}
        {(type === 'regions' || type === 'districts') && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
              Select State
            </label>
            <select
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '0.95rem',
                background: 'white',
                outline: 'none'
              }}
              value={formData.stateId || ''}
              onChange={(e) => setFormData({ ...formData, stateId: Number(e.target.value), regionId: undefined })}
            >
              <option value="">Select State</option>
              {statesData?.data?.items?.map((state: any) => (
                <option key={state.stateId} value={state.stateId}>{state.stateName}</option>
              ))}
            </select>
          </div>
        )}

        {/* Parent Region Field (for District) */}
        {type === 'districts' && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
              Select Region
            </label>
            <select
              required
              disabled={!formData.stateId}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '0.95rem',
                background: formData.stateId ? 'white' : 'var(--gray-50)',
                outline: 'none'
              }}
              value={formData.regionId || ''}
              onChange={(e) => setFormData({ ...formData, regionId: Number(e.target.value) })}
            >
              <option value="">Select Region</option>
              {regionsData?.data?.items?.map((region: any) => (
                <option key={region.regionId} value={region.regionId}>{region.regionName}</option>
              ))}
            </select>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'white',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              minWidth: '120px',
              justifyContent: 'center'
            }}
          >
            {loading ? <RotateCw size={18} className="animate-spin" /> : (isEdit ? 'Save Changes' : 'Create')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
