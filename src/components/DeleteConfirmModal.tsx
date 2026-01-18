'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  facilityName?: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Facility',
  message = 'Are you sure you want to delete this facility? This action cannot be undone.',
  facilityName
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleBackdropClick}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Modal */}
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxWidth: '480px',
            width: '100%',
            padding: '1.5rem',
            position: 'relative',
            animation: 'scaleIn 0.2s ease-out',
            zIndex: 1001
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              padding: '0.5rem',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'var(--gray-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--gray-100)';
              e.currentTarget.style.color = 'var(--gray-600)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--gray-400)';
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Icon */}
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#FEF2F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}
          >
            <AlertTriangle size={24} color="#DC2626" />
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'var(--gray-900)',
              marginBottom: '0.5rem'
            }}
          >
            {title}
          </h3>

          {/* Message */}
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--gray-600)',
              lineHeight: '1.5',
              marginBottom: facilityName ? '0.5rem' : '1.5rem'
            }}
          >
            {message}
          </p>

          {/* Facility name if provided */}
          {facilityName && (
            <div
              style={{
                padding: '0.75rem',
                background: 'var(--gray-50)',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                border: '1px solid var(--border-color)'
              }}
            >
              <p
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--gray-900)',
                  margin: 0
                }}
              >
                {facilityName}
              </p>
            </div>
          )}

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end',
              marginTop: '1.5rem'
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--gray-700)',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.95rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--gray-50)';
                e.currentTarget.style.borderColor = 'var(--gray-300)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#DC2626',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.95rem',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#B91C1C';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#DC2626';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}} />
    </>
  );
}
