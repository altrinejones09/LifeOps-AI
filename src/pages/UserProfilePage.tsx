import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Lock, 
  Edit3, 
  Save, 
  X, 
  CheckCircle2, 
  Sliders, 
  Bell, 
  Globe,
  LogOut,
  Clock
} from 'lucide-react';
import { UserProfile } from '../types';
import { calculateProfileCompletion } from '../engine/authService';
import { useNotification } from '../context/NotificationContext';
import { useLanguage, SupportedLanguage } from '../context/LanguageContext';

interface UserProfilePageProps {
  user: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onSignOut: () => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  user,
  onUpdateProfile,
  onSignOut
}) => {
  const { showToast } = useNotification();
  const { language: globalLanguage, setLanguage: setGlobalLanguage } = useLanguage();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Editable Form State
  const [fullName, setFullName] = useState<string>(user.fullName);
  const [phone, setPhone] = useState<string>(user.phone || '');
  const [location, setLocation] = useState<string>(user.location || '');
  const [dateOfBirth, setDateOfBirth] = useState<string>(user.dateOfBirth || '');
  const [avatar, setAvatar] = useState<string>(user.avatar || 'US');
  const [language, setLanguage] = useState<string>(globalLanguage || user.preferences.language || 'English (US)');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(user.preferences.notificationsEnabled);

  const completionPct = calculateProfileCompletion(user);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Full name cannot be empty', 'ERROR');
      return;
    }

    const updatedUser: UserProfile = {
      ...user,
      fullName: fullName.trim(),
      phone: phone.trim(),
      location: location.trim(),
      dateOfBirth: dateOfBirth.trim(),
      avatar: avatar.trim().toUpperCase() || 'US',
      updatedAt: new Date().toISOString(),
      preferences: {
        ...user.preferences,
        language,
        notificationsEnabled
      }
    };

    onUpdateProfile(updatedUser);
    setIsEditing(false);
    showToast('Profile updated and saved successfully', 'SUCCESS');
  };

  const formattedLastUpdated = user.updatedAt 
    ? new Date(user.updatedAt).toLocaleString() 
    : 'Just now';

  return (
    <div style={{ color: '#f8fafc' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0f172a',
        padding: '24px 32px',
        borderRadius: '12px',
        border: '1px solid #1e293b',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#ffffff' }}>
            <User color="#3b82f6" size={26} />
            User Account & Operations Identity
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
            Manage your persistent personal profile, authenticated identity, and operations preferences.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Edit3 size={16} />
              Edit Profile
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #334155',
                color: '#cbd5e1',
                borderRadius: '8px',
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <X size={16} />
              Cancel Edit
            </button>
          )}

          <button
            onClick={onSignOut}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #7f1d1d',
              color: '#fca5a5',
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Profile Summary Card */}
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '28px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          
          {/* Avatar Circle */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            fontWeight: 800,
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
            flexShrink: 0
          }}>
            {user.avatar || 'AS'}
          </div>

          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                {user.fullName}
              </h2>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid #15803d' }}>
                ✓ {user.accountStatus} ACCOUNT
              </span>
            </div>
            
            <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} color="#60a5fa" /> {user.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="#60a5fa" /> {user.location || 'Coimbatore, Tamil Nadu'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                <Clock size={14} color="#64748b" /> Last updated: {formattedLastUpdated}
              </span>
            </div>
          </div>

          {/* Profile Completion Bar */}
          <div style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '10px',
            padding: '16px 20px',
            minWidth: '220px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
              <span>Profile Completion</span>
              <span style={{ color: '#60a5fa' }}>{completionPct}%</span>
            </div>
            
            <div style={{
              height: '8px',
              backgroundColor: '#0f172a',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${completionPct}%`,
                backgroundColor: completionPct === 100 ? '#22c55e' : '#2563eb',
                borderRadius: '4px',
                transition: 'width 0.4s ease'
              }} />
            </div>

            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
              {completionPct === 100 ? 'All essential identity attributes complete' : 'Fill optional fields for higher matching precision'}
            </div>
          </div>

        </div>
      </div>

      {/* Main Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Personal Details */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="#3b82f6" />
            Personal & Identity Details
          </h3>

          {!isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Full Legal Name</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{user.fullName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Email Address</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>{user.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Phone Number</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>{user.phone || 'Not provided'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Primary Location</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>{user.location || 'Not provided'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Date of Birth</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>{user.dateOfBirth || '14 Jul 2006'}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#ffffff', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#ffffff', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
                  Primary Location / City
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Coimbatore, Tamil Nadu"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#ffffff', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
                  Date of Birth
                </label>
                <input
                  type="text"
                  value={dateOfBirth}
                  onChange={e => setDateOfBirth(e.target.value)}
                  placeholder="YYYY-MM-DD"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#ffffff', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Save size={16} /> Save Profile Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{ backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Security & Preferences */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Security & Session */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} color="#3b82f6" />
              Account Security & Session State
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#1e293b', padding: '10px 14px', borderRadius: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Account ID:</span>
                <code style={{ fontWeight: 700, color: '#38bdf8' }}>{user.id}</code>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#1e293b', padding: '10px 14px', borderRadius: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Auth Method:</span>
                <span style={{ fontWeight: 700, color: '#60a5fa' }}>🔒 Provider Managed</span>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} color="#3b82f6" />
              Workspace Preferences
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={16} color="#94a3b8" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>Preferred Language</span>
                </div>
                <select
                  value={globalLanguage}
                  onChange={e => {
                    const newLang = e.target.value as SupportedLanguage;
                    setLanguage(newLang);
                    setGlobalLanguage(newLang);
                  }}
                  style={{ backgroundColor: '#1e293b', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', border: '1px solid #334155', fontSize: '13px' }}
                >
                  <option value="English (US)">English (US)</option>
                  <option value="English (IN)">English (IN)</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={16} color="#94a3b8" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>Execution Notifications</span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={e => setNotificationsEnabled(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
