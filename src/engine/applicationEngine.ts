import { 
  Opportunity, 
  UserDocument, 
  ApplicationDraft, 
  ApplicationFieldDraft 
} from '../types';

/**
 * APPLICATION DRAFT GENERATOR ENGINE
 * 
 * Assembles application drafts using ONLY verified data extracted from the document vault.
 * Retains exact document provenance for every field.
 */
export function generateApplicationDraft(
  opportunity: Opportunity,
  documents: UserDocument[]
): ApplicationDraft {
  const fields: ApplicationFieldDraft[] = [];

  // Helper to extract field from vault with provenance
  const getField = (
    fieldKey: string, 
    label: string, 
    preferredTypes: string[], 
    fallbackLabel?: string,
    isSensitive: boolean = false
  ) => {
    let foundValue = '';
    let sourceDocName = '';

    // First try preferred document types
    for (const prefType of preferredTypes) {
      const doc = documents.find(d => d.type === prefType);
      if (doc) {
        const fieldItem = doc.fields.find(f => f.field === fieldKey);
        if (fieldItem) {
          foundValue = fieldItem.value;
          sourceDocName = doc.name;
          break;
        }
      }
    }

    // Fallback search across any document
    if (!foundValue) {
      for (const doc of documents) {
        const fieldItem = doc.fields.find(f => f.field === fieldKey);
        if (fieldItem) {
          foundValue = fieldItem.value;
          sourceDocName = doc.name;
          break;
        }
      }
    }

    if (foundValue) {
      fields.push({
        fieldKey,
        label: fallbackLabel || label,
        value: foundValue,
        sourceDocument: sourceDocName || 'Verified Vault',
        sensitive: isSensitive,
        approved: false
      });
    }
  };

  // Populate draft fields strictly from vault
  getField('fullName', 'Full Name', ['aadhaar', 'marksheet', 'income_certificate']);
  getField('dob', 'Date of Birth', ['aadhaar', 'marksheet']);
  getField('fatherName', 'Father / Guardian Name', ['aadhaar', 'marksheet']);
  getField('address', 'Residential Address', ['aadhaar', 'income_certificate']);
  getField('annualIncome', 'Annual Family Income', ['income_certificate']);
  getField('academicPercentage', 'Class 10 Academic Score', ['marksheet']);
  getField('aadhaarNumber', 'Aadhaar Card Number', ['aadhaar'], undefined, true);
  getField('accountNumber', 'Bank Account Number', ['bank_passbook'], undefined, true);

  return {
    id: `app-draft-${Date.now()}`,
    opportunityId: opportunity.id,
    opportunityTitle: opportunity.title,
    category: opportunity.category,
    authority: opportunity.authority,
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    userDeclarationApproved: false,
    fields
  };
}
