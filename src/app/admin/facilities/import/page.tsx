'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { csvImportService } from '@/services/csvImportService';
import { ArrowLeft, Upload, FileText, Download, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function BulkImportPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setUploadStatus('idle');
      } else {
        setErrorMessage('Please upload a valid CSV file.');
        setUploadStatus('error');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setUploadStatus('idle');
    }
  };

  const downloadTemplate = () => {
    const headers = [
      "New Facility ID", "Latitude", "Longitude", "State", "Region", "District", 
      "Health Facility Name", "Health Facility Type", "Ownership", "HC partners", 
      "HC Project End date", "Nutrition Cluster Partners", "Damal Caafimaad Partner", 
      "Damal Caafimaad Project end date", "Better Life Project Partner", 
      "Better Life Project End Date", "Caafimaad Plus Partner", 
      "Caafimaad Plus Project end", "Facility In-charge Name", 
      "Facility in-charge Number", "Operational Status"
    ];
    
    // Sample row from sampleData.txt
    const sampleRow = [
      "BRBNABDU01", "2.040533", "45.356388", "BRA", "Benadir", "Abdul Aziz", 
      "Abdi Aziz Health Center", "Health Center", "Government", "PSI & BRA", 
      "3/31/2026", "AAH", "No", "No", "No", "No", "No", "No", 
      "Amino Abdi Warsame", "615306618", "Operational"
    ];

    const csvContent = [
      headers.join(','),
      sampleRow.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "facility_import_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      await csvImportService.uploadCSV(file);
      setUploadStatus('success');
      setFile(null);
    } catch (error: any) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
      setErrorMessage(error.response?.data?.message || 'Failed to upload CSV. Please check the file format and try again.');
    } finally {
      setUploading(false);
    }
  };

  if (authLoading) return null;
  if (!isAuthenticated) return null;

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <button 
          onClick={() => router.push('/admin')}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            color: 'var(--text-secondary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            fontSize: '0.95rem'
          }}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
            Bulk Facility Import
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Upload a CSV file to add multiple health facilities to the system at once.
          </p>
        </div>

        <div className="glass" style={{ padding: '2rem', borderRadius: '16px', background: 'white' }}>
          {/* Instructions & Template */}
          <div style={{ 
            padding: '1.5rem', 
            background: 'var(--primary-50)', 
            borderRadius: '12px', 
            border: '1px solid var(--primary-100)',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <FileText size={24} color="var(--primary-600)" style={{ flexShrink: 0 }} />
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-800)', marginBottom: '0.5rem', fontWeight: 600 }}>
                  CSV Format Instructions
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--primary-700)', marginBottom: '1rem', lineHeight: 1.5 }}>
                  Please ensure your CSV file follows the required column structure. You can download our sample template to get started.
                </p>
                <button 
                  onClick={downloadTemplate}
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    padding: '0.6rem 1.2rem',
                    background: 'white',
                    color: 'var(--primary-600)',
                    border: '1px solid var(--primary-200)',
                    borderRadius: '8px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.9rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--primary-50)';
                    e.currentTarget.style.borderColor = 'var(--primary-300)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = 'var(--primary-200)';
                  }}
                >
                  <Download size={18} />
                  Download Sample Template
                </button>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragActive ? 'var(--primary-500)' : 'var(--border-color)'}`,
              borderRadius: '16px',
              padding: '3rem 2rem',
              textAlign: 'center',
              background: dragActive ? 'var(--primary-50)' : 'var(--gray-50)',
              transition: 'all 0.2s',
              cursor: 'pointer',
              position: 'relative'
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                background: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <Upload size={32} color="var(--primary-500)" />
              </div>
              <div>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
                  {file ? file.name : 'Click or drag CSV file to upload'}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Maximum file size: 10MB
                </p>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {uploadStatus === 'success' && (
            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1rem', 
              background: '#D1FAE5', 
              color: '#065F46', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              border: '1px solid #A7F3D0'
            }}>
              <CheckCircle size={20} />
              <div>
                <p style={{ fontWeight: 600 }}>Import Successful!</p>
                <p style={{ fontSize: '0.9rem' }}>The facilities have been added to the system.</p>
              </div>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1rem', 
              background: '#FEE2E2', 
              color: '#991B1B', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              border: '1px solid #FECACA'
            }}>
              <AlertCircle size={20} />
              <div>
                <p style={{ fontWeight: 600 }}>Import Failed</p>
                <p style={{ fontSize: '0.9rem' }}>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button 
              onClick={() => {
                setFile(null);
                setUploadStatus('idle');
              }}
              className="btn-secondary"
              disabled={!file || uploading}
              style={{
                background: 'white',
                border: '1px solid var(--border-color)',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                color: 'var(--gray-700)',
                cursor: file && !uploading ? 'pointer' : 'not-allowed',
                opacity: file && !uploading ? 1 : 0.5
              }}
            >
              Cancel
            </button>
            <button 
              onClick={handleUpload}
              className="btn-primary"
              disabled={!file || uploading}
              style={{
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: file && !uploading ? 'pointer' : 'not-allowed',
                opacity: file && !uploading ? 1 : 0.7
              }}
            >
              {uploading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Start Import
                </>
              )}
            </button>
          </div>
        </div>

        <style jsx>{`
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
