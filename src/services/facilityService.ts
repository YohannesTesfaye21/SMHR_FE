import apiClient from '@/lib/apiClient';
import { 
  HealthFacilityDTOApiPagedResponse, 
  HealthFacilityDTOApiResponse, 
  FacilityFilterParams,
  RegionApiPagedResponse,
  DistrictApiPagedResponse,
  FacilityTypeApiPagedResponse,
  StateApiPagedResponse,
  CardDataApiResponse,
  ChartDataListApiResponse,
  StateStatisticsListApiResponse,
  TopRegionListApiResponse,
  ApiResponse
} from '@/types/apiTypes';

export const facilityService = {
  getFacilities: async (params?: FacilityFilterParams) => {
    return apiClient.get<any, HealthFacilityDTOApiPagedResponse>('/api/HealthFacilities', { params });
  },

  getFacilityById: async (id: number) => {
    return apiClient.get<any, HealthFacilityDTOApiResponse>(`/api/HealthFacilities/${id}`);
  },

  // Lookup API helpers for filters
  getStates: async () => {
    return apiClient.get<any, StateApiPagedResponse>('/api/LookupTables/states?pageSize=100');
  },

  getRegions: async (stateId?: number) => {
    const params = { pageSize: 100, ...(stateId && { stateId }) };
    return apiClient.get<any, RegionApiPagedResponse>('/api/LookupTables/regions', { params });
  },

  getDistricts: async (regionId?: number) => {
    const params = { pageSize: 100, ...(regionId && { regionId }) };
    return apiClient.get<any, DistrictApiPagedResponse>('/api/LookupTables/districts', { params });
  },

  getFacilityTypes: async () => {
    return apiClient.get<any, FacilityTypeApiPagedResponse>('/api/LookupTables/facility-types?pageSize=100');
  },

  // Dashboard APIs
  getDashboardCards: async () => {
    return apiClient.get<any, CardDataApiResponse>('/api/Dashboard/cards');
  },

  getDashboardChart: async (type: 'bar' | 'pie', groupBy: 'region' | 'district' | 'type') => {
    const endpoint = type === 'bar' ? '/api/Dashboard/barchart' : '/api/Dashboard/piechart';
    return apiClient.get<any, ChartDataListApiResponse>(endpoint, { params: { groupBy } });
  },

  getDashboardStateStats: async (stateId?: number) => {
    const endpoint = stateId ? `/api/Dashboard/state-statistics/${stateId}` : '/api/Dashboard/state-statistics';
    // Note: The endpoint returns a single object if stateId is provided, but a list otherwise. 
    // Handled by return type polymorphism or specific methods if needed. 
    // Based on swagger, list returns StateStatisticsDTOListApiResponse.
    // Single ID might return StateStatisticsDTOApiResponse. 
    // For now assuming list for the main dashboard view.
    return apiClient.get<any, StateStatisticsListApiResponse>('/api/Dashboard/state-statistics');
  },

  getTopRegions: async () => {
    return apiClient.get<any, TopRegionListApiResponse>('/api/Dashboard/top-regions');
  },

  // Admin APIs - Create, Update, Delete
  createFacility: async (data: any) => {
    return apiClient.post<any, HealthFacilityDTOApiResponse>('/api/HealthFacilities', data);
  },

  updateFacility: async (id: number, data: any) => {
    return apiClient.put<any, HealthFacilityDTOApiResponse>(`/api/HealthFacilities/${id}`, data);
  },

  deleteFacility: async (id: number) => {
    return apiClient.delete<any, ApiResponse<null>>(`/api/HealthFacilities/${id}`);
  }
};
