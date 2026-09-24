import { 
  UserDocument, 
  DiscrepancyItem, 
  Opportunity, 
  ApplicationDraft, 
  ConsistencyCheckResult, 
  EligibilityResult,
  PrivacySettings 
} from '../types';
import { runConsistencyCheck } from './consistencyEngine';
import { evaluateEligibility } from './eligibilityEngine';
import { generateApplicationDraft } from './applicationEngine';
import { evaluateSubmissionGuard, SubmissionGuardResult } from './submissionGuard';
import { filterDocumentsByPrivacyPolicy, filterFieldsByPrivacyPolicy } from './privacyEngine';
import { DEFAULT_PRIVACY_SETTINGS } from '../utils/storage';

/**
 * CONTROLLED AGENT TOOLS
 * 
 * Strict permission-gated tools through which the Agent operates.
 * All document and profile access paths pass through the Privacy Policy engine.
 * The Agent cannot mutate application, deletion, or submission state directly.
 */
export const AgentTools = {
  getDocuments: (
    documents: UserDocument[], 
    purpose: string = 'Opportunity Evaluation', 
    settings: PrivacySettings = DEFAULT_PRIVACY_SETTINGS
  ): UserDocument[] => {
    return filterDocumentsByPrivacyPolicy(documents, purpose, settings);
  },

  getVerifiedProfile: (
    documents: UserDocument[], 
    purpose: string = 'Profile Verification', 
    settings: PrivacySettings = DEFAULT_PRIVACY_SETTINGS
  ) => {
    const fields: { fieldKey: string; label: string; value: string; source: string }[] = [];
    const filteredDocs = filterDocumentsByPrivacyPolicy(documents, purpose, settings);
    
    filteredDocs.forEach(doc => {
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
    application: ApplicationDraft | null,
    documents: UserDocument[] = [],
    user?: any,
    discrepancies: DiscrepancyItem[] = []
  ): SubmissionGuardResult => {
    return evaluateSubmissionGuard(hasValidRun, application, documents, user, discrepancies);
  }
};
