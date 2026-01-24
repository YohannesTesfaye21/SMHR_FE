export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
  errors: string[] | null;
  timestamp: string;
}

export interface PagedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface State {
  stateId: number;
  stateCode: string;
  stateName: string;
  createdAt: string;
}

export interface Region {
  regionId: number;
  stateId: number;
  regionName: string;
  createdAt: string;
  state?: State;
}

export interface District {
  districtId: number;
  regionId: number;
  districtName: string;
  createdAt: string;
  region?: Region;
}

export interface FacilityType {
  facilityTypeId: number;
  typeName: string;
  createdAt: string;
}

export interface Ownership {
  ownershipId: number;
  ownershipType: string;
  createdAt: string;
}

export interface OperationalStatus {
  operationalStatusId: number;
  statusName: string;
  createdAt: string;
}

export interface HealthFacilityDTO {
  healthFacilityId: number;
  facilityId: string | null;
  healthFacilityName: string | null;
  latitude: number | null;
  longitude: number | null;
  district: District | null;
  facilityType: FacilityType | null;
  ownership: Ownership | null;
  operationalStatus: OperationalStatus | null;
  hcPartners: string | null;
  hcProjectEndDate: string | null;
  nutritionClusterPartners: string | null;
  damalCaafimaadPartner: string | null;
  damalCaafimaadProjectEndDate: string | null;
  betterLifeProjectPartner: string | null;
  betterLifeProjectEndDate: string | null;
  caafimaadPlusPartner: string | null;
  caafimaadPlusProjectEndDate: string | null;
  facilityInChargeName: string | null;
  facilityInChargeNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

// Params interfaces
export interface FacilityFilterParams {
  facilityName?: string;
  facilityTypeId?: number;
  stateId?: number;
  regionId?: number;
  districtId?: number;
  ownershipId?: number;
  operationalStatusId?: number;
  pageNumber?: number;
  pageSize?: number;
}

// API Response Type Aliases
export type HealthFacilityDTOApiPagedResponse = ApiResponse<PagedResponse<HealthFacilityDTO>>;
export type HealthFacilityDTOApiResponse = ApiResponse<HealthFacilityDTO>;
export type RegionApiPagedResponse = ApiResponse<PagedResponse<Region>>;
export type DistrictApiPagedResponse = ApiResponse<PagedResponse<District>>;
export type FacilityTypeApiPagedResponse = ApiResponse<PagedResponse<FacilityType>>;
export type OwnershipApiPagedResponse = ApiResponse<PagedResponse<Ownership>>;
export type OperationalStatusApiPagedResponse = ApiResponse<PagedResponse<OperationalStatus>>;
export type StateApiPagedResponse = ApiResponse<PagedResponse<State>>;
export type StateApiResponse = ApiResponse<State>;
export type RegionApiResponse = ApiResponse<Region>;
export type DistrictApiResponse = ApiResponse<District>;
export type FacilityTypeApiResponse = ApiResponse<FacilityType>;
export type OwnershipApiResponse = ApiResponse<Ownership>;
export type OperationalStatusApiResponse = ApiResponse<OperationalStatus>;

// Dashboard Types
export interface CardDataDTO {
  totalStates: number;
  totalRegions: number;
  totalDistricts: number;
  totalFacilities: number;
}

export interface ChartDataDTO {
  label: string;
  value: number;
}

export interface RegionStatisticsDTO {
  name: string;
  totalFacility: number;
  totalDistrict: number;
}

export interface StateStatisticsDTO {
  stateId: number;
  stateName: string;
  stateCode: string;
  regions: RegionStatisticsDTO[];
  totalRegions: number;
  totalDistricts: number;
  totalFacilities: number;
}

export interface TopRegionDTO {
  regionId: number;
  regionName: string;
  stateId: number;
  stateName: string;
  facilityCount: number;
}

export interface DashboardStatisticsByFacilityType {
  facilityTypeId: number;
  typeName: string;
  count: number;
}

export interface DashboardStatisticsByOperationalStatus {
  operationalStatusId: number;
  statusName: string;
  count: number;
}

export interface DashboardStatisticsDTO {
  totalFacilities: number;
  byFacilityType: DashboardStatisticsByFacilityType[];
  byOperationalStatus: DashboardStatisticsByOperationalStatus[];
}

// Dashboard Responses
export type CardDataApiResponse = ApiResponse<CardDataDTO>;
export type DashboardStatisticsApiResponse = ApiResponse<DashboardStatisticsDTO>;
export type ChartDataListApiResponse = ApiResponse<ChartDataDTO[]>;
export type StateStatisticsListApiResponse = ApiResponse<StateStatisticsDTO[]>;
export type TopRegionListApiResponse = ApiResponse<TopRegionDTO[]>;

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    name?: string;
  };
  expiresIn?: number;
}

export type LoginApiResponse = ApiResponse<LoginResponse>;
