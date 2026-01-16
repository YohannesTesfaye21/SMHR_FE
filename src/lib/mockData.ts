export type Facility = {
  id: string;
  code: string;
  name: string;
  type: string;
  owner: string;
  region: string;
  state: string; // Added State
  district: string;
  status: 'Operational' | 'Closed' | 'Pending';
  isOpenNow: boolean;
  latitude?: number;
  longitude?: number;
  contactPerson?: string;
  contactPhone?: string;
};

// Data derived from sampleData.txt
const FACILITIES_DATA: Facility[] = [
  {
    id: 'BRBNABDU01', code: 'BRBNABDU01', name: 'Abdi Aziz Health Center', type: 'Health Center', owner: 'Government',
    state: 'BRA', region: 'Benadir', district: 'Abdul Aziz', status: 'Operational', isOpenNow: true,
    latitude: 2.040533, longitude: 45.356388, contactPerson: 'Amino Abdi Warsame', contactPhone: '615306618'
  },
  {
    id: 'BRBNABDU02', code: 'BRBNABDU02', name: 'Forlanini Hospital', type: 'National Referral Hospital', owner: 'Government',
    state: 'BRA', region: 'Benadir', district: 'Abdul Aziz', status: 'Operational', isOpenNow: true,
    latitude: 2.046604, longitude: 45.360421, contactPerson: 'Xuseen Cabdi Xaafid Sheeq', contactPhone: '617065639'
  },
  {
    id: 'BRBNABDU03', code: 'BRBNABDU03', name: 'Gaarisa TB Clinic', type: 'TB Clinic', owner: 'Government',
    state: 'BRA', region: 'Benadir', district: 'Abdul Aziz', status: 'Operational', isOpenNow: true,
    latitude: 2.048984, longitude: 45.360456, contactPerson: 'Ali Hassan', contactPhone: '61 5247976'
  },
  {
    id: 'BRBNABDU04', code: 'BRBNABDU04', name: 'Neero Health Center', type: 'Health Center', owner: 'Government',
    state: 'BRA', region: 'Benadir', district: 'Abdul Aziz', status: 'Closed', isOpenNow: false,
    latitude: 2.044955, longitude: 45.365555, contactPerson: 'Feysal Aweys Abdullahi', contactPhone: '0615332875'
  },
  {
    id: 'BRBNABDU05', code: 'BRBNABDU05', name: 'Ummah Private Hospital', type: 'Private Hospital', owner: 'Private Facility',
    state: 'BRA', region: 'Benadir', district: 'Abdul Aziz', status: 'Operational', isOpenNow: true,
    latitude: 2.046153, longitude: 45.356244, contactPerson: 'Mohamed Hussein ', contactPhone: '615564104'
  },
  {
    id: 'BRBNBOND01', code: 'BRBNBOND01', name: 'Boondheere Health Center', type: 'Health Center', owner: 'Government',
    state: 'BRA', region: 'Benadir', district: 'Bondheere', status: 'Operational', isOpenNow: true,
    latitude: 2.047391, longitude: 45.342063, contactPerson: 'Asma Osman Mohamod', contactPhone: '0770598408'
  },
  {
    id: 'BRBNBOND02', code: 'BRBNBOND02', name: 'Boondheere YK Health Center', type: 'Health Center', owner: 'Government',
    state: 'BRA', region: 'Benadir', district: 'Bondheere', status: 'Closed', isOpenNow: false,
    latitude: 2.04002, longitude: 45.341815, contactPerson: 'Closed', contactPhone: 'Closed'
  },
  {
    id: 'BRBNBOND03', code: 'BRBNBOND03', name: 'Wiil-Waal Health Center', type: 'Health Center', owner: 'Government',
    state: 'BRA', region: 'Benadir', district: 'Bondheere', status: 'Operational', isOpenNow: true,
    latitude: 2.042473, longitude: 45.345674, contactPerson: 'Farhia Bashiir Mohamed', contactPhone: '0615544455'
  },
  {
    id: 'BRBNDEYN01', code: 'BRBNDEYN01', name: '77 Health Center', type: 'Health Center', owner: 'Government',
    state: 'BRA', region: 'Benadir', district: 'Deynile', status: 'Operational', isOpenNow: true,
    latitude: 2.05306, longitude: 45.298383, contactPerson: 'Hassan Abdi Hassan', contactPhone: '615788670'
  },
];

export type FacilityFilters = {
  region?: string;
  district?: string;
  type?: string;
  owner?: string;
  status?: string;
  q?: string;
};

export async function getFacilities(filters?: FacilityFilters): Promise<Facility[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  let data = FACILITIES_DATA;
  
  if (!filters) return data;

  if (filters.q) {
    const lowerQ = filters.q.toLowerCase();
    data = data.filter(f => 
       f.name.toLowerCase().includes(lowerQ) ||
       f.code.toLowerCase().includes(lowerQ)
    );
  }

  if (filters.region) {
    data = data.filter(f => f.region.toLowerCase() === filters.region?.toLowerCase());
  }
  if (filters.district) {
     data = data.filter(f => f.district.toLowerCase() === filters.district?.toLowerCase());
  }
  if (filters.type) {
     data = data.filter(f => f.type.toLowerCase() === filters.type?.toLowerCase());
  }
  if (filters.owner) {
     data = data.filter(f => f.owner.toLowerCase() === filters.owner?.toLowerCase());
  }
  if (filters.status) {
     data = data.filter(f => f.status.toLowerCase() === filters.status?.toLowerCase());
  }

  return data;
}

export async function getFacilityById(id: string): Promise<Facility | undefined> {
   await new Promise(resolve => setTimeout(resolve, 100));
   return FACILITIES_DATA.find(f => f.id === id);
}

// Helpers for filter options
export async function getFilterOptions() {
    return {
        regions: Array.from(new Set(FACILITIES_DATA.map(f => f.region))),
        districts: Array.from(new Set(FACILITIES_DATA.map(f => f.district))),
        types: Array.from(new Set(FACILITIES_DATA.map(f => f.type))),
        owners: Array.from(new Set(FACILITIES_DATA.map(f => f.owner))),
        statuses: Array.from(new Set(FACILITIES_DATA.map(f => f.status))),
    };
}
