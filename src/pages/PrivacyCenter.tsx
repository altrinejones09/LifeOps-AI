import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Database, 
  RotateCcw, 
  AlertTriangle,
  Info,
  Key
} from 'lucide-react';
import { PrivacySettings, UserDocument } from '../types';

interface PrivacyCenterProps {
  documents: UserDocument[];
  privacySettings: PrivacySettings;
  onUpdatePrivacySettings: (settings: PrivacySettings) => void;
  onResetAgentRun: () => void;
  onResetDemo: () => void;
  onSignOut?: () => void;
}

export const PrivacyCenter: React.FC<PrivacyCenterProps> = ({
  documents,
  privacySettings,
  onUpdatePrivacySettings,
  onResetAgentRun,
  onResetDemo,
  onSignOut
}) => {
  const [maskFields, setMaskFields] = useState<boolean>(privacySettings.maskSensitiveFields);
  const [minimization, setMinimization] = useState<boolean>(privacySettings.dataMinimizationEnabled);
  const [consent, setConsent] = useState<boolean>(privacySettings.consentApproved);

  const handleToggleMasking = () => {
    const updated = { ...privacySettings, maskSensitiveFields: !maskFields };
    setMaskFields(!maskFields);
    onUpdatePrivacySettings(updated);
  };

  const handleToggleMinimization = () => {
    const updated = { ...privacySettings, dataMinimizationEnabled: !minimization };
    setMinimization(!minimization);
    onUpdatePrivacySettings(updated);
  };

  const handleToggleConsent = () => {
    const updated = { 
      ...privacySettings, 
      consentApproved: !consent,
      consentApprovedAt: !consent ? new Date().toISOString() : undefined
    };
    setConsent(!consent);
    onUpdatePrivacySettings(updated);
  };

  const categories = [
    {
      id: 'cat-identity',
      title: 'Identity Credentials',
      count: documents.filter(d => d.type === 'aadhaar').length,
      fields: ['Full Name', 'Father Name', 'Date of Birth', 'Address', 'Aadhaar Number (Masked)'],
      sensitive: ['Aadhaar Number'],
      purpose: 'Verification Engine identity consistency checks'
    },
    {
      id: 'cat-academic',
      title: 'Academic Performance',
      count: documents.filter(d => d.type === 'marksheet').length,
      fields: ['Class 10 Score', 'Roll Number'],
      sensitive: [],
      purpose: 'Eligibility Engine academic percentage rule evaluation'
    },
    {
      id: 'cat-financial',
      title: 'Financial & Household Income',
      count: documents.filter(d => d.type === 'income_certificate' || d.type === 'bank_passbook').length,
      fields: ['Annual Household Income', 'Bank Account Number (Masked)', 'IFSC Code'],
      sensitive: ['Bank Account Number', 'IFSC Code'],
      purpose: 'Income ceiling qualification & scholarship disbursement verification'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '24px',
        borderRadius: '12px',
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
          }}>
            <Lock size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
              Privacy & Security Center
            </h1>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Data minimization, sensitive field masking, and local demo privacy status.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            padding: '4px 12px',
            borderRadius: '20px',
            backgroundColor: '#14532d',
            color: '#86efac',
            border: '1px solid #16a34a',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <ShieldCheck size={14} />
            Local Demo Mode — Zero External Transmission
          </span>
        </div>
      </div>

      {/* Main Privacy Controls Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Sensitive Field Masking Control */}
        <div style={{
          backgroundColor: '#0f172a',
          borderRadius: '12px',
          border: '1px solid #1e293b',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {maskFields ? <EyeOff size={18} color="#38bdf8" /> : <Eye size={18} color="#f59e0b" />}
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>Mask Sensitive Identifiers</span>
            </div>
            <button
              onClick={handleToggleMasking}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                backgroundColor: maskFields ? '#16a34a' : '#1e293b',
                color: '#ffffff',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {maskFields ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.4' }}>
            Automatically masks Aadhaar numbers and bank account numbers across Agent Workspace, Application Drafts, and Audit Logs.
          </div>
        </div>

        {/* Data Minimization Principle */}
        <div style={{
          backgroundColor: '#0f172a',
          borderRadius: '12px',
          border: '1px solid #1e293b',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} color="#4ade80" />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>Data Minimization Principle</span>
            </div>
            <button
              onClick={handleToggleMinimization}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                backgroundColor: minimization ? '#16a34a' : '#1e293b',
                color: '#ffffff',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {minimization ? 'ENFORCED' : 'OFF'}
            </button>
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.4' }}>
            LifeOps inspects ONLY the attributes strictly required for active workflow eligibility. Unnecessary document fields are excluded from prompts.
          </div>
        </div>

        {/* Workflow Consent Confirmation */}
        <div style={{
          backgroundColor: '#0f172a',
          borderRadius: '12px',
          border: '1px solid #1e293b',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="#a78bfa" />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>Workflow Consent Confirmation</span>
            </div>
            <button
              onClick={handleToggleConsent}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                backgroundColor: consent ? '#16a34a' : '#78350f',
                color: consent ? '#ffffff' : '#fde047',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {consent ? 'AUTHORIZED' : 'PENDING'}
            </button>
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.4' }}>
            User explicit consent for vault data inspection. Rejecting consent pauses dependent agent operations until authorized.
          </div>
        </div>

      </div>

      {/* Data Inventory Categories */}
      <div style={{
        backgroundColor: '#0f172a',
        borderRadius: '12px',
        border: '1px solid #1e293b',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
          Personal Information Category Inventory
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              style={{
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: '#090d16',
                border: '1px solid #1e293b',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{cat.title}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#1e293b', color: '#38bdf8' }}>
                  {cat.count} Files
                </span>
              </div>

              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                <strong>Fields Used:</strong> {cat.fields.join(', ')}
              </div>

              <div style={{ fontSize: '12px', color: '#60a5fa' }}>
                <strong>Purpose:</strong> {cat.purpose}
              </div>

              {cat.sensitive.length > 0 && (
                <div style={{ fontSize: '11px', color: '#fde047', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={12} /> Masked Identifiers: {cat.sensitive.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Local Demo Data Controls */}
      <div style={{
        backgroundColor: '#0f172a',
        borderRadius: '12px',
        border: '1px solid #1e293b',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
          Local Demo Security & State Actions
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={onResetAgentRun}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              backgroundColor: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <RotateCcw size={14} />
            Clear Agent Run State Only
          </button>

          <button
            onClick={onResetDemo}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              backgroundColor: '#78350f',
              color: '#fde047',
              border: '1px solid #92400e',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertTriangle size={14} />
            Reset Full Demo Dataset
          </button>
        </div>
      </div>

    </div>
  );
};
