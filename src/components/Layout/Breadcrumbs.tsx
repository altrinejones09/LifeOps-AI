import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Home } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  vault: 'Document Vault',
  verification: 'Verification Center',
  opportunities: 'Opportunity Discovery',
  applications: 'Applications',
  approval: 'Human Approval Center',
  agent: 'Agent Workspace',
  history: 'Agent Run History',
  privacy: 'Privacy Center',
  profile: 'User Profile',
  audit: 'Cryptographic Audit Trail'
};

export const Breadcrumbs: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0 || pathSegments[0] === 'login' || pathSegments[0] === 'signup') {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb Navigation"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        color: '#94a3b8',
        marginBottom: '16px'
      }}
    >
      <button
        onClick={() => navigate(-1)}
        title="Go to previous page"
        aria-label="Go back"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid #334155',
          borderRadius: '6px',
          padding: '4px 10px',
          color: '#38bdf8',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          marginRight: '8px'
        }}
      >
        <ArrowLeft size={14} /> Back
      </button>

      <Link
        to="/dashboard"
        style={{
          color: '#64748b',
          display: 'inline-flex',
          alignItems: 'center',
          textDecoration: 'none'
        }}
      >
        <Home size={14} />
      </Link>

      {pathSegments.map((segment, idx) => {
        const url = `/${pathSegments.slice(0, idx + 1).join('/')}`;
        const isLast = idx === pathSegments.length - 1;
        const label = ROUTE_LABELS[segment] || segment.replace(/-/g, ' ');

        return (
          <React.Fragment key={url}>
            <ChevronRight size={12} color="#475569" />
            {isLast ? (
              <span style={{ color: '#f8fafc', fontWeight: 600, textTransform: 'capitalize' }}>
                {label}
              </span>
            ) : (
              <Link
                to={url}
                style={{
                  color: '#94a3b8',
                  textDecoration: 'none',
                  textTransform: 'capitalize'
                }}
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
