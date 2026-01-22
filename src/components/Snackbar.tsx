'use client';

import React from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export default function Snackbar() {
  const { notification, hideNotification } = useNotification();
  const { message, type, isOpen } = notification;

  if (!isOpen) return null;

  const styles = {
    success: {
      bg: '#DCFCE7',
      border: '#22C55E',
      color: '#166534',
      icon: <CheckCircle size={20} color="#166534" />,
    },
    error: {
      bg: '#FEE2E2',
      border: '#EF4444',
      color: '#991B1B',
      icon: <AlertCircle size={20} color="#991B1B" />,
    },
    warning: {
      bg: '#FEF3C7',
      border: '#F59E0B',
      color: '#92400E',
      icon: <AlertTriangle size={20} color="#92400E" />,
    },
    info: {
      bg: '#DBEAFE',
      border: '#3B82F6',
      color: '#1E40AF',
      icon: <Info size={20} color="#1E40AF" />,
    },
  };

  const currentStyle = styles[type];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        padding: '1rem 1.25rem',
        borderRadius: '12px',
        background: currentStyle.bg,
        border: `1px solid ${currentStyle.border}`,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        minWidth: '300px',
        maxWidth: '450px',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <div style={{ marginRight: '0.75rem', display: 'flex' }}>
        {currentStyle.icon}
      </div>
      <div style={{ flex: 1, color: currentStyle.color, fontWeight: 500, fontSize: '0.95rem' }}>
        {message}
      </div>
      <button
        onClick={hideNotification}
        style={{
          marginLeft: '1rem',
          padding: '0.25rem',
          background: 'transparent',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          color: currentStyle.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.7,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
      >
        <X size={18} />
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      ` }} />
    </div>
  );
}
