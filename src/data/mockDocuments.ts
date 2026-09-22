import { UserDocument } from '../types';

export const MISMATCH_DOCUMENTS: UserDocument[] = [
  {
    id: 'doc-aadhaar-01',
    name: 'Aadhaar Card',
    type: 'aadhaar',
    uploadedAt: '2026-09-10T10:30:00Z',
    status: 'verified',
    fileName: 'aadhaar_card_front.pdf',
    fileSize: '1.2 MB',
    fields: [
      {
        id: 'f-1',
        field: 'fullName',
        label: 'Full Name',
        value: 'Arun Kumar',
        sourceDocument: 'Aadhaar Card',
        confidence: 'high'
      },
      {
        id: 'f-2',
        field: 'fatherName',
        label: 'Father / Guardian',
        value: 'R. Kumar',
        sourceDocument: 'Aadhaar Card',
        confidence: 'high'
      },
      {
        id: 'f-3',
        field: 'dob',
        label: 'Date of Birth',
        value: '14-07-2006',
        sourceDocument: 'Aadhaar Card',
        confidence: 'high'
      },
      {
        id: 'f-4',
        field: 'address',
        label: 'Address',
        value: 'Coimbatore, Tamil Nadu',
        sourceDocument: 'Aadhaar Card',
        confidence: 'high'
      },
      {
        id: 'f-5',
        field: 'aadhaarNumber',
        label: 'Aadhaar Number',
        value: 'XXXX XXXX 1234',
        sourceDocument: 'Aadhaar Card',
        confidence: 'high',
        sensitive: true
      }
    ]
  },
  {
    id: 'doc-marksheet-02',
    name: 'Class 10 Marksheet',
    type: 'marksheet',
    uploadedAt: '2026-09-12T14:15:00Z',
    status: 'verified',
    fileName: 'class10_marksheet.pdf',
    fileSize: '2.4 MB',
    fields: [
      {
        id: 'f-6',
        field: 'fullName',
        label: 'Full Name',
        value: 'Arun Kumar',
        sourceDocument: 'Class 10 Marksheet',
        confidence: 'high'
      },
      {
        id: 'f-7',
        field: 'fatherName',
        label: 'Father / Guardian',
        value: 'R. Kumar',
        sourceDocument: 'Class 10 Marksheet',
        confidence: 'high'
      },
      {
        id: 'f-8',
        field: 'dob',
        label: 'Date of Birth',
        value: '14/07/2006',
        sourceDocument: 'Class 10 Marksheet',
        confidence: 'high'
      },
      {
        id: 'f-9',
        field: 'academicPercentage',
        label: 'Academic Percentage',
        value: '87.4%',
        sourceDocument: 'Class 10 Marksheet',
        confidence: 'high'
      },
      {
        id: 'f-10',
        field: 'rollNumber',
        label: 'Roll Number',
        value: 'TN-2022-88492',
        sourceDocument: 'Class 10 Marksheet',
        confidence: 'high'
      }
    ]
  },
  {
    id: 'doc-income-03',
    name: 'Income Certificate',
    type: 'income_certificate',
    uploadedAt: '2026-09-15T09:00:00Z',
    status: 'warning',
    fileName: 'income_certificate_2026.pdf',
    fileSize: '890 KB',
    fields: [
      {
        id: 'f-11',
        field: 'fullName',
        label: 'Full Name',
        value: 'Arun Kumarr', // INTENTIONAL MISMATCH FOR DEMO
        sourceDocument: 'Income Certificate',
        confidence: 'high'
      },
      {
        id: 'f-12',
        field: 'fatherName',
        label: 'Father / Guardian',
        value: 'R. Kumar',
        sourceDocument: 'Income Certificate',
        confidence: 'high'
      },
      {
        id: 'f-13',
        field: 'annualIncome',
        label: 'Annual Family Income',
        value: '₹1,80,000',
        sourceDocument: 'Income Certificate',
        confidence: 'high'
      },
      {
        id: 'f-14',
        field: 'address',
        label: 'Address',
        value: 'Coimbatore, Tamil Nadu',
        sourceDocument: 'Income Certificate',
        confidence: 'high'
      },
      {
        id: 'f-15',
        field: 'certificateNo',
        label: 'Certificate No',
        value: 'INC/2026/99341',
        sourceDocument: 'Income Certificate',
        confidence: 'high'
      }
    ]
  },
  {
    id: 'doc-bank-04',
    name: 'Bank Passbook',
    type: 'bank_passbook',
    uploadedAt: '2026-09-18T11:20:00Z',
    status: 'verified',
    fileName: 'sbi_passbook_front.pdf',
    fileSize: '1.5 MB',
    fields: [
      {
        id: 'f-16',
        field: 'fullName',
        label: 'Full Name',
        value: 'Arun Kumar',
        sourceDocument: 'Bank Passbook',
        confidence: 'high'
      },
      {
        id: 'f-17',
        field: 'accountNumber',
        label: 'Bank Account Number',
        value: 'XXXXXX4582',
        sourceDocument: 'Bank Passbook',
        confidence: 'high',
        sensitive: true
      },
      {
        id: 'f-18',
        field: 'bankName',
        label: 'Bank Name',
        value: 'State Bank of India',
        sourceDocument: 'Bank Passbook',
        confidence: 'high'
      },
      {
        id: 'f-19',
        field: 'ifscCode',
        label: 'IFSC Code',
        value: 'SBIN0004821',
        sourceDocument: 'Bank Passbook',
        confidence: 'high',
        sensitive: true
      }
    ]
  }
];

export const CLEAN_DOCUMENTS: UserDocument[] = MISMATCH_DOCUMENTS.map(doc => {
  if (doc.type === 'income_certificate') {
    return {
      ...doc,
      status: 'verified',
      fields: doc.fields.map(f => {
        if (f.field === 'fullName') {
          return { ...f, value: 'Arun Kumar' };
        }
        return f;
      })
    };
  }
  return doc;
});
