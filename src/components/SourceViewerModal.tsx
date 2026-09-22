import React from 'react';
import { FileText, X, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { UserDocument } from '../types';

interface SourceViewerModalProps {
  documentName: string;
  fieldKey?: string;
  documents: UserDocument[];
  onClose: () => void;
}

export const SourceViewerModal: React.FC<SourceViewerModalProps> = ({
  documentName,
  fieldKey,
  documents,
  onClose
}) => {
  const doc = documents.find(d => d.name.toLowerCase().includes(documentName.toLowerCase()) || d.type.toLowerCase().includes(documentName.toLowerCase()));

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#0f172a',
        borderRadius: '12px',
        border: '1px solid #1e293b',
        maxWidth: '560px',
        width: '100%',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} color="#3b82f6" />
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                {doc ? doc.name : documentName}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Field Provenance Inspection • Vault ID: {doc?.id || 'doc-vault-ref'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Verification Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          borderRadius: '6px',
          backgroundColor: '#090d16',
          border: '1px solid #1e293b'
        }}>
          <ShieldCheck size={16} color="#22c55e" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#4ade80' }}>
            Verified Vault Document • Extracted via OCR Scan
          </span>
        </div>

        {/* Extracted Fields Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Extracted Attributes:
          </div>
          {doc ? (
            doc.fields.map(f => {
              const isHighlight = fieldKey && (f.field === fieldKey || f.label.toLowerCase().includes(fieldKey.toLowerCase()));
              return (
                <div
                  key={f.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: isHighlight ? 'rgba(37, 99, 235, 0.15)' : '#090d16',
                    border: `1px solid ${isHighlight ? '#2563eb' : '#1e293b'}`
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>{f.label}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                      {f.sensitive ? 'XXXX XXXX ' + f.value.slice(-4) : f.value}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {f.sensitive && (
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#78350f', color: '#fde047' }}>
                        <Lock size={10} style={{ display: 'inline', marginRight: '2px' }} /> Masked
                      </span>
                    )}
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#4ade80', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <CheckCircle2 size={12} /> {f.confidence} confidence
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
              Document metadata verified in Document Vault.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid #1e293b' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              backgroundColor: '#1e293b',
              color: '#ffffff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Close Provenance View
          </button>
        </div>
      </div>
    </div>
  );
};
