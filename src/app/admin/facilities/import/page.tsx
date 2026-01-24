'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { csvImportService } from '@/services/csvImportService';
import { ArrowLeft, Upload, FileText, Download, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function BulkImportPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
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
      "Date ",
      "State",
      "Region",
      "District",
      "Is your health facility included in the list below?\r\n      - If Yes: Select your facility from the list and continue completing the questionnaire.\r\n      - If No: Select “No”, enter the facility name, and continue completing the questionnaire",
      "Name of health facility",
      "Health Facility Code",
      "Is the health facility currently operational and providing services to patients?",
      "If No, what is the main reason the health facility is not operational?",
      "When was the last date the health facility was operational?",
      "Is the selected health facility name correct?",
      "If no, enter the correct health facility name",
      "If the health facility is not listed, enter the health facility name",
      "Column10",
      "Facility type",
      "Full Name of the helath Facility in-charge",
      "Job title of in-charge",
      "Mobile number of the helath Facility in-charge",
      "WhatsApp number of the helath Facility in-charge",
      "Email adress of the health facility incharge ",
      "Capture GPS location from within the health facility premises/compound.\r\nNote (Important): Capture the GPS coordinates while you are inside the health facility premises/compound. Stand in an open space within the compound where the device can clearly see t",
      "Latitude",
      "Longitude",
      "Catchment population served (Total Population)",
      "Under 1 year (surviving infants) Target for EPI for the HF",
      "Do you know the geographical boundaries of the catchment area of this health facility?",
      "Main type(s) of settlement/population served (select all that apply)",
      "Number of settlements/villages served by the facility",
      "Select all services that are currently provided at this health facility.",
      "Services provided (PHU)",
      "Services provided (Health Centre)",
      "Services provided (District Hospital)",
      "Services provided (Regional Hospital / National Hospital)",
      "Key equipment available (PHU)",
      "Key equipment available (Health Centre)",
      "Key equipment available (District Hospital)",
      "Key equipment available (Regional Hospital / National Hospital)",
      "Select all staff cadres currently available at this health facility.",
      "HR cadres available (PHU)",
      "Total number of Community Health Worker (CHW)",
      "Total number of Female Health Worker (FHW)",
      "Total number of Nurse",
      "Total number of Midwife",
      "Total number of Health assistant",
      "Total number of Vaccinator/EPI staff",
      "Total number of Data clerk/HMIS",
      "Total number of Other",
      "HR cadres available (Health Centre)",
      "Total number of Medical officer/Doctor",
      "Total number of Nurse_1",
      "Total number of Midwife_2",
      "Total number of Laboratory technician",
      "Total number of Pharmacy technician",
      "Total number of Vaccinator/EPI staff_3",
      "Total number of Data clerk/HMIS_4",
      "Total number of CHW/FHW",
      "Total number of Other_5",
      "HR cadres available (District Hospital)",
      "Total number of Doctor/Medical officer",
      "Total number of Nurse_6",
      "Total number of Midwife_7",
      "Total number of Anaesthesia provider",
      "Total number of Laboratory staff",
      "Total number of Pharmacy staff",
      "Total number of Radiology/Imaging staff",
      "Total number of Surgical/Operating team",
      "Total number of Data clerk/HMIS_8",
      "Total number of Other_9",
      "HR cadres available (Regional / National Hospital)",
      "Total number of Specialist doctors",
      "Total number of Medical officers",
      "Total number of Nurses",
      "Total number of Midwives",
      "Total number of Anaesthesia team",
      "Total number of Laboratory staff_10",
      "Total number of Pharmacy staff_11",
      "Total number of Radiology/Imaging staff_12",
      "Total number of Surgical/Operating team_13",
      "Total number of HMIS/Data team",
      "Total number of Other_14",
      "What is the estimated distance to the nearest referral facility (in kilometers)?",
      "Does this health facility have designated Community Health Workers (CHWs) and/or Female Health Workers (FHWs)?",
      "Is there a dedicated/ assigned persone to manage the HMIS at this facility?",
      "If yes, name of HMIS reporter/data clerk",
      "HMIS reporter telephone (WhatsApp)",
      "HMIS reporter email",
      "Does this health facility have complete and updated HMIS reporting tools?",
      "Which HMIS tools are available and in use at this facility? (select all that apply)",
      "Is the health facility reporting routine health information (HMIS) through DHIS2?",
      "If yes, date the facility started reporting using DHIS2",
      "How is routine data entered into DHIS2 for this facility?",
      "Is the health facility using the IDSR system?",
      "If yes, date the facility started using IDSR",
      "Does this health facility have a surveillance reporting system for priority diseases/events?",
      "Main water source(s)",
      "Main power source(s)",
      "Is internet available at the facility?",
      "If yes, type of internet connection",
      "ICT equipment available",
      "Waste management methods available",
      "Cold chain equipment available",
      "Transport available",
      "Photo of facility signboard (optional)",
      "Photo of facility licence/certificate (optional)",
      "Photo of Front the ",
      "Any additional remarks / notes",
      "Health Facility Photo"
    ];
    
    // sampleRow removed as per request

    // Helper to escape CSV fields
    const escapeCsv = (field: string) => {
      if (field === null || field === undefined) return '';
      const stringField = String(field);
      if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n') || stringField.includes('\r')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    const csvContent = headers.map(escapeCsv).join(',');

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
      showNotification('Facilities imported successfully!', 'success');
      
      // Redirect to admin dashboard after a delay
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (error: any) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
      const msg = error.response?.data?.message || 'Failed to upload CSV. Please check the file format and try again.';
      setErrorMessage(msg);
      showNotification(msg, 'error');
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
                  Start Upload
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
