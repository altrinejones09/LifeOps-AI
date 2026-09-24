import React, { useState } from 'react';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';

interface MaskedSensitiveValueProps {
  value: string;
  type?: 'aadhaar' | 'bank' | 'pan' | 'generic';
  label?: string;
  allowReveal?: boolean;
  onRevealLogged?: (fieldLabel: string) => void;
  style?: React.CSSProperties;
}

export function maskValue(rawVal: string, type: 'aadhaar' | 'bank' | 'pan' | 'generic' = 'generic'): string {
  if (!rawVal) return '••••';
  const clean = rawVal.replace(/\s+/g, '');
  
  if (type === 'aadhaar') {
    if (clean.length >= 4) {
      return `XXXX XXXX ${clean.slice(-4)}`;
    }
    return 'XXXX XXXX XXXX';
  }
  
  if (type === 'bank') {
    if (clean.length >= 4) {
      return `XXXXXXXX${clean.slice(-4)}`;
    }
    return 'XXXXXXXXXXXX';
  }

  if (type === 'pan') {
    if (clean.length >= 5) {
      return `XXXXX${clean.slice(-5)}`;
    }
    return 'XXXXXXXXXX';
  }

  if (clean.length > 4) {
    return `•••• •••• ${clean.slice(-4)}`;
  }
  return '••••••••';
}

export const MaskedSensitiveValue: React.FC<MaskedSensitiveValueProps> = ({
  value,
  type = 'generic',
  label = 'Sensitive Data',
  allowReveal = true,
  onRevealLogged,
  style
}) => {
  const [revealed, setRevealed] = useState(false);

  const toggleReveal = () => {
    const nextState = !revealed;
    setRevealed(nextState);
    if (nextState && onRevealLogged) {
      onRevealLogged(label);
    }
  };

  const maskedText = maskValue(value, type);

  return (
    <span 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '6px',
        fontFamily: 'monospace',
        letterSpacing: '0.05em',
        ...style 
      }}
    >
      <span>{revealed ? value : maskedText}</span>
      {allowReveal && (
        <button
          type="button"
          onClick={toggleReveal}
          title={revealed ? `Hide ${label}` : `Reveal ${label} (Audit logged)`}
          aria-label={revealed ? `Hide ${label}` : `Reveal ${label}`}
          style={{
            background: 'none',
            border: 'none',
            color: revealed ? '#ef4444' : '#64748b',
            cursor: 'pointer',
            padding: '2px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center'
          }}
        >
          {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      )}
    </span>
  );
};
