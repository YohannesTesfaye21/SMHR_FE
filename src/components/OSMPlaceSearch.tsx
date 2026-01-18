'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, Search } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic imports for leaflet components
const MapContainer = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.MapContainer })), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.TileLayer })), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.Marker })), { ssr: false });

interface OSMPlace {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

interface OSMPlaceSearchProps {
  latitude: number | null;
  longitude: number | null;
  onLocationSelect: (lat: number, lng: number) => void;
}

// Map click handler component - must be inside MapContainer  
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  // Import useMapEvent - must be at component level for hooks to work
  const useMapEvent = typeof window !== 'undefined' ? require('react-leaflet').useMapEvent : null;
  
  if (!useMapEvent) return null;
  
  useMapEvent('click', (e: any) => {
    const lat = e.latlng?.lat;
    const lng = e.latlng?.lng;
    
    if (lat && lng) {
      console.log('Map clicked:', lat, lng);
      onMapClick(lat, lng);
    }
  });
  
  return null;
}

export default function OSMPlaceSearch({ latitude, longitude, onLocationSelect }: OSMPlaceSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<OSMPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mapPosition, setMapPosition] = useState<[number, number]>([5.1521, 46.1996]); // Somalia default
  const searchRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update map position when latitude/longitude change
  useEffect(() => {
    if (latitude && longitude) {
      setMapPosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResults]);

  const searchPlace = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=so&bounded=1&viewbox=41.0,11.0,51.0,2.0`,
        {
          headers: {
            'User-Agent': 'SMHF-Web-App/1.0'
          }
        }
      );
      
      const data: OSMPlace[] = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching OSM places:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    
    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Debounce search
    timerRef.current = setTimeout(() => {
      searchPlace(value);
    }, 500);
  };

  const handleSelectPlace = (place: OSMPlace) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    console.log('Place selected:', lat, lng);
    onLocationSelect(lat, lng);
    setSearchTerm(place.display_name);
    setShowResults(false);
    setMapPosition([lat, lng]);
  };

  const handleMapClick = (lat: number, lng: number) => {
    console.log('handleMapClick called with:', lat, lng);
    onLocationSelect(lat, lng);
    setMapPosition([lat, lng]);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div style={{ marginTop: '1.5rem', gridColumn: '1 / -1' }}>
      <label style={{ 
        display: 'block', 
        marginBottom: '0.5rem', 
        fontSize: '0.875rem', 
        fontWeight: 600, 
        color: 'var(--gray-700)' 
      }}>
        <MapPin size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
        Search Location from OSM (Optional)
      </label>
      
      {/* OSM Place Search */}
      <div ref={searchRef} style={{ position: 'relative', marginBottom: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={20} color="var(--gray-400)" style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            zIndex: 1
          }} />
          <input
            type="text"
            placeholder="Search for a place in Somalia (e.g., Mogadishu, Hargeisa)..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 3rem',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              fontSize: '1rem',
              outline: 'none',
              background: 'white'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary-500)';
              if (searchResults.length > 0) {
                setShowResults(true);
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-color)';
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setSearchTerm('');
                setSearchResults([]);
                setShowResults(false);
              }}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={18} color="var(--gray-400)" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && (isSearching || searchResults.length > 0) && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            marginTop: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {isSearching && (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Searching...
              </div>
            )}
            {!isSearching && searchResults.map((place) => (
              <button
                key={place.place_id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectPlace(place);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: 'var(--gray-700)',
                  borderBottom: '1px solid var(--border-color)',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--gray-50)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <MapPin size={14} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle', color: 'var(--primary-500)' }} />
                {place.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* OSM Map - Render only on client */}
      {typeof window !== 'undefined' && (
        <div 
          style={{ 
            height: '300px', 
            width: '100%', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            border: '1px solid var(--border-color)',
            marginTop: '1rem',
            position: 'relative',
            zIndex: 0
          }}
        >
          <MapContainer
            center={mapPosition}
            zoom={latitude && longitude ? 13 : 6}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {typeof window !== 'undefined' && <MapClickHandler onMapClick={handleMapClick} />}
            {latitude && longitude && (
              <Marker position={[latitude, longitude]}>
                <div style={{ fontWeight: 600 }}>Selected Location</div>
              </Marker>
            )}
          </MapContainer>
        </div>
      )}

      <p style={{ 
        fontSize: '0.75rem', 
        color: 'var(--text-secondary)', 
        marginTop: '0.5rem',
        fontStyle: 'italic'
      }}>
        Search for a place or click on the map to set coordinates. Latitude and Longitude will be updated automatically.
      </p>
    </div>
  );
}
