import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './components/Layout/Header';
import { Sidebar, NavTab } from './components/Layout/Sidebar';
import { Breadcrumbs } from './components/Layout/Breadcrumbs';
import { Dashboard } from './pages/Dashboard';
import { AgentWorkspace } from './pages/AgentWorkspace';
import { DocumentVault } from './pages/DocumentVault';
import { Verification } from './pages/Verification';
import { Opportunities } from './pages/Opportunities';
import { Applications } from './pages/Applications';
import { Approval } from './pages/Approval';
import { AuditTrail } from './pages/AuditTrail';
import { AgentHistory } from './pages/AgentHistory';
import { PrivacyCenter } from './pages/PrivacyCenter';
import { AuthPage } from './pages/AuthPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';

import { DemoMode, Opportunity, UserDocument, ApplicationDraft, UserProfile, AuthState } from './types';
import { 
  loadStoredState, 
  saveStateToStorage, 
  getInitialDefaultState,
  clearLocalStorageState,
  AppState 
} from './utils/storage';
import { loadStoredAuthState, saveAuthSession } from './engine/authService';
import { runConsistencyCheck } from './engine/consistencyEngine';
import { generateApplicationDraft } from './engine/applicationEngine';
import { createAuditEvent, GENESIS_HASH } from './utils/audit';
import { backend } from './services/backend';

const MainAppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useNotification();

  const [authState, setAuthState] = useState<AuthState>(() => loadStoredAuthState());
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [state, setState] = useState<AppState>(() => loadStoredState(authState.currentUser?.id));

  // Reload state if user session changes
  useEffect(() => {
    if (authState.currentUser?.id) {
      backend.getProfile(authState.currentUser.id).then(profile => {
        if (profile) {
          setAuthState(prev => ({ ...prev, currentUser: profile }));
        }
      });
      setState(loadStoredState(authState.currentUser.id));
    }
  }, [authState.currentUser?.id]);

  // Persist state updates to backend / storage with user isolation key
  useEffect(() => {
    saveStateToStorage(state, authState.currentUser?.id);
  }, [state, authState.currentUser?.id]);

  // Handle successful authentication
  const handleAuthSuccess = (user: UserProfile) => {
    saveAuthSession(user);
    setAuthState({
      status: 'authenticated',
      currentUser: user
    });
    setState(loadStoredState(user.id));
    showToast(`Welcome back, ${user.fullName}`, 'SUCCESS');
    navigate('/dashboard');
  };

  // Handle sign out
  const handleSignOut = () => {
    saveAuthSession(null);
    setAuthState({
      status: 'unauthenticated',
      currentUser: null
    });
    showToast('Signed out of operations workspace', 'INFO');
    navigate('/login');
  };

  // Handle profile updates
  const handleUpdateProfile = (updatedUser: UserProfile) => {
    saveAuthSession(updatedUser);
    backend.saveProfile(updatedUser.id, updatedUser);
    setAuthState(prev => ({
      ...prev,
      currentUser: updatedUser
    }));
  };

  // Render Auth Gate if Unauthenticated
  if (authState.status !== 'authenticated' || !authState.currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<AuthPage onAuthSuccess={handleAuthSuccess} />} />
        <Route path="/signup" element={<AuthPage onAuthSuccess={handleAuthSuccess} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const currentUser = authState.currentUser;
  const userName = currentUser.fullName;

  // Derived check result
  const checkResult = runConsistencyCheck(state.documents, state.discrepancies);
  const activeIssuesCount = checkResult.discrepancies.filter(d => !d.acknowledged).length;
  const currentApp = state.applications.find(a => a.id === selectedAppId) || state.applications[0] || null;

  // Handler to switch demo fixture modes
  const handleSelectDemoMode = (mode: DemoMode) => {
    const newState = getInitialDefaultState(mode, currentUser.id);
    setState(newState);
    showToast(`Loaded ${mode === 'clean' ? 'Clean Case' : 'Name Mismatch Case'} test fixture`, 'INFO');
  };

  // Handler to reset demo state
  const handleResetDemo = () => {
    clearLocalStorageState(currentUser.id);
    const newState = getInitialDefaultState('mismatch', currentUser.id);
    setState(newState);
    showToast('Reset local sandbox state to fresh defaults', 'INFO');
  };

  // Handler to acknowledge discrepancy
  const handleAcknowledgeDiscrepancy = (discId: string) => {
    const updatedDiscrepancies = state.discrepancies.map(d => {
      if (d.id === discId) {
        return {
          ...d,
          acknowledged: true,
          acknowledgedAt: new Date().toISOString()
        };
      }
      return d;
    });

    const targetDisc = state.discrepancies.find(d => d.id === discId);

    const auditEvent = createAuditEvent(
      'DISCREPANCY_ACKNOWLEDGED',
      'Discrepancy Acknowledged by User',
      `User ${userName} acknowledged identity discrepancy for field "${targetDisc?.fieldLabel}". Application drafting permitted with audit trail record.`,
      { field: targetDisc?.fieldKey, approvedBy: userName }
    );

    setState(prev => ({
      ...prev,
      discrepancies: updatedDiscrepancies,
      auditLogs: [auditEvent, ...prev.auditLogs]
    }));

    showToast('Identity discrepancy acknowledged and audit event appended', 'WARNING');
  };

  // Handler to create draft application from opportunity
  const handleCreateDraft = (opportunity: Opportunity, navigateToApps: boolean = true): ApplicationDraft => {
    const newDraft = generateApplicationDraft(opportunity, state.documents);

    const auditEvent = createAuditEvent(
      'APPLICATION_DRAFTED',
      'Application Draft Prepared',
      `Draft application prepared for "${opportunity.title}" by ${userName} using verified document vault data.`,
      { applicationTitle: opportunity.title, approvedBy: userName }
    );

    setState(prev => {
      const existingFiltered = prev.applications.filter(a => a.opportunityId !== opportunity.id);
      return {
        ...prev,
        applications: [newDraft, ...existingFiltered],
        auditLogs: [auditEvent, ...prev.auditLogs]
      };
    });

    setSelectedAppId(newDraft.id);
    showToast(`Draft application prepared for ${opportunity.title}`, 'SUCCESS');
    if (navigateToApps) {
      navigate('/applications');
    }
    return newDraft;
  };

  // Handler for field approval toggles
  const handleApproveFieldToggle = (appId: string, fieldKey: string) => {
    let isApprovedAction = false;
    let targetLabel = '';

    setState(prev => ({
      ...prev,
      applications: prev.applications.map(app => {
        if (app.id === appId) {
          return {
            ...app,
            fields: app.fields.map(f => {
              if (f.fieldKey === fieldKey) {
                const newApproved = !f.approved;
                isApprovedAction = newApproved;
                targetLabel = f.label;
                return {
                  ...f,
                  approved: newApproved,
                  approvalStatus: newApproved ? 'APPROVED' : 'PENDING',
                  rejectionReason: newApproved ? undefined : f.rejectionReason
                };
              }
              return f;
            })
          };
        }
        return app;
      })
    }));

    if (isApprovedAction) {
      const auditEvent = createAuditEvent(
        'FIELD_APPROVED',
        'Field Authorization Granted',
        `User ${currentUser.fullName} approved field "${targetLabel || fieldKey}".`,
        { field: fieldKey, approvedBy: currentUser.fullName }
      );
      setState(prev => ({ ...prev, auditLogs: [auditEvent, ...prev.auditLogs] }));
      showToast(`Field "${targetLabel || fieldKey}" approved`, 'SUCCESS');
    }
  };

  // Handler for field rejection
  const handleRejectField = (appId: string, fieldKey: string, reason: string) => {
    let targetLabel = '';

    setState(prev => ({
      ...prev,
      applications: prev.applications.map(app => {
        if (app.id === appId) {
          return {
            ...app,
            fields: app.fields.map(f => {
              if (f.fieldKey === fieldKey) {
                targetLabel = f.label;
                return {
                  ...f,
                  approved: false,
                  approvalStatus: 'REJECTED',
                  rejectionReason: reason
                };
              }
              return f;
            })
          };
        }
        return app;
      })
    }));

    const auditEvent = createAuditEvent(
      'FIELD_REJECTED',
      'Field Approval Rejected',
      `User ${currentUser.fullName} rejected field "${targetLabel || fieldKey}" with reason: "${reason}".`,
      { field: fieldKey, rejectionReason: reason, approvedBy: currentUser.fullName }
    );
    setState(prev => ({ ...prev, auditLogs: [auditEvent, ...prev.auditLogs] }));
    showToast(`Field "${targetLabel || fieldKey}" rejected: ${reason}`, 'ERROR');
  };

  // Handler to select all field approvals
  const handleApproveAllFields = (appId: string) => {
    let rejectedCount = 0;
    setState(prev => ({
      ...prev,
      applications: prev.applications.map(app => {
        if (app.id === appId) {
          return {
            ...app,
            fields: app.fields.map(f => {
              if (f.approvalStatus === 'REJECTED') {
                rejectedCount++;
                return f;
              }
              return {
                ...f,
                approved: true,
                approvalStatus: 'APPROVED',
                rejectionReason: undefined
              };
            })
          };
        }
        return app;
      })
    }));

    if (rejectedCount > 0) {
      showToast(`${rejectedCount} rejected field${rejectedCount > 1 ? 's' : ''} require manual correction before submission.`, 'WARNING');
    } else {
      const latestLogHash = state.auditLogs[0]?.hash || GENESIS_HASH;
      const auditEvent = createAuditEvent(
        'FIELD_APPROVED',
        'All Eligible Fields Approved',
        `User ${currentUser.fullName} granted batch approval for eligible application fields.`,
        { userId: currentUser.id, approvedBy: currentUser.fullName, previousHash: latestLogHash }
      );
      setState(prev => ({ ...prev, auditLogs: [auditEvent, ...prev.auditLogs] }));
      showToast('Batch approval granted for all eligible application fields', 'SUCCESS');
    }
  };

  // Handler for declaration approval
  const handleSetDeclarationApproved = (appId: string, approved: boolean) => {
    setState(prev => ({
      ...prev,
      applications: prev.applications.map(app => {
        if (app.id === appId) {
          return { ...app, userDeclarationApproved: approved };
        }
        return app;
      })
    }));
  };

  // Handler for mock application submission
  const handleSubmitApplication = (appId: string, submissionResult?: { referenceId?: string; submittedAt?: string }) => {
    const targetApp = state.applications.find(a => a.id === appId);
    if (!targetApp) return;

    const refId = submissionResult?.referenceId || `LO-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const timestampStr = submissionResult?.submittedAt || new Date().toISOString();
    const latestLogHash = state.auditLogs[0]?.hash || GENESIS_HASH;

    const submitAuditEvent = createAuditEvent(
      'APPLICATION_MOCK_SUBMITTED',
      'Application Mock Submitted',
      `User ${userName} authorized submission for "${targetApp.opportunityTitle}". Reference code ${refId}. Execution mode: Mock Sandbox.`,
      { userId: currentUser.id, applicationTitle: targetApp.opportunityTitle, approvedBy: userName, previousHash: latestLogHash }
    );

    setState(prev => {
      let updatedAgentRun = prev.agentRun;
      if (updatedAgentRun && (updatedAgentRun.applicationId === appId || !updatedAgentRun.applicationId)) {
        updatedAgentRun = {
          ...updatedAgentRun,
          status: 'COMPLETED',
          steps: updatedAgentRun.steps.map(s => {
            if (s.number === '07' || s.number === '08') {
              return {
                ...s,
                status: 'completed' as const,
                detail: `Mock Submission Executed — Ref Code: ${refId}`
              };
            }
            return s;
          })
        };
      }

      return {
        ...prev,
        agentRun: updatedAgentRun,
        applications: prev.applications.map(app => {
          if (app.id === appId) {
            return {
              ...app,
              status: 'SUBMITTED',
              referenceId: refId,
              submittedAt: timestampStr
            };
          }
          return app;
        }),
        auditLogs: [submitAuditEvent, ...prev.auditLogs]
      };
    });

    showToast(`Application submitted! Reference code: ${refId}`, 'SUCCESS');
  };

  // Handler for adding simulated document upload
  const handleAddSimulatedDocument = (doc: UserDocument) => {
    const auditEvent = createAuditEvent(
      'DOCUMENT_ADDED',
      'User Document Uploaded',
      `Uploaded "${doc.name}" for ${userName} with ${doc.fields.length} extracted fields.`,
      { sourceDocument: doc.name, approvedBy: userName }
    );

    setState(prev => ({
      ...prev,
      documents: [doc, ...prev.documents],
      auditLogs: [auditEvent, ...prev.auditLogs]
    }));

    showToast(`Document "${doc.name}" added to vault`, 'SUCCESS');
  };

  const handleSaveAgentRun = (agentRun: any) => {
    setState(prev => ({
      ...prev,
      agentRun
    }));
  };

  return (
    <div className="app-container">
      <Sidebar
        issueCount={activeIssuesCount}
        pendingApprovalCount={state.applications.filter(a => a.status !== 'SUBMITTED').length}
      />

      <div className="main-wrapper">
        <Header
          user={currentUser}
          demoMode={state.demoMode}
          onSelectDemoMode={handleSelectDemoMode}
          onResetDemo={handleResetDemo}
          onSignOut={handleSignOut}
        />

        <main className="content-body">
          <Breadcrumbs />
          <Routes>
            <Route path="/dashboard" element={<Dashboard state={state} onNavigate={t => navigate(`/${t}`)} />} />
            <Route path="/agent" element={
              <AgentWorkspace
                documents={state.documents}
                discrepancies={state.discrepancies}
                applications={state.applications}
                agentRun={state.agentRun || null}
                demoMode={state.demoMode}
                user={currentUser}
                onNavigate={t => navigate(`/${t}`)}
                onCreateDraft={handleCreateDraft}
                onSaveAgentRun={handleSaveAgentRun}
              />
            } />
            <Route path="/vault" element={
              <DocumentVault
                documents={state.documents}
                demoMode={state.demoMode}
                onSelectDemoMode={handleSelectDemoMode}
                onAddSimulatedDocument={handleAddSimulatedDocument}
              />
            } />
            <Route path="/verification" element={
              <Verification
                checkResult={checkResult}
                demoMode={state.demoMode}
                onAcknowledgeDiscrepancy={handleAcknowledgeDiscrepancy}
                onNavigateToOpportunities={() => navigate('/opportunities')}
              />
            } />
            <Route path="/opportunities" element={
              <Opportunities
                documents={state.documents}
                onCreateDraft={handleCreateDraft}
              />
            } />
            <Route path="/applications" element={
              <Applications
                applications={state.applications}
                onNavigateToApproval={appId => {
                  setSelectedAppId(appId);
                  navigate('/approval');
                }}
                onNavigateToAudit={() => navigate('/audit')}
              />
            } />
            <Route path="/approval" element={
              <Approval
                application={currentApp}
                documents={state.documents}
                user={currentUser}
                discrepancies={state.discrepancies}
                hasValidRun={Boolean(state.agentRun && state.agentRun.status !== 'IDLE')}
                onApproveFieldToggle={handleApproveFieldToggle}
                onApproveAllFields={handleApproveAllFields}
                onRejectField={handleRejectField}
                onSetDeclarationApproved={handleSetDeclarationApproved}
                onSubmitApplication={handleSubmitApplication}
                onNavigateToAudit={() => navigate('/audit')}
              />
            } />
            <Route path="/audit" element={<AuditTrail auditLogs={state.auditLogs} />} />
            <Route path="/history" element={
              <AgentHistory
                runHistory={state.runHistory}
                activeRunId={state.agentRun?.runId}
                onRestoreRun={run => setState(prev => ({ ...prev, agentRun: run }))}
                onNavigate={t => navigate(`/${t}`)}
              />
            } />
            <Route path="/privacy" element={
              <PrivacyCenter
                documents={state.documents}
                privacySettings={state.privacySettings}
                onUpdatePrivacySettings={settings => setState(prev => ({ ...prev, privacySettings: settings }))}
                onResetAgentRun={() => setState(prev => ({ ...prev, agentRun: null }))}
                onResetDemo={handleResetDemo}
                onSignOut={handleSignOut}
              />
            } />
            <Route path="/profile" element={
              <UserProfilePage
                user={currentUser}
                onUpdateProfile={handleUpdateProfile}
                onSignOut={handleSignOut}
              />
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <NotificationProvider>
        <BrowserRouter>
          <MainAppContent />
        </BrowserRouter>
      </NotificationProvider>
    </LanguageProvider>
  );
};
