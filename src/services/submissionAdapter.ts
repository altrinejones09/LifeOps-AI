import { ApplicationDraft, UserProfile } from '../types';
import { SubmissionGuardResult } from '../engine/submissionGuard';
import { createAuditEvent } from '../utils/audit';

export interface SubmissionResponse {
  success: boolean;
  referenceId?: string;
  submittedAt?: string;
  error?: string;
  isMock: boolean;
  disclaimer: string;
}

export interface SubmissionProvider {
  submitApplication(
    application: ApplicationDraft,
    user: UserProfile,
    guardResult: SubmissionGuardResult
  ): Promise<SubmissionResponse>;
}

// In-flight submission lock for idempotency enforcement
const pendingSubmissions = new Set<string>();

/**
 * MOCK SUBMISSION ADAPTER (PROTOTYPE GOVERNANCE LAYER)
 * 
 * Safely executes mock submissions for administrative prototypes with full idempotency locks.
 * Explicitly disclaims that live government portal submission is disconnected.
 */
export class MockSubmissionProvider implements SubmissionProvider {
  async submitApplication(
    application: ApplicationDraft,
    user: UserProfile,
    guardResult: SubmissionGuardResult
  ): Promise<SubmissionResponse> {
    // 1. Guard check validation
    if (!guardResult.canSubmit) {
      return {
        success: false,
        error: guardResult.blockingReason || 'Submission guard preconditions failed.',
        isMock: true,
        disclaimer: 'Prototype submission blocked by safety guard.'
      };
    }

    // 2. Idempotency lock check
    if (pendingSubmissions.has(application.id)) {
      return {
        success: false,
        error: 'A submission for this application is currently in progress. Duplicate request blocked.',
        isMock: true,
        disclaimer: 'Idempotency guard active.'
      };
    }

    // Lock application ID
    pendingSubmissions.add(application.id);

    try {
      // Simulate network request duration
      await new Promise(resolve => setTimeout(resolve, 800));

      const refId = `LO-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const submittedAt = new Date().toISOString();

      return {
        success: true,
        referenceId: refId,
        submittedAt,
        isMock: true,
        disclaimer: 'Prototype submission executed safely. External government portal integration is not connected.'
      };
    } finally {
      // Release idempotency lock
      pendingSubmissions.delete(application.id);
    }
  }
}

export const submissionProvider = new MockSubmissionProvider();
