import React, { useState } from 'react';
import { 
  History, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  FileText, 
  AlertTriangle, 
  UploadCloud, 
  RefreshCw,
  Send,
  Filter,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AuditEvent } from '../types';
import { verifyAuditChain } from '../utils/audit';

interface AuditTrailProps {
  auditLogs: AuditEvent[];
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ auditLogs }) => {
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [tamperedTestLogs, setTamperedTestLogs] = useState<AuditEvent[] | null>(null);
  const [verificationResult, setVerificationResult] = useState<{ valid: boolean; brokenIndex?: number; reason?: string } | null>(null);

  const activeLogs = tamperedTestLogs || auditLogs;
  const currentIntegrity = verifyAuditChain(activeLogs);

  const handleRunIntegrityCheck = () => {
    setTamperedTestLogs(null);
    const result = verifyAuditChain(auditLogs);
    setVerificationResult(result);
  };

  const handleSimulateTamperTest = () => {
    if (auditLogs.length === 0) return;
    const corrupted = auditLogs.map((log, idx) => {
      if (idx === auditLogs.length - 1) {
        return {
          ...log,
          details: log.details + ' [UNAUTHORIZED LOCAL TAMPERING DETECTED]'
        };
      }
      return log;
    });
    setTamperedTestLogs(corrupted);
    const result = verifyAuditChain(corrupted);
    setVerificationResult(result);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'DOCUMENT_ADDED': return <UploadCloud size={16} color="#2563eb" />;
      case 'VERIFICATION_RUN': return <ShieldCheck size={16} color="#15803d" />;
      case 'DISCREPANCY_ACKNOWLEDGED': return <AlertTriangle size={16} color="#b45309" />;
      case 'APPLICATION_SUBMITTED': return <Send size={16} color="#15803d" />;
      case 'DEMO_RESET': return <RefreshCw size={16} color="#4338ca" />;
      default: return <FileText size={16} color="#64748b" />;
    }
  };

  const actionTypes = ['ALL', 'DOCUMENT_ADDED', 'VERIFICATION_RUN', 'DISCREPANCY_ACKNOWLEDGED', 'APPLICATION_SUBMITTED'];

  const filteredLogs = activeLogs.filter(log => {
    const matchesFilter = selectedActionFilter === 'ALL' || log.action === selectedActionFilter;
    const matchesSearch = !searchTerm || 
      log.actionLabel.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div>
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
            <History color="#2563eb" />
            Cryptographic SHA-256 Audit Ledger
          </h1>
          <p className="page-subtitle">
            Tamper-evident administrative ledger. Every event is cryptographically linked with SHA-256 payload hashing.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleRunIntegrityCheck}
            className="btn btn-primary btn-sm"
          >
            <ShieldCheck size={14} />
            Verify Chain Integrity
          </button>
          <button
            onClick={handleSimulateTamperTest}
            className="btn btn-outline btn-sm"
            style={{ color: '#b45309', borderColor: '#fde047' }}
          >
            <AlertTriangle size={14} />
            Simulate Tamper Test
          </button>
        </div>
      </div>

      {/* Audit Chain Integrity Status Banner */}
      <div className="card" style={{
        backgroundColor: currentIntegrity.valid ? '#f0fdf4' : '#fef2f2',
        borderColor: currentIntegrity.valid ? '#bbf7d0' : '#fecaca',
        marginBottom: '24px',
        padding: '16px 20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: currentIntegrity.valid ? '#dcfce7' : '#fee2e2',
              color: currentIntegrity.valid ? '#15803d' : '#b91c1c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {currentIntegrity.valid ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: currentIntegrity.valid ? '#166534' : '#991b1b' }}>
                {currentIntegrity.valid ? '✓ SHA-256 AUDIT CHAIN VERIFIED (0 Tampering Detected)' : '⚠ AUDIT INTEGRITY ERROR: Tampering Detected'}
              </div>
              <div style={{ fontSize: '12px', color: currentIntegrity.valid ? '#15803d' : '#b91c1c', marginTop: '2px' }}>
                {currentIntegrity.valid
                  ? `All ${activeLogs.length} events are cryptographically linked using SHA-256 hash chaining.`
                  : currentIntegrity.reason}
              </div>
            </div>
          </div>

          {tamperedTestLogs && (
            <button
              onClick={handleRunIntegrityCheck}
              className="btn btn-sm btn-outline"
              style={{ fontSize: '12px', color: '#15803d', borderColor: '#86efac' }}
            >
              Restore Valid Chain
            </button>
          )}
        </div>
      </div>

      {/* UPGRADE #14: Filter & Search Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Filter size={16} color="#64748b" />
            {actionTypes.map(act => (
              <button
                key={act}
                onClick={() => setSelectedActionFilter(act)}
                className={`btn btn-sm ${selectedActionFilter === act ? 'btn-primary' : 'btn-outline'}`}
                style={{ borderRadius: '16px', fontSize: '12px' }}
              >
                {act === 'ALL' ? 'All Events' : act.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px' }}>
            <Search size={14} color="#64748b" />
            <input
              type="text"
              placeholder="Search audit records..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#0f172a', width: '180px' }}
            />
          </div>
        </div>
      </div>

      {/* Ledger Timeline List */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>
          Chronological Event Ledger ({filteredLogs.length} Events)
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredLogs.map((log, idx) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: idx === 0 ? '#eff6ff' : '#ffffff',
                  borderLeft: `4px solid ${idx === 0 ? '#2563eb' : '#cbd5e1'}`
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '16px'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {getActionIcon(log.action)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                          {log.actionLabel}
                        </span>
                        <span className="provenance-tag" style={{ fontSize: '10px' }}>
                          {log.id}
                        </span>
                      </div>

                      <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                        {log.timestamp}
                      </span>
                    </div>

                    <p style={{ fontSize: '13px', color: '#334155', marginTop: '6px', lineHeight: 1.5 }}>
                      {log.details}
                    </p>

                    {/* Additional Event Metadata */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '10px',
                      fontSize: '12px',
                      color: '#64748b'
                    }}>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        {log.sourceDocument && (
                          <div>
                            Source Document: <strong style={{ color: '#0f172a' }}>{log.sourceDocument}</strong>
                          </div>
                        )}
                        {log.field && (
                          <div>
                            Target Field: <strong style={{ color: '#0f172a' }}>{log.field}</strong>
                          </div>
                        )}
                        <div>
                          Authorized By: <strong style={{ color: '#2563eb' }}>{log.approvedBy}</strong>
                        </div>
                      </div>

                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        style={{ border: 'none', background: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {isExpanded ? 'Hide Raw Metadata' : 'View Raw Metadata'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* UPGRADE #14: JSON Raw Event Payload Viewer */}
                {isExpanded && (
                  <div style={{
                    backgroundColor: '#0f172a',
                    color: '#38bdf8',
                    padding: '12px 16px',
                    borderTop: '1px solid #1e293b',
                    borderBottomLeftRadius: '6px',
                    borderBottomRightRadius: '6px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    overflowX: 'auto'
                  }}>
                    <pre style={{ margin: 0 }}>{JSON.stringify(log, null, 2)}</pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

