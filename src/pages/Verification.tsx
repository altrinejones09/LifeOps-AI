import React from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  HelpCircle, 
  FileCheck,
  ShieldCheck,
  Check
} from 'lucide-react';
import { ConsistencyCheckResult, DiscrepancyItem, DemoMode } from '../types';

interface VerificationProps {
  checkResult: ConsistencyCheckResult;
  demoMode: DemoMode;
  onAcknowledgeDiscrepancy: (id: string) => void;
  onNavigateToOpportunities: () => void;
}

export const Verification: React.FC<VerificationProps> = ({
  checkResult,
  demoMode,
  onAcknowledgeDiscrepancy,
  onNavigateToOpportunities
}) => {
  const { overallStatus, totalFieldsChecked, verifiedCount, warningCount, criticalCount, discrepancies } = checkResult;

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
            <ShieldAlert color="#2563eb" />
            Consistency Verification Engine
          </h1>
          <p className="page-subtitle">
            LifeOps compares identity and eligibility fields across your documents before application submission.
          </p>
        </div>

        <div>
          <span className={`badge ${overallStatus === 'verified' ? 'badge-verified' : 'badge-warning'}`} style={{ fontSize: '14px', padding: '6px 14px' }}>
            {overallStatus === 'verified' ? '✓ ALL FIELDS VERIFIED' : '⚠ DISCREPANCIES DETECTED'}
          </span>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div className="card">
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Total Fields Evaluated
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>
            {totalFieldsChecked}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Across 4 Vault Documents</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Verified Consistent
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#15803d', margin: '4px 0' }}>
            {verifiedCount}
          </div>
          <div style={{ fontSize: '12px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} /> 100% Agreement
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Warning Discrepancies
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: warningCount > 0 ? '#b45309' : '#64748b', margin: '4px 0' }}>
            {warningCount}
          </div>
          <div style={{ fontSize: '12px', color: warningCount > 0 ? '#b45309' : '#64748b' }}>
            {warningCount > 0 ? 'Requires Attention' : 'None'}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Critical Blockers
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: criticalCount > 0 ? '#b91c1c' : '#64748b', margin: '4px 0' }}>
            {criticalCount}
          </div>
          <div style={{ fontSize: '12px', color: criticalCount > 0 ? '#b91c1c' : '#64748b' }}>
            {criticalCount > 0 ? 'Action Required' : 'None'}
          </div>
        </div>
      </div>

      {/* VERIFIED STATE BANNER (For Clean Case) */}
      {overallStatus === 'verified' && (
        <div className="card" style={{
          backgroundColor: '#f0fdf4',
          borderColor: '#bbf7d0',
          padding: '24px',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <CheckCircle2 size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#166534', margin: 0 }}>
                ✓ VERIFIED — ALL FIELDS CONSISTENT
              </h3>
              <p style={{ fontSize: '14px', color: '#15803d', marginTop: '6px', lineHeight: 1.5 }}>
                All checked identity and eligibility fields are fully consistent across your available documents. Application data can now be prepared safely from the verified vault.
              </p>
              <button
                onClick={onNavigateToOpportunities}
                className="btn btn-primary"
                style={{ marginTop: '16px', backgroundColor: '#15803d', borderColor: '#166534' }}
              >
                Proceed to Opportunity Eligibility
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISCREPANCY RESULTS LIST (For Mismatch Case) */}
      {discrepancies.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            Cross-Document Discrepancies ({discrepancies.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {discrepancies.map(item => (
              <div
                key={item.id}
                className="card"
                style={{
                  borderColor: item.acknowledged ? '#cbd5e1' : '#fef08a',
                  backgroundColor: item.acknowledged ? '#f8fafc' : '#ffffff',
                  padding: '24px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: item.acknowledged ? '#e2e8f0' : '#fef3c7',
                      color: item.acknowledged ? '#64748b' : '#b45309',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        ⚠ MISMATCH DETECTED: {item.fieldLabel}
                      </h3>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        Evaluated across {item.documents.length} identity documents
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${item.status === 'critical' ? 'badge-critical' : 'badge-warning'}`}>
                      {item.status.toUpperCase()} RISK
                    </span>
                    {item.acknowledged && (
                      <span className="badge badge-info">
                        ACKNOWLEDGED
                      </span>
                    )}
                  </div>
                </div>

                {/* Side by Side Document Comparison Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${item.documents.length}, 1fr)`,
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  {item.documents.map((docVal, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '12px 14px'
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                        {docVal.documentName}
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                        "{docVal.value}"
                      </div>
                    </div>
                  ))}
                </div>

                {/* Explanation & Neutral Suggested Action */}
                <div style={{
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fef08a',
                  borderRadius: '6px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#92400e' }}>
                    Reason for Discrepancy Flag:
                  </div>
                  <p style={{ fontSize: '13px', color: '#78350f', marginTop: '4px' }}>
                    {item.explanation}
                  </p>

                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#92400e', marginTop: '12px' }}>
                    Suggested Procedural Resolution:
                  </div>
                  <p style={{ fontSize: '13px', color: '#78350f', marginTop: '4px', lineHeight: 1.5 }}>
                    {item.suggestedAction}
                  </p>
                </div>

                {/* UPGRADE #7: Interactive Resolution Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '8px' }}>
                  {item.acknowledged ? (
                    <div style={{ fontSize: '13px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={16} />
                      Discrepancy acknowledged. LifeOps will proceed with drafting using primary Aadhaar name while noting initial mismatch in audit trail.
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>
                        Select a resolution action below to unblock drafting:
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => onAcknowledgeDiscrepancy(item.id)}
                          className="btn btn-primary btn-sm"
                        >
                          <CheckCircle2 size={14} />
                          Acknowledge & Continue
                        </button>
                        <button
                          onClick={() => alert(`Marked field "${item.fieldLabel}" for manual document correction in Vault.`)}
                          className="btn btn-outline btn-sm"
                        >
                          Mark for Correction
                        </button>
                        <button
                          onClick={() => onAcknowledgeDiscrepancy(item.id)}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#b45309', borderColor: '#fde047' }}
                        >
                          Continue with Warning
                        </button>
                      </div>
                    </>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* UPGRADE #6: Document Standardizer & Format Normalization Panel */}
      <div className="card" style={{ marginBottom: '28px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileCheck size={18} color="#2563eb" />
          Document Standardizer & Format Normalization Engine
        </h3>
        <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>
          Prior to consistency verification, LifeOps standardizes raw document text into canonical formats to prevent false-positive syntax mismatches.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>Date Format Standardizer</div>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
              Raw: <code>14-07-2006</code> & <code>14/07/2006</code>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#15803d', marginTop: '4px' }}>
              ✓ Normalized to <code>2006-07-14</code> (ISO 8601)
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>Name & Salutation Normalizer</div>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
              Raw: <code>Mr. Aarav Sharma</code> vs <code>AARAV SHARMA</code>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#15803d', marginTop: '4px' }}>
              ✓ Stripped titles & case-normalized
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>Currency & Numeric Parser</div>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
              Raw: <code>₹ 1,80,000 / year</code>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#15803d', marginTop: '4px' }}>
              ✓ Parsed float <code>180000.00 INR</code>
            </div>
          </div>
        </div>
      </div>

      {/* Field Level Verification Log Table */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
          Identity & Eligibility Verification Log
        </h3>

        <table className="civic-table">
          <thead>
            <tr>
              <th>Field Key</th>
              <th>Field Description</th>
              <th>Evaluated Documents</th>
              <th>Match Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>fullName</td>
              <td style={{ fontWeight: 600 }}>Full Applicant Name</td>
              <td>Aadhaar Card, Class 10 Marksheet, Income Certificate, Bank Passbook</td>
              <td>
                {warningCount > 0 ? (
                  <span className="badge badge-warning">⚠ NAME MISMATCH</span>
                ) : (
                  <span className="badge badge-verified">✓ VERIFIED EXACT</span>
                )}
              </td>
            </tr>
            <tr>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>dob</td>
              <td style={{ fontWeight: 600 }}>Date of Birth</td>
              <td>Aadhaar Card ("14-07-2006"), Marksheet ("14/07/2006")</td>
              <td><span className="badge badge-verified">✓ FORMAT NORMALIZED</span></td>
            </tr>
            <tr>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>fatherName</td>
              <td style={{ fontWeight: 600 }}>Father / Guardian Name</td>
              <td>Aadhaar Card, Marksheet, Income Certificate ("R. Kumar")</td>
              <td><span className="badge badge-verified">✓ VERIFIED EXACT</span></td>
            </tr>
            <tr>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>address</td>
              <td style={{ fontWeight: 600 }}>Residential Address</td>
              <td>Aadhaar Card, Income Certificate ("Coimbatore, Tamil Nadu")</td>
              <td><span className="badge badge-verified">✓ VERIFIED EXACT</span></td>
            </tr>
            <tr>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>annualIncome</td>
              <td style={{ fontWeight: 600 }}>Annual Family Income</td>
              <td>Income Certificate ("₹1,80,000")</td>
              <td><span className="badge badge-verified">✓ SINGLE SOURCE</span></td>
            </tr>
            <tr>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>academicPercentage</td>
              <td style={{ fontWeight: 600 }}>Class 10 Score</td>
              <td>Class 10 Marksheet ("87.4%")</td>
              <td><span className="badge badge-verified">✓ SINGLE SOURCE</span></td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
};

