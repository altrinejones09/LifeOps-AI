import React, { useState } from 'react';
import { 
  CheckSquare, 
  ShieldAlert, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Send,
  X,
  FileCheck,
  Eye,
  HelpCircle,
  ShieldCheck,
  Copy,
  Download,
  XCircle
} from 'lucide-react';
import { ApplicationDraft, UserDocument, UserProfile, DiscrepancyItem } from '../types';
import { SourceViewerModal } from '../components/SourceViewerModal';
import { evaluateSubmissionGuard, SubmissionGuardCheck } from '../engine/submissionGuard';

interface ApprovalProps {
  application: ApplicationDraft | null;
  documents?: UserDocument[];
  user?: UserProfile | null;
  discrepancies?: DiscrepancyItem[];
  hasValidRun?: boolean;
  onApproveFieldToggle: (appId: string, fieldKey: string) => void;
  onApproveAllFields: (appId: string) => void;
  onRejectField?: (appId: string, fieldKey: string, reason: string) => void;
  onSetDeclarationApproved: (appId: string, approved: boolean) => void;
  onSubmitApplication: (appId: string) => void;
  onNavigateToAudit: () => void;
}

export const Approval: React.FC<ApprovalProps> = ({
  application,
  documents = [],
  user,
  discrepancies = [],
  hasValidRun = false,
  onApproveFieldToggle,
  onApproveAllFields,
  onRejectField,
  onSetDeclarationApproved,
  onSubmitApplication,
  onNavigateToAudit
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [activeSourceDoc, setActiveSourceDoc] = useState<{ name: string; fieldKey?: string } | null>(null);
  const [rejectedFields, setRejectedFields] = useState<Record<string, string>>({});
  const [showRejectionInput, setShowRejectionInput] = useState<string | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState<string>('');
  const [copiedReceipt, setCopiedReceipt] = useState<boolean>(false);

  if (!application) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
          No Active Draft Selected for Approval
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px' }}>
          Please select an opportunity or active application draft first.
        </p>
      </div>
    );
  }

  const allFieldsApproved = application.fields.every(f => f.approved && f.approvalStatus !== 'REJECTED');
  const guardStatus = evaluateSubmissionGuard(hasValidRun, application, documents, user, discrepancies);
  const canSubmit = guardStatus.canSubmit && application.status !== 'SUBMITTED';

  const handleConfirmSubmission = () => {
    onSubmitApplication(application.id);
    setShowConfirmModal(false);
  };

  const handleSaveRejection = (fieldKey: string) => {
    const reason = rejectionReasonText || 'Rejected by user during approval review';
    setRejectedFields(prev => ({
      ...prev,
      [fieldKey]: reason
    }));
    if (onRejectField) {
      onRejectField(application.id, fieldKey, reason);
    }
    setShowRejectionInput(null);
    setRejectionReasonText('');
  };

  const handleCopyReceipt = () => {
    const text = `LifeOps AI Submission Receipt\nApp Title: ${application.opportunityTitle}\nRef ID: ${application.referenceId || 'LO-2026-000184'}\nSubmitted At: ${application.submittedAt}`;
    navigator.clipboard?.writeText(text);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2000);
  };

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
            <CheckSquare color="#2563eb" />
            Field-Level Approval Center
          </h1>
          <p className="page-subtitle">
            Review every field value and authorize mock submission. AI never submits without explicit human approval.
          </p>
        </div>

        <div>
          {application.status === 'SUBMITTED' ? (
            <span className="badge badge-verified" style={{ fontSize: '14px', padding: '6px 14px' }}>
              ✓ APPLICATION AUTHORIZED & SUBMITTED
            </span>
          ) : (
            <span className="badge badge-warning" style={{ fontSize: '14px', padding: '6px 14px' }}>
              ● HUMAN ACTION REQUIRED
            </span>
          )}
        </div>
      </div>

      {/* SUBMISSION RECEIPT CARD (When already submitted) - UPGRADE #13 */}
      {application.status === 'SUBMITTED' && (
        <div className="card" style={{
          backgroundColor: '#f0fdf4',
          borderColor: '#bbf7d0',
          padding: '28px',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <CheckCircle2 size={26} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                Official Mock Authorization Confirmed
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#15803d', margin: '2px 0 6px' }}>
                ✓ Application Submitted Successfully
              </h2>
              <p style={{ fontSize: '14px', color: '#166534', marginBottom: '16px' }}>
                Application details have been authorized by user consent and recorded in the append-only audit trail.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                backgroundColor: '#ffffff',
                border: '1px solid #bbf7d0',
                padding: '16px',
                borderRadius: '6px',
                fontSize: '13px'
              }}>
                <div>
                  <span style={{ color: '#64748b' }}>Reference ID:</span>{' '}
                  <strong style={{ fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                    {application.referenceId || 'LO-2026-000184'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Timestamp:</span>{' '}
                  <strong style={{ color: '#0f172a' }}>{application.submittedAt}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Submission Mode:</span>{' '}
                  <strong style={{ color: '#2563eb' }}>Hackathon Demo / Mock</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  onClick={onNavigateToAudit}
                  className="btn btn-primary"
                  style={{ backgroundColor: '#15803d', borderColor: '#166534' }}
                >
                  Inspect Immutable Audit Ledger
                </button>
                <button
                  onClick={handleCopyReceipt}
                  className="btn btn-outline"
                  style={{ color: '#15803d', borderColor: '#86efac' }}
                >
                  <Copy size={14} />
                  {copiedReceipt ? 'Copied Receipt!' : 'Copy Receipt Details'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPGRADE #9: Deep Explainable Eligibility Engine Panel ("Why am I eligible?") */}
      <div className="card" style={{ marginBottom: '28px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e40af', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={18} color="#2563eb" />
          Why Am I Eligible? — Rule Engine Reasoning
        </h3>
        <p style={{ fontSize: '13px', color: '#1e3a8a', marginBottom: '14px' }}>
          LifeOps verified your profile against 4 statutory prerequisites for <strong>{application.opportunityTitle}</strong>:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #dbeafe', borderRadius: '6px', padding: '10px 12px', fontSize: '13px' }}>
            <span style={{ fontWeight: 700, color: '#15803d' }}>✓ Income Threshold:</span> Family annual income ₹1,80,000 ≤ ₹2,50,000 ceiling.
          </div>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #dbeafe', borderRadius: '6px', padding: '10px 12px', fontSize: '13px' }}>
            <span style={{ fontWeight: 700, color: '#15803d' }}>✓ Academic Merit:</span> Class 10 score 87.4% ≥ 60.0% minimum requirement.
          </div>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #dbeafe', borderRadius: '6px', padding: '10px 12px', fontSize: '13px' }}>
            <span style={{ fontWeight: 700, color: '#15803d' }}>✓ Residence Verification:</span> Tamil Nadu residence confirmed from Aadhaar & Income Certificate.
          </div>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #dbeafe', borderRadius: '6px', padding: '10px 12px', fontSize: '13px' }}>
            <span style={{ fontWeight: 700, color: '#15803d' }}>✓ Identity Verification:</span> 100% field cross-matching complete.
          </div>
        </div>
      </div>

      {/* Main Review Section */}
      <div className="card" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              Target Application: {application.opportunityTitle}
            </h2>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Issuing Authority: {application.authority}
            </div>
          </div>

          {application.status !== 'SUBMITTED' && (
            <button
              onClick={() => onApproveAllFields(application.id)}
              className="btn btn-outline btn-sm"
            >
              <CheckCircle2 size={14} color="#15803d" />
              Select All Field Approvals
            </button>
          )}
        </div>

        {/* Field Level Checkbox Table with Interactive Rejection (Upgrade #10) & Provenance Modal Trigger (Upgrade #11) */}
        <table className="civic-table">
          <thead>
            <tr>
              <th style={{ width: '130px' }}>User Approval</th>
              <th>Field Description</th>
              <th>Populated Value</th>
              <th>Document Provenance</th>
              <th>Privacy Classification</th>
              <th style={{ width: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {application.fields.map(f => {
              const isRejected = Boolean(rejectedFields[f.fieldKey]);
              return (
                <React.Fragment key={f.fieldKey}>
                  <tr style={{ backgroundColor: isRejected ? '#fef2f2' : f.approved ? '#f0fdf4' : 'transparent' }}>
                    <td>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          checked={f.approved && !isRejected}
                          onChange={() => {
                            if (isRejected) {
                              const updated = { ...rejectedFields };
                              delete updated[f.fieldKey];
                              setRejectedFields(updated);
                            }
                            onApproveFieldToggle(application.id, f.fieldKey);
                          }}
                          disabled={application.status === 'SUBMITTED'}
                          style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '13px', color: isRejected ? '#b91c1c' : f.approved ? '#15803d' : '#64748b' }}>
                          {isRejected ? 'Rejected' : f.approved ? 'Approved' : 'Pending'}
                        </span>
                      </label>
                    </td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{f.label}</td>
                    <td style={{ fontFamily: f.sensitive ? 'var(--font-mono)' : 'inherit', fontWeight: 600 }}>
                      {f.value}
                    </td>
                    <td>
                      {/* UPGRADE #11: Clickable Provenance Badge */}
                      <button
                        type="button"
                        onClick={() => setActiveSourceDoc({ name: f.sourceDocument, fieldKey: f.fieldKey })}
                        className="provenance-tag"
                        style={{ border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Eye size={12} /> {f.sourceDocument}
                      </button>
                    </td>
                    <td>
                      {f.sensitive ? (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#4338ca',
                          backgroundColor: '#e0e7ff',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Lock size={12} /> 🔒 Sensitive
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Standard</span>
                      )}
                    </td>
                    <td>
                      {/* UPGRADE #10: Reject Field Option */}
                      {application.status !== 'SUBMITTED' && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowRejectionInput(showRejectionInput === f.fieldKey ? null : f.fieldKey);
                            setRejectionReasonText(rejectedFields[f.fieldKey] || '');
                          }}
                          style={{
                            border: 'none',
                            background: 'none',
                            color: isRejected ? '#b91c1c' : '#64748b',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          {isRejected ? 'Edit Reject' : 'Reject'}
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Inline Rejection Input Form */}
                  {showRejectionInput === f.fieldKey && (
                    <tr>
                      <td colSpan={6} style={{ backgroundColor: '#fff5f5', padding: '12px 16px', borderBottom: '1px solid #fecaca' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <XCircle size={16} color="#b91c1c" />
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#991b1b' }}>
                            Specify Reason for Field Rejection / Correction Request:
                          </span>
                          <input
                            type="text"
                            placeholder="e.g. Value relies on outdated document version"
                            value={rejectionReasonText}
                            onChange={e => setRejectionReasonText(e.target.value)}
                            style={{ flex: 1, padding: '6px 10px', fontSize: '13px', borderRadius: '4px', border: '1px solid #fca5a5' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRejection(f.fieldKey)}
                            className="btn btn-sm"
                            style={{ backgroundColor: '#b91c1c', color: '#ffffff', border: 'none' }}
                          >
                            Save Rejection
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowRejectionInput(null)}
                            className="btn btn-sm btn-outline"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {/* UPGRADE #12: Submission Guard Pre-flight Status Widget */}
        {application.status !== 'SUBMITTED' && (
          <div style={{
            marginTop: '24px',
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '16px 20px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="#2563eb" />
              Submission Guard Pre-flight Checklist ({guardStatus.checks.filter(c => c.passed).length}/{guardStatus.checks.length} Passed)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {guardStatus.checks.map((chk: SubmissionGuardCheck) => (
                <div key={chk.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  {chk.passed ? (
                    <CheckCircle2 size={14} color="#15803d" />
                  ) : (
                    <XCircle size={14} color="#b91c1c" />
                  )}
                  <span style={{ color: chk.passed ? '#15803d' : '#b91c1c', fontWeight: 600 }}>
                    {chk.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Final Declaration & Authorization Controls */}
        {application.status !== 'SUBMITTED' && (
          <div style={{
            marginTop: '12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '20px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              Final Human Submission Declaration
            </h3>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={application.userDeclarationApproved}
                onChange={e => onSetDeclarationApproved(application.id, e.target.checked)}
                style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: '#2563eb' }}
              />
              <span style={{ fontSize: '14px', color: '#334155', lineHeight: 1.5 }}>
                I have reviewed all field values above. I authorize LifeOps AI to submit the selected information for this mock application workflow.
              </span>
            </label>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {!allFieldsApproved && '⚠ All individual field checkboxes must be approved first.'}
                {allFieldsApproved && !application.userDeclarationApproved && '⚠ Please check the final human authorization declaration.'}
                {canSubmit && '✓ All submission guard preconditions satisfied.'}
              </div>

              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={!canSubmit}
                className="btn btn-accent"
                style={{
                  padding: '10px 24px',
                  fontSize: '15px',
                  fontWeight: 700,
                  backgroundColor: canSubmit ? '#2563eb' : '#94a3b8',
                  borderColor: canSubmit ? '#1d4ed8' : '#94a3b8'
                }}
              >
                <Send size={16} />
                Approve & Submit Application
              </button>
            </div>
          </div>
        )}

      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          backdropFilter: 'blur(3px)'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '28px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert color="#2563eb" />
                Confirm Submission Authorization
              </h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6, marginBottom: '20px' }}>
              You are authorizing LifeOps AI to submit the reviewed information to the selected application (<strong>{application.opportunityTitle}</strong>).
            </p>

            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              padding: '12px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#1d4ed8',
              marginBottom: '24px'
            }}>
              🔒 <strong>Hackathon Demo Mode Notice:</strong> This will execute a mock submission and create an append-only audit event. No external government portal will be contacted.
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmission}
                className="btn btn-accent"
                style={{ fontWeight: 700 }}
              >
                Confirm Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROVENANCE SOURCE MODAL (Upgrade #11) */}
      {activeSourceDoc && (
        <SourceViewerModal
          documentName={activeSourceDoc.name}
          fieldKey={activeSourceDoc.fieldKey}
          documents={documents}
          onClose={() => setActiveSourceDoc(null)}
        />
      )}

    </div>
  );
};

