import { 
  UserDocument, 
  DiscrepancyItem, 
  Opportunity, 
  ApplicationDraft, 
  ConsistencyCheckResult, 
  EligibilityResult 
} from '../types';
import { runConsistencyCheck } from './consistencyEngine';
import { evaluateEligibility } from './eligibilityEngine';
import { generateApplicationDraft } from './applicationEngine';
import { evaluateSubmissionGuard, SubmissionGuardResult } from './submissionGuard';

/**
 * CONTROLLED AGENT TOOLS
 * 
 * Strict permission-gated tools through which the Agent operates.
 * The Agent cannot mutate application or submission state directly.
 */
export const AgentTools = {
  getDocuments: (documents: UserDocument[]): UserDocument[] => {
    return documents;
  },

  getVerifiedProfile: (documents: UserDocument[]) => {
    const fields: { fieldKey: string; label: string; value: string; source: string }[] = [];
    documents.forEach(doc => {
      doc.fields.forEach(f => {
        fields.push({
          fieldKey: f.field,
          label: f.label,
          value: f.value,
          source: doc.name
        });
      });
    });
    return fields;
  },

  runVerification: (documents: UserDocument[], discrepancies: DiscrepancyItem[] = []): ConsistencyCheckResult => {
    return runConsistencyCheck(documents, discrepancies);
  },

  findOpportunities: (opportunities: Opportunity[]): Opportunity[] => {
    return opportunities;
  },

  evaluateEligibility: (opportunity: Opportunity, documents: UserDocument[]): EligibilityResult => {
    return evaluateEligibility(opportunity, documents);
  },

  prepareApplication: (opportunity: Opportunity, documents: UserDocument[]): ApplicationDraft => {
    return generateApplicationDraft(opportunity, documents);
  },

  evaluateSubmissionGuard: (
    hasValidRun: boolean,
    application: ApplicationDraft | null
  ): SubmissionGuardResult => {
    return evaluateSubmissionGuard(hasValidRun, application);
  }
};
