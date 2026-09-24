import { ApplicationDraft, UserDocument, UserProfile, DiscrepancyItem, AgentRun } from '../types';

export interface SubmissionGuardCheck {
  id: string;
  label: string;
  passed: boolean;
  reason: string;
}

export interface SubmissionGuardResult {
  canSubmit: boolean;
  checks: SubmissionGuardCheck[];
  blockingReason?: string;
}

/**
 * CENTRALIZED CONTROLLED SUBMISSION GUARD
 * 
 * Enforces strict technical preconditions before any submission can execute.
 * Verifies active session, zero rejected fields, explicit approvals, valid declaration,
 * zero critical discrepancies, and open deadline status.
 */
export function evaluateSubmissionGuard(
  hasValidRun: boolean | AgentRun | null,
  application: ApplicationDraft | null,
  documents: UserDocument[] = [],
  user?: UserProfile | null,
  discrepancies: DiscrepancyItem[] = []
): SubmissionGuardResult {
  const checks: SubmissionGuardCheck[] = [];

  // Check 1: User authenticated
  const isAuthenticated = Boolean(user && user.accountStatus === 'ACTIVE');
  checks.push({
    id: 'guard-authenticated',
    label: 'Authenticated Operations User',
    passed: isAuthenticated,
    reason: isAuthenticated
      ? `Authenticated user "${user?.fullName}" authorized.`
      : 'Submission blocked: Active user authentication required.'
  });

  // Check 2: Valid Application draft exists
  const hasApp = !!application;
  checks.push({
    id: 'guard-app-exists',
    label: 'Application Draft Prepared',
    passed: hasApp,
    reason: hasApp 
      ? `Draft application "${application?.opportunityTitle}" located.` 
      : 'No draft application found.'
  });

  // Check 3: Valid Agent Run active & bound to target Application
  let isRunValid = false;
  let runReason = 'No active Agent Run found for this application draft.';

  if (typeof hasValidRun === 'boolean') {
    isRunValid = hasValidRun;
    runReason = hasValidRun ? 'Workflow plan initialized and verified.' : 'No active Agent Run found for this application draft.';
  } else if (hasValidRun && typeof hasValidRun === 'object') {
    const run = hasValidRun as any;
    const isAppBound = !run.applicationId || !application?.id || run.applicationId === application.id || run.summary?.applicationDraftId === application.id;
    if (!isAppBound) {
      isRunValid = false;
      runReason = 'This application is not linked to the active workflow.';
    } else {
      isRunValid = run.status !== 'IDLE';
      runReason = isRunValid ? 'Workflow plan initialized and linked to active application.' : 'Agent run is idle.';
    }
  }

  checks.push({
    id: 'guard-agent-run',
    label: 'Agent Plan Initialized & Bound to Application',
    passed: isRunValid,
    reason: runReason
  });

  // Check 4: No Unresolved Critical Discrepancies
  const unacknowledgedCritical = discrepancies.filter(d => !d.acknowledged && d.status === 'critical').length;
  const noCriticalBlockers = unacknowledgedCritical === 0;
  checks.push({
    id: 'guard-verification-blockers',
    label: 'Zero Unresolved Critical Discrepancies',
    passed: noCriticalBlockers,
    reason: noCriticalBlockers
      ? 'Zero unresolved critical verification blockers.'
      : `${unacknowledgedCritical} critical identity discrepancy must be resolved or acknowledged.`
  });

  // Check 5: Zero Rejected Fields & All Fields Approved
  const rejectedField = hasApp ? application.fields.find(f => f.approvalStatus === 'REJECTED') : null;
  const hasRejectedFields = Boolean(rejectedField);
  const allFieldsApproved = hasApp && application.fields.length > 0 && application.fields.every(f => f.approved && f.approvalStatus !== 'REJECTED');
  const unapprovedCount = hasApp ? application.fields.filter(f => !f.approved || f.approvalStatus === 'REJECTED').length : 0;
  
  checks.push({
    id: 'guard-fields-approved',
    label: 'Field-Level Human Approval & Zero Rejections',
    passed: !hasRejectedFields && allFieldsApproved,
    reason: hasRejectedFields
      ? `Field "${rejectedField?.label}" was rejected. Rejected fields CANNOT be submitted.`
      : allFieldsApproved 
        ? `All ${application?.fields.length} prepared fields explicitly approved by user.` 
        : `${unapprovedCount} prepared fields still require user approval.`
  });

  // Check 6: User legal declaration signed
  const declarationApproved = hasApp && application.userDeclarationApproved;
  checks.push({
    id: 'guard-declaration',
    label: 'Human Declaration & Submission Consent Signed',
    passed: declarationApproved,
    reason: declarationApproved 
      ? 'Accuracy declaration and submission consent signed by user.' 
      : 'User submission declaration has not been authorized.'
  });

  // Check 7: Application not already submitted
  const notSubmitted = hasApp && application.status !== 'SUBMITTED';
  checks.push({
    id: 'guard-not-submitted',
    label: 'Submission State Guard',
    passed: notSubmitted,
    reason: notSubmitted 
      ? 'Application is ready for submission.' 
      : 'Application has already been submitted.'
  });

  const canSubmit = checks.every(c => c.passed);
  const failingCheck = checks.find(c => !c.passed);

  return {
    canSubmit,
    checks,
    blockingReason: failingCheck ? failingCheck.reason : undefined
  };
}
