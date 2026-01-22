import { useQuery } from '@tanstack/react-query';
import { facilityService } from '@/services/facilityService';
import { FacilityFilterParams } from '@/types/apiTypes';

export const useFacilities = (params?: FacilityFilterParams) => {
  return useQuery({
    queryKey: ['facilities', params],
    queryFn: () => facilityService.getFacilities(params),
  });
};

export const useFacility = (id: number) => {
  return useQuery({
    queryKey: ['facility', id],
    queryFn: () => facilityService.getFacilityById(id),
    enabled: !!id,
  });
};

export const useRegions = (stateId?: number) => {
  return useQuery({
    queryKey: ['regions', stateId],
    queryFn: () => facilityService.getRegions(stateId),
  });
};

export const useDistricts = (regionId?: number) => {
  return useQuery({
    queryKey: ['districts', regionId],
    queryFn: () => facilityService.getDistricts(regionId),
    enabled: !!regionId,
  });
};

export const useFacilityTypes = () => {
  return useQuery({
    queryKey: ['facilityTypes'],
    queryFn: () => facilityService.getFacilityTypes(),
  });
};

export const useStates = () => {
  return useQuery({
    queryKey: ['states'],
    queryFn: () => facilityService.getStates(),
  });
};
