import React from 'react';
import { ShieldCheck, FileText, ExternalLink } from 'lucide-react';

interface ProvenanceBadgeProps {
  sourceDocument: string;
  verificationStatus?: string;
  verifiedAt?: string;
  onClickSource?: () => void;
  compact?: boolean;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  sourceDocument,
  verificationStatus = 'VERIFIED',
  verifiedAt,
  onClickSource,
  compact = false
}) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        border: '1px solid #334155',
        borderRadius: '6px',
        padding: compact ? '2px 8px' : '4px 10px',
        fontSize: compact ? '11px' : '12px',
        color: '#94a3b8'
      }}
    >
      <ShieldCheck size={compact ? 12 : 14} color="#34d399" />
      <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{sourceDocument}</span>
      
      {onClickSource && (
        <button
          type="button"
          onClick={onClickSource}
          title={`View source document: ${sourceDocument}`}
          aria-label={`View source document: ${sourceDocument}`}
          style={{
            background: 'none',
            border: 'none',
            color: '#60a5fa',
            cursor: 'pointer',
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px',
            fontSize: compact ? '10px' : '11px',
            fontWeight: 700,
            marginLeft: '4px'
          }}
        >
          View source <ExternalLink size={10} />
        </button>
      )}
    </div>
  );
};
