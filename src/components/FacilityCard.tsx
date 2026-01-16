"use client";

import Link from 'next/link';
import { MapPin, Building2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Facility } from '@/lib/mockData';

export default function FacilityCard({ facility }: { facility: Facility }) {
  return (
    <Link href={`/facilities/${facility.id}`} style={{ display: 'block' }}>
        <div className="glass card-hover" style={{ 
            borderRadius: '20px', 
            padding: '1.5rem', 
            background: 'white', 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ 
                    width: '40px', height: '40px', 
                    background: 'var(--primary-100)', 
                    color: 'var(--primary-600)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Building2 size={20} />
                </div>
                <span className={facility.status === 'Operational' ? 'badge badge-success' : 'badge badge-warning'}>
                    {facility.status}
                </span>
            </div>

            <div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem', color: 'var(--gray-900)' }}>
                    {facility.name}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{facility.code}</p>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    <MapPin size={16} />
                    <span>{facility.district}, {facility.region}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    {facility.isOpenNow ? (
                        <>
                            <CheckCircle size={16} color="green" />
                            <span style={{ color: 'green' }}>Open Now</span>
                        </>
                    ) : (
                         <>
                            <Clock size={16} color="orange" />
                            <span style={{ color: 'orange' }}>Closed</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    </Link>
  );
}
