"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Facility } from '@/lib/mockData';
import Link from 'next/link';
import { MapPin, Building2, Phone } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons based on status
const getMarkerIcon = (status: string) => {
  const color = status === 'Operational' ? '#22c55e' : status === 'Closed' ? '#ef4444' : '#f59e0b';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(45deg);
          color: white;
          font-size: 14px;
          font-weight: bold;
        ">+</div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

// Component to fit map bounds to markers
function MapBounds({ facilities }: { facilities: Facility[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (facilities.length > 0) {
      const validCoords = facilities
        .filter(f => f.latitude && f.longitude)
        .map(f => [f.latitude!, f.longitude!] as [number, number]);
      
      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [facilities, map]);
  
  return null;
}

export default function FacilityMap({ facilities }: { facilities: Facility[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ 
        width: '100%', 
        height: '600px', 
        background: 'var(--gray-100)', 
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)'
      }}>
        Loading map...
      </div>
    );
  }

  const validFacilities = facilities.filter(f => f.latitude && f.longitude);

  if (validFacilities.length === 0) {
    return (
      <div style={{ 
        width: '100%', 
        height: '600px', 
        background: 'var(--gray-100)', 
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        color: 'var(--text-secondary)'
      }}>
        <MapPin size={48} style={{ opacity: 0.3 }} />
        <p>No facilities with location data available</p>
      </div>
    );
  }

  // Center on Somalia (approximate center of Benadir region)
  const defaultCenter: [number, number] = [2.046, 45.35];

  return (
    <div style={{ width: '100%', height: '600px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBounds facilities={validFacilities} />
        
        {validFacilities.map((facility) => (
          <Marker
            key={facility.id}
            position={[facility.latitude!, facility.longitude!]}
            icon={getMarkerIcon(facility.status)}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--gray-900)' }}>
                  {facility.name}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={14} />
                    <span>{facility.type}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} />
                    <span>{facility.district}, {facility.region}</span>
                  </div>
                  {facility.contactPhone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} />
                      <span>{facility.contactPhone}</span>
                    </div>
                  )}
                  <div style={{ marginTop: '0.5rem' }}>
                    <span className={`badge ${facility.status === 'Operational' ? 'badge-success' : 'badge-warning'}`}>
                      {facility.status}
                    </span>
                  </div>
                </div>
                <Link 
                  href={`/facilities/${facility.id}`}
                  style={{ 
                    display: 'inline-block',
                    marginTop: '0.75rem',
                    padding: '0.5rem 1rem',
                    background: 'var(--primary-500)',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textAlign: 'center'
                  }}
                >
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
