import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Filter, 
  Building2, 
  Calendar,
  FileCheck
} from 'lucide-react';
import { Opportunity, OpportunityCategory, UserDocument } from '../types';
import { MOCK_OPPORTUNITIES } from '../data/mockOpportunities';
import { evaluateEligibility } from '../engine/eligibilityEngine';

interface OpportunitiesProps {
  documents: UserDocument[];
  onCreateDraft: (opportunity: Opportunity) => void;
}

export const Opportunities: React.FC<OpportunitiesProps> = ({
  documents,
  onCreateDraft
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories: string[] = [
    'ALL',
    'Government Schemes',
    'Scholarships',
    'Certificates',
    'Education',
    'Employment'
  ];

  const filteredOpportunities = selectedCategory === 'ALL'
    ? MOCK_OPPORTUNITIES
    : MOCK_OPPORTUNITIES.filter(o => o.category === selectedCategory);

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
            <Sparkles color="#2563eb" />
            Opportunity Center
          </h1>
          <p className="page-subtitle">
            Administrative applications, government schemes, scholarships, and official identity certificates matched against your verified profile.
          </p>
        </div>
      </div>

      {/* Category Tabs Filter */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '20px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '12px',
        flexWrap: 'wrap'
      }}>
        <Filter size={16} color="#64748b" style={{ marginRight: '4px' }} />
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: '20px' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* UPGRADE #8: Opportunity Engine Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #2563eb' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Discovered Opportunities</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{MOCK_OPPORTUNITIES.length} Total</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Schemes, Scholarships & Grants</div>
        </div>

        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #15803d' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Eligible Matches</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#15803d', marginTop: '2px' }}>
            {MOCK_OPPORTUNITIES.filter(o => evaluateEligibility(o, documents).isEligible).length} Eligible
          </div>
          <div style={{ fontSize: '12px', color: '#15803d' }}>All prerequisites satisfied</div>
        </div>

        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #b91c1c' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Ineligible / Missing Docs</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#b91c1c', marginTop: '2px' }}>
            {MOCK_OPPORTUNITIES.filter(o => !evaluateEligibility(o, documents).isEligible).length} Ineligible
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Missing document or criteria</div>
        </div>
      </div>

      {/* Opportunities List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredOpportunities.map(opp => {
          const evalResult = evaluateEligibility(opp, documents);

          return (
            <div
              key={opp.id}
              className="card card-hover"
              style={{ padding: '24px' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-info">{opp.category}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>• {opp.type}</span>
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    {opp.title}
                  </h2>
                  <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Building2 size={14} color="#64748b" /> {opp.authority}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} color="#64748b" /> Deadline: {opp.deadline}
                    </span>
                  </div>
                </div>

                {/* Eligibility Status Badge */}
                <div>
                  {evalResult.isEligible ? (
                    <span className="badge badge-verified" style={{ fontSize: '13px', padding: '6px 12px' }}>
                      <CheckCircle2 size={16} /> MATCHED ({evalResult.matchedCount}/{evalResult.totalCriteria} Criteria)
                    </span>
                  ) : (
                    <span className="badge badge-critical" style={{ fontSize: '13px', padding: '6px 12px' }}>
                      <XCircle size={16} /> NOT ELIGIBLE ({evalResult.matchedCount}/{evalResult.totalCriteria} Criteria)
                    </span>
                  )}
                </div>
              </div>

              <p style={{ fontSize: '14px', color: '#334155', marginTop: '12px', lineHeight: 1.5 }}>
                {opp.description}
              </p>

              {/* Criteria Evaluation Breakdown */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '16px',
                marginTop: '16px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Rule Engine Eligibility Evaluation
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {evalResult.details.map((detail, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        padding: '10px 12px',
                        borderRadius: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {detail.passed ? (
                          <CheckCircle2 size={16} color="#15803d" />
                        ) : (
                          <XCircle size={16} color="#b91c1c" />
                        )}
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                          {detail.criterionLabel}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Actual: <strong>{detail.actualValue}</strong> ({detail.requiredValue})
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Create Draft Button */}
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => onCreateDraft(opp)}
                  className="btn btn-primary"
                >
                  <FileCheck size={16} />
                  Create Application Draft
                  <ArrowRight size={16} />
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
