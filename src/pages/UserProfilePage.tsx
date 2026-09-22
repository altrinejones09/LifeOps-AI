import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Lock, 
  Edit3, 
  Save, 
  X, 
  CheckCircle2, 
  Sliders, 
  Bell, 
  Globe,
  LogOut
} from 'lucide-react';
import { UserProfile } from '../types';
import { calculateProfileCompletion } from '../engine/authService';

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
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Editable Form State
  const [fullName, setFullName] = useState<string>(user.fullName);
  const [phone, setPhone] = useState<string>(user.phone || '');
  const [location, setLocation] = useState<string>(user.location || '');
  const [dateOfBirth, setDateOfBirth] = useState<string>(user.dateOfBirth || '');
  const [avatar, setAvatar] = useState<string>(user.avatar || 'US');
  const [language, setLanguage] = useState<string>(user.preferences.language || 'English (US)');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(user.preferences.notificationsEnabled);
  const [savedSuccessAlert, setSavedSuccessAlert] = useState<boolean>(false);

  const completionPct = calculateProfileCompletion(user);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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
    setSavedSuccessAlert(true);
    setTimeout(() => setSavedSuccessAlert(false), 3000);
  };

  return (
    <div>
      {/* Header Banner */}
      <div className="page-header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        padding: '24px 32px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        marginBottom: '24px'
      }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User color="#2563eb" />
            User Account & Operations Identity
          </h1>
          <p className="page-subtitle">
            Manage your personal profile, authenticated identity, operations preferences, and local security.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-primary"
            >
              <Edit3 size={16} />
              Edit Profile
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="btn btn-outline"
            >
              <X size={16} />
              Cancel Edit
            </button>
          )}

          <button
            onClick={onSignOut}
            className="btn btn-outline"
            style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      {savedSuccessAlert && (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '12px 20px',
          fontSize: '14px',
          color: '#15803d',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={18} />
          Profile changes updated and saved to Local Demo state.
        </div>
      )}

      {/* Main Profile Summary Card */}
      <div className="card" style={{ marginBottom: '28px', padding: '28px' }}>
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
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            flexShrink: 0
          }}>
            {user.avatar || 'AS'}
          </div>

          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {user.fullName}
              </h2>
              <span className="badge badge-verified" style={{ fontSize: '11px' }}>
                ✓ {user.accountStatus} ACCOUNT
              </span>
            </div>
            
            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={14} color="#64748b" /> {user.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} color="#64748b" /> {user.location || 'Coimbatore, Tamil Nadu'}
              </span>
            </div>
          </div>

          {/* Profile Completion Bar */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px 20px',
            minWidth: '220px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
              <span>Profile Completion</span>
              <span style={{ color: '#2563eb' }}>{completionPct}%</span>
            </div>
            
            <div style={{
              height: '8px',
              backgroundColor: '#e2e8f0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${completionPct}%`,
                backgroundColor: completionPct === 100 ? '#15803d' : '#2563eb',
                borderRadius: '4px',
                transition: 'width 0.4s ease'
              }} />
            </div>

            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
              {completionPct === 100 ? 'All essential identity fields completed' : 'Complete optional fields for optimal matching'}
            </div>
          </div>

        </div>
      </div>

      {/* Main Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Personal & Contact Information */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="#2563eb" />
            Personal & Identity Details
          </h3>

          {!isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Full Name</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{user.fullName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Email Address</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{user.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Phone Number</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{user.phone || 'Not provided'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Primary Location</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{user.location || 'Not provided'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Date of Birth</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{user.dateOfBirth || '14 Jul 2006'}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Primary Location / City
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Coimbatore, Tamil Nadu"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Date of Birth
                </label>
                <input
                  type="text"
                  value={dateOfBirth}
                  onChange={e => setDateOfBirth(e.target.value)}
                  placeholder="YYYY-MM-DD"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Avatar Initials (2 letters)
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={avatar}
                  onChange={e => setAvatar(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="submit"
                  className="btn btn-accent"
                  style={{ flex: 1 }}
                >
                  <Save size={16} /> Save Profile Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Security & Preferences */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Security & Session Card */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} color="#2563eb" />
              Account Security & Local Session
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '6px' }}>
                <span style={{ color: '#64748b' }}>Account ID:</span>
                <code style={{ fontWeight: 700, color: '#0f172a' }}>{user.id}</code>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '6px' }}>
                <span style={{ color: '#64748b' }}>Authentication Provider:</span>
                <span style={{ fontWeight: 700, color: '#2563eb' }}>🔒 {user.authMethod}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '6px' }}>
                <span style={{ color: '#64748b' }}>Current Session:</span>
                <span style={{ fontWeight: 700, color: '#15803d' }}>Active (Persisted Locally)</span>
              </div>
            </div>

            <div style={{ marginTop: '16px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '12px 14px', fontSize: '12px', color: '#1e40af' }}>
              🔒 <strong>Local Demo Security Note:</strong> Authentication credentials and profile state are managed locally in your browser sandbox without exposing plaintext credentials.
            </div>
          </div>

          {/* Preferences Card */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} color="#2563eb" />
              Agent & Workspace Preferences
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={16} color="#64748b" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Preferred Language</span>
                </div>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="English (US)">English (US)</option>
                  <option value="English (IN)">English (IN)</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={16} color="#64748b" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Agent Execution Notifications</span>
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
