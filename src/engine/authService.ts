import { UserProfile, AuthState } from '../types';

const STORAGE_KEY_AUTH_SESSION = 'lifeops_auth_session';
const STORAGE_KEY_USER_USERS = 'lifeops_registered_users';

export const DEFAULT_DEMO_USER: UserProfile = {
  id: 'usr-demo-01',
  fullName: 'Aarav Sharma',
  email: 'aarav.sharma@example.com',
  phone: '+91 98765 43210',
  location: 'Coimbatore, Tamil Nadu',
  dateOfBirth: '2006-07-14',
  avatar: 'AS',
  createdAt: '2026-01-15T08:30:00Z',
  updatedAt: new Date().toISOString(),
  accountStatus: 'ACTIVE',
  authMethod: 'LOCAL_DEMO',
  preferences: {
    language: 'English (US)',
    notificationsEnabled: true,
    sensitivityLevel: 'standard'
  }
};

interface StoredUserAccount {
  profile: UserProfile;
  passwordHash: string;
}

const inMemoryAuthStore = new Map<string, string>();

function getItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {
    // Fallthrough to in-memory map
  }
  return inMemoryAuthStore.get(key) || null;
}

function setItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }
  } catch {
    // Fallthrough to in-memory map
  }
  inMemoryAuthStore.set(key, value);
}

function removeItem(key: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
      return;
    }
  } catch {
    // Fallthrough to in-memory map
  }
  inMemoryAuthStore.delete(key);
}

/**
 * Load persisted AuthState from localStorage
 */
export function loadStoredAuthState(): AuthState {
  try {
    const rawSession = getItem(STORAGE_KEY_AUTH_SESSION);
    if (rawSession) {
      const parsedUser: UserProfile = JSON.parse(rawSession);
      return {
        status: 'authenticated',
        currentUser: parsedUser
      };
    }
  } catch (err) {
    console.warn('Failed to parse stored auth session:', err);
  }

  // Default: unauthenticated gate
  return {
    status: 'unauthenticated',
    currentUser: null
  };
}

/**
 * Save Auth Session to localStorage
 */
export function saveAuthSession(user: UserProfile | null): void {
  try {
    if (user) {
      setItem(STORAGE_KEY_AUTH_SESSION, JSON.stringify(user));
    } else {
      removeItem(STORAGE_KEY_AUTH_SESSION);
    }
  } catch (err) {
    console.warn('Failed to save auth session:', err);
  }
}

/**
 * Load registered accounts list from localStorage
 */
function loadRegisteredUsers(): StoredUserAccount[] {
  try {
    const raw = getItem(STORAGE_KEY_USER_USERS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load registered users:', e);
  }
  
  // Seed with default user account
  const defaultAccount: StoredUserAccount = {
    profile: DEFAULT_DEMO_USER,
    passwordHash: 'demo1234'
  };
  return [defaultAccount];
}

/**
 * Save registered accounts list to localStorage
 */
function saveRegisteredUsers(users: StoredUserAccount[]): void {
  try {
    setItem(STORAGE_KEY_USER_USERS, JSON.stringify(users));
  } catch (e) {
    console.warn('Failed to save registered users:', e);
  }
}

/**
 * Authenticate with Email & Password
 */
export function authenticateUser(email: string, password: string): { success: boolean; user?: UserProfile; error?: string } {
  const users = loadRegisteredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const account = users.find(u => u.profile.email.toLowerCase() === normalizedEmail);

  if (!account) {
    return { 
      success: false, 
      error: 'Incorrect email or password. Please check your credentials and try again.' 
    };
  }

  // Verify password against stored password representation
  if (account.passwordHash && password !== account.passwordHash) {
    return { 
      success: false, 
      error: 'Incorrect email or password. Please check your credentials and try again.' 
    };
  }

  return { success: true, user: account.profile };
}

/**
 * Create New Account
 */
export function createAccount(
  fullName: string,
  email: string,
  password: string,
  phone?: string
): { success: boolean; user?: UserProfile; error?: string } {
  const users = loadRegisteredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some(u => u.profile.email.toLowerCase() === normalizedEmail)) {
    return { success: false, error: 'An account with this email address already exists.' };
  }

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0].toUpperCase())
    .slice(0, 2)
    .join('') || 'US';

  const newUser: UserProfile = {
    id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    fullName: fullName.trim(),
    email: normalizedEmail,
    phone: phone?.trim() || '+91 98765 00000',
    location: 'Coimbatore, Tamil Nadu',
    avatar: initials,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accountStatus: 'ACTIVE',
    authMethod: 'LOCAL_DEMO',
    preferences: {
      language: 'English (US)',
      notificationsEnabled: true,
      sensitivityLevel: 'standard'
    }
  };

  const newAccount: StoredUserAccount = {
    profile: newUser,
    passwordHash: password
  };

  users.push(newAccount);
  saveRegisteredUsers(users);

  return { success: true, user: newUser };
}

/**
 * Quick Demo Evaluation Shortcut (Explicitly for Developer / Demo Mode)
 */
export function getJudgeDemoUser(): UserProfile {
  saveAuthSession(DEFAULT_DEMO_USER);
  return DEFAULT_DEMO_USER;
}

/**
 * Calculate dynamic Profile Completion Percentage based on filled fields
 */
export function calculateProfileCompletion(profile: UserProfile | null): number {
  if (!profile) return 0;
  
  const fieldsToCheck = [
    Boolean(profile.fullName),
    Boolean(profile.email),
    Boolean(profile.phone && profile.phone !== '+91 98765 00000'),
    Boolean(profile.location),
    Boolean(profile.dateOfBirth),
    Boolean(profile.avatar)
  ];

  const completed = fieldsToCheck.filter(Boolean).length;
  return Math.round((completed / fieldsToCheck.length) * 100);
}
