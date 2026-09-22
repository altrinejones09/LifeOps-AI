import { 
  UserDocument, 
  ConsistencyCheckResult, 
  DiscrepancyItem, 
  VerificationStatus,
  DiscrepancyDocumentValue
} from '../types';
import { 
  compareNames, 
  compareDates, 
  normalizeString 
} from '../utils/comparison';

/**
 * DETERMINISTIC CONSISTENCY ENGINE
 * 
 * Verifies cross-document consistency for administrative document fields.
 * Performs field normalization, date format resolution, and edit-distance checks.
 */
export function runConsistencyCheck(
  documents: UserDocument[],
  existingDiscrepancies: DiscrepancyItem[] = []
): ConsistencyCheckResult {
  const discrepancies: DiscrepancyItem[] = [];
  let verifiedCount = 0;
  let warningCount = 0;
  let criticalCount = 0;

  // 1. Group fields across all documents
  const fieldsMap = new Map<string, { label: string; values: DiscrepancyDocumentValue[] }>();

  documents.forEach(doc => {
    doc.fields.forEach(f => {
      const existing = fieldsMap.get(f.field) || { label: f.label, values: [] };
      existing.values.push({
        documentName: doc.name,
        documentType: doc.type,
        value: f.value
      });
      fieldsMap.set(f.field, existing);
    });
  });

  let totalFieldsChecked = fieldsMap.size;

  // 2. Run deterministic checks per field type
  fieldsMap.forEach((fieldData, fieldKey) => {
    const { label, values } = fieldData;
    const existingAck = existingDiscrepancies.find(d => d.fieldKey === fieldKey)?.acknowledged || false;

    // Single source fields are automatically verified
    if (values.length <= 1) {
      verifiedCount++;
      return;
    }

    if (fieldKey === 'fullName') {
      let fieldHasWarning = false;
      let fieldHasCritical = false;
      let explanation = '';

      // Pairwise comparison against primary document (first document, e.g., Aadhaar)
      const primary = values[0];
      for (let i = 1; i < values.length; i++) {
        const current = values[i];
        const cmp = compareNames(primary.value, current.value);

        if (cmp.status === 'warning') {
          fieldHasWarning = true;
          explanation = `The full name differs slightly between ${primary.documentName} ("${primary.value}") and ${current.documentName} ("${current.value}").`;
        } else if (cmp.status === 'critical') {
          fieldHasCritical = true;
          explanation = `Significant identity mismatch found between ${primary.documentName} ("${primary.value}") and ${current.documentName} ("${current.value}").`;
        }
      }

      if (fieldHasCritical) {
        criticalCount++;
        discrepancies.push({
          id: `disc-${fieldKey}`,
          fieldKey,
          fieldLabel: label,
          status: 'critical',
          documents: values,
          explanation: explanation || 'Identity name mismatch across documents.',
          suggestedAction: 'Verify which document contains the legally correct name. Check with the relevant issuing authority before submitting official forms.',
          acknowledged: existingAck
        });
      } else if (fieldHasWarning) {
        warningCount++;
        discrepancies.push({
          id: `disc-${fieldKey}`,
          fieldKey,
          fieldLabel: label,
          status: 'warning',
          documents: values,
          explanation: explanation || 'Likely spelling mismatch detected between identity-bearing documents.',
          suggestedAction: 'Verify which document contains the legally correct name. If your Aadhaar or Marksheet is correct, check with the issuing authority or update the inconsistent certificate.',
          acknowledged: existingAck
        });
      } else {
        verifiedCount++;
      }
    } else if (fieldKey === 'dob') {
      let fieldHasWarning = false;
      let fieldHasCritical = false;
      let explanation = '';

      const primary = values[0];
      for (let i = 1; i < values.length; i++) {
        const current = values[i];
        const cmp = compareDates(primary.value, current.value);

        if (cmp.status === 'warning') {
          fieldHasWarning = true;
          explanation = cmp.reason;
        } else if (cmp.status === 'critical') {
          fieldHasCritical = true;
          explanation = cmp.reason;
        }
      }

      if (fieldHasCritical) {
        criticalCount++;
        discrepancies.push({
          id: `disc-${fieldKey}`,
          fieldKey,
          fieldLabel: label,
          status: 'critical',
          documents: values,
          explanation,
          suggestedAction: 'Date of birth is a strict verification criteria. Re-upload or re-verify official identity cards.',
          acknowledged: existingAck
        });
      } else if (fieldHasWarning) {
        warningCount++;
        discrepancies.push({
          id: `disc-${fieldKey}`,
          fieldKey,
          fieldLabel: label,
          status: 'warning',
          documents: values,
          explanation,
          suggestedAction: 'Ensure date of birth format conforms to standard administrative guidelines.',
          acknowledged: existingAck
        });
      } else {
        verifiedCount++;
      }
    } else {
      // Default exact normalization check for other fields (e.g. fatherName, address)
      const firstNorm = normalizeString(values[0].value);
      const allMatch = values.every(v => normalizeString(v.value) === firstNorm);

      if (allMatch) {
        verifiedCount++;
      } else {
        warningCount++;
        discrepancies.push({
          id: `disc-${fieldKey}`,
          fieldKey,
          fieldLabel: label,
          status: 'warning',
          documents: values,
          explanation: `Discrepancy detected across documents for ${label}.`,
          suggestedAction: 'Verify values across documents and ensure consistent spelling.',
          acknowledged: existingAck
        });
      }
    }
  });

  let overallStatus: VerificationStatus = 'verified';
  if (criticalCount > 0) {
    overallStatus = 'critical';
  } else if (warningCount > 0) {
    overallStatus = 'warning';
  }

  return {
    overallStatus,
    totalFieldsChecked,
    verifiedCount,
    warningCount,
    criticalCount,
    discrepancies
  };
}
