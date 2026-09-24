import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Filter, 
  Building2, 
  Calendar,
  FileCheck,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Opportunity, UserDocument } from '../types';
import { MOCK_OPPORTUNITIES } from '../data/mockOpportunities';
import { evaluateEligibility } from '../engine/eligibilityEngine';
import { useLanguage } from '../context/LanguageContext';

interface OpportunitiesProps {
  documents: UserDocument[];
  onCreateDraft: (opportunity: Opportunity) => void;
}

export const Opportunities: React.FC<OpportunitiesProps> = ({
  documents,
  onCreateDraft
}) => {
  const { t } = useLanguage();
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
    <div style={{ color: '#f8fafc' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0f172a',
        padding: '24px 32px',
        borderRadius: '12px',
        border: '1px solid #1e293b',
        marginBottom: '24px'
      }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            PROTOTYPE DATASET
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#ffffff' }}>
            <Sparkles color="#3b82f6" size={26} />
            {t.navOpportunities}
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
            Prototype opportunities evaluated locally against your verified profile.
          </p>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          color: '#38bdf8',
          fontWeight: 600
        }}>
          <ShieldCheck size={14} />
          {MOCK_OPPORTUNITIES.length} Prototype Opportunities Available
        </div>
      </div>

      {/* Category Tabs Filter */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '20px',
        borderBottom: '1px solid #1e293b',
        paddingBottom: '12px',
        flexWrap: 'wrap'
      }}>
        <Filter size={16} color="#94a3b8" style={{ marginRight: '4px' }} />
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              padding: '6px 14px',
              border: '1px solid #334155',
              backgroundColor: selectedCategory === cat ? '#2563eb' : '#1e293b',
              color: selectedCategory === cat ? '#ffffff' : '#94a3b8',
              cursor: 'pointer'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderLeft: '4px solid #2563eb', borderRadius: '10px', padding: '16px 20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Prototype Dataset</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>{MOCK_OPPORTUNITIES.length} Total</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Demo Schemes, Scholarships & Grants</div>
        </div>

        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderLeft: '4px solid #15803d', borderRadius: '10px', padding: '16px 20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Eligible Matches</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#4ade80', marginTop: '2px' }}>
            {MOCK_OPPORTUNITIES.filter(o => evaluateEligibility(o, documents).isEligible).length} Eligible
          </div>
          <div style={{ fontSize: '12px', color: '#4ade80' }}>All prerequisites satisfied</div>
        </div>

        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderLeft: '4px solid #b91c1c', borderRadius: '10px', padding: '16px 20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Ineligible / Missing Docs</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#fca5a5', marginTop: '2px' }}>
            {MOCK_OPPORTUNITIES.filter(o => !evaluateEligibility(o, documents).isEligible).length} Ineligible
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Missing document or criteria</div>
        </div>
      </div>

      {/* Opportunities List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredOpportunities.map(opp => {
          const evalResult = evaluateEligibility(opp, documents);

          return (
            <div
              key={opp.id}
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '12px',
                padding: '24px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', backgroundColor: '#1e293b', border: '1px solid #334155', padding: '2px 8px', borderRadius: '4px' }}>
                      DEMO OPPORTUNITY
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{opp.category} • {opp.type}</span>
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    {opp.title}
                  </h2>
                  <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Building2 size={14} color="#94a3b8" /> {opp.authority}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} color="#94a3b8" /> Deadline: {opp.deadline}
                    </span>
                    {opp.sourceUrl && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#60a5fa' }}>
                        <ExternalLink size={14} /> Reference Source: {opp.sourceName || 'Official Portal'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Eligibility Status Badge */}
                <div>
                  {evalResult.isEligible ? (
                    <span style={{ fontSize: '12px', fontWeight: 700, padding: '6px 12px', borderRadius: '20px', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid #15803d', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} /> MATCHED ({evalResult.matchedCount}/{evalResult.totalCriteria} Criteria)
                    </span>
                  ) : (
                    <span style={{ fontSize: '12px', fontWeight: 700, padding: '6px 12px', borderRadius: '20px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: '1px solid #991b1b', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <XCircle size={16} /> NOT ELIGIBLE ({evalResult.matchedCount}/{evalResult.totalCriteria} Criteria)
                    </span>
                  )}
                </div>
              </div>

              <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '12px', lineHeight: 1.5 }}>
                {opp.description}
              </p>

              {/* Criteria Evaluation Breakdown */}
              <div style={{
                backgroundColor: '#090d16',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '16px',
                marginTop: '16px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '10px' }}>
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
                        backgroundColor: '#0f172a',
                        border: '1px solid #1e293b',
                        padding: '10px 12px',
                        borderRadius: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {detail.passed ? (
                          <CheckCircle2 size={16} color="#4ade80" />
                        ) : (
                          <XCircle size={16} color="#fca5a5" />
                        )}
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                          {detail.criterionLabel}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        Actual: <strong style={{ color: '#ffffff' }}>{detail.actualValue}</strong> ({detail.requiredValue})
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Create Draft Button */}
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => onCreateDraft(opp)}
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  <FileCheck size={16} />
                  {t.btnCreateDraft}
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
