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
  ApiResponse,
  StateApiResponse,
  RegionApiResponse,
  DistrictApiResponse,
  FacilityTypeApiResponse,
  State,
  Region,
  District,
  FacilityType
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
  },

  deleteAllFacilities: async () => {
    return apiClient.delete<any, any>('/api/HealthFacilities/all');
  },

  // State CRUD
  createState: async (data: Partial<State>) => {
    return apiClient.post<any, StateApiResponse>('/api/LookupTables/states', data);
  },
  updateState: async (id: number, data: Partial<State>) => {
    return apiClient.put<any, ApiResponse<null>>(`/api/LookupTables/states/${id}`, data);
  },
  deleteState: async (id: number) => {
    return apiClient.delete<any, ApiResponse<null>>(`/api/LookupTables/states/${id}`);
  },

  // Region CRUD
  createRegion: async (data: Partial<Region>) => {
    return apiClient.post<any, RegionApiResponse>('/api/LookupTables/regions', data);
  },
  updateRegion: async (id: number, data: Partial<Region>) => {
    return apiClient.put<any, ApiResponse<null>>(`/api/LookupTables/regions/${id}`, data);
  },
  deleteRegion: async (id: number) => {
    return apiClient.delete<any, ApiResponse<null>>(`/api/LookupTables/regions/${id}`);
  },

  // District CRUD
  createDistrict: async (data: Partial<District>) => {
    return apiClient.post<any, DistrictApiResponse>('/api/LookupTables/districts', data);
  },
  updateDistrict: async (id: number, data: Partial<District>) => {
    return apiClient.put<any, ApiResponse<null>>(`/api/LookupTables/districts/${id}`, data);
  },
  deleteDistrict: async (id: number) => {
    return apiClient.delete<any, ApiResponse<null>>(`/api/LookupTables/districts/${id}`);
  },

  // Facility Type CRUD
  createFacilityType: async (data: Partial<FacilityType>) => {
    return apiClient.post<any, FacilityTypeApiResponse>('/api/LookupTables/facility-types', data);
  },
  updateFacilityType: async (id: number, data: Partial<FacilityType>) => {
    return apiClient.put<any, ApiResponse<null>>(`/api/LookupTables/facility-types/${id}`, data);
  },
  deleteFacilityType: async (id: number) => {
    return apiClient.delete<any, ApiResponse<null>>(`/api/LookupTables/facility-types/${id}`);
  }
};
