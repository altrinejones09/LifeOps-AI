import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  Lock, 
  ShieldCheck,
  Clock
} from 'lucide-react';
import { ApplicationDraft } from '../types';

interface ApplicationsProps {
  applications: ApplicationDraft[];
  onNavigateToApproval: (appId: string) => void;
  onNavigateToAudit: () => void;
}

export const Applications: React.FC<ApplicationsProps> = ({
  applications,
  onNavigateToApproval,
  onNavigateToAudit
}) => {
  return (
    <div>
      <div className="page-header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        padding: '24px 32px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        marginBottom: '24px'
      }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText color="#2563eb" />
            Application Drafts
          </h1>
          <p className="page-subtitle">
            Applications automatically populated using ONLY verified data extracted from your document vault.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {applications.map(app => (
          <div key={app.id} className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge badge-info">{app.category}</span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>• Ref ID: {app.referenceId || app.id}</span>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {app.opportunityTitle}
                </h2>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={14} /> Authority: {app.authority}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${app.status === 'SUBMITTED' ? 'badge-verified' : 'badge-warning'}`} style={{ fontSize: '13px', padding: '6px 12px' }}>
                  {app.status === 'SUBMITTED' ? '✓ SUBMITTED' : '● DRAFT — AWAITING APPROVAL'}
                </span>
                {app.submittedAt && (
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                    Submitted: {app.submittedAt}
                  </div>
                )}
              </div>
            </div>

            {/* Application Data Provenance Notice */}
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <ShieldCheck size={16} />
              <span>
                <strong>Data Provenance Verified:</strong> All values in this application were populated strictly from your verified vault documents. No unverified or invented data exists.
              </span>
            </div>

            {/* Prepared Fields Table */}
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              Prepared Form Fields ({app.fields.length})
            </h3>

            <table className="civic-table">
              <thead>
                <tr>
                  <th>Field Description</th>
                  <th>Populated Form Value</th>
                  <th>Vault Document Source</th>
                  <th>Sensitivity</th>
                </tr>
              </thead>
              <tbody>
                {app.fields.map((f, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{f.label}</td>
                    <td style={{ fontFamily: f.sensitive ? 'var(--font-mono)' : 'inherit', fontWeight: 500 }}>
                      {f.value}
                    </td>
                    <td>
                      <span className="provenance-tag">
                        {f.sourceDocument}
                      </span>
                    </td>
                    <td>
                      {f.sensitive ? (
                        <span style={{ fontSize: '11px', color: '#4338ca', backgroundColor: '#e0e7ff', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                          <Lock size={11} /> Sensitive Data
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Standard</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer Action */}
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              {app.status === 'SUBMITTED' ? (
                <button
                  onClick={onNavigateToAudit}
                  className="btn btn-outline"
                >
                  View Immutable Audit Event
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => onNavigateToApproval(app.id)}
                  className="btn btn-primary"
                >
                  <Clock size={16} />
                  Proceed to Field-Level Approval Center
                  <ArrowRight size={16} />
                </button>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
