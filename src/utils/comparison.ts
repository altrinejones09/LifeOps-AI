/**
 * Utility functions for name normalization, date parsing, and string comparisons
 */

export function normalizeString(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates Levenshtein distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const s1 = normalizeString(a);
  const s2 = normalizeString(b);

  const matrix: number[][] = [];

  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[s1.length][s2.length];
}

export type NameMatchResult = 'exact' | 'warning' | 'critical';

export interface NameComparisonDetail {
  status: NameMatchResult;
  reason: string;
}

export function compareNames(name1: string, name2: string): NameComparisonDetail {
  const norm1 = normalizeString(name1);
  const norm2 = normalizeString(name2);

  if (norm1 === norm2) {
    return {
      status: 'exact',
      reason: 'Exact name match across documents'
    };
  }

  const dist = levenshteinDistance(norm1, norm2);

  if (dist <= 2) {
    return {
      status: 'warning',
      reason: `Minor spelling difference detected ("${name1}" vs "${name2}")`
    };
  }

  // Check if one contains the other (e.g. missing middle name)
  const parts1 = norm1.split(' ');
  const parts2 = norm2.split(' ');
  const commonParts = parts1.filter(p => parts2.includes(p));
  
  if (commonParts.length >= 1 && (parts1.length !== parts2.length)) {
    return {
      status: 'warning',
      reason: `Possible missing middle name or format variation ("${name1}" vs "${name2}")`
    };
  }

  return {
    status: 'critical',
    reason: `Significant identity name mismatch ("${name1}" vs "${name2}")`
  };
}

/**
 * Standardizes date string into YYYY-MM-DD format
 */
export function normalizeDate(dateStr: string): string | null {
  if (!dateStr) return null;
  
  const clean = dateStr.trim();
  
  // Format: YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, '0');
    const d = isoMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Format: DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, '0');
    const m = dmyMatch[2].padStart(2, '0');
    const y = dmyMatch[3];
    return `${y}-${m}-${d}`;
  }

  // Text format e.g., 14 July 2006
  const dateObj = new Date(clean);
  if (!isNaN(dateObj.getTime())) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return null;
}

export function compareDates(dateStr1: string, dateStr2: string): { status: NameMatchResult; reason: string } {
  const norm1 = normalizeDate(dateStr1);
  const norm2 = normalizeDate(dateStr2);

  if (norm1 && norm2 && norm1 === norm2) {
    if (dateStr1.trim() !== dateStr2.trim()) {
      return {
        status: 'exact',
        reason: `Identical date representation across different display formats ("${dateStr1}" and "${dateStr2}")`
      };
    }
    return {
      status: 'exact',
      reason: 'Exact date match across documents'
    };
  }

  if (!norm1 || !norm2) {
    return {
      status: 'warning',
      reason: 'Could not parse date formats completely for comparison'
    };
  }

  return {
    status: 'critical',
    reason: `Date of birth discrepancy detected ("${dateStr1}" vs "${dateStr2}")`
  };
}

/**
 * Standardizes income string into numeric value (e.g., "₹1,80,000" -> 180000)
 */
export function parseIncomeNumber(incomeStr: string): number {
  if (!incomeStr) return 0;
  const cleaned = incomeStr.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

/**
 * Standardizes percentage string into numeric value (e.g., "87.4%" -> 87.4)
 */
export function parsePercentage(percentageStr: string): number {
  if (!percentageStr) return 0;
  const cleaned = percentageStr.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}
