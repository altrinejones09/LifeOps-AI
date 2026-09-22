import { 
  UserDocument, 
  DiscrepancyItem, 
  ApplicationDraft, 
  AuditEvent, 
  DemoMode,
  AgentRun,
  PrivacySettings 
} from '../types';
import { MISMATCH_DOCUMENTS, CLEAN_DOCUMENTS } from '../data/mockDocuments';
import { INITIAL_APPLICATIONS } from '../data/mockApplications';
import { INITIAL_AUDIT_LOGS, createAuditEvent } from './audit';
import { runConsistencyCheck } from '../engine/consistencyEngine';

function getUserKey(baseKey: string, userId?: string): string {
  const safeId = userId || 'default';
  return `lifeops_usr_${safeId}_${baseKey}`;
}

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  dataMinimizationEnabled: true,
  maskSensitiveFields: true,
  allowExternalSharing: false,
  consentApproved: true,
  consentApprovedAt: new Date().toISOString()
};

export interface AppState {
  demoMode: DemoMode;
  documents: UserDocument[];
  discrepancies: DiscrepancyItem[];
  applications: ApplicationDraft[];
  auditLogs: AuditEvent[];
  agentRun?: AgentRun | null;
  runHistory: AgentRun[];
  privacySettings: PrivacySettings;
}

export function loadStoredAgentRun(userId?: string): AgentRun | null {
  try {
    const key = getUserKey('agent_run', userId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Failed to load agent run from localStorage:', err);
    return null;
  }
}

export function saveAgentRunToStorage(run: AgentRun | null, userId?: string): void {
  try {
    const key = getUserKey('agent_run', userId);
    if (run) {
      localStorage.setItem(key, JSON.stringify(run));
      // Append to user-isolated run history
      const history = loadRunHistory(userId);
      const existingIdx = history.findIndex(h => h.runId === run.runId);
      let updatedHistory = [...history];
      if (existingIdx >= 0) {
        updatedHistory[existingIdx] = run;
      } else {
        updatedHistory = [run, ...history];
      }
      localStorage.setItem(getUserKey('run_history', userId), JSON.stringify(updatedHistory));
    } else {
      localStorage.removeItem(key);
    }
  } catch (err) {
    console.error('Failed to save agent run to localStorage:', err);
  }
}

export function loadRunHistory(userId?: string): AgentRun[] {
  try {
    const key = getUserKey('run_history', userId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to load run history:', err);
    return [];
  }
}

export function loadPrivacySettings(userId?: string): PrivacySettings {
  try {
    const key = getUserKey('privacy_settings', userId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : DEFAULT_PRIVACY_SETTINGS;
  } catch (err) {
    return DEFAULT_PRIVACY_SETTINGS;
  }
}

export function clearAgentRunFromStorage(userId?: string): void {
  try {
    const key = getUserKey('agent_run', userId);
    localStorage.removeItem(key);
  } catch (err) {
    console.error('Failed to clear agent run from localStorage:', err);
  }
}

export function loadStoredState(userId?: string): AppState {
  try {
    const demoModeKey = getUserKey('demo_mode', userId);
    const storedDemoMode = (localStorage.getItem(demoModeKey) as DemoMode) || 'mismatch';
    
    const docsKey = getUserKey('documents', userId);
    const storedDocs = localStorage.getItem(docsKey);
    
    const discKey = getUserKey('discrepancies', userId);
    const storedDiscrepancies = localStorage.getItem(discKey);
    
    const appsKey = getUserKey('applications', userId);
    const storedApps = localStorage.getItem(appsKey);
    
    const auditsKey = getUserKey('audit_logs', userId);
    const storedAudits = localStorage.getItem(auditsKey);
    
    const storedAgentRun = loadStoredAgentRun(userId);
    const storedRunHistory = loadRunHistory(userId);
    const storedPrivacySettings = loadPrivacySettings(userId);

    const documents: UserDocument[] = storedDocs 
      ? JSON.parse(storedDocs) 
      : (storedDemoMode === 'clean' ? CLEAN_DOCUMENTS : MISMATCH_DOCUMENTS);

    const discrepancies: DiscrepancyItem[] = storedDiscrepancies 
      ? JSON.parse(storedDiscrepancies) 
      : runConsistencyCheck(documents).discrepancies;

    const applications: ApplicationDraft[] = storedApps 
      ? JSON.parse(storedApps) 
      : INITIAL_APPLICATIONS;

    const auditLogs: AuditEvent[] = storedAudits 
      ? JSON.parse(storedAudits) 
      : INITIAL_AUDIT_LOGS;

    return {
      demoMode: storedDemoMode,
      documents,
      discrepancies,
      applications,
      auditLogs,
      agentRun: storedAgentRun,
      runHistory: storedRunHistory,
      privacySettings: storedPrivacySettings
    };
  } catch (err) {
    console.error('Failed to load local storage state:', err);
    return getInitialDefaultState('mismatch', userId);
  }
}

export function getInitialDefaultState(mode: DemoMode, userId?: string): AppState {
  const documents = mode === 'clean' ? CLEAN_DOCUMENTS : MISMATCH_DOCUMENTS;
  const consistency = runConsistencyCheck(documents);

  const resetAudit = createAuditEvent(
    'DEMO_RESET',
    'Demo Dataset Loaded',
    `Loaded ${mode === 'clean' ? 'Clean (Verified)' : 'Mismatch Case'} dataset for user sandbox.`
  );

  return {
    demoMode: mode,
    documents,
    discrepancies: consistency.discrepancies,
    applications: INITIAL_APPLICATIONS,
    auditLogs: [resetAudit, ...INITIAL_AUDIT_LOGS],
    agentRun: null,
    runHistory: loadRunHistory(userId),
    privacySettings: loadPrivacySettings(userId)
  };
}

export function saveStateToStorage(state: AppState, userId?: string): void {
  try {
    localStorage.setItem(getUserKey('demo_mode', userId), state.demoMode);
    localStorage.setItem(getUserKey('documents', userId), JSON.stringify(state.documents));
    localStorage.setItem(getUserKey('discrepancies', userId), JSON.stringify(state.discrepancies));
    localStorage.setItem(getUserKey('applications', userId), JSON.stringify(state.applications));
    localStorage.setItem(getUserKey('audit_logs', userId), JSON.stringify(state.auditLogs));
    localStorage.setItem(getUserKey('run_history', userId), JSON.stringify(state.runHistory));
    localStorage.setItem(getUserKey('privacy_settings', userId), JSON.stringify(state.privacySettings));
    if (state.agentRun !== undefined) {
      saveAgentRunToStorage(state.agentRun, userId);
    }
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function clearLocalStorageState(userId?: string): void {
  try {
    const keys = [
      getUserKey('demo_mode', userId),
      getUserKey('documents', userId),
      getUserKey('discrepancies', userId),
      getUserKey('applications', userId),
      getUserKey('audit_logs', userId),
      getUserKey('agent_run', userId),
      getUserKey('run_history', userId),
      getUserKey('privacy_settings', userId)
    ];
    keys.forEach(key => localStorage.removeItem(key));
  } catch (err) {
    console.error('Failed to clear localStorage:', err);
  }
}
