import { useQuery } from '@tanstack/react-query';
import { facilityService } from '@/services/facilityService';

export const useDashboardCards = () => {
    return useQuery({
        queryKey: ['dashboard', 'cards'],
        queryFn: facilityService.getDashboardCards
    });
};

export const useDashboardCharts = (type: 'bar' | 'pie', groupBy: 'region' | 'district' | 'type') => {
    return useQuery({
        queryKey: ['dashboard', 'chart', type, groupBy],
        queryFn: () => facilityService.getDashboardChart(type, groupBy)
    });
};

export const useDashboardStateStats = (stateId?: number) => {
    return useQuery({
        queryKey: ['dashboard', 'state-stats', stateId],
        queryFn: () => facilityService.getDashboardStateStats(stateId)
    });
};

export const useTopRegions = () => {
    return useQuery({
        queryKey: ['dashboard', 'top-regions'],
        queryFn: facilityService.getTopRegions
    });
};

export interface HomeFilter {
    stateId: number | null;
    regionId: number | null;
    districtId: number | null;
}

export const useDashboardStatistics = (filter?: HomeFilter | null) => {
    const params = filter && (filter.stateId != null || filter.regionId != null || filter.districtId != null)
        ? { stateId: filter.stateId ?? undefined, regionId: filter.regionId ?? undefined, districtId: filter.districtId ?? undefined }
        : undefined;
    return useQuery({
        queryKey: ['dashboard', 'statistics', params],
        queryFn: () => facilityService.getDashboardStatistics(params)
    });
};
