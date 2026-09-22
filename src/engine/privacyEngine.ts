import { DocumentField, PrivacySettings } from '../types';

/**
 * EXECUTABLE PRIVACY POLICY ENGINE
 * 
 * Filters document fields exposed to Agent Tools and LLM contexts based on
 * data minimization rules, sensitive field masking, and explicit workflow consent.
 */

export function filterFieldsByPrivacyPolicy(
  fields: DocumentField[],
  workflowPurpose: string,
  settings: PrivacySettings
): {
  allowedFields: DocumentField[];
  minimizationApplied: boolean;
  totalFieldsCount: number;
  exposedFieldsCount: number;
  explanation: string;
} {
  const totalFieldsCount = fields.length;

  if (!settings.consentApproved) {
    return {
      allowedFields: [],
      minimizationApplied: true,
      totalFieldsCount,
      exposedFieldsCount: 0,
      explanation: 'Workflow consent not authorized by user. All vault fields restricted from agent tools.'
    };
  }

  let allowed = [...fields];

  // Data Minimization Filter
  if (settings.dataMinimizationEnabled) {
    const purposeLower = workflowPurpose.toLowerCase();

    allowed = allowed.filter(f => {
      const fieldKey = f.field.toLowerCase();
      
      if (purposeLower.includes('scholarship') || purposeLower.includes('financial') || purposeLower.includes('eligibility')) {
        // Only pass identity, academic, and income attributes
        return ['fullname', 'name', 'dob', 'fathername', 'income', 'annualincome', 'academicpercentage', 'marksheet_score', 'state', 'address'].some(k => fieldKey.includes(k));
      }
      return true;
    });
  }

  // Sensitive Field Masking
  if (settings.maskSensitiveFields) {
    allowed = allowed.map(f => {
      if (f.sensitive || f.field.toLowerCase().includes('aadhaar') || f.field.toLowerCase().includes('account')) {
        return {
          ...f,
          value: f.value.length > 4 ? `XXXX XXXX ${f.value.slice(-4)}` : 'XXXX'
        };
      }
      return f;
    });
  }

  const minimizationApplied = allowed.length < totalFieldsCount;
  const exposedFieldsCount = allowed.length;

  const explanation = minimizationApplied
    ? `Data minimization applied: Exposed ${exposedFieldsCount} of ${totalFieldsCount} available fields strictly required for "${workflowPurpose}".`
    : `Exposed ${exposedFieldsCount} verified fields to workflow context.`;

  return {
    allowedFields: allowed,
    minimizationApplied,
    totalFieldsCount,
    exposedFieldsCount,
    explanation
  };
}
