import React, { useState } from 'react';
import { 
  FolderLock, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Eye, 
  EyeOff,
  Lock, 
  Info,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { UserDocument, DemoMode } from '../types';

interface DocumentVaultProps {
  documents: UserDocument[];
  demoMode: DemoMode;
  onSelectDemoMode: (mode: DemoMode) => void;
  onAddSimulatedDocument: (doc: UserDocument) => void;
}

export const DocumentVault: React.FC<DocumentVaultProps> = ({
  documents,
  demoMode,
  onSelectDemoMode,
  onAddSimulatedDocument
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || '');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string>('');
  const [showMaskedValues, setShowMaskedValues] = useState<boolean>(false);

  const selectedDoc = documents.find(d => d.id === selectedDocId) || documents[0];

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadSuccessMessage('');

    setTimeout(() => {
      const newDoc: UserDocument = {
        id: `doc-uploaded-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, '').toUpperCase() + ' (Uploaded)',
        type: 'other',
        uploadedAt: new Date().toISOString(),
        status: 'verified',
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        fields: [
          {
            id: `uf-1`,
            field: 'fullName',
            label: 'Extracted Full Name',
            value: 'Arun Kumar',
            sourceDocument: file.name,
            confidence: 'high'
          },
          {
            id: `uf-2`,
            field: 'address',
            label: 'Extracted Address',
            value: 'Coimbatore, Tamil Nadu',
            sourceDocument: file.name,
            confidence: 'medium'
          }
        ]
      };

      onAddSimulatedDocument(newDoc);
      setSelectedDocId(newDoc.id);
      setIsUploading(false);
      setUploadSuccessMessage(`Simulated OCR successfully extracted 2 fields from "${file.name}"`);
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        backgroundColor: '#0f172a',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #1e293b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
          }}>
            <FolderLock size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
              Intelligent Document Vault
            </h1>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Structured personal information workspace with OCR extraction confidence & field sensitivity masking.
            </p>
          </div>
        </div>

        {/* Demo Switchers & Upload */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <label style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
          }}>
            <UploadCloud size={16} />
            {isUploading ? 'Simulating OCR...' : 'Upload New Document'}
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleSimulatedFileUpload}
              disabled={isUploading}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {uploadSuccessMessage && (
        <div style={{
          backgroundColor: '#091528',
          border: '1px solid #16a34a',
          color: '#86efac',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} />
          {uploadSuccessMessage}
        </div>
      )}

      {/* Predefined Datasets Toggle */}
      <div style={{
        backgroundColor: '#0f172a',
        borderRadius: '12px',
        border: '1px solid #1e293b',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Predefined Demo Datasets
          </span>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '2px 0 0 0' }}>
            Switch instantly between realistic mismatch and clean document datasets for live testing.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => onSelectDemoMode('mismatch')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              backgroundColor: demoMode === 'mismatch' ? '#78350f' : '#1e293b',
              color: demoMode === 'mismatch' ? '#fde047' : '#cbd5e1',
              border: `1px solid ${demoMode === 'mismatch' ? '#92400e' : '#334155'}`,
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <AlertTriangle size={14} />
            Demo A — Mismatch Case
          </button>
          <button
            onClick={() => onSelectDemoMode('clean')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              backgroundColor: demoMode === 'clean' ? '#14532d' : '#1e293b',
              color: demoMode === 'clean' ? '#86efac' : '#cbd5e1',
              border: `1px solid ${demoMode === 'clean' ? '#16a34a' : '#334155'}`,
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <CheckCircle2 size={14} />
            Demo B — Clean Case
          </button>
        </div>
      </div>

      {/* Two Column Document Vault Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 360px) 1fr', gap: '24px' }}>
        
        {/* Left: Document Selector Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Vault Credentials ({documents.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {documents.map(doc => {
              const isSelected = doc.id === selectedDoc?.id;
              const hasWarning = doc.status === 'warning';
              const sensitiveCount = doc.fields.filter(f => f.sensitive).length;

              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? '#091528' : '#0f172a',
                    border: `1px solid ${isSelected ? '#2563eb' : (hasWarning ? '#d97706' : '#1e293b')}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={20} color={isSelected ? '#38bdf8' : '#64748b'} />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
                          {doc.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {doc.fields.length} extracted attributes
                        </div>
                      </div>
                    </div>

                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: hasWarning ? '#78350f' : '#14532d',
                      color: hasWarning ? '#fde047' : '#86efac',
                      border: `1px solid ${hasWarning ? '#92400e' : '#16a34a'}`
                    }}>
                      {hasWarning ? 'WARNING' : 'VERIFIED'}
                    </span>
                  </div>

                  {/* Badges */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {sensitiveCount > 0 && (
                      <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#1e293b', color: '#cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Lock size={10} /> {sensitiveCount} Masked
                      </span>
                    )}
                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#090d16', color: '#60a5fa', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <Tag size={10} /> Used by State Scheme
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Document Detail & Field Extraction View */}
        {selectedDoc && (
          <div style={{
            backgroundColor: '#0f172a',
            borderRadius: '12px',
            border: '1px solid #1e293b',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #1e293b' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Document Vault Source Provenance
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', margin: '4px 0 0 0' }}>
                  {selectedDoc.name}
                </h2>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  File: {selectedDoc.fileName || 'document_scan.pdf'} ({selectedDoc.fileSize || '1.2 MB'}) • Uploaded: {new Date(selectedDoc.uploadedAt).toLocaleDateString()}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: selectedDoc.status === 'warning' ? '#78350f' : '#14532d',
                  color: selectedDoc.status === 'warning' ? '#fde047' : '#86efac',
                  border: `1px solid ${selectedDoc.status === 'warning' ? '#92400e' : '#16a34a'}`
                }}>
                  {selectedDoc.status === 'warning' ? 'Discrepancy Flagged' : 'Verified Integrity'}
                </span>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  OCR Confidence: 99.4%
                </div>
              </div>
            </div>

            {/* Extracted Fields Table */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Extracted Attributes ({selectedDoc.fields.length})
              </h3>
              <button
                onClick={() => setShowMaskedValues(!showMaskedValues)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#1e293b',
                  color: '#93c5fd',
                  border: '1px solid #334155',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {showMaskedValues ? <EyeOff size={13} /> : <Eye size={13} />}
                {showMaskedValues ? 'Mask Sensitive Values' : 'Reveal Sensitive Values'}
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e293b', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '10px 12px' }}>Field Name</th>
                    <th style={{ padding: '10px 12px' }}>Extracted Value</th>
                    <th style={{ padding: '10px 12px' }}>Confidence</th>
                    <th style={{ padding: '10px 12px' }}>Source Provenance</th>
                    <th style={{ padding: '10px 12px' }}>Sensitivity</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDoc.fields.map(f => {
                    const isMasked = f.sensitive && !showMaskedValues;
                    const displayValue = isMasked ? 'XXXX XXXX ' + f.value.slice(-4) : f.value;

                    return (
                      <tr key={f.id} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#ffffff' }}>
                          {f.label}
                        </td>
                        <td style={{ padding: '12px', fontFamily: f.sensitive ? 'monospace' : 'inherit', fontWeight: 500, color: isMasked ? '#f59e0b' : '#38bdf8' }}>
                          {displayValue}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#4ade80',
                            backgroundColor: '#090d16',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            border: '1px solid #16a34a'
                          }}>
                            {f.confidence.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontSize: '12px', color: '#94a3b8', backgroundColor: '#090d16', padding: '3px 8px', borderRadius: '4px', border: '1px solid #1e293b' }}>
                            {f.sourceDocument}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {f.sensitive ? (
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#fde047',
                              backgroundColor: '#78350f',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <Lock size={10} /> Sensitive
                            </span>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Standard</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Workflow Usage Panel */}
            <div style={{
              padding: '14px 16px',
              borderRadius: '8px',
              backgroundColor: '#090d16',
              border: '1px solid #1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <ShieldCheck size={18} color="#3b82f6" />
              <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                Used by workflows: <strong style={{ color: '#ffffff' }}>State Student Support Scheme</strong> and <strong style={{ color: '#ffffff' }}>Merit Education Assistance</strong>.
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
