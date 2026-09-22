import { ApplicationDraft, UserDocument, UserProfile, DiscrepancyItem } from '../types';

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
 * Enforces technical preconditions before any mock submission can execute.
 * Checks authenticated user, valid agent run, zero rejected fields, explicit approvals,
 * and user declaration authorization.
 */
export function evaluateSubmissionGuard(
  hasValidRun: boolean,
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
      ? `Authenticated user "${user?.fullName}" authorized for submission.`
      : 'Submission blocked: User must be signed into an active account.'
  });

  // Check 2: Valid Agent Run active
  checks.push({
    id: 'guard-agent-run',
    label: 'Valid Agent Run Active',
    passed: hasValidRun,
    reason: hasValidRun 
      ? 'Workflow plan initialized and verified.' 
      : 'No active Agent Run found for this application draft.'
  });

  // Check 3: Valid Application draft exists
  const hasApp = !!application;
  checks.push({
    id: 'guard-app-exists',
    label: 'Application Draft Prepared',
    passed: hasApp,
    reason: hasApp 
      ? `Draft application "${application?.opportunityTitle}" located.` 
      : 'No draft application found.'
  });

  // Check 4: No Unresolved Critical Discrepancies
  const unacknowledgedCritical = discrepancies.filter(d => !d.acknowledged && d.status === 'critical').length;
  const noCriticalBlockers = unacknowledgedCritical === 0;
  checks.push({
    id: 'guard-verification-blockers',
    label: 'No Unresolved Critical Discrepancies',
    passed: noCriticalBlockers,
    reason: noCriticalBlockers
      ? 'Zero unresolved critical verification blockers.'
      : `${unacknowledgedCritical} critical identity discrepancy must be acknowledged or corrected.`
  });

  // Check 5: No Rejected Fields & All Fields Approved
  const rejectedField = hasApp ? application.fields.find(f => f.approvalStatus === 'REJECTED') : null;
  const hasRejectedFields = Boolean(rejectedField);
  const allFieldsApproved = hasApp && application.fields.length > 0 && application.fields.every(f => f.approved && f.approvalStatus !== 'REJECTED');
  const unapprovedCount = hasApp ? application.fields.filter(f => !f.approved || f.approvalStatus === 'REJECTED').length : 0;
  
  checks.push({
    id: 'guard-fields-approved',
    label: 'Field-Level Human Approval & Zero Rejections',
    passed: !hasRejectedFields && allFieldsApproved,
    reason: hasRejectedFields
      ? `Field "${rejectedField?.label}" was rejected by user. Rejected fields can NEVER be submitted.`
      : allFieldsApproved 
        ? `All ${application?.fields.length} prepared fields explicitly approved by human user.` 
        : `${unapprovedCount} prepared fields still require user approval.`
  });

  // Check 6: User declaration signed
  const declarationApproved = hasApp && application.userDeclarationApproved;
  checks.push({
    id: 'guard-declaration',
    label: 'Human Authorization Declaration Signed',
    passed: declarationApproved,
    reason: declarationApproved 
      ? 'Legal accuracy declaration signed by user.' 
      : 'User declaration has not been authorized.'
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
