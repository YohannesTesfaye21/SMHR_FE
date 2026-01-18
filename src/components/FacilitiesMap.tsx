"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import { HealthFacilityDTO } from '@/types/apiTypes';
import { ArrowRight } from 'lucide-react';

// Fix for default marker icons in Next.js
const fixLeafletIcon = () => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
};

function MapBounds({ facilities }: { facilities: HealthFacilityDTO[] }) {
    const map = useMap();

    useEffect(() => {
        if (facilities.length > 0) {
            const bounds = L.latLngBounds(
                facilities
                    .filter(f => f.latitude && f.longitude)
                    .map(f => [f.latitude!, f.longitude!])
            );
            
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [facilities, map]);

    return null;
}

interface FacilitiesMapProps {
    facilities: HealthFacilityDTO[];
}

export default function FacilitiesMap({ facilities }: FacilitiesMapProps) {
    useEffect(() => {
        fixLeafletIcon();
    }, []);

    // Default center (Somalia approx)
    const defaultCenter: [number, number] = [5.1521, 46.1996];

    const validFacilities = facilities.filter(f => f.latitude && f.longitude);

    return (
        <div style={{ height: '600px', width: '100%', borderRadius: '16px', overflow: 'hidden', position: 'relative', zIndex: 0, border: '1px solid var(--border-color)' }}>
             <MapContainer 
                center={defaultCenter} 
                zoom={6} 
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {validFacilities.map((facility) => (
                    <Marker 
                        key={facility.healthFacilityId} 
                        position={[facility.latitude!, facility.longitude!]}
                    >
                        <Popup>
                            <div style={{ padding: '4px' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '4px' }}>
                                    {facility.healthFacilityName}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    {facility.facilityType?.typeName}
                                </div>
                                <Link 
                                    href={`/facilities/${facility.healthFacilityId}`}
                                    style={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: '4px',
                                        fontSize: '0.8rem',
                                        color: 'var(--primary-600)',
                                        fontWeight: 500
                                    }}
                                >
                                    View Details <ArrowRight size={12} />
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <MapBounds facilities={validFacilities} />
            </MapContainer>
        </div>
    );
}
