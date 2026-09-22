import React from 'react';
import { 
  History, 
  Bot, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  FileCheck,
  ShieldCheck
} from 'lucide-react';
import { AgentRun } from '../types';
import { NavTab } from '../components/Layout/Sidebar';

interface AgentHistoryProps {
  runHistory: AgentRun[];
  activeRunId?: string;
  onRestoreRun: (run: AgentRun) => void;
  onNavigate: (tab: NavTab) => void;
}

export const AgentHistory: React.FC<AgentHistoryProps> = ({
  runHistory,
  activeRunId,
  onRestoreRun,
  onNavigate
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '24px',
        borderRadius: '12px',
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
          }}>
            <History size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
              Agent Run History
            </h1>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Inspect and restore previous Agent execution runs and audit evidence.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('agent')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Bot size={16} />
          Go to Active Agent Workspace
        </button>
      </div>

      {/* Runs List */}
      <div style={{
        backgroundColor: '#0f172a',
        borderRadius: '12px',
        border: '1px solid #1e293b',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
            Recorded Agent Runs ({runHistory.length})
          </div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Persisted in local demo memory
          </span>
        </div>

        {runHistory.length === 0 ? (
          <div style={{
            padding: '36px 20px',
            textAlign: 'center',
            backgroundColor: '#090d16',
            borderRadius: '8px',
            border: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Bot size={36} color="#64748b" />
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#cbd5e1' }}>
              No Agent Runs Recorded Yet
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', maxWidth: '400px' }}>
              Go to the Agent Workspace, enter an operational goal, and click "Start Secure Workflow" to record your first run.
            </div>
            <button
              onClick={() => onNavigate('agent')}
              style={{
                marginTop: '8px',
                padding: '8px 16px',
                borderRadius: '6px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Start Agent Run
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {runHistory.map((run) => {
              const isActive = activeRunId === run.runId;
              const isDone = run.status === 'COMPLETED';

              return (
                <div
                  key={run.id}
                  style={{
                    padding: '18px 20px',
                    borderRadius: '8px',
                    backgroundColor: isActive ? '#091528' : '#090d16',
                    border: `1px solid ${isActive ? '#2563eb' : '#1e293b'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: isActive ? '#2563eb' : '#1e293b',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isDone ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', fontFamily: 'monospace' }}>
                          {run.runId}
                        </span>
                        {isActive && (
                          <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', backgroundColor: '#1e3a8a', color: '#93c5fd' }}>
                            ACTIVE RUN
                          </span>
                        )}
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          backgroundColor: run.demoMode === 'mismatch' ? '#78350f' : '#14532d',
                          color: run.demoMode === 'mismatch' ? '#fde047' : '#86efac'
                        }}>
                          {run.demoMode === 'mismatch' ? 'Demo A (Mismatch)' : 'Demo B (Clean)'}
                        </span>
                      </div>

                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0', marginTop: '4px' }}>
                        "{run.goal}"
                      </div>

                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'flex', gap: '14px' }}>
                        <span>Created: {run.createdAt}</span>
                        <span>Updated: {run.updatedAt}</span>
                        <span>Stages: {run.steps.filter(s => s.status === 'completed').length} / {run.totalSteps}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => {
                        onRestoreRun(run);
                        onNavigate('agent');
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        backgroundColor: '#1e293b',
                        color: '#93c5fd',
                        border: '1px solid #334155',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <RotateCcw size={14} />
                      Restore Agent Run
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
