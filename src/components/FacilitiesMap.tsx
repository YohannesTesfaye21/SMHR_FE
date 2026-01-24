"use client";

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import { HealthFacilityDTO } from '@/types/apiTypes';
import { ArrowRight } from 'lucide-react';

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

// Custom cluster icon for better visibility
const createClusterCustomIcon = (cluster: any) => {
    const count = cluster.getChildCount();
    let size = 40;
    let fontSize = 14;

    if (count > 100) {
        size = 50;
        fontSize = 16;
    } else if (count > 50) {
        size = 45;
        fontSize = 15;
    }

    return L.divIcon({
        html: `
            <div style="
                background: #667eea;
                color: white;
                width: ${size}px;
                height: ${size}px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                border: 3px solid rgba(255, 255, 255, 0.8);
                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                font-family: inherit;
                font-weight: 700;
                font-size: ${fontSize}px;
            ">
                ${count}
            </div>
        `,
        className: 'custom-cluster-icon',
        iconSize: L.point(size, size, true),
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
    const [selectedStates, setSelectedStates] = useState<Set<string>>(new Set());
    const [selectedFacilityTypes, setSelectedFacilityTypes] = useState<Set<string>>(new Set());

    // Default center (Somalia approx)
    const defaultCenter: [number, number] = [5.1521, 46.1996];

    const validFacilities = facilities.filter(f => f.latitude && f.longitude);

    // Extract unique states (sorted)
    const uniqueStates = useMemo(() => {
        const states = new Set<string>();
        validFacilities.forEach(facility => {
            const stateName = facility.district?.region?.state?.stateName;
            if (stateName) states.add(stateName);
        });
        return Array.from(states).sort();
    }, [validFacilities]);

    // Extract unique facility types and assign colors
    const facilityTypeColors = useMemo(() => {
        const typesMap = new Map<string, string>();
        
        validFacilities.forEach(facility => {
            const typeName = facility.facilityType?.typeName;
            if (typeName && !typesMap.has(typeName)) {
                typesMap.set(typeName, stringToColor(typeName));
            }
        });
        
        return new Map([...typesMap.entries()].sort((a, b) => a[0].localeCompare(b[0])));
    }, [validFacilities]);

    // Calculate counts
    const counts = useMemo(() => {
        const stateCounts = new Map<string, number>();
        const typeCounts = new Map<string, number>();

        validFacilities.forEach(facility => {
            const stateName = facility.district?.region?.state?.stateName;
            const typeName = facility.facilityType?.typeName;

            if (stateName) stateCounts.set(stateName, (stateCounts.get(stateName) || 0) + 1);
            if (typeName) typeCounts.set(typeName, (typeCounts.get(typeName) || 0) + 1);
        });

        return { stateCounts, typeCounts };
    }, [validFacilities]);

    // Filter facilities
    const filteredFacilities = useMemo(() => {
        return validFacilities.filter(facility => {
            const stateName = facility.district?.region?.state?.stateName;
            const typeName = facility.facilityType?.typeName;

            const matchesState = selectedStates.size === 0 || (stateName && selectedStates.has(stateName));
            const matchesType = selectedFacilityTypes.size === 0 || (typeName && selectedFacilityTypes.has(typeName));

            return matchesState && matchesType;
        });
    }, [validFacilities, selectedStates, selectedFacilityTypes]);

    // Get color for a facility based on its type
    const getFacilityColor = (facility: HealthFacilityDTO): string => {
        const typeName = facility.facilityType?.typeName;
        return typeName ? (facilityTypeColors.get(typeName) || '#3b82f6') : '#3b82f6';
    };

    const toggleState = (stateName: string) => {
        setSelectedStates(prev => {
            const newSet = new Set(prev);
            if (newSet.has(stateName)) newSet.delete(stateName);
            else newSet.add(stateName);
            return newSet;
        });
    };

    const toggleFacilityType = (typeName: string) => {
        setSelectedFacilityTypes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(typeName)) newSet.delete(typeName);
            else newSet.add(typeName);
            return newSet;
        });
    };

    return (
        <div style={{ width: '100%' }}>
            {/* Filters Container */}
            <div style={{
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                {/* Facility Type Filter (Legend) */}
                {facilityTypeColors.size > 0 && (
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '1rem',
                        border: '1px solid var(--border-color)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '0.75rem'
                        }}>
                            Filter by Facility Type {selectedFacilityTypes.size > 0 && (
                                <span style={{ 
                                    color: '#667eea',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    marginLeft: '0.5rem'
                                }}>
                                    ({selectedFacilityTypes.size} selected)
                                </span>
                            )}
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            overflowX: 'auto',
                            paddingBottom: '4px',
                            scrollbarWidth: 'thin'
                        }}>
                            {Array.from(facilityTypeColors.entries()).map(([typeName, color]) => {
                                const isSelected = selectedFacilityTypes.has(typeName);
                                const count = counts.typeCounts.get(typeName) || 0;
                                
                                return (
                                    <div 
                                        key={typeName}
                                        onClick={() => toggleFacilityType(typeName)}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 14px',
                                            borderRadius: '20px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            background: isSelected ? '#667eea' : '#f9fafb',
                                            border: isSelected ? '2px solid #667eea' : '2px solid #e5e7eb',
                                            whiteSpace: 'nowrap',
                                            flexShrink: 0
                                        }}
                                    >
                                        <div style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            background: isSelected ? 'white' : color,
                                            border: isSelected ? 'none' : '2px solid white',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                            flexShrink: 0
                                        }} />
                                        <span style={{
                                            fontSize: '0.85rem',
                                            color: isSelected ? 'white' : '#374151',
                                            fontWeight: isSelected ? 600 : 500
                                        }}>
                                            {typeName}
                                        </span>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '10px',
                                            background: isSelected ? 'rgba(255,255,255,0.25)' : '#e5e7eb',
                                            color: isSelected ? 'white' : '#6b7280',
                                            fontSize: '0.75rem',
                                            fontWeight: 600
                                        }}>
                                            {count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* State Filter */}
                {/* {uniqueStates.length > 0 && (
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '1rem',
                        border: '1px solid var(--border-color)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '0.75rem'
                        }}>
                            Filter by State {selectedStates.size > 0 && (
                                <span style={{ 
                                    color: '#667eea',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    marginLeft: '0.5rem'
                                }}>
                                    ({selectedStates.size} selected)
                                </span>
                            )}
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            overflowX: 'auto',
                            paddingBottom: '4px',
                            scrollbarWidth: 'thin'
                        }}>
                            {uniqueStates.map((stateName) => {
                                const isSelected = selectedStates.has(stateName);
                                const count = counts.stateCounts.get(stateName) || 0;
                                
                                return (
                                    <div 
                                        key={stateName}
                                        onClick={() => toggleState(stateName)}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 14px',
                                            borderRadius: '20px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            background: isSelected ? '#374151' : '#f9fafb',
                                            border: isSelected ? '2px solid #374151' : '2px solid #e5e7eb',
                                            whiteSpace: 'nowrap',
                                            flexShrink: 0
                                        }}
                                    >
                                        <span style={{
                                            fontSize: '0.85rem',
                                            color: isSelected ? 'white' : '#374151',
                                            fontWeight: isSelected ? 600 : 500
                                        }}>
                                            {stateName}
                                        </span>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '10px',
                                            background: isSelected ? 'rgba(255,255,255,0.25)' : '#e5e7eb',
                                            color: isSelected ? 'white' : '#6b7280',
                                            fontSize: '0.75rem',
                                            fontWeight: 600
                                        }}>
                                            {count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )} */}
            </div>

            {/* Map Container */}
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
                        iconCreateFunction={createClusterCustomIcon}
                    >
                        {filteredFacilities.map((facility) => {
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
                                            
                                            {/* Facility Type with Color Dot */}
                                            {facility.facilityType?.typeName && (
                                                <div style={{ 
                                                    fontSize: '0.85rem', 
                                                    color: '#666', 
                                                    marginBottom: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}>
                                                    <div style={{
                                                        width: '10px',
                                                        height: '10px',
                                                        borderRadius: '50%',
                                                        background: color,
                                                        flexShrink: 0
                                                    }} />
                                                    {facility.facilityType.typeName}
                                                </div>
                                            )}

                                            {facility.district?.region?.state?.stateName && (
                                                <div style={{ 
                                                    fontSize: '0.8rem', 
                                                    color: '#888',
                                                    marginBottom: '8px'
                                                }}>
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

                    <MapBounds facilities={filteredFacilities} />
                </MapContainer>
            </div>
        </div>
    );
}
