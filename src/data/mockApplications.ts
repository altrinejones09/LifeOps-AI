import { ApplicationDraft } from '../types';

export const INITIAL_APPLICATIONS: ApplicationDraft[] = [
  {
    id: 'app-draft-01',
    opportunityId: 'opp-scheme-01',
    opportunityTitle: 'State Student Support Scheme',
    category: 'Government Schemes',
    authority: 'Department of Higher Education, Govt. of Tamil Nadu',
    status: 'DRAFT',
    createdAt: '2026-09-20T10:00:00Z',
    userDeclarationApproved: false,
    fields: [
      {
        fieldKey: 'fullName',
        label: 'Applicant Full Name',
        value: 'Arun Kumar',
        sourceDocument: 'Aadhaar Card',
        approved: false
      },
      {
        fieldKey: 'dob',
        label: 'Date of Birth',
        value: '14-07-2006',
        sourceDocument: 'Aadhaar Card',
        approved: false
      },
      {
        fieldKey: 'fatherName',
        label: 'Father / Guardian Name',
        value: 'R. Kumar',
        sourceDocument: 'Aadhaar Card',
        approved: false
      },
      {
        fieldKey: 'address',
        label: 'Residential Address',
        value: 'Coimbatore, Tamil Nadu',
        sourceDocument: 'Aadhaar Card',
        approved: false
      },
      {
        fieldKey: 'annualIncome',
        label: 'Annual Family Income',
        value: '₹1,80,000',
        sourceDocument: 'Income Certificate',
        approved: false
      },
      {
        fieldKey: 'academicPercentage',
        label: 'Class 10 Academic Score',
        value: '87.4%',
        sourceDocument: 'Class 10 Marksheet',
        approved: false
      },
      {
        fieldKey: 'aadhaarNumber',
        label: 'Aadhaar Card Number',
        value: 'XXXX XXXX 1234',
        sourceDocument: 'Aadhaar Card',
        sensitive: true,
        approved: false
      },
      {
        fieldKey: 'accountNumber',
        label: 'Bank Account Number',
        value: 'XXXXXX4582',
        sourceDocument: 'Bank Passbook',
        sensitive: true,
        approved: false
      }
    ]
  }
];
