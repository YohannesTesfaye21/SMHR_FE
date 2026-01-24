'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { facilityService } from '@/services/facilityService';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import OSMPlaceSearch from '@/components/OSMPlaceSearch';

export default function NewFacilityPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    facilityId: '',
    healthFacilityName: '',
    latitude: '',
    longitude: '',
    stateId: '',
    regionId: '',
    districtId: '',
    facilityTypeId: '',
    ownershipId: '',
    operationalStatusId: '',
    hcPartners: '',
    hcProjectEndDate: '',
    nutritionClusterPartners: '',
    damalCaafimaadPartner: '',
    damalCaafimaadProjectEndDate: '',
    betterLifeProjectPartner: '',
    betterLifeProjectEndDate: '',
    caafimaadPlusPartner: '',
    caafimaadPlusProjectEndDate: '',
    facilityInChargeName: '',
    facilityInChargeNumber: '',
  });

  // Fetch lookup data
  const { data: statesData } = useQuery({
    queryKey: ['states'],
    queryFn: () => facilityService.getStates(),
  });

  const { data: regionsData } = useQuery({
    queryKey: ['regions', formData.stateId],
    queryFn: () => facilityService.getRegions(formData.stateId ? Number(formData.stateId) : undefined),
    enabled: !!formData.stateId,
  });

  const { data: districtsData } = useQuery({
    queryKey: ['districts', formData.regionId],
    queryFn: () => facilityService.getDistricts(formData.regionId ? Number(formData.regionId) : undefined),
    enabled: !!formData.regionId,
  });

  const { data: facilityTypesData } = useQuery({
    queryKey: ['facilityTypes'],
    queryFn: () => facilityService.getFacilityTypes(),
  });

  const { data: ownershipsData } = useQuery({
    queryKey: ['ownerships'],
    queryFn: () => facilityService.getOwnerships(),
  });

  const { data: operationalStatusesData } = useQuery({
    queryKey: ['operationalStatuses'],
    queryFn: () => facilityService.getOperationalStatuses(),
  });

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Reset dependent dropdowns when parent changes
      if (name === 'stateId') {
        updated.regionId = '';
        updated.districtId = '';
      } else if (name === 'regionId') {
        updated.districtId = '';
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Prepare request body - IDs for lookups (ownership, operationalStatus), districtId, facilityTypeId
      const requestBody: any = {
        facilityId: formData.facilityId || null,
        healthFacilityName: formData.healthFacilityName || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        districtId: formData.districtId ? Number(formData.districtId) : null,
        facilityTypeId: formData.facilityTypeId ? Number(formData.facilityTypeId) : null,
        ownershipId: formData.ownershipId ? Number(formData.ownershipId) : null,
        operationalStatusId: formData.operationalStatusId ? Number(formData.operationalStatusId) : null,
        hcPartners: formData.hcPartners || null,
        hcProjectEndDate: formData.hcProjectEndDate || null,
        nutritionClusterPartners: formData.nutritionClusterPartners || null,
        damalCaafimaadPartner: formData.damalCaafimaadPartner || null,
        damalCaafimaadProjectEndDate: formData.damalCaafimaadProjectEndDate || null,
        betterLifeProjectPartner: formData.betterLifeProjectPartner || null,
        betterLifeProjectEndDate: formData.betterLifeProjectEndDate || null,
        caafimaadPlusPartner: formData.caafimaadPlusPartner || null,
        caafimaadPlusProjectEndDate: formData.caafimaadPlusProjectEndDate || null,
        facilityInChargeName: formData.facilityInChargeName || null,
        facilityInChargeNumber: formData.facilityInChargeNumber || null,
      };

      // Log request model before sending
      console.log('📤 CREATE FACILITY REQUEST MODEL:');
      console.log(JSON.stringify(requestBody, null, 2));
      console.log('Raw request body:', requestBody);

      const response = await facilityService.createFacility(requestBody);
      
      // Log successful response
      console.log('✅ CREATE FACILITY RESPONSE:');
      console.log('Response:', response);
      console.log('Response data:', JSON.stringify(response, null, 2));
      
      // Redirect to admin page after successful creation
      router.push('/admin');
    } catch (err: any) {
      // Log error details
      console.error('❌ ERROR CREATING FACILITY:');
      console.error('Error object:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);
      console.error('Error response headers:', err.response?.headers);
      console.error('Request config:', err.config);
      console.error('Full error details:', JSON.stringify(err.response?.data || err, null, 2));
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create facility. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ paddingTop: '4rem', paddingBottom: '4rem', textAlign: 'center' }}>
        <div className="container">
          <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary-500)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading...</p>
          <style dangerouslySetInnerHTML={{__html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const states = statesData?.data?.items || [];
  const regions = regionsData?.data?.items || [];
  const districts = districtsData?.data?.items || [];
  const facilityTypes = facilityTypesData?.data?.items || [];
  const ownerships = ownershipsData?.data?.items || [];
  const operationalStatuses = operationalStatusesData?.data?.items || [];

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => router.back()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              marginBottom: '1rem',
              background: 'white',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'var(--gray-700)',
              fontSize: '0.875rem'
            }}
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <h1 style={{ fontSize: '2rem', color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
            Create New Facility
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Fill in the form below to add a new health facility to the registry
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#991b1b'
          }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: '0.875rem' }}>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
          {/* Basic Information */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--gray-900)' }}>Basic Information</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  Facility ID <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  name="facilityId"
                  value={formData.facilityId}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  Facility Name <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  name="healthFacilityName"
                  value={formData.healthFacilityName}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* OSM Place Search */}
            <OSMPlaceSearch
              latitude={formData.latitude ? parseFloat(formData.latitude) : null}
              longitude={formData.longitude ? parseFloat(formData.longitude) : null}
              onLocationSelect={(lat, lng) => {
                setFormData(prev => ({
                  ...prev,
                  latitude: lat.toString(),
                  longitude: lng.toString()
                }));
              }}
            />
          </div>

          {/* Location */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--gray-900)' }}>Location</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  State <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  name="stateId"
                  value={formData.stateId}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    background: 'white'
                  }}
                >
                  <option value="">Select State</option>
                  {states.map((state: any) => (
                    <option key={state.stateId} value={state.stateId}>{state.stateName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  Region
                </label>
                <select
                  name="regionId"
                  value={formData.regionId}
                  onChange={handleChange}
                  disabled={!formData.stateId}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    background: formData.stateId ? 'white' : 'var(--gray-50)',
                    cursor: formData.stateId ? 'pointer' : 'not-allowed'
                  }}
                >
                  <option value="">Select Region</option>
                  {regions.map((region: any) => (
                    <option key={region.regionId} value={region.regionId}>{region.regionName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  District <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  name="districtId"
                  value={formData.districtId}
                  onChange={handleChange}
                  required
                  disabled={!formData.regionId}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    background: formData.regionId ? 'white' : 'var(--gray-50)',
                    cursor: formData.regionId ? 'pointer' : 'not-allowed'
                  }}
                >
                  <option value="">Select District</option>
                  {districts.map((district: any) => (
                    <option key={district.districtId} value={district.districtId}>{district.districtName}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Type & Status */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--gray-900)' }}>Type & Status</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  Facility Type <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  name="facilityTypeId"
                  value={formData.facilityTypeId}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    background: 'white'
                  }}
                >
                  <option value="">Select Facility Type</option>
                  {facilityTypes.map((type: any) => (
                    <option key={type.facilityTypeId} value={type.facilityTypeId}>{type.typeName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  Ownership
                </label>
                <select
                  name="ownershipId"
                  value={formData.ownershipId}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    background: 'white'
                  }}
                >
                  <option value="">Select Ownership</option>
                  {ownerships.map((o: { ownershipId: number; ownershipType: string }) => (
                    <option key={o.ownershipId} value={o.ownershipId}>{o.ownershipType}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  Operational Status
                </label>
                <select
                  name="operationalStatusId"
                  value={formData.operationalStatusId}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    background: 'white'
                  }}
                >
                  <option value="">Select Status</option>
                  {operationalStatuses.map((s: { operationalStatusId: number; statusName: string }) => (
                    <option key={s.operationalStatusId} value={s.operationalStatusId}>{s.statusName}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Partners */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--gray-900)' }}>Partners</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  HC Partners
                </label>
                <input
                  type="text"
                  name="hcPartners"
                  value={formData.hcPartners}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  HC Project End Date
                </label>
                <input
                  type="date"
                  name="hcProjectEndDate"
                  value={formData.hcProjectEndDate}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  Nutrition Cluster Partners
                </label>
                <input
                  type="text"
                  name="nutritionClusterPartners"
                  value={formData.nutritionClusterPartners}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  Damal Caafimaad Partner
                </label>
                <input
                  type="text"
                  name="damalCaafimaadPartner"
                  value={formData.damalCaafimaadPartner}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  Damal Caafimaad Project End Date
                </label>
                <input
                  type="date"
                  name="damalCaafimaadProjectEndDate"
                  value={formData.damalCaafimaadProjectEndDate}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  Better Life Project Partner
                </label>
                <input
                  type="text"
                  name="betterLifeProjectPartner"
                  value={formData.betterLifeProjectPartner}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  Better Life Project End Date
                </label>
                <input
                  type="date"
                  name="betterLifeProjectEndDate"
                  value={formData.betterLifeProjectEndDate}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  Caafimaad Plus Partner
                </label>
                <input
                  type="text"
                  name="caafimaadPlusPartner"
                  value={formData.caafimaadPlusPartner}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  Caafimaad Plus Project End Date
                </label>
                <input
                  type="date"
                  name="caafimaadPlusProjectEndDate"
                  value={formData.caafimaadPlusProjectEndDate}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--gray-900)' }}>Contact Information</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  Facility In-Charge Name
                </label>
                <input
                  type="text"
                  name="facilityInChargeName"
                  value={formData.facilityInChargeName}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  Facility In-Charge Number
                </label>
                <input
                  type="text"
                  name="facilityInChargeNumber"
                  value={formData.facilityInChargeNumber}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                background: 'white',
                color: 'var(--gray-700)',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '8px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {isSubmitting ? (
                <>
                  <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Create Facility
                </>
              )}
            </button>
            <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </form>
      </div>
    </div>
  );
}
