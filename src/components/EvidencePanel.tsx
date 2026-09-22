import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  Database, 
  Info,
  ExternalLink
} from 'lucide-react';
import { StepEvidence } from '../types';

interface EvidencePanelProps {
  stageNumber: string;
  stageTitle: string;
  evidence?: StepEvidence;
  onViewSource?: (docName: string, fieldKey?: string) => void;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  stageNumber,
  stageTitle,
  evidence,
  onViewSource
}) => {
  if (!evidence) return null;

  return (
    <div style={{
      backgroundColor: '#090d16',
      borderRadius: '8px',
      border: '1px solid #1e293b',
      padding: '16px',
      marginTop: '10px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} color="#38bdf8" />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Stage {stageNumber} Evidence Breakdown
          </span>
        </div>
        <span style={{ fontSize: '11px', color: '#64748b' }}>Deterministic Audit Trail</span>
      </div>

      {/* Grid: What & Why */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
        <div style={{ padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={13} color="#60a5fa" />
            WHAT HAPPENED
          </div>
          <div style={{ fontSize: '13px', color: '#e2e8f0', marginTop: '4px', lineHeight: '1.4' }}>
            {evidence.whatHappened}
          </div>
        </div>

        <div style={{ padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Database size={13} color="#a78bfa" />
            WHY IT HAPPENED
          </div>
          <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '4px', lineHeight: '1.4' }}>
            {evidence.whyItHappened}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      {evidence.metrics && evidence.metrics.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {evidence.metrics.map((m, idx) => (
            <div
              key={idx}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: '#0f172a',
                border: `1px solid ${m.status === 'warning' ? '#92400e' : (m.status === 'good' ? '#16a34a' : '#334155')}`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>{m.label}:</span>
              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                color: m.status === 'warning' ? '#fde047' : (m.status === 'good' ? '#4ade80' : '#ffffff')
              }}>
                {m.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Source References */}
      {evidence.sourceReferences && evidence.sourceReferences.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Verified Source Documents
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {evidence.sourceReferences.map((ref, idx) => (
              <div
                key={idx}
                onClick={() => onViewSource && onViewSource(ref.documentName, ref.fieldKey)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  backgroundColor: '#1e293b',
                  color: '#93c5fd',
                  border: '1px solid #334155',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: onViewSource ? 'pointer' : 'default',
                  transition: 'all 0.15s ease'
                }}
              >
                <FileText size={13} color="#60a5fa" />
                <span>{ref.documentName}</span>
                {ref.fieldLabel && <span style={{ color: '#94a3b8', fontSize: '11px' }}>({ref.fieldLabel})</span>}
                {onViewSource && <ExternalLink size={11} color="#64748b" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {evidence.warnings && evidence.warnings.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          padding: '10px 12px',
          borderRadius: '6px',
          backgroundColor: 'rgba(120, 53, 15, 0.3)',
          border: '1px solid #92400e'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#fde047', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={13} />
            EVIDENCE WARNING
          </div>
          {evidence.warnings.map((w, idx) => (
            <div key={idx} style={{ fontSize: '12px', color: '#fef08a' }}>
              {w}
            </div>
          ))}
        </div>
      )}

      {/* Next Action */}
      {evidence.nextAction && (
        <div style={{ fontSize: '12px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, paddingTop: '4px' }}>
          <ArrowRight size={13} />
          <span>Next Action: {evidence.nextAction}</span>
        </div>
      )}
    </div>
  );
};
