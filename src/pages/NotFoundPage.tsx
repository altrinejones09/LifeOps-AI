import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 20px',
      color: '#f8fafc'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        color: '#ef4444',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <ShieldAlert size={32} />
      </div>

      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
        404 — Route Not Located
      </h1>
      
      <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '420px', lineHeight: 1.6, marginBottom: '28px' }}>
        The requested operations page does not exist or has moved. LifeOps AI keeps all your workflow states safe.
      </p>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #334155',
            color: '#cbd5e1',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ArrowLeft size={16} /> Go Back
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          style={{
            backgroundColor: '#2563eb',
            border: 'none',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Home size={16} /> Return to Operations Dashboard
        </button>
      </div>
    </div>
  );
};
