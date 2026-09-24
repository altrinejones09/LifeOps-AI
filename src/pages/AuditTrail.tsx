import React, { useState } from 'react';
import { 
  History, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  AlertTriangle, 
  UploadCloud, 
  RefreshCw,
  Send,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Key
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
          details: log.details + ' [UNAUTHORIZED SHA-256 PAYLOAD TAMPERING DETECTED]'
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
      case 'DOCUMENT_ADDED': return <UploadCloud size={16} color="#3b82f6" />;
      case 'VERIFICATION_RUN': return <ShieldCheck size={16} color="#22c55e" />;
      case 'DISCREPANCY_ACKNOWLEDGED': return <AlertTriangle size={16} color="#f59e0b" />;
      case 'APPLICATION_SUBMITTED': return <Send size={16} color="#22c55e" />;
      case 'DEMO_RESET': return <RefreshCw size={16} color="#a855f7" />;
      default: return <FileText size={16} color="#94a3b8" />;
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
            <History color="#3b82f6" size={26} />
            Cryptographic SHA-256 Audit Trail
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
            Tamper-evident operations ledger. Every administrative action is linked via SHA-256 hash chains.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleRunIntegrityCheck}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ShieldCheck size={16} />
            Verify Audit Integrity
          </button>
          <button
            onClick={handleSimulateTamperTest}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #b45309',
              color: '#fde047',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <AlertTriangle size={16} />
            Simulate Tamper Test
          </button>
        </div>
      </div>

      {/* Audit Chain Status Banner */}
      <div style={{
        backgroundColor: currentIntegrity.valid ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        border: `1px solid ${currentIntegrity.valid ? '#15803d' : '#991b1b'}`,
        borderRadius: '10px',
        marginBottom: '24px',
        padding: '16px 20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: currentIntegrity.valid ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: currentIntegrity.valid ? '#4ade80' : '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {currentIntegrity.valid ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: currentIntegrity.valid ? '#4ade80' : '#fca5a5' }}>
                {currentIntegrity.valid ? '✓ SHA-256 AUDIT CHAIN VERIFIED (0 Tampering Detected)' : '⚠ CRYPTOGRAPHIC TAMPERING DETECTED'}
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
                {currentIntegrity.valid
                  ? `All ${activeLogs.length} events are verified using Web Crypto SHA-256 hash linkage.`
                  : currentIntegrity.reason}
              </div>
            </div>
          </div>

          {tamperedTestLogs && (
            <button
              onClick={handleRunIntegrityCheck}
              style={{
                backgroundColor: '#15803d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Restore Valid Chain
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search */}
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Filter size={16} color="#94a3b8" />
            {actionTypes.map(act => (
              <button
                key={act}
                onClick={() => setSelectedActionFilter(act)}
                style={{
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '4px 12px',
                  border: '1px solid #334155',
                  backgroundColor: selectedActionFilter === act ? '#2563eb' : '#1e293b',
                  color: selectedActionFilter === act ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                {act === 'ALL' ? 'All Events' : act.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '6px 12px' }}>
            <Search size={14} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search SHA-256 records..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#ffffff', width: '180px' }}
            />
          </div>
        </div>
      </div>

      {/* Ledger Timeline */}
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '20px' }}>
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
                  borderRadius: '8px',
                  border: '1px solid #1e293b',
                  backgroundColor: idx === 0 ? '#1e293b' : '#0f172a',
                  borderLeft: `4px solid ${idx === 0 ? '#2563eb' : '#334155'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#1e293b',
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
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
                          {log.actionLabel}
                        </span>
                        <code style={{ fontSize: '11px', color: '#38bdf8', backgroundColor: '#1e293b', padding: '2px 6px', borderRadius: '4px' }}>
                          {log.id}
                        </code>
                      </div>

                      <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '6px', lineHeight: 1.5 }}>
                      {log.details}
                    </p>

                    {log.hash && (
                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                        <Key size={12} color="#60a5fa" />
                        <span>SHA-256 Hash: <code style={{ color: '#60a5fa' }}>{log.hash}</code></span>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', fontSize: '12px', color: '#94a3b8' }}>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        {log.sourceDocument && (
                          <div>
                            Source Document: <strong style={{ color: '#ffffff' }}>{log.sourceDocument}</strong>
                          </div>
                        )}
                        <div>
                          Authorized By: <strong style={{ color: '#60a5fa' }}>{log.approvedBy}</strong>
                        </div>
                      </div>

                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        style={{ border: 'none', background: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {isExpanded ? 'Hide Raw Metadata' : 'View Payload Details'}
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{
                    backgroundColor: '#090d16',
                    color: '#38bdf8',
                    padding: '12px 16px',
                    borderTop: '1px solid #1e293b',
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                    fontFamily: 'monospace',
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
