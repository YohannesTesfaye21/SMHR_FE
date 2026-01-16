export type RegionalStats = {
  state: string;
  region: string;
  districtCount: number;
  facilityCount: number;
  typeCount: number;
  ownershipCount: number;
  partnerCount: number;
};

export const REGIONAL_STATISTICS: RegionalStats[] = [
  { state: 'BRA', region: 'Benadir', districtCount: 175, facilityCount: 175, typeCount: 175, ownershipCount: 175, partnerCount: 175 },
  { state: 'Galmudug', region: 'Galgadud', districtCount: 112, facilityCount: 112, typeCount: 112, ownershipCount: 112, partnerCount: 112 },
  { state: 'Galmudug', region: 'Mudug', districtCount: 113, facilityCount: 113, typeCount: 113, ownershipCount: 113, partnerCount: 113 },
  { state: 'Hirshabelle', region: 'Hiiraan', districtCount: 122, facilityCount: 122, typeCount: 122, ownershipCount: 122, partnerCount: 122 },
  { state: 'Hirshabelle', region: 'Middle Shebelle', districtCount: 126, facilityCount: 126, typeCount: 126, ownershipCount: 126, partnerCount: 126 },
  { state: 'Jubaland', region: 'Gedo', districtCount: 98, facilityCount: 98, typeCount: 98, ownershipCount: 98, partnerCount: 98 },
  { state: 'Jubaland', region: 'Lower Juba', districtCount: 103, facilityCount: 103, typeCount: 103, ownershipCount: 103, partnerCount: 103 },
  { state: 'North East', region: 'Cayn', districtCount: 27, facilityCount: 27, typeCount: 27, ownershipCount: 27, partnerCount: 27 },
  { state: 'North East', region: 'Sanaag', districtCount: 12, facilityCount: 12, typeCount: 12, ownershipCount: 12, partnerCount: 12 },
  { state: 'North East', region: 'Sool', districtCount: 55, facilityCount: 55, typeCount: 55, ownershipCount: 55, partnerCount: 55 },
  { state: 'Southwest', region: 'Bakool', districtCount: 70, facilityCount: 70, typeCount: 70, ownershipCount: 70, partnerCount: 70 },
  { state: 'Southwest', region: 'Bay', districtCount: 137, facilityCount: 137, typeCount: 137, ownershipCount: 137, partnerCount: 137 },
  { state: 'Southwest', region: 'Lower Shabelle', districtCount: 94, facilityCount: 94, typeCount: 94, ownershipCount: 94, partnerCount: 94 },
];

export function getStatisticsSummary() {
  const totalFacilities = REGIONAL_STATISTICS.reduce((sum, stat) => sum + stat.facilityCount, 0);
  const totalDistricts = REGIONAL_STATISTICS.reduce((sum, stat) => sum + stat.districtCount, 0);
  const totalStates = new Set(REGIONAL_STATISTICS.map(s => s.state)).size;
  const totalRegions = REGIONAL_STATISTICS.length;

  return {
    totalFacilities,
    totalDistricts,
    totalStates,
    totalRegions,
  };
}

export function getStatsByState() {
  const stateMap = new Map<string, { facilityCount: number; regionCount: number }>();
  
  REGIONAL_STATISTICS.forEach(stat => {
    const existing = stateMap.get(stat.state) || { facilityCount: 0, regionCount: 0 };
    stateMap.set(stat.state, {
      facilityCount: existing.facilityCount + stat.facilityCount,
      regionCount: existing.regionCount + 1,
    });
  });

  return Array.from(stateMap.entries()).map(([state, data]) => ({
    state,
    ...data,
  }));
}
