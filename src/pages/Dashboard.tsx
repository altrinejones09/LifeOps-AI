import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  CheckCircle2,
  FolderLock,
  ChevronRight,
  Zap
} from 'lucide-react';
import { AppState } from '../utils/storage';
import { NavTab } from '../components/Layout/Sidebar';

interface DashboardProps {
  state: AppState;
  onNavigate?: (tab: NavTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, onNavigate }) => {
  const navigate = useNavigate();
  const { documents, discrepancies, applications } = state;

  const handleGoTo = (route: string, tab: NavTab) => {
    if (onNavigate) onNavigate(tab);
    navigate(route);
  };

  const totalDocuments = documents.length;
  const verifiedFieldsCount = documents.reduce((acc, doc) => acc + doc.fields.length, 0);
  const unacknowledgedIssues = discrepancies.filter(d => !d.acknowledged);
  const issueCount = unacknowledgedIssues.length;
  const pendingApprovalCount = applications.filter(a => a.status === 'DRAFT' || a.status === 'PENDING_APPROVAL').length;
  const submittedCount = applications.filter(a => a.status === 'SUBMITTED').length;

  // Determine Next Best Action dynamically
  const getNextBestAction = () => {
    if (issueCount > 0) {
      return {
        title: `Review ${issueCount} identity discrepancy ${issueCount === 1 ? 'issue' : 'issues'}`,
        desc: 'Verification engine detected name/date variance across documents. Review and acknowledge to proceed.',
        buttonText: 'Review Verification Issues',
        route: '/verification',
        tab: 'verification' as NavTab,
        color: '#b45309',
        bg: 'rgba(245, 158, 11, 0.15)',
        icon: AlertTriangle
      };
    }

    if (pendingApprovalCount > 0) {
      const targetApp = applications.find(a => a.status !== 'SUBMITTED');
      return {
        title: `Authorize field approval for "${targetApp?.opportunityTitle || 'Application'}"`,
        desc: 'Draft application generated from verified vault data requires 100% human field-level review.',
        buttonText: 'Go to Approval Center',
        route: '/approval',
        tab: 'approval' as NavTab,
        color: '#3b82f6',
        bg: 'rgba(59, 130, 246, 0.15)',
        icon: Clock
      };
    }

    if (totalDocuments === 0) {
      return {
        title: 'Upload your first verified document',
        desc: 'Add Aadhaar, Marksheet, or Income Certificate to your Document Vault.',
        buttonText: 'Upload Documents',
        route: '/vault',
        tab: 'vault' as NavTab,
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.15)',
        icon: FolderLock
      };
    }

    return {
      title: 'Discover eligible scholarships & opportunities',
      desc: 'Run rule-based eligibility evaluation against verified vault fields.',
      buttonText: 'Explore Opportunities',
      route: '/opportunities',
      tab: 'opportunities' as NavTab,
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.15)',
      icon: Sparkles
    };
  };

  const nextAction = getNextBestAction();
  const NextIcon = nextAction.icon;

  return (
    <div style={{ color: '#f8fafc' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0f172a',
        padding: '28px 32px',
        borderRadius: '12px',
        border: '1px solid #1e293b',
        marginBottom: '24px',
        background: 'radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.15) 0%, transparent 50%), #0f172a'
      }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              Personal Operations Platform
            </span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>
            Operations Control Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '6px', lineHeight: 1.5 }}>
            Automating application workflows while keeping human approval in 100% control of identity, eligibility, and authorization.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleGoTo('/agent', 'agent')}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
            }}
          >
            <Sparkles size={16} />
            Open Agent Workspace
          </button>
        </div>
      </div>

      {/* Next Best Action Spotlight */}
      <div style={{
        backgroundColor: '#0f172a',
        border: `1px solid ${nextAction.color}`,
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: nextAction.bg,
            color: nextAction.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <NextIcon size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: nextAction.color, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Zap size={12} /> Next Best Action
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: '2px 0 0' }}>
              {nextAction.title}
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '2px 0 0' }}>
              {nextAction.desc}
            </p>
          </div>
        </div>

        <button
          onClick={() => handleGoTo(nextAction.route, nextAction.tab)}
          style={{
            backgroundColor: nextAction.color,
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0
          }}
        >
          {nextAction.buttonText}
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Documents Vault
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
            {totalDocuments}
          </div>
          <div style={{ fontSize: '12px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} /> Active Uploads
          </div>
        </div>

        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Fields Verified
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
            {verifiedFieldsCount}
          </div>
          <div style={{ fontSize: '12px', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={13} /> Vault Attributes
          </div>
        </div>

        <div style={{ backgroundColor: '#0f172a', border: `1px solid ${issueCount > 0 ? '#b45309' : '#1e293b'}`, borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Verification Issues
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: issueCount > 0 ? '#f59e0b' : '#22c55e', margin: '4px 0' }}>
            {issueCount}
          </div>
          <div style={{ fontSize: '12px', color: issueCount > 0 ? '#f59e0b' : '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {issueCount > 0 ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />}
            {issueCount > 0 ? 'Requires Review' : 'Zero Discrepancies'}
          </div>
        </div>

        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Applications
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
            {applications.length}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FileText size={13} /> Active Workflows
          </div>
        </div>

        <div style={{ backgroundColor: '#0f172a', border: `1px solid ${pendingApprovalCount > 0 ? '#2563eb' : '#1e293b'}`, borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Pending Approval
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: pendingApprovalCount > 0 ? '#60a5fa' : '#64748b', margin: '4px 0' }}>
            {pendingApprovalCount}
          </div>
          <div style={{ fontSize: '12px', color: pendingApprovalCount > 0 ? '#60a5fa' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={13} /> Awaiting Approval
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Verification & Attention */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#3b82f6" />
            Vault Verification Status
          </h3>

          {issueCount > 0 ? (
            <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid #b45309', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#fde68a', marginBottom: '4px' }}>
                ⚠ Name Mismatch Detected
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '14px' }}>
                Identity variance found between uploaded Aadhaar and Income Certificate documents.
              </div>
              <button
                onClick={() => handleGoTo('/verification', 'verification')}
                style={{ backgroundColor: '#b45309', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Review Discrepancy
              </button>
            </div>
          ) : (
            <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid #15803d', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#86efac', marginBottom: '4px' }}>
                ✓ Vault Attributes Clean & Consistent
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '14px' }}>
                All document vault attributes match with zero unresolved identity discrepancies.
              </div>
              <button
                onClick={() => handleGoTo('/opportunities', 'opportunities')}
                style={{ backgroundColor: '#15803d', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Explore Opportunities
              </button>
            </div>
          )}
        </div>

        {/* Active Applications list */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="#60a5fa" />
              Active Applications
            </h3>
            <button
              onClick={() => handleGoTo('/applications', 'applications')}
              style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              View All ({applications.length})
            </button>
          </div>

          {applications.length > 0 ? (
            applications.map(app => (
              <div key={app.id} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '14px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{app.opportunityTitle}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{app.authority}</div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', backgroundColor: app.status === 'SUBMITTED' ? '#14532d' : '#1e3a8a', color: app.status === 'SUBMITTED' ? '#86efac' : '#93c5fd' }}>
                    {app.status}
                  </span>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleGoTo(app.status === 'SUBMITTED' ? '/audit' : '/approval', app.status === 'SUBMITTED' ? 'audit' : 'approval')}
                    style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {app.status === 'SUBMITTED' ? 'View Audit' : 'Proceed to Approval'}
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '13px' }}>
              No applications drafted yet.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
