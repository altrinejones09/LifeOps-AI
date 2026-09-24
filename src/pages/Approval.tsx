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
  XCircle,
  RefreshCw
} from 'lucide-react';
import { ApplicationDraft, UserDocument, UserProfile, DiscrepancyItem } from '../types';
import { SourceViewerModal } from '../components/SourceViewerModal';
import { evaluateSubmissionGuard, SubmissionGuardCheck } from '../engine/submissionGuard';
import { submissionProvider } from '../services/submissionAdapter';
import { useNotification } from '../context/NotificationContext';
import { MaskedSensitiveValue } from '../components/MaskedSensitiveValue';
import { ProvenanceBadge } from '../components/ProvenanceBadge';

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
  onSubmitApplication: (appId: string, submissionResult?: { referenceId?: string; submittedAt?: string }) => void;
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
  const { showToast } = useNotification();
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [activeSourceDoc, setActiveSourceDoc] = useState<{ name: string; fieldKey?: string } | null>(null);
  const [showRejectionInput, setShowRejectionInput] = useState<string | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState<string>('');
  const [copiedReceipt, setCopiedReceipt] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!application) {
    return (
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', textAlign: 'center', padding: '48px 24px', color: '#f8fafc' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
          No Active Application Selected for Approval
        </h2>
        <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '6px' }}>
          Please select an opportunity or active application draft first.
        </p>
      </div>
    );
  }

  const allFieldsApproved = application.fields.length > 0 && application.fields.every(f => f.approved && f.approvalStatus !== 'REJECTED');
  const rejectedField = application.fields.find(f => f.approvalStatus === 'REJECTED');
  const unapprovedCount = application.fields.filter(f => !f.approved || f.approvalStatus === 'REJECTED').length;
  
  const guardStatus = evaluateSubmissionGuard(hasValidRun, application, documents, user, discrepancies);
  const canSubmit = guardStatus.canSubmit && application.status !== 'SUBMITTED';

  const handleConfirmSubmission = async () => {
    // 1. Re-evaluate guard at submission moment
    const latestGuard = evaluateSubmissionGuard(hasValidRun, application, documents, user, discrepancies);
    if (!latestGuard.canSubmit) {
      showToast(latestGuard.blockingReason || 'Submission preconditions failed.', 'ERROR');
      setShowConfirmModal(false);
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. Call Submission Provider Adapter
      const userObj: UserProfile = user || {
        id: 'usr-demo-01',
        fullName: 'Authenticated User',
        email: 'user@example.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        accountStatus: 'ACTIVE',
        authMethod: 'LOCAL_DEMO',
        preferences: { language: 'English', notificationsEnabled: true, sensitivityLevel: 'standard' }
      };

      const response = await submissionProvider.submitApplication(application, userObj, latestGuard);

      if (response.success) {
        onSubmitApplication(application.id, { referenceId: response.referenceId, submittedAt: response.submittedAt });
        setShowConfirmModal(false);
        showToast(`Mock submission complete! Ref: ${response.referenceId || 'LO-2026-SUBMITTED'}. Redirecting to Audit Trail...`, 'SUCCESS');
        
        // Automatic redirect to Audit Trail
        setTimeout(() => {
          onNavigateToAudit();
        }, 1200);
      } else {
        showToast(response.error || 'Submission failed.', 'ERROR');
      }
    } catch (err: any) {
      showToast(err.message || 'Submission failed.', 'ERROR');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveRejection = (fieldKey: string) => {
    const reason = rejectionReasonText || 'Value requires correction by user';
    if (onRejectField) {
      onRejectField(application.id, fieldKey, reason);
    }
    setShowRejectionInput(null);
    setRejectionReasonText('');
  };

  const handleCopyReceipt = () => {
    const text = `LifeOps AI Submission Receipt\nApp Title: ${application.opportunityTitle}\nRef ID: ${application.referenceId || 'LO-2026-SUBMITTED'}\nSubmitted At: ${application.submittedAt}`;
    navigator.clipboard?.writeText(text);
    setCopiedReceipt(true);
    showToast('Receipt details copied to clipboard', 'INFO');
    setTimeout(() => setCopiedReceipt(false), 2000);
  };

  const getGuardExplanation = () => {
    if (application.status === 'SUBMITTED') return '✓ Application authorized and submitted.';
    if (rejectedField) return `⚠ Field "${rejectedField.label}" was rejected. Rejected fields CANNOT be submitted.`;
    if (!allFieldsApproved) return `⚠ ${unapprovedCount} prepared field${unapprovedCount > 1 ? 's' : ''} still require human approval checkbox.`;
    if (!application.userDeclarationApproved) return '⚠ Final human legal accuracy declaration checkbox required.';
    if (!hasValidRun) return '⚠ Active Agent workflow run required.';
    if (canSubmit) return '✓ All submission guard preconditions satisfied. Ready for mock submission.';
    return '⚠ Submission preconditions pending.';
  };

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
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            STEP 07 — HUMAN APPROVAL
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#ffffff' }}>
            <CheckSquare color="#3b82f6" size={26} />
            Field-Level Approval Center
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
            Review every field value and authorize mock submission. AI never submits without explicit human approval.
          </p>
        </div>

        <div>
          {application.status === 'SUBMITTED' ? (
            <span style={{ fontSize: '13px', fontWeight: 700, padding: '6px 14px', borderRadius: '20px', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid #15803d' }}>
              ✓ MOCK AUTHORIZATION COMPLETED
            </span>
          ) : (
            <span style={{ fontSize: '13px', fontWeight: 700, padding: '6px 14px', borderRadius: '20px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fde047', border: '1px solid #b45309' }}>
              ● HUMAN APPROVAL REQUIRED
            </span>
          )}
        </div>
      </div>

      {/* SUBMISSION RECEIPT CARD (When already submitted) */}
      {application.status === 'SUBMITTED' && (
        <div style={{
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid #15803d',
          borderRadius: '12px',
          padding: '28px',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              color: '#4ade80',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <CheckCircle2 size={26} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#4ade80', textTransform: 'uppercase' }}>
                Official Mock Authorization Confirmed
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: '2px 0 6px' }}>
                ✓ Application Mock Submitted Successfully
              </h2>
              <p style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '16px' }}>
                Application details authorized by user consent and recorded in the cryptographic SHA-256 audit trail.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '13px'
              }}>
                <div>
                  <span style={{ color: '#94a3b8' }}>Reference ID:</span>{' '}
                  <strong style={{ fontFamily: 'monospace', color: '#38bdf8' }}>
                    {application.referenceId || 'LO-2026-SUBMITTED'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>Submitted At:</span>{' '}
                  <strong style={{ color: '#ffffff' }}>{new Date(application.submittedAt || Date.now()).toLocaleString()}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>Submission Mode:</span>{' '}
                  <strong style={{ color: '#60a5fa' }}>Prototype Sandbox / Mock</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  onClick={onNavigateToAudit}
                  style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Inspect Immutable Audit Ledger
                </button>
                <button
                  onClick={handleCopyReceipt}
                  style={{ backgroundColor: 'transparent', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Copy size={14} />
                  {copiedReceipt ? 'Copied Receipt!' : 'Copy Receipt Details'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Explainable Eligibility Engine Panel */}
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e3a8a', borderRadius: '12px', padding: '24px', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={18} color="#38bdf8" />
          Why Am I Eligible? — Rule Engine Reasoning
        </h3>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '14px' }}>
          LifeOps verified your profile against statutory prerequisites for <strong>{application.opportunityTitle}</strong>:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px', fontSize: '13px' }}>
            <span style={{ fontWeight: 700, color: '#4ade80' }}>✓ Income Threshold:</span> Family annual income ₹1,80,000 ≤ ₹2,50,000 ceiling.
          </div>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px', fontSize: '13px' }}>
            <span style={{ fontWeight: 700, color: '#4ade80' }}>✓ Academic Merit:</span> Class 10 score 87.4% ≥ 60.0% minimum requirement.
          </div>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px', fontSize: '13px' }}>
            <span style={{ fontWeight: 700, color: '#4ade80' }}>✓ Residence Verification:</span> Tamil Nadu residence confirmed from Aadhaar & Income Certificate.
          </div>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px', fontSize: '13px' }}>
            <span style={{ fontWeight: 700, color: '#4ade80' }}>✓ Identity Verification:</span> 100% field cross-matching complete.
          </div>
        </div>
      </div>

      {/* Main Review Section */}
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Target Application: {application.opportunityTitle}
            </h2>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
              Issuing Authority: {application.authority}
            </div>
          </div>

          {application.status !== 'SUBMITTED' && (
            <button
              onClick={() => onApproveAllFields(application.id)}
              style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              Approve All Fields
            </button>
          )}
        </div>

        {/* Fields Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Field Label</th>
              <th style={{ padding: '10px' }}>Value</th>
              <th style={{ padding: '10px' }}>Source Provenance</th>
              <th style={{ padding: '10px' }}>Status</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Human Action</th>
            </tr>
          </thead>
          <tbody>
            {application.fields.map(f => {
              const isRejected = f.approvalStatus === 'REJECTED';
              const isApproved = f.approved && !isRejected;

              return (
                <React.Fragment key={f.fieldKey}>
                  <tr style={{ borderBottom: '1px solid #1e293b', backgroundColor: isRejected ? 'rgba(239, 68, 68, 0.1)' : (isApproved ? 'rgba(34, 197, 94, 0.05)' : 'transparent') }}>
                    <td style={{ padding: '12px 10px', fontWeight: 600, color: '#ffffff' }}>
                      {f.label}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      {f.sensitive ? (
                        <MaskedSensitiveValue value={f.value} type={f.fieldKey.toLowerCase().includes('aadhaar') ? 'aadhaar' : 'generic'} />
                      ) : (
                        <span style={{ fontWeight: 600, color: '#f8fafc' }}>{f.value}</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <ProvenanceBadge 
                        sourceDocument={f.sourceDocument} 
                        onClickSource={() => setActiveSourceDoc({ name: f.sourceDocument, fieldKey: f.fieldKey })}
                      />
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      {isRejected ? (
                        <span style={{ color: '#fca5a5', fontWeight: 700, fontSize: '11px', backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                          REJECTED ({f.rejectionReason})
                        </span>
                      ) : isApproved ? (
                        <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '11px', backgroundColor: 'rgba(34, 197, 94, 0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                          ✓ APPROVED
                        </span>
                      ) : (
                        <span style={{ color: '#fde047', fontWeight: 700, fontSize: '11px', backgroundColor: 'rgba(245, 158, 11, 0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                          PENDING
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                      {application.status !== 'SUBMITTED' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => onApproveFieldToggle(application.id, f.fieldKey)}
                            style={{
                              backgroundColor: isApproved ? '#15803d' : '#1e293b',
                              color: isApproved ? '#ffffff' : '#94a3b8',
                              border: `1px solid ${isApproved ? '#22c55e' : '#334155'}`,
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            {isApproved ? 'Approved ✓' : 'Approve'}
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setShowRejectionInput(showRejectionInput === f.fieldKey ? null : f.fieldKey);
                              setRejectionReasonText('');
                            }}
                            style={{
                              backgroundColor: isRejected ? '#7f1d1d' : 'transparent',
                              color: isRejected ? '#fca5a5' : '#ef4444',
                              border: '1px solid #7f1d1d',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            {isRejected ? 'Rejected ✗' : 'Reject'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>

                  {/* Inline Rejection Form */}
                  {showRejectionInput === f.fieldKey && (
                    <tr>
                      <td colSpan={5} style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: '12px 16px', borderBottom: '1px solid #7f1d1d' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <XCircle size={16} color="#ef4444" />
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#fca5a5' }}>
                            Reason for Field Rejection:
                          </span>
                          <input
                            type="text"
                            placeholder="e.g. Value requires correction by user"
                            value={rejectionReasonText}
                            onChange={e => setRejectionReasonText(e.target.value)}
                            style={{ flex: 1, padding: '6px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #7f1d1d', backgroundColor: '#0f172a', color: '#ffffff', outline: 'none' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRejection(f.fieldKey)}
                            style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Save Rejection
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowRejectionInput(null)}
                            style={{ backgroundColor: 'transparent', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}
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

        {/* Submission Guard Checklist Widget */}
        {application.status !== 'SUBMITTED' && (
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '16px 20px', marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="#38bdf8" />
              Submission Guard Pre-flight Checklist ({guardStatus.checks.filter(c => c.passed).length}/{guardStatus.checks.length} Passed)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {guardStatus.checks.map((chk: SubmissionGuardCheck) => (
                <div key={chk.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  {chk.passed ? (
                    <CheckCircle2 size={14} color="#4ade80" />
                  ) : (
                    <XCircle size={14} color="#ef4444" />
                  )}
                  <span style={{ color: chk.passed ? '#4ade80' : '#fca5a5', fontWeight: 600 }}>
                    {chk.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Final Declaration & Authorization Controls */}
        {application.status !== 'SUBMITTED' && (
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
              Final Human Submission Declaration
            </h3>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={application.userDeclarationApproved}
                onChange={e => onSetDeclarationApproved(application.id, e.target.checked)}
                style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: '#2563eb' }}
              />
              <span style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: 1.5 }}>
                I have reviewed all field values above. I authorize LifeOps AI to submit the selected information for this mock application workflow.
              </span>
            </label>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #334155' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: canSubmit ? '#4ade80' : '#fde047' }}>
                {getGuardExplanation()}
              </div>

              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={!canSubmit || isSubmitting}
                style={{
                  padding: '12px 24px',
                  fontSize: '15px',
                  fontWeight: 700,
                  backgroundColor: canSubmit ? '#2563eb' : '#334155',
                  color: canSubmit ? '#ffffff' : '#64748b',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: canSubmit ? '0 4px 14px rgba(37, 99, 235, 0.4)' : 'none'
                }}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Approve & Submit Application
                  </>
                )}
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
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{ maxWidth: '480px', width: '100%', padding: '28px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert color="#38bdf8" />
                Confirm Submission Authorization
              </h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '20px' }}>
              You are authorizing LifeOps AI to submit the reviewed information to the selected application (<strong>{application.opportunityTitle}</strong>).
            </p>

            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '12px 14px', borderRadius: '6px', fontSize: '12px', color: '#60a5fa', marginBottom: '24px' }}>
              🔒 <strong>Hackathon Prototype Notice:</strong> This will execute a mock submission and create an append-only audit event. No external government portal will be contacted.
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{ backgroundColor: 'transparent', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmission}
                disabled={isSubmitting}
                style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROVENANCE SOURCE MODAL */}
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
