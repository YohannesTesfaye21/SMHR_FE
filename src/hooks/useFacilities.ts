import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { facilityService } from '@/services/facilityService';
import { 
  FacilityFilterParams, 
  HealthFacilityDTOApiPagedResponse,
  StateApiPagedResponse,
  RegionApiPagedResponse,
  DistrictApiPagedResponse,
  FacilityTypeApiPagedResponse
} from '@/types/apiTypes';

export const useFacilities = (params?: FacilityFilterParams): UseQueryResult<HealthFacilityDTOApiPagedResponse> => {
  return useQuery<HealthFacilityDTOApiPagedResponse>({
    queryKey: ['facilities', params],
    queryFn: () => facilityService.getFacilities(params),
  });
};

export const useFacility = (id: number): UseQueryResult<any> => {
  return useQuery<any>({
    queryKey: ['facility', id],
    queryFn: () => facilityService.getFacilityById(id),
    enabled: !!id,
  });
};

export const useRegions = (stateId?: number, params?: { searchTerm?: string; pageNumber?: number; pageSize?: number }, options?: any): UseQueryResult<RegionApiPagedResponse> => {
  return useQuery<RegionApiPagedResponse>({
    queryKey: ['regions', stateId, params],
    queryFn: () => facilityService.getRegions(stateId, params),
    ...options
  });
};

export const useDistricts = (regionId?: number, params?: { searchTerm?: string; pageNumber?: number; pageSize?: number }, options?: any): UseQueryResult<DistrictApiPagedResponse> => {
  return useQuery<DistrictApiPagedResponse>({
    queryKey: ['districts', regionId, params],
    queryFn: () => facilityService.getDistricts(regionId, params),
    ...options
  });
};

export const useFacilityTypes = (params?: { searchTerm?: string; pageNumber?: number; pageSize?: number }, options?: any): UseQueryResult<FacilityTypeApiPagedResponse> => {
  return useQuery<FacilityTypeApiPagedResponse>({
    queryKey: ['facilityTypes', params],
    queryFn: () => facilityService.getFacilityTypes(params),
    ...options
  });
};

export const useStates = (params?: { searchTerm?: string; pageNumber?: number; pageSize?: number }, options?: any): UseQueryResult<StateApiPagedResponse> => {
  return useQuery<StateApiPagedResponse>({
    queryKey: ['states', params],
    queryFn: () => facilityService.getStates(params),
    ...options
  });
};
