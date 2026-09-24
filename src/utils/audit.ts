import { AuditEvent, AuditActionType } from '../types';

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Standard pure JS SHA-256 implementation (FIPS 180-4 compliant)
 */
function sha256StandardHex(ascii: string): string {
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i: number, j: number;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  let hash: number[] = [];
  let k: number[] = [];
  let primeCounter = 0;

  const isPrime = (n: number) => {
    for (let factor = 2; factor * factor <= n; factor++) {
      if (n % factor === 0) return false;
    }
    return true;
  };

  const getFractionalBits = (n: number) => Math.floor((n - Math.floor(n)) * maxWord);

  let candidate = 2;
  while (primeCounter < 64) {
    if (isPrime(candidate)) {
      if (primeCounter < 8) {
        hash[primeCounter] = getFractionalBits(Math.pow(candidate, 1 / 2));
      }
      k[primeCounter] = getFractionalBits(Math.pow(candidate, 1 / 3));
      primeCounter++;
    }
    candidate++;
  }

  ascii += '\x80';
  while (ascii[lengthProperty] % 64 !== 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << ((3 - (i % 4)) * 8);
  }
  words[words[lengthProperty]] = Math.floor(asciiBitLength / maxWord);
  words[words[lengthProperty]] = asciiBitLength;

  for (j = 0; j < words[lengthProperty]; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];

      const a = hash[0], e = hash[4];
      const s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & hash[5]) ^ (~e & hash[6]);
      const temp1 = hash[7] + s1 + ch + k[i] + (w[i] = (i < 16) ? w[i] : (
        w[i - 16] +
        (((w15 >>> 7) | (w15 << 25)) ^ ((w15 >>> 18) | (w15 << 14)) ^ (w15 >>> 3)) +
        w[i - 7] +
        (((w2 >>> 17) | (w2 << 15)) ^ ((w2 >>> 19) | (w2 << 13)) ^ (w2 >>> 10))
      ) | 0);

      const s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = s0 + maj;

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

/**
 * Compute SHA-256 string hash using browser standard Web Crypto API (crypto.subtle)
 * falls back to standard JS SHA-256 algorithm.
 */
export async function computeSha256(payload: string): Promise<string> {
  const cryptoObj = typeof window !== 'undefined' ? window.crypto : (globalThis as any).crypto;
  if (cryptoObj && cryptoObj.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(payload);
      const hashBuffer = await cryptoObj.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback below
    }
  }
  return sha256StandardHex(payload);
}

/**
 * Synchronous standard SHA-256 hash function for immediate UI rendering
 */
export function computeSha256Sync(payload: string): string {
  return sha256StandardHex(payload);
}

/**
 * Generate canonical string representation for audit payload
 */
export function canonicalizeAuditPayload(
  event: Omit<AuditEvent, 'hash'>,
  previousHash: string
): string {
  return [
    event.id,
    event.userId || '',
    event.action,
    event.actionLabel,
    event.details,
    event.approvedBy || '',
    event.timestamp,
    event.sourceDocument || '',
    event.field || '',
    event.value || '',
    previousHash
  ].join('|');
}

/**
 * Compute hash link for an audit event
 */
export async function computeEventHashAsync(
  event: Omit<AuditEvent, 'hash'>,
  previousHash: string = GENESIS_HASH
): Promise<string> {
  const payload = canonicalizeAuditPayload(event, previousHash);
  return await computeSha256(payload);
}

/**
 * Create a new cryptographic linked Audit Event
 */
export function createAuditEvent(
  action: AuditActionType,
  actionLabel: string,
  details: string,
  options?: {
    userId?: string;
    applicationTitle?: string;
    field?: string;
    fieldKey?: string;
    value?: string;
    sourceDocument?: string;
    approvedBy?: string;
    previousHash?: string;
    rejectionReason?: string;
  }
): AuditEvent {
  const prevHash = options?.previousHash || GENESIS_HASH;
  const id = `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const timestamp = new Date().toISOString();

  const baseEvent: Omit<AuditEvent, 'hash'> = {
    id,
    userId: options?.userId || 'usr-demo-01',
    action,
    actionLabel,
    details,
    applicationTitle: options?.applicationTitle,
    field: options?.field,
    value: options?.value,
    sourceDocument: options?.sourceDocument,
    approvedBy: options?.approvedBy || 'Authenticated User',
    timestamp,
    previousHash: prevHash
  };

  const payload = canonicalizeAuditPayload(baseEvent, prevHash);
  const hash = computeSha256Sync(payload);

  return {
    ...baseEvent,
    hash
  };
}

/**
 * Verify complete cryptographic audit chain integrity
 */
export function verifyAuditChain(logs: AuditEvent[]): {
  valid: boolean;
  brokenIndex?: number;
  brokenEventId?: string;
  reason?: string;
} {
  if (!logs || logs.length === 0) {
    return { valid: true };
  }

  // Iterate chronologically (oldest to newest)
  const chronological = [...logs].reverse();
  let prevHash = GENESIS_HASH;

  for (let i = 0; i < chronological.length; i++) {
    const event = chronological[i];

    // Verify linkage to previous hash
    if (event.previousHash && event.previousHash !== prevHash) {
      return {
        valid: false,
        brokenIndex: logs.length - 1 - i,
        brokenEventId: event.id,
        reason: `Previous hash mismatch on Event "${event.actionLabel}" (${event.id}). Link broken from parent hash ${prevHash.slice(0, 10)}...`
      };
    }

    // Recompute payload hash
    const payload = canonicalizeAuditPayload(event, event.previousHash || prevHash);
    const expectedHash = computeSha256Sync(payload);

    if (event.hash && event.hash !== expectedHash) {
      return {
        valid: false,
        brokenIndex: logs.length - 1 - i,
        brokenEventId: event.id,
        reason: `Cryptographic SHA-256 payload tampering detected on Event "${event.actionLabel}" (${event.id}). Stored hash does not match payload.`
      };
    }

    prevHash = event.hash || expectedHash;
  }

  return { valid: true };
}

// Initial Audit Logs initialized with valid SHA-256 hash chains
export const INITIAL_AUDIT_LOGS: AuditEvent[] = (() => {
  let prevHash = GENESIS_HASH;
  
  const rawSeeds = [
    {
      id: 'audit-seed-01',
      userId: 'usr-demo-01',
      action: 'DOCUMENT_ADDED' as const,
      actionLabel: 'Document Vault Upload',
      details: 'Aadhaar Card uploaded and OCR identity attributes extracted.',
      sourceDocument: 'Aadhaar Card',
      approvedBy: 'Account Owner',
      timestamp: '2026-09-22T10:15:00.000Z'
    },
    {
      id: 'audit-seed-02',
      userId: 'usr-demo-01',
      action: 'DOCUMENT_ADDED' as const,
      actionLabel: 'Document Vault Upload',
      details: 'Class 10 Marksheet uploaded to Personal Vault.',
      sourceDocument: 'Class 10 Marksheet',
      approvedBy: 'Account Owner',
      timestamp: '2026-09-22T10:16:30.000Z'
    },
    {
      id: 'audit-seed-03',
      userId: 'usr-demo-01',
      action: 'DOCUMENT_ADDED' as const,
      actionLabel: 'Document Vault Upload',
      details: 'Income Certificate uploaded to Personal Vault.',
      sourceDocument: 'Income Certificate',
      approvedBy: 'Account Owner',
      timestamp: '2026-09-22T10:18:00.000Z'
    },
    {
      id: 'audit-seed-04',
      userId: 'usr-demo-01',
      action: 'VERIFICATION_RUN' as const,
      actionLabel: 'Verification Check Executed',
      details: 'Identity engine verified attributes across document vault items.',
      approvedBy: 'LifeOps System',
      timestamp: '2026-09-22T10:20:00.000Z'
    }
  ];

  return rawSeeds.map(s => {
    const payload = canonicalizeAuditPayload(s, prevHash);
    const hash = computeSha256Sync(payload);
    const event: AuditEvent = { ...s, previousHash: prevHash, hash };
    prevHash = hash;
    return event;
  }).reverse();
})();
