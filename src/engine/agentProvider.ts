import { 
  AIProviderType, 
  UserDocument, 
  DiscrepancyItem, 
  Opportunity, 
  AgentStep, 
  StepEvidence 
} from '../types';
import { runConsistencyCheck } from './consistencyEngine';
import { evaluateEligibility } from './eligibilityEngine';
import { MOCK_OPPORTUNITIES } from '../data/mockOpportunities';

export interface AgentGoalUnderstanding {
  intent: string;
  domain: string;
  requiredDocuments: string[];
  plannedStages: number;
}

export interface AgentProvider {
  type: AIProviderType;
  name: string;
  isConfigured: boolean;
  understandGoal: (goal: string) => Promise<AgentGoalUnderstanding>;
  generateStepEvidence: (
    stepNumber: string,
    goal: string,
    documents: UserDocument[],
    discrepancies: DiscrepancyItem[],
    demoMode: 'mismatch' | 'clean'
  ) => StepEvidence;
}

/**
 * LOCAL DEMO AGENT PROVIDER (Default)
 * 
 * Provides deterministic, explainable evidence backed by local consistency & eligibility engines.
 */
export const LocalDemoAgentProvider: AgentProvider = {
  type: 'LOCAL_DEMO',
  name: 'Local Demo Agent (Deterministic)',
  isConfigured: true,

  understandGoal: async (goal: string): Promise<AgentGoalUnderstanding> => {
    return {
      intent: goal,
      domain: 'Administrative Grants & Higher Education Scholarships',
      requiredDocuments: ['Aadhaar Card', 'Class 10 Marksheet', 'Income Certificate', 'Bank Passbook'],
      plannedStages: 8
    };
  },

  generateStepEvidence: (
    stepNumber: string,
    goal: string,
    documents: UserDocument[],
    discrepancies: DiscrepancyItem[],
    demoMode: 'mismatch' | 'clean'
  ): StepEvidence => {
    const checkResult = runConsistencyCheck(documents, discrepancies);
    const evalResults = MOCK_OPPORTUNITIES.map(opp => ({
      opp,
      result: evaluateEligibility(opp, documents)
    }));
    const eligibleCount = evalResults.filter(r => r.result.isEligible).length;

    switch (stepNumber) {
      case '01':
        return {
          whatHappened: `Parsed user intent: "${goal}". Mapped workflow to administrative opportunity domain.`,
          whyItHappened: 'Goal understanding module identified request requires identity verification, eligibility scoring, and form population.',
          evidenceSummary: 'Structured 8-stage operational plan initialized.',
          sourceReferences: [],
          metrics: [
            { label: 'Planned Stages', value: 8, status: 'good' },
            { label: 'Domain', value: 'Education & Grants', status: 'neutral' }
          ],
          nextAction: 'Scan Document Vault for relevant identity credentials'
        };

      case '02':
        return {
          whatHappened: `Scanned Document Vault: Located ${documents.length} uploaded files (Aadhaar, Marksheet, Income Cert, Bank Passbook).`,
          whyItHappened: 'Goal requires full name, DOB, income certificate, and bank details for scholarship eligibility.',
          evidenceSummary: `${documents.length} documents inspected with 19 total extracted fields.`,
          sourceReferences: documents.map(d => ({ documentId: d.id, documentName: d.name, documentType: d.type })),
          metrics: [
            { label: 'Documents Inspected', value: documents.length, status: 'good' },
            { label: 'Fields Available', value: 19, status: 'good' }
          ],
          nextAction: 'Run Cross-Document Consistency Engine'
        };

      case '03':
        if (demoMode === 'mismatch') {
          return {
            whatHappened: 'Consistency Engine executed: Flagged 1 identity spelling discrepancy between Aadhaar and Income Certificate.',
            whyItHappened: 'Deterministic edit-distance comparison detected "Arun Kumar" on Aadhaar vs "Arun Kumarr" on Income Certificate.',
            evidenceSummary: 'Identity mismatch flagged. Application drafting permitted with audit record upon user acknowledgment.',
            sourceReferences: [
              { documentName: 'Aadhaar Card', fieldLabel: 'Full Name', value: 'Arun Kumar' },
              { documentName: 'Income Certificate', fieldLabel: 'Full Name', value: 'Arun Kumarr' }
            ],
            metrics: [
              { label: 'Fields Checked', value: checkResult.totalFieldsChecked, status: 'neutral' },
              { label: 'Discrepancies Flagged', value: 1, status: 'warning' }
            ],
            warnings: ['Full name differs slightly between Aadhaar Card ("Arun Kumar") and Income Certificate ("Arun Kumarr").'],
            nextAction: 'Proceed to Opportunity Discovery with flagged warning'
          };
        }
        return {
          whatHappened: `Consistency Engine executed: 19 fields successfully cross-verified across ${documents.length} documents with 0 discrepancies.`,
          whyItHappened: 'Pairwise normalization and comparison confirmed 100% attribute consistency.',
          evidenceSummary: 'Clean verification state achieved.',
          sourceReferences: documents.map(d => ({ documentName: d.name })),
          metrics: [
            { label: 'Fields Verified', value: checkResult.totalFieldsChecked, status: 'good' },
            { label: 'Discrepancies', value: 0, status: 'good' }
          ],
          nextAction: 'Query administrative opportunities database'
        };

      case '04':
        return {
          whatHappened: `Searched administrative database: Found ${MOCK_OPPORTUNITIES.length} active programs matching domain filters.`,
          whyItHappened: 'Filter criteria matched higher education grants and state student welfare schemes.',
          evidenceSummary: 'Discovered State Student Support Scheme, Merit Education Assistance, and Identity Certificate.',
          sourceReferences: MOCK_OPPORTUNITIES.map(o => ({ documentName: o.title })),
          metrics: [
            { label: 'Opportunities Evaluated', value: MOCK_OPPORTUNITIES.length, status: 'good' },
            { label: 'Matching Category', value: 'Scholarships & Schemes', status: 'neutral' }
          ],
          nextAction: 'Evaluate deterministic eligibility criteria'
        };

      case '05':
        return {
          whatHappened: `Eligibility Engine evaluated criteria across profile attributes: User qualifies for ${eligibleCount} of ${MOCK_OPPORTUNITIES.length} programs.`,
          whyItHappened: 'Evaluated age (20 yrs in 17-25 range), income (₹1.8L <= ₹2.5L), domicile (Tamil Nadu), academic score (87.4% >= 60%).',
          evidenceSummary: 'State Student Support Scheme matched 4/4 rules (PASS).',
          sourceReferences: [
            { documentName: 'Aadhaar Card', fieldLabel: 'DOB / Address', value: '14-07-2006 (Age 20) / Tamil Nadu' },
            { documentName: 'Class 10 Marksheet', fieldLabel: 'Score', value: '87.4%' },
            { documentName: 'Income Certificate', fieldLabel: 'Income', value: '₹1,80,000' }
          ],
          metrics: [
            { label: 'Programs Eligible', value: eligibleCount, status: 'good' },
            { label: 'Rules Evaluated', value: 4, status: 'good' }
          ],
          nextAction: 'Prepare application draft with verified document provenance'
        };

      case '06':
        return {
          whatHappened: 'Application Engine generated draft for "State Student Support Scheme" with 8 field provenance links.',
          whyItHappened: 'Populated strictly from verified vault fields. Sensitive fields (Aadhaar number, Bank Account) masked by default.',
          evidenceSummary: 'Application draft app-draft-01 created in state.',
          sourceReferences: [
            { documentName: 'Aadhaar Card', fieldLabel: 'Name & Address', value: 'Arun Kumar' },
            { documentName: 'Income Certificate', fieldLabel: 'Annual Income', value: '₹1,80,000' },
            { documentName: 'Bank Passbook', fieldLabel: 'Account Number', value: 'XXXXXX4582' }
          ],
          metrics: [
            { label: 'Fields Prepared', value: 8, status: 'good' },
            { label: 'Sensitive Fields Masked', value: 2, status: 'good' }
          ],
          nextAction: 'Pause and request field-level human authorization'
        };

      case '07':
        return {
          whatHappened: 'HUMAN APPROVAL REQUIRED: Workflow execution paused. Sensitive fields and declaration require explicit user authorization.',
          whyItHappened: 'LifeOps policy enforces that no application can be submitted without explicit human review and authorization.',
          evidenceSummary: 'Awaiting human authorization in Approval Center.',
          sourceReferences: [],
          metrics: [
            { label: 'Fields Needing Review', value: 8, status: 'warning' },
            { label: 'Submission Authorization', value: 'Locked', status: 'warning' }
          ],
          warnings: ['LifeOps has prepared the application but has not authorized submission.'],
          nextAction: 'User must review fields and authorize in Approval Center'
        };

      case '08':
      default:
        return {
          whatHappened: 'CONTROLLED SUBMISSION GUARD: Controlled submission remains locked until explicit human authorization.',
          whyItHappened: 'Centralized submission guard blocks unauthorized mock submission actions.',
          evidenceSummary: 'Submission guard active. No external government portal contacted.',
          sourceReferences: [],
          metrics: [
            { label: 'Submission Guard Status', value: 'Locked / Active', status: 'neutral' },
            { label: 'External Contact', value: 'None (Local Demo)', status: 'neutral' }
          ],
          nextAction: 'Complete Human Approval in Approval Center'
        };
    }
  }
};

/**
 * EXTERNAL LLM AGENT PROVIDER (Optional AI Provider Integration)
 * 
 * Uses environment variable VITE_AI_API_KEY if configured, falling back to LocalDemoAgentProvider.
 */
export const ExternalLLMAgentProvider: AgentProvider = {
  type: 'EXTERNAL_LLM',
  name: 'Configured AI Provider (External LLM)',
  isConfigured: !!((import.meta as any).env && (import.meta as any).env.VITE_AI_API_KEY),

  understandGoal: async (goal: string): Promise<AgentGoalUnderstanding> => {
    // If API key is present, simulated external AI response; fallback otherwise
    if ((import.meta as any).env && (import.meta as any).env.VITE_AI_API_KEY) {
      return {
        intent: goal,
        domain: 'AI-Guided Administrative Operations',
        requiredDocuments: ['Aadhaar Card', 'Marksheet', 'Income Certificate'],
        plannedStages: 8
      };
    }
    return LocalDemoAgentProvider.understandGoal(goal);
  },

  generateStepEvidence: (stepNumber, goal, documents, discrepancies, demoMode) => {
    return LocalDemoAgentProvider.generateStepEvidence(stepNumber, goal, documents, discrepancies, demoMode);
  }
};

export function getActiveAgentProvider(): AgentProvider {
  if ((import.meta as any).env && (import.meta as any).env.VITE_AI_API_KEY) {
    return ExternalLLMAgentProvider;
  }
  return LocalDemoAgentProvider;
}
