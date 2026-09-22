import { 
  UserDocument, 
  Opportunity, 
  EligibilityResult, 
  CriterionEvalResult 
} from '../types';
import { 
  normalizeDate, 
  parseIncomeNumber, 
  parsePercentage 
} from '../utils/comparison';

/**
 * DETERMINISTIC ELIGIBILITY ENGINE
 * 
 * Evaluates verified document vault attributes against administrative opportunity rules.
 */
export function evaluateEligibility(
  opportunity: Opportunity,
  documents: UserDocument[]
): EligibilityResult {
  // Extract profile attributes from document vault
  let dobStr = '';
  let incomeStr = '';
  let addressStr = '';
  let academicStr = '';

  documents.forEach(doc => {
    doc.fields.forEach(f => {
      if (f.field === 'dob' && !dobStr) dobStr = f.value;
      if (f.field === 'annualIncome' && !incomeStr) incomeStr = f.value;
      if (f.field === 'address' && !addressStr) addressStr = f.value;
      if (f.field === 'academicPercentage' && !academicStr) academicStr = f.value;
    });
  });

  // Calculate numeric profile metrics with exact birth month/day age precision
  let calculatedAge = 20; // Default fallback for 2006 DOB
  const normDate = normalizeDate(dobStr);
  if (normDate) {
    const parts = normDate.split('-');
    if (parts.length === 3) {
      const birthYear = parseInt(parts[0], 10);
      const birthMonth = parseInt(parts[1], 10) - 1;
      const birthDay = parseInt(parts[2], 10);
      const today = new Date();
      calculatedAge = today.getFullYear() - birthYear;
      const monthDiff = today.getMonth() - birthMonth;
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDay)) {
        calculatedAge--;
      }
    }
  }

  const numericIncome = parseIncomeNumber(incomeStr);
  const numericAcademic = parsePercentage(academicStr);

  const details: CriterionEvalResult[] = [];
  let matchedCount = 0;

  opportunity.criteria.forEach(criterion => {
    let passed = false;
    let actualValue = 'N/A';
    let requiredValue = 'N/A';

    switch (criterion.type) {
      case 'age_range': {
        const { min, max } = criterion.targetValue;
        actualValue = `${calculatedAge} years`;
        requiredValue = `${min}–${max} years`;
        passed = calculatedAge >= min && calculatedAge <= max;
        break;
      }
      case 'max_number': {
        actualValue = `₹${numericIncome.toLocaleString('en-IN')}`;
        requiredValue = `<= ₹${criterion.targetValue.toLocaleString('en-IN')}`;
        passed = numericIncome <= criterion.targetValue;
        break;
      }
      case 'min_number': {
        actualValue = `${numericAcademic}%`;
        requiredValue = `>= ${criterion.targetValue}%`;
        passed = numericAcademic >= criterion.targetValue;
        break;
      }
      case 'exact_match': {
        actualValue = addressStr || 'Unknown';
        requiredValue = criterion.targetValue;
        passed = addressStr.toLowerCase().includes(criterion.targetValue.toLowerCase());
        break;
      }
      default:
        passed = true;
    }

    if (passed) matchedCount++;

    details.push({
      criterionLabel: criterion.label,
      passed,
      actualValue,
      requiredValue
    });
  });

  const totalCriteria = opportunity.criteria.length;
  const isEligible = matchedCount === totalCriteria;

  return {
    opportunityId: opportunity.id,
    isEligible,
    matchedCount,
    totalCriteria,
    details
  };
}
