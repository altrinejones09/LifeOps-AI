import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedLanguage = 'English (US)' | 'English (IN)' | 'Tamil' | 'Hindi';

interface Translations {
  // Sidebar
  navDashboard: string;
  navAgent: string;
  navVault: string;
  navVerification: string;
  navOpportunities: string;
  navApplications: string;
  navApproval: string;
  navAudit: string;
  navHistory: string;
  navPrivacy: string;
  navProfile: string;

  // Workflow Stages
  stageGoal: string;
  stageVault: string;
  stageVerify: string;
  stageOpportunities: string;
  stageEligibility: string;
  stagePrepare: string;
  stageApproval: string;
  stageSubmission: string;

  // Actions
  btnStartWorkflow: string;
  btnBeginWorkflow: string;
  btnCreateDraft: string;
  btnApprove: string;
  btnReject: string;
  btnApproveAll: string;
  btnSubmit: string;
  btnViewAudit: string;
  btnReset: string;
  btnSignOut: string;

  // Statuses
  statusVerified: string;
  statusWarning: string;
  statusCritical: string;
  statusPending: string;
  statusApproved: string;
  statusRejected: string;
  statusSubmitted: string;
  statusWaitingApproval: string;
}

const DICTIONARY: Record<SupportedLanguage, Translations> = {
  'English (US)': {
    navDashboard: 'Dashboard',
    navAgent: 'Agent Workspace',
    navVault: 'Document Vault',
    navVerification: 'Verification Engine',
    navOpportunities: 'Opportunities',
    navApplications: 'Applications',
    navApproval: 'Approval Center',
    navAudit: 'Audit Trail',
    navHistory: 'Agent Run History',
    navPrivacy: 'Privacy & Security',
    navProfile: 'User Profile',

    stageGoal: 'Understand Goal',
    stageVault: 'Check Document Vault',
    stageVerify: 'Verify Information',
    stageOpportunities: 'Find Opportunities',
    stageEligibility: 'Evaluate Eligibility',
    stagePrepare: 'Prepare Application',
    stageApproval: 'Human Approval Required',
    stageSubmission: 'Controlled Submission',

    btnStartWorkflow: 'Start Secure Workflow',
    btnBeginWorkflow: 'Begin Workflow',
    btnCreateDraft: 'Create Application Draft',
    btnApprove: 'Approve',
    btnReject: 'Reject',
    btnApproveAll: 'Approve All Fields',
    btnSubmit: 'Approve & Submit Application',
    btnViewAudit: 'View Audit Trail',
    btnReset: 'Reset Sandbox',
    btnSignOut: 'Sign Out',

    statusVerified: 'Verified',
    statusWarning: 'Warning Flagged',
    statusCritical: 'Critical Blocker',
    statusPending: 'Pending',
    statusApproved: 'Approved',
    statusRejected: 'Rejected',
    statusSubmitted: 'Submitted',
    statusWaitingApproval: 'Waiting for Human Approval'
  },
  'English (IN)': {
    navDashboard: 'Dashboard',
    navAgent: 'Agent Workspace',
    navVault: 'Document Vault',
    navVerification: 'Verification Engine',
    navOpportunities: 'Opportunities',
    navApplications: 'Applications',
    navApproval: 'Approval Center',
    navAudit: 'Audit Trail',
    navHistory: 'Agent Run History',
    navPrivacy: 'Privacy & Security',
    navProfile: 'User Profile',

    stageGoal: 'Understand Goal',
    stageVault: 'Check Document Vault',
    stageVerify: 'Verify Information',
    stageOpportunities: 'Find Opportunities',
    stageEligibility: 'Evaluate Eligibility',
    stagePrepare: 'Prepare Application',
    stageApproval: 'Human Approval Required',
    stageSubmission: 'Controlled Submission',

    btnStartWorkflow: 'Start Secure Workflow',
    btnBeginWorkflow: 'Begin Workflow',
    btnCreateDraft: 'Create Application Draft',
    btnApprove: 'Approve',
    btnReject: 'Reject',
    btnApproveAll: 'Approve All Fields',
    btnSubmit: 'Approve & Submit Application',
    btnViewAudit: 'View Audit Trail',
    btnReset: 'Reset Sandbox',
    btnSignOut: 'Sign Out',

    statusVerified: 'Verified',
    statusWarning: 'Warning Flagged',
    statusCritical: 'Critical Blocker',
    statusPending: 'Pending',
    statusApproved: 'Approved',
    statusRejected: 'Rejected',
    statusSubmitted: 'Submitted',
    statusWaitingApproval: 'Waiting for Human Approval'
  },
  'Tamil': {
    navDashboard: 'முகப்பு (Dashboard)',
    navAgent: 'செயல்பாட்டு ஏஜென்ட் (Agent Workspace)',
    navVault: 'ஆவணப் பெட்டகம் (Document Vault)',
    navVerification: 'சரிபார்ப்பு என்ஜின் (Verification)',
    navOpportunities: 'வாய்ப்புகள் (Opportunities)',
    navApplications: 'விண்ணப்பங்கள் (Applications)',
    navApproval: 'ஒப்புதல் மையம் (Approval Center)',
    navAudit: 'தணிக்கை பதிவு (Audit Trail)',
    navHistory: 'இயக்க வரலாறு (Run History)',
    navPrivacy: 'தனியுரிமை & பாதுகாப்பு (Privacy)',
    navProfile: 'பயனர் சுயவிவரம் (Profile)',

    stageGoal: 'இலக்கை புரிந்துகொள்ளுதல்',
    stageVault: 'ஆவணப் பெட்டகத்தை சரிபார்த்தல்',
    stageVerify: 'தகவல் சரிபார்ப்பு',
    stageOpportunities: 'வாய்ப்புகளைக் கண்டறிதல்',
    stageEligibility: 'தகுதியை மதிப்பிடுதல்',
    stagePrepare: 'விண்ணப்பம் தயாரித்தல்',
    stageApproval: 'மனித ஒப்புதல் தேவை',
    stageSubmission: 'கட்டுப்படுத்தப்பட்ட சமர்ப்பிப்பு',

    btnStartWorkflow: 'பாதுகாப்பான பணிப்பாய்வு தொடங்குக',
    btnBeginWorkflow: 'பணிப்பாய்வு தொடங்குக',
    btnCreateDraft: 'விண்ணப்ப வரைவு உருவாக்குக',
    btnApprove: 'ஒப்புதல் அளி',
    btnReject: 'நிராகரி',
    btnApproveAll: 'அனைத்து புலங்களுக்கும் ஒப்புதல் அளி',
    btnSubmit: 'ஒப்புதல் அளித்து சமர்ப்பி',
    btnViewAudit: 'தணிக்கை பதிவைக் காண்',
    btnReset: 'மீட்டமைக்க (Reset)',
    btnSignOut: 'வெளியேறு',

    statusVerified: 'சரிபார்க்கப்பட்டது',
    statusWarning: 'எச்சரிக்கை கொடியிடப்பட்டது',
    statusCritical: 'முக்கிய தடுப்பான்',
    statusPending: 'நிலுவையில் உள்ளது',
    statusApproved: 'ஒப்புதல் அளிக்கப்பட்டது',
    statusRejected: 'நிராகரிக்கப்பட்டது',
    statusSubmitted: 'சமர்ப்பிக்கப்பட்டது',
    statusWaitingApproval: 'மனித ஒப்புதலுக்காக காத்திருக்கிறது'
  },
  'Hindi': {
    navDashboard: 'डैशबोर्ड (Dashboard)',
    navAgent: 'एजेंट कार्यक्षेत्र (Agent Workspace)',
    navVault: 'दस्तावेज़ तिजोरी (Document Vault)',
    navVerification: 'सत्यापन इंजन (Verification)',
    navOpportunities: 'अवसर (Opportunities)',
    navApplications: 'आवेदन (Applications)',
    navApproval: 'अनुमोदन केंद्र (Approval Center)',
    navAudit: 'ऑडिट ट्रेल (Audit Trail)',
    navHistory: 'रन इतिहास (Run History)',
    navPrivacy: 'गोपनीयता और सुरक्षा (Privacy)',
    navProfile: 'उपयोगकर्ता प्रोफ़ाइल (Profile)',

    stageGoal: 'लक्ष्य समझें',
    stageVault: 'दस्तावेज़ जांचें',
    stageVerify: 'जानकारी सत्यापित करें',
    stageOpportunities: 'अवसर खोजें',
    stageEligibility: 'पात्रता का मूल्यांकन करें',
    stagePrepare: 'आवेदन तैयार करें',
    stageApproval: 'मानव अनुमोदन आवश्यक',
    stageSubmission: 'नियंत्रित प्रस्तुति',

    btnStartWorkflow: 'सुरक्षित वर्कफ़्लो शुरू करें',
    btnBeginWorkflow: 'वर्कफ़्लो प्रारंभ करें',
    btnCreateDraft: 'आवेदन ड्राफ्ट बनाएं',
    btnApprove: 'स्वीकृत करें',
    btnReject: 'अस्वीकृत करें',
    btnApproveAll: 'सभी फ़ील्ड स्वीकृत करें',
    btnSubmit: 'स्वीकृत करें और जमा करें',
    btnViewAudit: 'ऑडिट ट्रेल देखें',
    btnReset: 'रीसेट करें',
    btnSignOut: 'साइन आउट',

    statusVerified: 'सत्यापित',
    statusWarning: 'चेतावनी झंडी',
    statusCritical: 'गंभीर अवरोधक',
    statusPending: 'लंबित',
    statusApproved: 'स्वीकृत',
    statusRejected: 'अस्वीकृत',
    statusSubmitted: 'जमा कर दिया गया',
    statusWaitingApproval: 'मानव अनुमोदन की प्रतीक्षा में'
  }
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode; initialLanguage?: SupportedLanguage }> = ({ 
  children,
  initialLanguage = 'English (US)'
}) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem('lifeops_preferred_language');
      return (saved as SupportedLanguage) || initialLanguage;
    } catch {
      return initialLanguage;
    }
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('lifeops_preferred_language', lang);
    } catch (e) {
      console.warn('Failed to save language preference:', e);
    }
  };

  const t = DICTIONARY[language] || DICTIONARY['English (US)'];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
