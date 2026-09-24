import { 
  UserProfile, 
  UserDocument, 
  Opportunity, 
  ApplicationDraft, 
  AuditEvent, 
  PrivacySettings
} from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MOCK_OPPORTUNITIES } from '../data/mockOpportunities';
import { MISMATCH_DOCUMENTS, CLEAN_DOCUMENTS } from '../data/mockDocuments';
import { INITIAL_APPLICATIONS } from '../data/mockApplications';
import { INITIAL_AUDIT_LOGS } from '../utils/audit';
import { DEFAULT_PRIVACY_SETTINGS } from '../utils/storage';

function getUserKey(baseKey: string, userId: string): string {
  return `lifeops_usr_${userId}_${baseKey}`;
}

/**
 * UNIFIED BACKEND & DATA ACCESS LAYER
 * 
 * Enforces strict user isolation. Uses Supabase PostgreSQL when available,
 * and falls back to user-isolated persistent storage for local execution.
 */
export const backend = {

  // --------------------------------------------------------------------------
  // USER PROFILES
  // --------------------------------------------------------------------------
  getProfile: async (userId: string): Promise<UserProfile | null> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (!error && data) {
        return {
          id: data.user_id,
          fullName: data.full_name,
          email: data.email,
          phone: data.phone,
          location: data.location,
          dateOfBirth: data.date_of_birth,
          avatar: data.avatar,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          accountStatus: data.account_status || 'ACTIVE',
          authMethod: 'EMAIL_PASSWORD',
          preferences: data.preferences || {
            language: 'English (US)',
            notificationsEnabled: true,
            sensitivityLevel: 'standard'
          }
        };
      }
    }

    // Local DB Fallback
    const raw = localStorage.getItem(getUserKey('profile', userId));
    return raw ? JSON.parse(raw) : null;
  },

  saveProfile: async (userId: string, profile: UserProfile): Promise<UserProfile> => {
    const updated = { ...profile, updatedAt: new Date().toISOString() };

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          full_name: updated.fullName,
          email: updated.email,
          phone: updated.phone,
          location: updated.location,
          date_of_birth: updated.dateOfBirth,
          avatar: updated.avatar,
          updated_at: updated.updatedAt,
          preferences: updated.preferences
        });
    }

    localStorage.setItem(getUserKey('profile', userId), JSON.stringify(updated));
    return updated;
  },

  // --------------------------------------------------------------------------
  // DOCUMENT VAULT
  // --------------------------------------------------------------------------
  getDocuments: async (userId: string, demoMode: 'clean' | 'mismatch' = 'mismatch'): Promise<UserDocument[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data: docs, error } = await supabase
        .from('documents')
        .select('*, document_fields(*)')
        .eq('user_id', userId);

      if (!error && docs && docs.length > 0) {
        return docs.map(d => ({
          id: d.id,
          name: d.name,
          type: d.type as any,
          uploadedAt: d.upload_date || d.created_at || new Date().toISOString(),
          status: d.status as any,
          issuer: d.issuer,
          expiryDate: d.expiry_date,
          fields: (d.document_fields || []).map((f: any) => ({
            id: f.id || f.field_key,
            field: f.field_key,
            label: f.label,
            value: f.value,
            confidence: f.confidence > 0.8 ? 'high' : 'medium',
            sensitive: f.sensitive,
            sourceDocument: d.name
          }))
        }));
      }
    }

    // Local DB Fallback
    const raw = localStorage.getItem(getUserKey('documents', userId));
    if (raw) return JSON.parse(raw);

    const defaultDocs = demoMode === 'clean' ? CLEAN_DOCUMENTS : MISMATCH_DOCUMENTS;
    localStorage.setItem(getUserKey('documents', userId), JSON.stringify(defaultDocs));
    return defaultDocs;
  },

  saveDocuments: async (userId: string, docs: UserDocument[]): Promise<void> => {
    localStorage.setItem(getUserKey('documents', userId), JSON.stringify(docs));
  },

  // --------------------------------------------------------------------------
  // PRIVACY SETTINGS
  // --------------------------------------------------------------------------
  getPrivacySettings: async (userId: string): Promise<PrivacySettings> => {
    const raw = localStorage.getItem(getUserKey('privacy_settings', userId));
    return raw ? JSON.parse(raw) : DEFAULT_PRIVACY_SETTINGS;
  },

  savePrivacySettings: async (userId: string, settings: PrivacySettings): Promise<void> => {
    localStorage.setItem(getUserKey('privacy_settings', userId), JSON.stringify(settings));
  },

  // --------------------------------------------------------------------------
  // OPPORTUNITIES
  // --------------------------------------------------------------------------
  getOpportunities: async (): Promise<Opportunity[]> => {
    return MOCK_OPPORTUNITIES;
  },

  // --------------------------------------------------------------------------
  // APPLICATIONS
  // --------------------------------------------------------------------------
  getApplications: async (userId: string): Promise<ApplicationDraft[]> => {
    const raw = localStorage.getItem(getUserKey('applications', userId));
    if (raw) return JSON.parse(raw);
    localStorage.setItem(getUserKey('applications', userId), JSON.stringify(INITIAL_APPLICATIONS));
    return INITIAL_APPLICATIONS;
  },

  saveApplications: async (userId: string, apps: ApplicationDraft[]): Promise<void> => {
    localStorage.setItem(getUserKey('applications', userId), JSON.stringify(apps));
  },

  // --------------------------------------------------------------------------
  // CRYPTOGRAPHIC AUDIT TRAIL
  // --------------------------------------------------------------------------
  getAuditEvents: async (userId: string): Promise<AuditEvent[]> => {
    const raw = localStorage.getItem(getUserKey('audit_logs', userId));
    if (raw) return JSON.parse(raw);
    localStorage.setItem(getUserKey('audit_logs', userId), JSON.stringify(INITIAL_AUDIT_LOGS));
    return INITIAL_AUDIT_LOGS;
  },

  saveAuditEvents: async (userId: string, events: AuditEvent[]): Promise<void> => {
    localStorage.setItem(getUserKey('audit_logs', userId), JSON.stringify(events));
  }
};
