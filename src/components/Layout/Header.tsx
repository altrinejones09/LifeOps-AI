import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, RefreshCw, AlertTriangle, CheckCircle2, User, ChevronDown, LogOut, Shield, Settings } from 'lucide-react';
import { DemoMode, UserProfile } from '../../types';
import { NavTab } from './Sidebar';

interface HeaderProps {
  user: UserProfile | null;
  demoMode: DemoMode;
  onSelectDemoMode: (mode: DemoMode) => void;
  onResetDemo: () => void;
  onNavigateToTab: (tab: NavTab) => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  demoMode,
  onSelectDemoMode,
  onResetDemo,
  onNavigateToTab,
  onSignOut
}) => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header-bar" style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '12px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 20
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              LifeOps AI
            </h1>
            <span style={{ color: '#94a3b8' }}>|</span>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#475569' }}>
              Secure Application Workspace
            </span>
          </div>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#f1f5f9',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '12px',
          color: '#334155',
          border: '1px solid #cbd5e1'
        }}>
          <ShieldCheck size={14} color="#2563eb" />
          <span style={{ fontWeight: 600 }}>🔒 Local Demo Mode</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Quick Demo Dataset Selector for Judges */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
          padding: '3px',
          borderRadius: '6px',
          border: '1px solid #e2e8f0'
        }}>
          <button
            onClick={() => onSelectDemoMode('mismatch')}
            className={`btn btn-sm ${demoMode === 'mismatch' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              borderRadius: '4px',
              backgroundColor: demoMode === 'mismatch' ? '#b45309' : 'transparent',
              color: demoMode === 'mismatch' ? '#ffffff' : '#64748b',
              border: 'none',
              fontWeight: 600
            }}
            title="Load dataset containing name mismatch between Aadhaar and Income Certificate"
          >
            <AlertTriangle size={13} />
            Demo A — Mismatch Case
          </button>
          
          <button
            onClick={() => onSelectDemoMode('clean')}
            className={`btn btn-sm ${demoMode === 'clean' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              borderRadius: '4px',
              backgroundColor: demoMode === 'clean' ? '#15803d' : 'transparent',
              color: demoMode === 'clean' ? '#ffffff' : '#64748b',
              border: 'none',
              fontWeight: 600
            }}
            title="Load clean verified dataset where all documents match perfectly"
          >
            <CheckCircle2 size={13} />
            Demo B — Clean Case
          </button>
        </div>

        <button
          onClick={onResetDemo}
          className="btn btn-outline btn-sm"
          style={{ fontSize: '12px', color: '#64748b' }}
          title="Reset local state to fresh defaults"
        >
          <RefreshCw size={13} />
          Reset State
        </button>

        <div style={{
          height: '24px',
          width: '1px',
          backgroundColor: '#e2e8f0'
        }} />

        {/* Authenticated User Menu Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              padding: '4px 10px 4px 6px',
              borderRadius: '24px',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '13px'
            }}>
              {user?.avatar || 'AS'}
            </div>

            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                {user?.fullName || 'Aarav Sharma'}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>
                Personal Operations
              </div>
            </div>

            <ChevronDown size={14} color="#64748b" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '44px',
              width: '220px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
              padding: '6px',
              zIndex: 100
            }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{user?.fullName}</div>
                <div style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-all' }}>{user?.email}</div>
              </div>

              <button
                type="button"
                onClick={() => { onNavigateToTab('profile'); setDropdownOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                className="card-hover"
              >
                <User size={15} color="#2563eb" /> View Profile
              </button>

              <button
                type="button"
                onClick={() => { onNavigateToTab('profile'); setDropdownOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                className="card-hover"
              >
                <Settings size={15} color="#475569" /> Edit Profile
              </button>

              <button
                type="button"
                onClick={() => { onNavigateToTab('privacy'); setDropdownOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                className="card-hover"
              >
                <Shield size={15} color="#15803d" /> Privacy & Security
              </button>

              <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '4px 0' }} />

              <button
                type="button"
                onClick={() => { onSignOut(); setDropdownOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#b91c1c',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                className="card-hover"
              >
                <LogOut size={15} color="#b91c1c" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

