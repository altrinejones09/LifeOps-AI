import React, { useState, useEffect } from 'react';
import { Header } from './components/Layout/Header';
import { Sidebar, NavTab } from './components/Layout/Sidebar';
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

import { DemoMode, Opportunity, UserDocument, ApplicationDraft, UserProfile, AuthState } from './types';
import { 
  loadStoredState, 
  saveStateToStorage, 
  getInitialDefaultState,
  clearLocalStorageState,
  AppState 
} from './utils/storage';
import { loadStoredAuthState, saveAuthSession, DEFAULT_DEMO_USER } from './engine/authService';
import { runConsistencyCheck } from './engine/consistencyEngine';
import { generateApplicationDraft } from './engine/applicationEngine';
import { createAuditEvent } from './utils/audit';

export const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>(() => loadStoredAuthState());
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedAppId, setSelectedAppId] = useState<string>('');

  const [state, setState] = useState<AppState>(() => loadStoredState(authState.currentUser?.id));

  // Reload state if user session changes
  useEffect(() => {
    if (authState.currentUser?.id) {
      setState(loadStoredState(authState.currentUser.id));
    }
  }, [authState.currentUser?.id]);

  // Persist state updates to localStorage with user isolation key
  useEffect(() => {
    saveStateToStorage(state, authState.currentUser?.id);
  }, [state, authState.currentUser?.id]);

  // Handle successful login or account creation
  const handleAuthSuccess = (user: UserProfile) => {
    saveAuthSession(user);
    setAuthState({
      status: 'authenticated',
      currentUser: user
    });
    setState(loadStoredState(user.id));
    setCurrentTab('dashboard');
  };

  // Handle sign out
  const handleSignOut = () => {
    saveAuthSession(null);
    setAuthState({
      status: 'unauthenticated',
      currentUser: null
    });
  };

  // Handle profile updates
  const handleUpdateProfile = (updatedUser: UserProfile) => {
    saveAuthSession(updatedUser);
    setAuthState(prev => ({
      ...prev,
      currentUser: updatedUser
    }));
  };

  // Render Authentication Entry Gate if Unauthenticated
  if (authState.status !== 'authenticated' || !authState.currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  const currentUser = authState.currentUser;
  const userName = currentUser.fullName;

  // Derived check result
  const checkResult = runConsistencyCheck(state.documents, state.discrepancies);
  const activeIssuesCount = checkResult.discrepancies.filter(d => !d.acknowledged).length;

  // Selected application draft
  const currentApp = state.applications.find(a => a.id === selectedAppId) || state.applications[0] || null;

  // Handler to switch demo modes (Mismatch vs Clean)
  const handleSelectDemoMode = (mode: DemoMode) => {
    const newState = getInitialDefaultState(mode);
    setState(newState);
  };

  // Handler to reset demo state
  const handleResetDemo = () => {
    clearLocalStorageState(currentUser.id);
    const newState = getInitialDefaultState('mismatch');
    setState(newState);
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
  };

  // Handler to create draft application from opportunity
  const handleCreateDraft = (opportunity: Opportunity, navigateToApps: boolean = true) => {
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
    if (navigateToApps) {
      setCurrentTab('applications');
    }
  };

  // Handler for field approval checkboxes
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
  };

  // Handler to select all field approvals
  const handleApproveAllFields = (appId: string) => {
    setState(prev => ({
      ...prev,
      applications: prev.applications.map(app => {
        if (app.id === appId) {
          return {
            ...app,
            fields: app.fields.map(f => ({
              ...f,
              approved: true,
              approvalStatus: 'APPROVED',
              rejectionReason: undefined
            }))
          };
        }
        return app;
      })
    }));

    if (currentUser) {
      const auditEvent = createAuditEvent(
        'FIELD_APPROVED',
        'All Fields Approved',
        `User ${currentUser.fullName} granted batch approval for all application fields.`,
        { approvedBy: currentUser.fullName }
      );
      setState(prev => ({ ...prev, auditLogs: [auditEvent, ...prev.auditLogs] }));
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
  const handleSubmitApplication = (appId: string) => {
    const targetApp = state.applications.find(a => a.id === appId);
    if (!targetApp) return;

    const refId = `LO-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const timestampStr = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const submitAuditEvent = createAuditEvent(
      'APPLICATION_SUBMITTED',
      'Application Mock Submitted',
      `User ${userName} authorized submission for "${targetApp.opportunityTitle}". Generated reference code ${refId}.`,
      { applicationTitle: targetApp.opportunityTitle, approvedBy: userName }
    );

    setState(prev => ({
      ...prev,
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
    }));
  };

  // Handler for adding simulated document upload
  const handleAddSimulatedDocument = (doc: UserDocument) => {
    const auditEvent = createAuditEvent(
      'DOCUMENT_ADDED',
      'User Document Uploaded',
      `Simulated OCR scan added "${doc.name}" for ${userName} with ${doc.fields.length} extracted fields.`,
      { sourceDocument: doc.name, approvedBy: userName }
    );

    setState(prev => ({
      ...prev,
      documents: [doc, ...prev.documents],
      auditLogs: [auditEvent, ...prev.auditLogs]
    }));
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
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        issueCount={activeIssuesCount}
        pendingApprovalCount={state.applications.filter(a => a.status !== 'SUBMITTED').length}
      />

      <div className="main-wrapper">
        <Header
          user={currentUser}
          demoMode={state.demoMode}
          onSelectDemoMode={handleSelectDemoMode}
          onResetDemo={handleResetDemo}
          onNavigateToTab={setCurrentTab}
          onSignOut={handleSignOut}
        />

        <main className="content-body">
          {currentTab === 'dashboard' && (
            <Dashboard
              state={state}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'agent' && (
            <AgentWorkspace
              documents={state.documents}
              discrepancies={state.discrepancies}
              applications={state.applications}
              agentRun={state.agentRun || null}
              demoMode={state.demoMode}
              user={currentUser}
              onNavigate={setCurrentTab}
              onCreateDraft={handleCreateDraft}
              onSaveAgentRun={handleSaveAgentRun}
            />
          )}

          {currentTab === 'vault' && (
            <DocumentVault
              documents={state.documents}
              demoMode={state.demoMode}
              onSelectDemoMode={handleSelectDemoMode}
              onAddSimulatedDocument={handleAddSimulatedDocument}
            />
          )}

          {currentTab === 'verification' && (
            <Verification
              checkResult={checkResult}
              demoMode={state.demoMode}
              onAcknowledgeDiscrepancy={handleAcknowledgeDiscrepancy}
              onNavigateToOpportunities={() => setCurrentTab('opportunities')}
            />
          )}

          {currentTab === 'opportunities' && (
            <Opportunities
              documents={state.documents}
              onCreateDraft={handleCreateDraft}
            />
          )}

          {currentTab === 'applications' && (
            <Applications
              applications={state.applications}
              onNavigateToApproval={appId => {
                setSelectedAppId(appId);
                setCurrentTab('approval');
              }}
              onNavigateToAudit={() => setCurrentTab('audit')}
            />
          )}

          {currentTab === 'approval' && (
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
              onNavigateToAudit={() => setCurrentTab('audit')}
            />
          )}

          {currentTab === 'audit' && (
            <AuditTrail
              auditLogs={state.auditLogs}
            />
          )}

          {currentTab === 'history' && (
            <AgentHistory
              runHistory={state.runHistory}
              activeRunId={state.agentRun?.runId}
              onRestoreRun={run => {
                setState(prev => ({
                  ...prev,
                  agentRun: run
                }));
              }}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'privacy' && (
            <PrivacyCenter
              documents={state.documents}
              privacySettings={state.privacySettings}
              onUpdatePrivacySettings={settings => {
                setState(prev => ({
                  ...prev,
                  privacySettings: settings
                }));
              }}
              onResetAgentRun={() => {
                setState(prev => ({
                  ...prev,
                  agentRun: null
                }));
              }}
              onResetDemo={handleResetDemo}
              onSignOut={handleSignOut}
            />
          )}

          {currentTab === 'profile' && (
            <UserProfilePage
              user={currentUser}
              onUpdateProfile={handleUpdateProfile}
              onSignOut={handleSignOut}
            />
          )}
        </main>
      </div>
    </div>
  );
};

