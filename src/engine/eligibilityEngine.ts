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
 * REUSABLE EXPLAINABLE ELIGIBILITY ENGINE
 * 
 * Evaluates verified document vault attributes against administrative opportunity rules.
 * Never claims eligibility if required attributes are missing.
 */
export function evaluateEligibility(
  opportunity: Opportunity,
  documents: UserDocument[]
): EligibilityResult {
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

  // Calculate numeric profile metrics with exact birth month/day precision
  let calculatedAge: number | null = null;
  const normDate = normalizeDate(dobStr);
  if (normDate) {
    const parts = normDate.split('-');
    if (parts.length === 3) {
      const birthYear = parseInt(parts[0], 10);
      const birthMonth = parseInt(parts[1], 10) - 1;
      const birthDay = parseInt(parts[2], 10);
      const today = new Date();
      let age = today.getFullYear() - birthYear;
      const monthDiff = today.getMonth() - birthMonth;
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDay)) {
        age--;
      }
      calculatedAge = age;
    }
  }

  const numericIncome = incomeStr ? parseIncomeNumber(incomeStr) : null;
  const numericAcademic = academicStr ? parsePercentage(academicStr) : null;

  const details: CriterionEvalResult[] = [];
  let matchedCount = 0;
  let missingCount = 0;

  opportunity.criteria.forEach(criterion => {
    let passed = false;
    let actualValue = 'Missing Document / Value';
    let requiredValue = 'N/A';

    switch (criterion.type) {
      case 'age_range': {
        const { min, max } = criterion.targetValue;
        requiredValue = `${min}–${max} years`;
        if (calculatedAge !== null) {
          actualValue = `${calculatedAge} years`;
          passed = calculatedAge >= min && calculatedAge <= max;
        } else {
          missingCount++;
        }
        break;
      }
      case 'max_number': {
        requiredValue = `<= ₹${criterion.targetValue.toLocaleString('en-IN')}`;
        if (numericIncome !== null) {
          actualValue = `₹${numericIncome.toLocaleString('en-IN')}`;
          passed = numericIncome <= criterion.targetValue;
        } else {
          missingCount++;
        }
        break;
      }
      case 'min_number': {
        requiredValue = `>= ${criterion.targetValue}%`;
        if (numericAcademic !== null) {
          actualValue = `${numericAcademic}%`;
          passed = numericAcademic >= criterion.targetValue;
        } else {
          missingCount++;
        }
        break;
      }
      case 'exact_match': {
        requiredValue = criterion.targetValue;
        if (addressStr) {
          actualValue = addressStr;
          passed = addressStr.toLowerCase().includes(criterion.targetValue.toLowerCase());
        } else {
          missingCount++;
        }
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
  // If missing documents exist, cannot claim fully eligible
  const isEligible = matchedCount === totalCriteria && missingCount === 0;

  return {
    opportunityId: opportunity.id,
    isEligible,
    matchedCount,
    totalCriteria,
    details
  };
}
