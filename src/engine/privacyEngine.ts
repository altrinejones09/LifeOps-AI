import { DocumentField, PrivacySettings, UserDocument } from '../types';

/**
 * EXECUTABLE PRIVACY POLICY ENGINE
 * 
 * Enforces data minimization, sensitive field masking, and explicit workflow consent
 * across all Agent tools and LLM execution contexts.
 */

export interface PrivacyFilterResult {
  allowedFields: DocumentField[];
  minimizationApplied: boolean;
  totalFieldsCount: number;
  exposedFieldsCount: number;
  explanation: string;
}

export function filterFieldsByPrivacyPolicy(
  fields: DocumentField[],
  workflowPurpose: string,
  settings: PrivacySettings
): PrivacyFilterResult {
  const totalFieldsCount = fields.length;

  if (!settings.consentApproved) {
    return {
      allowedFields: [],
      minimizationApplied: true,
      totalFieldsCount,
      exposedFieldsCount: 0,
      explanation: 'Workflow consent not authorized by user. Vault fields restricted from agent tools.'
    };
  }

  let allowed = [...fields];

  // Data Minimization Filter: Only pass fields required for current purpose
  if (settings.dataMinimizationEnabled) {
    const purposeLower = workflowPurpose.toLowerCase();

    allowed = allowed.filter(f => {
      const fieldKey = f.field.toLowerCase();
      
      if (purposeLower.includes('scholarship') || purposeLower.includes('grant') || purposeLower.includes('financial')) {
        // Exclude unneeded bank accounts, full Aadhaar, or irrelevant certificates
        return ['fullname', 'name', 'dob', 'fathername', 'income', 'annualincome', 'academicpercentage', 'marksheet_score', 'state', 'district', 'address'].some(k => fieldKey.includes(k));
      }

      if (purposeLower.includes('certificate') || purposeLower.includes('residency') || purposeLower.includes('domicile')) {
        return ['fullname', 'name', 'dob', 'state', 'district', 'address', 'aadhaar'].some(k => fieldKey.includes(k));
      }

      return true;
    });
  }

  // Sensitive Field Masking
  if (settings.maskSensitiveFields) {
    allowed = allowed.map(f => {
      if (f.sensitive || f.field.toLowerCase().includes('aadhaar') || f.field.toLowerCase().includes('account') || f.field.toLowerCase().includes('pan')) {
        const raw = f.value || '';
        const masked = raw.length > 4 ? `XXXX XXXX ${raw.slice(-4)}` : 'XXXX';
        return {
          ...f,
          value: masked
        };
      }
      return f;
    });
  }

  const minimizationApplied = allowed.length < totalFieldsCount;
  const exposedFieldsCount = allowed.length;

  const explanation = minimizationApplied
    ? `Data minimization applied: Filtered ${exposedFieldsCount} of ${totalFieldsCount} available fields for purpose "${workflowPurpose}".`
    : `Exposed ${exposedFieldsCount} verified fields to workflow context.`;

  return {
    allowedFields: allowed,
    minimizationApplied,
    totalFieldsCount,
    exposedFieldsCount,
    explanation
  };
}

/**
 * Filter an entire set of UserDocuments using Privacy Policy
 */
export function filterDocumentsByPrivacyPolicy(
  documents: UserDocument[],
  workflowPurpose: string,
  settings: PrivacySettings
): UserDocument[] {
  return documents.map(doc => {
    const filterResult = filterFieldsByPrivacyPolicy(doc.fields, workflowPurpose, settings);
    return {
      ...doc,
      fields: filterResult.allowedFields
    };
  });
}
