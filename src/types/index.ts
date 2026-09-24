export type DocumentType = 
  | 'aadhaar' 
  | 'marksheet' 
  | 'income_certificate' 
  | 'bank_passbook' 
  | 'other';

export type VerificationStatus = 
  | 'verified' 
  | 'warning' 
  | 'critical' 
  | 'pending';

export interface DocumentField {
  id: string;
  field: string;
  label: string;
  value: string;
  sourceDocument: string;
  confidence: 'high' | 'medium' | 'low';
  sensitive?: boolean;
}

export interface UserDocument {
  id: string;
  name: string;
  type: DocumentType;
  fields: DocumentField[];
  uploadedAt: string;
  status: VerificationStatus;
  fileName?: string;
  fileSize?: string;
}

export interface UserProfileField {
  fieldKey: string;
  label: string;
  value: string;
  sourceDocument: string;
  confidence: 'high' | 'medium' | 'low';
  status: VerificationStatus;
  sensitive?: boolean;
}

export interface DiscrepancyDocumentValue {
  documentName: string;
  documentType: DocumentType;
  value: string;
}

export interface DiscrepancyItem {
  id: string;
  fieldKey: string;
  fieldLabel: string;
  status: VerificationStatus; // 'warning' or 'critical'
  documents: DiscrepancyDocumentValue[];
  explanation: string;
  suggestedAction: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
}

export interface ConsistencyCheckResult {
  overallStatus: VerificationStatus;
  totalFieldsChecked: number;
  verifiedCount: number;
  warningCount: number;
  criticalCount: number;
  discrepancies: DiscrepancyItem[];
}

export type OpportunityCategory =
  | 'Scholarships'
  | 'Government Schemes'
  | 'Certificates'
  | 'Education'
  | 'Employment'
  | 'Other Applications';

export interface EligibilityCriterion {
  key: string;
  label: string;
  requirementDescription: string;
  type: 'min_number' | 'max_number' | 'exact_match' | 'age_range' | 'in_list';
  targetValue: any;
}

export interface Opportunity {
  id: string;
  title: string;
  category: OpportunityCategory;
  type: string;
  deadline: string;
  description: string;
  authority: string;
  criteria: EligibilityCriterion[];
  sourceUrl?: string;
  sourceName?: string;
  lastVerifiedAt?: string;
}

export interface CriterionEvalResult {
  criterionLabel: string;
  passed: boolean;
  actualValue: string;
  requiredValue: string;
}

export interface EligibilityResult {
  opportunityId: string;
  isEligible: boolean;
  matchedCount: number;
  totalCriteria: number;
  details: CriterionEvalResult[];
}

export type FieldApprovalStatus = 'APPROVED' | 'REJECTED' | 'PENDING';

export interface ApplicationFieldDraft {
  fieldKey: string;
  label: string;
  value: string;
  sourceDocument: string;
  sensitive?: boolean;
  approved: boolean;
  approvalStatus?: FieldApprovalStatus;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
}

export type ApplicationStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'SUBMITTED';

export interface ApplicationDraft {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  category: OpportunityCategory;
  authority: string;
  status: ApplicationStatus;
  createdAt: string;
  submittedAt?: string;
  referenceId?: string;
  fields: ApplicationFieldDraft[];
  userDeclarationApproved: boolean;
}

export type AuditActionType =
  | 'GOAL_CREATED'
  | 'WORKFLOW_PLANNED'
  | 'DOCUMENT_ADDED'
  | 'DOCUMENT_PROCESSED'
  | 'VERIFICATION_EXECUTED'
  | 'VERIFICATION_RUN'
  | 'DISCREPANCY_DETECTED'
  | 'DISCREPANCY_ACKNOWLEDGED'
  | 'ELIGIBILITY_EVALUATED'
  | 'APPLICATION_DRAFTED'
  | 'APPLICATION_DRAFT_PREPARED'
  | 'FIELD_APPROVED'
  | 'FIELD_REJECTED'
  | 'FIELD_APPROVAL_REVOKED'
  | 'DECLARATION_AUTHORIZED'
  | 'HUMAN_DECLARATION_CONFIRMED'
  | 'APPLICATION_SUBMITTED'
  | 'APPLICATION_MOCK_SUBMITTED'
  | 'DEMO_RESET';

export interface AuditEvent {
  id: string;
  userId?: string;
  action: AuditActionType;
  actionLabel: string;
  applicationTitle?: string;
  field?: string;
  value?: string;
  sourceDocument?: string;
  approvedBy: string;
  timestamp: string;
  details: string;
  hash?: string;
  previousHash?: string;
  isTampered?: boolean;
}

export type DemoMode = 'mismatch' | 'clean';

export type AgentStepStatus = 'pending' | 'active' | 'completed' | 'blocked' | 'warning';

export interface SourceReference {
  documentId?: string;
  documentName: string;
  documentType?: DocumentType;
  fieldKey?: string;
  fieldLabel?: string;
  value?: string;
}

export interface MetricItem {
  label: string;
  value: string | number;
  status?: 'good' | 'warning' | 'neutral';
}

export interface StepEvidence {
  whatHappened: string;
  whyItHappened: string;
  evidenceSummary: string;
  sourceReferences: SourceReference[];
  metrics: MetricItem[];
  warnings?: string[];
  nextAction?: string;
}

export interface AgentStep {
  id: string;
  number: string;
  title: string;
  description: string;
  status: AgentStepStatus;
  detail?: string;
  timestamp?: string;
  startedAt?: string;
  completedAt?: string;
  summary?: string;
  evidence?: StepEvidence;
  actionRequired?: string;
}

export type AgentRunStatus = 'IDLE' | 'PLANNING' | 'RUNNING' | 'WAITING_APPROVAL' | 'FIELDS_APPROVED' | 'COMPLETED';

export interface AgentActivityLogItem {
  id: string;
  timestamp: string;
  message: string;
  stepNumber?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export interface AgentRunSummary {
  goal: string;
  documentsChecked: number;
  verifiedFields: number;
  issuesDetected: number;
  opportunitiesEvaluated: number;
  eligibleOpportunities: number;
  applicationDraftId?: string;
  applicationTitle?: string;
}

export type AIProviderType = 'LOCAL_DEMO' | 'EXTERNAL_LLM';

export interface PrivacySettings {
  dataMinimizationEnabled: boolean;
  maskSensitiveFields: boolean;
  allowExternalSharing: boolean;
  consentApproved: boolean;
  consentApprovedAt?: string;
}

export interface UserPreferences {
  language: string;
  notificationsEnabled: boolean;
  sensitivityLevel: 'strict' | 'standard' | 'relaxed';
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  dateOfBirth?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  accountStatus: 'ACTIVE' | 'DEMO_LOCKED' | 'PENDING';
  authMethod: 'LOCAL_DEMO' | 'EMAIL_PASSWORD' | 'FIREBASE_AUTH';
  preferences: UserPreferences;
}

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading' | 'error';

export interface AuthState {
  status: AuthStatus;
  currentUser: UserProfile | null;
  error?: string;
}

export interface AgentRun {
  id: string;
  runId: string;
  goal: string;
  status: AgentRunStatus;
  currentStepIndex: number;
  totalSteps: number;
  createdAt: string;
  updatedAt: string;
  applicationId?: string;
  demoMode: DemoMode;
  providerType?: AIProviderType;
  steps: AgentStep[];
  activityLog: AgentActivityLogItem[];
  summary?: AgentRunSummary;
}


