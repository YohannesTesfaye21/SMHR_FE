"use client";

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import { HealthFacilityDTO } from '@/types/apiTypes';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

// Generate a consistent color from a string (state name)
function stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate HSL color with good saturation and lightness for visibility
    const hue = Math.abs(hash % 360);
    const saturation = 65 + (Math.abs(hash) % 20); // 65-85%
    const lightness = 45 + (Math.abs(hash >> 8) % 15); // 45-60%
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Create custom marker icon with state color
function createColoredIcon(color: string): L.DivIcon {
    return L.divIcon({
        html: `
            <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41C12.5 41 25 21.9 25 12.5C25 5.6 19.4 0 12.5 0Z" 
                      fill="${color}" 
                      stroke="white" 
                      stroke-width="2"/>
                <circle cx="12.5" cy="12.5" r="4" fill="white"/>
            </svg>
        `,
        className: 'custom-marker-icon',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });
}

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
    const [legendOpen, setLegendOpen] = useState(true);

    // Default center (Somalia approx)
    const defaultCenter: [number, number] = [5.1521, 46.1996];

    const validFacilities = facilities.filter(f => f.latitude && f.longitude);

    // Extract unique states and assign colors
    const stateColors = useMemo(() => {
        const statesMap = new Map<string, string>();
        
        validFacilities.forEach(facility => {
            const stateName = facility.district?.region?.state?.stateName;
            if (stateName && !statesMap.has(stateName)) {
                statesMap.set(stateName, stringToColor(stateName));
            }
        });
        
        // Sort states alphabetically for consistent legend display
        return new Map([...statesMap.entries()].sort((a, b) => a[0].localeCompare(b[0])));
    }, [validFacilities]);

    // Get color for a facility based on its state
    const getFacilityColor = (facility: HealthFacilityDTO): string => {
        const stateName = facility.district?.region?.state?.stateName;
        return stateName ? (stateColors.get(stateName) || '#3b82f6') : '#3b82f6';
    };

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
                
                <MarkerClusterGroup
                    chunkedLoading
                    maxClusterRadius={50}
                    spiderfyOnMaxZoom={true}
                    showCoverageOnHover={false}
                    zoomToBoundsOnClick={true}
                >
                    {validFacilities.map((facility) => {
                        const color = getFacilityColor(facility);
                        const icon = createColoredIcon(color);
                        
                        return (
                            <Marker 
                                key={facility.healthFacilityId} 
                                position={[facility.latitude!, facility.longitude!]}
                                icon={icon}
                            >
                                <Popup>
                                    <div style={{ padding: '4px', minWidth: '200px' }}>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '6px' }}>
                                            {facility.healthFacilityName}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>
                                            {facility.facilityType?.typeName}
                                        </div>
                                        {facility.district?.region?.state?.stateName && (
                                            <div style={{ 
                                                fontSize: '0.8rem', 
                                                color: '#888',
                                                marginBottom: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                <div style={{
                                                    width: '12px',
                                                    height: '12px',
                                                    borderRadius: '50%',
                                                    background: color,
                                                    border: '2px solid white',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                                }} />
                                                {facility.district.region.state.stateName}
                                            </div>
                                        )}
                                        <Link 
                                            href={`/facilities/${facility.healthFacilityId}`}
                                            style={{ 
                                                display: 'inline-flex', 
                                                alignItems: 'center', 
                                                gap: '4px',
                                                fontSize: '0.85rem',
                                                color: '#2563eb',
                                                fontWeight: 500,
                                                textDecoration: 'none'
                                            }}
                                        >
                                            View Details <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MarkerClusterGroup>

                <MapBounds facilities={validFacilities} />
            </MapContainer>

            {/* Legend */}
            {stateColors.size > 0 && (
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    maxWidth: '280px',
                    overflow: 'hidden'
                }}>
                    <div 
                        onClick={() => setLegendOpen(!legendOpen)}
                        style={{
                            padding: '12px 16px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            userSelect: 'none'
                        }}
                    >
                        <span>States ({stateColors.size})</span>
                        {legendOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                    
                    {legendOpen && (
                        <div style={{
                            padding: '12px',
                            maxHeight: '300px',
                            overflowY: 'auto'
                        }}>
                            {Array.from(stateColors.entries()).map(([stateName, color]) => (
                                <div 
                                    key={stateName}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '6px 8px',
                                        borderRadius: '6px',
                                        marginBottom: '4px',
                                        transition: 'background 0.2s',
                                        cursor: 'default'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{
                                        width: '16px',
                                        height: '16px',
                                        borderRadius: '50%',
                                        background: color,
                                        border: '2px solid white',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                        flexShrink: 0
                                    }} />
                                    <span style={{
                                        fontSize: '0.85rem',
                                        color: '#374151',
                                        fontWeight: 500
                                    }}>
                                        {stateName}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
