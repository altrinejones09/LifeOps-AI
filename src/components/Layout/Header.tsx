import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, RefreshCw, AlertTriangle, CheckCircle2, User, ChevronDown, LogOut, Shield, Settings, Code, Globe } from 'lucide-react';
import { DemoMode, UserProfile } from '../../types';
import { NavTab } from './Sidebar';
import { useLanguage, SupportedLanguage } from '../../context/LanguageContext';

interface HeaderProps {
  user: UserProfile | null;
  demoMode: DemoMode;
  onSelectDemoMode: (mode: DemoMode) => void;
  onResetDemo: () => void;
  onNavigateToTab?: (tab: NavTab) => void;
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
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [testModeOpen, setTestModeOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (route: string, tab?: NavTab) => {
    if (tab && onNavigateToTab) onNavigateToTab(tab);
    navigate(route);
    setDropdownOpen(false);
  };

  return (
    <header style={{
      backgroundColor: '#0f172a',
      borderBottom: '1px solid #1e293b',
      padding: '12px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 20
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            LifeOps AI
          </h1>
          <span style={{ color: '#334155' }}>|</span>
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#94a3b8' }}>
            Prototype Operations Workspace
          </span>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '11px',
          color: '#38bdf8',
          border: '1px solid #1e293b'
        }}>
          <ShieldCheck size={14} color="#38bdf8" />
          <span style={{ fontWeight: 600 }}>Security Hardened Architecture</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Language Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '4px 8px' }}>
          <Globe size={14} color="#38bdf8" />
          <select
            aria-label="Select Application Language"
            value={language}
            onChange={e => setLanguage(e.target.value as SupportedLanguage)}
            style={{
              backgroundColor: 'transparent',
              color: '#f8fafc',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="English (US)" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>English (US)</option>
            <option value="English (IN)" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>English (IN)</option>
            <option value="Tamil" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Tamil (தமிழ்)</option>
            <option value="Hindi" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Hindi (हिंदी)</option>
          </select>
        </div>

        {/* Test Mode Switcher dropdown for developers */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setTestModeOpen(!testModeOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '6px 10px',
              color: '#94a3b8',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Code size={14} color="#60a5fa" />
            <span>Dev / Test Mode</span>
          </button>

          {testModeOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '40px',
              width: '260px',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '10px',
              padding: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.7)',
              zIndex: 100
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '8px' }}>
                Test Fixtures Environment
              </div>

              <button
                onClick={() => { onSelectDemoMode('mismatch'); setTestModeOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: demoMode === 'mismatch' ? '#78350f' : 'transparent',
                  color: '#fde68a',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginBottom: '4px'
                }}
              >
                <AlertTriangle size={14} color="#f59e0b" />
                Fixture A: Name Mismatch Case
              </button>

              <button
                onClick={() => { onSelectDemoMode('clean'); setTestModeOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: demoMode === 'clean' ? '#14532d' : 'transparent',
                  color: '#86efac',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginBottom: '8px'
                }}
              >
                <CheckCircle2 size={14} color="#22c55e" />
                Fixture B: Clean Verified Case
              </button>

              <button
                onClick={() => { onResetDemo(); setTestModeOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  border: '1px solid #334155',
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={12} /> Reset Fixture Sandbox
              </button>
            </div>
          )}
        </div>

        <div style={{ height: '20px', width: '1px', backgroundColor: '#334155' }} />

        {/* Authenticated User Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              border: '1px solid #334155',
              backgroundColor: '#1e293b',
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
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                {user?.fullName || 'Account Owner'}
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                Personal Operations
              </div>
            </div>

            <ChevronDown size={14} color="#94a3b8" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '44px',
              width: '220px',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '10px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.7)',
              padding: '6px',
              zIndex: 100
            }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #1e293b', marginBottom: '4px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>{user?.fullName}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', wordBreak: 'break-all' }}>{user?.email}</div>
              </div>

              <button
                type="button"
                onClick={() => handleNav('/profile', 'profile')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#cbd5e1',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <User size={15} color="#3b82f6" /> View Profile
              </button>

              <button
                type="button"
                onClick={() => handleNav('/privacy', 'privacy')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#cbd5e1',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Shield size={15} color="#22c55e" /> Privacy & Security
              </button>

              <div style={{ height: '1px', backgroundColor: '#1e293b', margin: '4px 0' }} />

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
                  color: '#fca5a5',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <LogOut size={15} color="#ef4444" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
