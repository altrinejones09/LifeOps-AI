import React from 'react';
import { 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  CheckCircle2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { AppState } from '../utils/storage';
import { NavTab } from '../components/Layout/Sidebar';

interface DashboardProps {
  state: AppState;
  onNavigate: (tab: NavTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, onNavigate }) => {
  const { documents, discrepancies, applications } = state;

  const totalDocuments = documents.length;
  const verifiedFieldsCount = documents.reduce((acc, doc) => acc + doc.fields.length, 0);
  const unacknowledgedIssues = discrepancies.filter(d => !d.acknowledged);
  const issueCount = unacknowledgedIssues.length;
  const pendingApprovalCount = applications.filter(a => a.status === 'DRAFT' || a.status === 'PENDING_APPROVAL').length;
  const submittedCount = applications.filter(a => a.status === 'SUBMITTED').length;

  // Compute status for the 8 workflow steps
  const getStepStatus = (stepIndex: number) => {
    // 0: DOCUMENTS, 1: PROFILE, 2: VERIFICATION, 3: ELIGIBILITY, 4: APPLICATION DRAFT, 5: HUMAN APPROVAL, 6: SUBMISSION, 7: AUDIT TRAIL
    if (stepIndex === 0) return { label: 'Completed', color: '#15803d', bg: '#f0fdf4' };
    if (stepIndex === 1) return { label: 'Completed', color: '#15803d', bg: '#f0fdf4' };
    if (stepIndex === 2) {
      if (issueCount > 0) return { label: 'Warning', color: '#b45309', bg: '#fffbeb' };
      return { label: 'Verified', color: '#15803d', bg: '#f0fdf4' };
    }
    if (stepIndex === 3) return { label: 'Completed', color: '#15803d', bg: '#f0fdf4' };
    if (stepIndex === 4) {
      if (applications.length > 0) return { label: 'Draft Ready', color: '#1d4ed8', bg: '#eff6ff' };
      return { label: 'Pending', color: '#64748b', bg: '#f8fafc' };
    }
    if (stepIndex === 5) {
      if (submittedCount > 0) return { label: 'Approved', color: '#15803d', bg: '#f0fdf4' };
      if (pendingApprovalCount > 0) return { label: 'Pending Action', color: '#b45309', bg: '#fffbeb' };
      return { label: 'Locked', color: '#94a3b8', bg: '#f8fafc' };
    }
    if (stepIndex === 6) {
      if (submittedCount > 0) return { label: 'Submitted', color: '#15803d', bg: '#f0fdf4' };
      return { label: 'Locked', color: '#94a3b8', bg: '#f8fafc' };
    }
    if (stepIndex === 7) {
      return { label: 'Active Ledger', color: '#4338ca', bg: '#e0e7ff' };
    }
    return { label: 'Pending', color: '#64748b', bg: '#f8fafc' };
  };

  const workflowSteps = [
    { title: 'DOCUMENTS', desc: 'Vault Loaded', tab: 'vault' as NavTab },
    { title: 'PROFILE', desc: 'Structured Provenance', tab: 'vault' as NavTab },
    { title: 'VERIFICATION', desc: 'Consistency Check', tab: 'verification' as NavTab },
    { title: 'ELIGIBILITY', desc: 'Rules Evaluation', tab: 'opportunities' as NavTab },
    { title: 'APPLICATION DRAFT', desc: 'Vault Data Population', tab: 'applications' as NavTab },
    { title: 'HUMAN APPROVAL', desc: 'Field-Level Consent', tab: 'approval' as NavTab },
    { title: 'SUBMISSION', desc: 'Mock Authorization', tab: 'approval' as NavTab },
    { title: 'AUDIT TRAIL', desc: 'Immutable Ledger', tab: 'audit' as NavTab }
  ];

  return (
    <div>
      {/* Header Banner - UPGRADE #23 & #26 */}
      <div className="page-header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        padding: '28px 32px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        marginBottom: '24px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
      }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-info" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Autonomous Personal Operations AI
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#4338ca', backgroundColor: '#e0e7ff', padding: '2px 8px', borderRadius: '4px' }}>
              🔒 Local Demo Mode
            </span>
          </div>
          <h1 className="page-title" style={{ fontSize: '24px', margin: 0 }}>
            LifeOps AI — Personal Operations Agent
          </h1>
          <p className="page-subtitle" style={{ fontSize: '14px', color: '#475569', marginTop: '6px', lineHeight: 1.5 }}>
            Verify identity once from structured document vault. Discover opportunities, run rule evaluations, draft applications, and authorize mock submissions with 100% human consent.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('agent')}
            className="btn btn-primary"
            style={{ padding: '10px 18px' }}
          >
            <Sparkles size={16} />
            Open Agent Workspace
          </button>
          <button
            onClick={() => onNavigate('vault')}
            className="btn btn-outline"
            style={{ padding: '10px 18px' }}
          >
            Document Vault
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div className="card">
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Documents
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>
            {totalDocuments}
          </div>
          <div style={{ fontSize: '12px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} /> Active in Vault
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Fields Verified
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>
            {verifiedFieldsCount}
          </div>
          <div style={{ fontSize: '12px', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={13} /> Full Provenance
          </div>
        </div>

        <div className="card" style={{ borderColor: issueCount > 0 ? '#fef08a' : '#e2e8f0' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Issues Detected
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: issueCount > 0 ? '#b45309' : '#15803d', margin: '4px 0' }}>
            {issueCount}
          </div>
          <div style={{ fontSize: '12px', color: issueCount > 0 ? '#b45309' : '#15803d', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {issueCount > 0 ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />}
            {issueCount > 0 ? 'Requires Review' : 'All Clear'}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Applications
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>
            {applications.length}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FileText size={13} /> Active Administrative
          </div>
        </div>

        <div className="card" style={{ borderColor: pendingApprovalCount > 0 ? '#bfdbfe' : '#e2e8f0' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Pending Approval
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: pendingApprovalCount > 0 ? '#1d4ed8' : '#64748b', margin: '4px 0' }}>
            {pendingApprovalCount}
          </div>
          <div style={{ fontSize: '12px', color: pendingApprovalCount > 0 ? '#1d4ed8' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={13} /> Awaiting Consent
          </div>
        </div>
      </div>

      {/* Workflow Visualization Pipeline */}
      <div className="card" style={{ marginBottom: '32px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              Application Lifecycle Operations Workflow
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              LifeOps AI enforces human verification and approval at every stage before submission.
            </p>
          </div>
          <span className="badge badge-info">
            Deterministic Pipeline
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gap: '8px',
          alignItems: 'stretch'
        }}>
          {workflowSteps.map((step, idx) => {
            const status = getStepStatus(idx);
            return (
              <div
                key={step.title}
                onClick={() => onNavigate(step.tab)}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '12px 10px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
                className="card-hover"
              >
                <div style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#475569',
                  letterSpacing: '0.04em',
                  marginBottom: '4px'
                }}>
                  0{idx + 1}. {step.title}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#64748b',
                  marginBottom: '10px',
                  minHeight: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {step.desc}
                </div>
                <div style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: status.bg,
                  color: status.color,
                  display: 'inline-block'
                }}>
                  {status.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Content: Current Attention & Active Applications */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Current Attention Section */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color={issueCount > 0 ? '#b45309' : '#15803d'} />
              Current Attention
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Consistency Status
            </span>
          </div>

          {issueCount > 0 ? (
            <div style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fef08a',
              borderRadius: '6px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#fef3c7',
                  color: '#b45309',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#92400e', margin: 0 }}>
                    ⚠ Identity mismatch detected
                  </h4>
                  <p style={{ fontSize: '13px', color: '#78350f', marginTop: '6px', lineHeight: 1.5 }}>
                    Name differs between <strong>Aadhaar Card</strong> ("Arun Kumar") and <strong>Income Certificate</strong> ("Arun Kumarr").
                  </p>
                  <p style={{ fontSize: '12px', color: '#92400e', marginTop: '6px' }}>
                    Review discrepancy before using this information in official administrative applications.
                  </p>

                  <button
                    onClick={() => onNavigate('verification')}
                    className="btn btn-sm btn-primary"
                    style={{ marginTop: '14px', backgroundColor: '#b45309', borderColor: '#92400e' }}
                  >
                    Review Discrepancy
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '6px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#166534', margin: 0 }}>
                    ✓ Vault Information Verified
                  </h4>
                  <p style={{ fontSize: '13px', color: '#15803d', marginTop: '6px' }}>
                    All verified identity fields across your available documents are internally consistent.
                  </p>
                  <button
                    onClick={() => onNavigate('opportunities')}
                    className="btn btn-sm btn-primary"
                    style={{ marginTop: '14px', backgroundColor: '#15803d', borderColor: '#166534' }}
                  >
                    Explore Matched Opportunities
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Applications Section */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="#2563eb" />
              Active Applications
            </h3>
            <button
              onClick={() => onNavigate('applications')}
              style={{ fontSize: '12px', fontWeight: 600, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              View All ({applications.length})
            </button>
          </div>

          {applications.length > 0 ? (
            applications.map(app => (
              <div
                key={app.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '16px',
                  marginBottom: '12px',
                  backgroundColor: '#f8fafc'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {app.opportunityTitle}
                    </h4>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      Authority: {app.authority}
                    </div>
                  </div>
                  <span className={`badge ${app.status === 'SUBMITTED' ? 'badge-verified' : 'badge-info'}`}>
                    {app.status === 'SUBMITTED' ? 'SUBMITTED' : 'Draft Ready'}
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #e2e8f0',
                  fontSize: '12px'
                }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Verification:</span>{' '}
                    <strong style={{ color: issueCount > 0 ? '#b45309' : '#15803d' }}>
                      {issueCount > 0 ? 'Acknowledged' : 'Passed'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Approval:</span>{' '}
                    <strong style={{ color: app.status === 'SUBMITTED' ? '#15803d' : '#1d4ed8' }}>
                      {app.status === 'SUBMITTED' ? 'Approved' : 'Pending'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Deadline:</span>{' '}
                    <strong>28 Sep 2026</strong>
                  </div>
                </div>

                <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                  {app.status === 'SUBMITTED' ? (
                    <button
                      onClick={() => onNavigate('audit')}
                      className="btn btn-sm btn-outline"
                    >
                      View Audit Event
                      <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigate('approval')}
                      className="btn btn-sm btn-accent"
                    >
                      Proceed to Approval Center
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
              No active application drafts. Select an opportunity to start.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
