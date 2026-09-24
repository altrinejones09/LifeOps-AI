import { Opportunity } from '../types';

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-scheme-01',
    title: 'State Student Support Scheme',
    category: 'Government Schemes',
    type: 'Education Assistance Grant',
    deadline: '28 Sep 2026',
    authority: 'Department of Higher Education, Govt. of Tamil Nadu',
    description: 'Financial support grant for eligible resident students pursuing higher education in recognized state institutions.',
    sourceUrl: 'https://tndhe.gov.in/schemes/higher-education-grant-2026',
    sourceName: 'Tamil Nadu Higher Education Portal (Official)',
    lastVerifiedAt: '2026-09-20T12:00:00.000Z',
    criteria: [
      {
        key: 'age',
        label: 'Age Eligibility (17-25 years)',
        requirementDescription: 'Applicant must be between 17 and 25 years old',
        type: 'age_range',
        targetValue: { min: 17, max: 25 }
      },
      {
        key: 'income',
        label: 'Annual Family Income (<= ₹2,50,000)',
        requirementDescription: 'Annual household income must not exceed ₹2,50,000',
        type: 'max_number',
        targetValue: 250000
      },
      {
        key: 'residency',
        label: 'State Domicile (Tamil Nadu)',
        requirementDescription: 'Applicant must reside in Tamil Nadu',
        type: 'exact_match',
        targetValue: 'Tamil Nadu'
      },
      {
        key: 'academicScore',
        label: 'Academic Performance (>= 60%)',
        requirementDescription: 'Minimum 60% marks in Class 10 / qualifying examination',
        type: 'min_number',
        targetValue: 60
      }
    ]
  },
  {
    id: 'opp-scholarship-02',
    title: 'Merit Education Assistance Scholarship',
    category: 'Scholarships',
    type: 'Academic Scholarship',
    deadline: '15 Oct 2026',
    authority: 'National Merit Trust',
    description: 'Merit-cum-means scholarship program for high-performing secondary education graduates.',
    sourceUrl: 'https://scholarships.gov.in/national-merit-trust-2026',
    sourceName: 'National Scholarship Portal (NSP Official)',
    lastVerifiedAt: '2026-09-21T09:30:00.000Z',
    criteria: [
      {
        key: 'academicScore',
        label: 'Academic Excellence (>= 75%)',
        requirementDescription: 'Minimum aggregate score of 75% in qualifying marksheet',
        type: 'min_number',
        targetValue: 75
      },
      {
        key: 'income',
        label: 'Income Ceiling (<= ₹3,00,000)',
        requirementDescription: 'Annual family income must be under ₹3,00,000',
        type: 'max_number',
        targetValue: 300000
      }
    ]
  },
  {
    id: 'opp-cert-03',
    title: 'Student Identity Certificate',
    category: 'Certificates',
    type: 'Official Government Certificate',
    deadline: 'Rolling / No Expiry',
    authority: 'District Revenue & Citizen Services Administration',
    description: 'Official digital identity verification certificate required for state portal applications.',
    sourceUrl: 'https://tnedistrict.tn.gov.in/citizen/services',
    sourceName: 'e-Sevai Portal Govt of Tamil Nadu',
    lastVerifiedAt: '2026-09-18T16:45:00.000Z',
    criteria: [
      {
        key: 'residency',
        label: 'District Residency Verification',
        requirementDescription: 'Documented residency in Coimbatore, Tamil Nadu',
        type: 'exact_match',
        targetValue: 'Tamil Nadu'
      }
    ]
  }
];
