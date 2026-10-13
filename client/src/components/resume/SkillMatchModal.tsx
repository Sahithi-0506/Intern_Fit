import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../api/client';
import { ResumeAnalysis } from '@internfit/shared';
import { EligibilityBadge } from '../common/Badge';
import {
  Sparkles,
  CheckCircle,
  XCircle,
  Lightbulb,
  Loader2,
  AlertCircle,
  GraduationCap,
  Info,
} from 'lucide-react';

interface SkillMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  internshipId: string;
  internshipTitle: string;
  companyName: string;
}

export const SkillMatchModal: React.FC<SkillMatchModalProps> = ({
  isOpen,
  onClose,
  internshipId,
  internshipTitle,
  companyName,
}) => {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [formulaExplanation, setFormulaExplanation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && internshipId) {
      runAnalysis();
    }
  }, [isOpen, internshipId]);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/resume/analyze-match/${internshipId}`);
      if (res.data.success) {
        setAnalysis(res.data.analysis);
        setFormulaExplanation(res.data.formulaExplanation);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze resume match against this internship.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Resume Skill Match & Eligibility Analysis" maxWidth="xl">
      <div className="space-y-6 text-slate-800">
        {/* Role & Company Header */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
              {companyName}
            </span>
            <h4 className="text-base font-bold text-slate-900">{internshipTitle}</h4>
          </div>
          {analysis && (
            <div className="text-right">
              <EligibilityBadge result={analysis.eligibilityOverall} />
              <span className="text-[10px] text-slate-400 block mt-1">Independent Evaluation</span>
            </div>
          )}
        </div>

        {loading && (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <span className="text-sm font-medium text-slate-600">Comparing resume text with internship requirements...</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">Analysis Notice</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {analysis && !loading && (
          <div className="space-y-6 animate-fade-in">
            {/* 1. Skill Coverage Gauge & Math */}
            <div className="p-5 bg-teal-50/60 border border-teal-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-900">
                    Required-Skill Coverage
                  </span>
                </div>
                <div className="text-xs text-teal-800 leading-relaxed font-mono">
                  {formulaExplanation}
                </div>
              </div>
              <div className="px-5 py-3 rounded-xl bg-teal-600 text-white flex flex-col items-center justify-center shrink-0 shadow-sm shadow-teal-900/20">
                <span className="text-3xl font-black">{analysis.skillCoveragePercentage}%</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-100">Match Score</span>
              </div>
            </div>

            {/* 2. Matched vs Missing Skills breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Matched Required Skills */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Matched Required Skills ({analysis.matchedSkills.length})
                </h5>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {analysis.matchedSkills.length > 0 ? (
                    analysis.matchedSkills.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">None detected in resume</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Missing Required Skills ({analysis.missingSkills.length})
                </h5>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {analysis.missingSkills.length > 0 ? (
                    analysis.missingSkills.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-emerald-600 font-medium">All required skills matched!</span>
                  )}
                </div>
              </div>
            </div>

            {/* Matched Preferred Skills if any */}
            {analysis.preferredMatchedSkills.length > 0 && (
              <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl">
                <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-800 mb-2">
                  Bonus: Matched Preferred Skills ({analysis.preferredMatchedSkills.length})
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.preferredMatchedSkills.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white text-indigo-700 border border-indigo-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Learning Recommendations */}
            {analysis.learningRecommendations.length > 0 && (
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  Targeted Learning Recommendations
                </h5>
                <ul className="space-y-1.5 text-xs text-amber-950">
                  {analysis.learningRecommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 4. Separate Independent Eligibility Evaluation */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-slate-600" />
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Separate Academic Eligibility Breakdown
                </h5>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                {analysis.eligibilityBreakdown.map((item, idx) => (
                  <div key={idx} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white">
                    <div>
                      <span className="font-bold text-slate-800">{item.label}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.reason}</p>
                    </div>
                    <EligibilityBadge result={item.status} />
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 flex items-start gap-2 leading-relaxed">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong>Limitation Notice:</strong> This analysis is performed strictly via rule-based natural language processing
                comparing your uploaded resume with stated employer criteria. It does not represent an official employer screening decision.
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
