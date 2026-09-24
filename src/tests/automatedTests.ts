import { evaluateEligibility } from '../engine/eligibilityEngine';
import { evaluateSubmissionGuard } from '../engine/submissionGuard';
import { filterFieldsByPrivacyPolicy } from '../engine/privacyEngine';
import { createAuditEvent, verifyAuditChain, GENESIS_HASH } from '../utils/audit';
import { authenticateUser, createAccount } from '../engine/authService';
import { MOCK_OPPORTUNITIES } from '../data/mockOpportunities';
import { CLEAN_DOCUMENTS, MISMATCH_DOCUMENTS } from '../data/mockDocuments';
import { DEFAULT_PRIVACY_SETTINGS } from '../utils/storage';
import { maskValue } from '../components/MaskedSensitiveValue';
import { UserProfile, ApplicationDraft, AgentRun } from '../types';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` - ${detail}` : ''}`);
  }
}

export function runAllAutomatedTests() {
  console.log('====================================================');
  console.log('LIFEOPS AI — AUTOMATED TEST SUITE EXECUTION');
  console.log('====================================================\n');

  // TEST SUITE 1: PRIVACY & SENSITIVE DATA MASKING
  console.log('1. PRIVACY ENGINE & SENSITIVE MASKING TESTS:');
  const aadhaarMasked = maskValue('1234 5678 9012', 'aadhaar');
  assert(aadhaarMasked === 'XXXX XXXX 9012', 'Aadhaar masking formats correctly (XXXX XXXX 9012)');

  const bankMasked = maskValue('98765432105678', 'bank');
  assert(bankMasked === 'XXXXXXXX5678', 'Bank account masking formats correctly (XXXXXXXX5678)');

  const docFields = CLEAN_DOCUMENTS[0].fields;
  const minimizationResult = filterFieldsByPrivacyPolicy(docFields, 'Scholarship Application', DEFAULT_PRIVACY_SETTINGS);
  assert(minimizationResult.minimizationApplied, 'Data minimization filters unneeded fields based on workflow purpose');

  const revokedConsentResult = filterFieldsByPrivacyPolicy(docFields, 'Scholarship Application', {
    ...DEFAULT_PRIVACY_SETTINGS,
    consentApproved: false
  });
  assert(revokedConsentResult.allowedFields.length === 0, 'Revoked consent blocks all vault fields from agent tools');
  console.log('');

  // TEST SUITE 2: REUSABLE ELIGIBILITY ENGINE
  console.log('2. DETERMINISTIC ELIGIBILITY ENGINE TESTS:');
  const opp = MOCK_OPPORTUNITIES[0]; // State Student Support Scheme
  const cleanEval = evaluateEligibility(opp, CLEAN_DOCUMENTS);
  assert(cleanEval.isEligible, 'Clean documents evaluate as ELIGIBLE for State Student Support Scheme');

  const emptyDocsEval = evaluateEligibility(opp, []);
  assert(!emptyDocsEval.isEligible, 'Empty document vault evaluates as NOT ELIGIBLE due to missing required data');
  console.log('');

  // TEST SUITE 3: SUBMISSION GUARD & HUMAN APPROVAL
  console.log('3. CONTROLLED SUBMISSION GUARD TESTS:');
  const dummyUser: UserProfile = {
    id: 'usr-test-01',
    fullName: 'Test User',
    email: 'test@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accountStatus: 'ACTIVE',
    authMethod: 'EMAIL_PASSWORD',
    preferences: { language: 'English', notificationsEnabled: true, sensitivityLevel: 'standard' }
  };

  const dummyApp: ApplicationDraft = {
    id: 'app-test-01',
    opportunityId: opp.id,
    opportunityTitle: opp.title,
    category: opp.category,
    authority: opp.authority,
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    userDeclarationApproved: true,
    fields: [
      { fieldKey: 'name', label: 'Full Name', value: 'Test User', sourceDocument: 'Aadhaar Card', approved: true, approvalStatus: 'APPROVED' },
      { fieldKey: 'income', label: 'Annual Income', value: '₹1,50,000', sourceDocument: 'Income Certificate', approved: true, approvalStatus: 'APPROVED' }
    ]
  };

  const validGuard = evaluateSubmissionGuard(true, dummyApp, CLEAN_DOCUMENTS, dummyUser, []);
  assert(validGuard.canSubmit, 'Valid application with human declaration and all approved fields passes Submission Guard');

  const rejectedApp: ApplicationDraft = {
    ...dummyApp,
    fields: [
      { fieldKey: 'name', label: 'Full Name', value: 'Test User', sourceDocument: 'Aadhaar Card', approved: false, approvalStatus: 'REJECTED', rejectionReason: 'Spelling mismatch' }
    ]
  };

  const rejectedGuard = evaluateSubmissionGuard(true, rejectedApp, CLEAN_DOCUMENTS, dummyUser, []);
  assert(!rejectedGuard.canSubmit, 'Rejected field BLOCKS submission guard from proceeding');

  const unsignedApp: ApplicationDraft = {
    ...dummyApp,
    userDeclarationApproved: false
  };

  const unsignedGuard = evaluateSubmissionGuard(true, unsignedApp, CLEAN_DOCUMENTS, dummyUser, []);
  assert(!unsignedGuard.canSubmit, 'Unsigned declaration BLOCKS submission guard');
  console.log('');

  // TEST SUITE 4: CRYPTOGRAPHIC SHA-256 AUDIT CHAIN
  console.log('4. SHA-256 AUDIT CHAIN & TAMPERING DETECTION TESTS:');
  const event1 = createAuditEvent('DOCUMENT_ADDED', 'Upload Aadhaar', 'Aadhaar uploaded to vault', { previousHash: GENESIS_HASH });
  const event2 = createAuditEvent('VERIFICATION_RUN', 'Run Verification', 'Verified identity attributes', { previousHash: event1.hash });
  
  const validChain = verifyAuditChain([event2, event1]);
  assert(validChain.valid, 'SHA-256 audit chain links correctly from genesis');

  const tamperedEvent2 = { ...event2, details: event2.details + ' [TAMPERED]' };
  const tamperedChain = verifyAuditChain([tamperedEvent2, event1]);
  assert(!tamperedChain.valid, 'Payload tampering is detected and fails audit verification');
  console.log('');

  // TEST SUITE 5: AUTHENTICATION & STRICT AGENT BINDING TESTS
  console.log('5. AUTHENTICATION & STRICT AGENT BINDING TESTS:');
  const created = createAccount('Test Auth User', `authuser_${Date.now()}@example.com`, 'secret123');
  assert(created.success, 'New account creation succeeds');

  const wrongAuth = authenticateUser(created.user!.email, 'wrongpass');
  assert(!wrongAuth.success, 'Wrong password authentication fails');

  const wrongBypass = authenticateUser(created.user!.email, 'demo1234');
  assert(!wrongBypass.success, 'Universal demo1234 password bypass is blocked for new accounts');

  const correctAuth = authenticateUser(created.user!.email, 'secret123');
  assert(correctAuth.success && correctAuth.user?.email === created.user!.email, 'Correct password authentication succeeds');

  const dummyRun: AgentRun = {
    id: 'run-99',
    runId: 'run-99',
    goal: 'Test Goal',
    status: 'RUNNING',
    currentStepIndex: 1,
    totalSteps: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    applicationId: 'different-app-id',
    demoMode: 'clean',
    steps: [],
    activityLog: []
  };

  const mismatchedRunGuard = evaluateSubmissionGuard(dummyRun, dummyApp, CLEAN_DOCUMENTS, dummyUser, []);
  assert(!mismatchedRunGuard.canSubmit && (mismatchedRunGuard.blockingReason?.includes('not linked') || false), 'Mismatched Agent Run applicationId BLOCKS submission guard');
  console.log('');

  console.log('====================================================');
  console.log(`TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('====================================================\n');

  return { passed: passedTests === totalTests, totalTests, passedTests };
}

// Execute tests directly if executed via tsx / node runner
if (typeof window === 'undefined') {
  runAllAutomatedTests();
}
