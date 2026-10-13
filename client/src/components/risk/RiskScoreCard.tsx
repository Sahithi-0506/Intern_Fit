import React from 'react';
import { UrlRiskAssessment } from '@internfit/shared';
import { RiskBadge } from '../common/Badge';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Globe,
  ExternalLink,
  Info,
  CheckCircle,
  Flag,
} from 'lucide-react';

interface RiskScoreCardProps {
  assessment: UrlRiskAssessment;
  onReport?: () => void;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ assessment, onReport }) => {
  // Score styling
  const getScoreColor = (score: number) => {
    if (score >= 60) return 'text-rose-600 bg-rose-50 border-rose-200';
    if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-slate-800">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <RiskBadge level={assessment.riskLevel} />
            {assessment.isReviewedByPlacementCell && (
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                Placement Cell Audited
              </span>
            )}
          </div>
          <h4 className="text-lg font-bold text-slate-900 flex items-center gap-1.5 mt-2">
            <Globe className="w-4 h-4 text-slate-400" />
            {assessment.destinationDomain}
          </h4>
          <p className="text-xs text-slate-500 font-mono break-all mt-0.5">
            {assessment.submittedUrl}
          </p>
        </div>

        {/* Score indicator */}
        <div className={`px-4 py-3 rounded-xl border flex flex-col items-center justify-center shrink-0 ${getScoreColor(assessment.evidenceScore)}`}>
          <span className="text-2xl font-black">{assessment.evidenceScore}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Evidence Score / 100</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Destination & Redirect details */}
        {assessment.finalDestinationUrl && assessment.finalDestinationUrl !== assessment.submittedUrl && (
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Redirect Hop Detected:</span> Destination resolved across network hops to:
              <div className="font-mono text-slate-700 break-all mt-0.5">{assessment.finalDestinationUrl}</div>
            </div>
          </div>
        )}

        {/* Warning Signs */}
        {assessment.warningSigns.length > 0 && (
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Observed Risk Indicators & Warning Signs ({assessment.warningSigns.length})
            </h5>
            <ul className="space-y-1.5">
              {assessment.warningSigns.map((warning, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Positive Indicators */}
        {assessment.positiveIndicators.length > 0 && (
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Positive Trust Signals & Corporate Alignment ({assessment.positiveIndicators.length})
            </h5>
            <ul className="space-y-1.5">
              {assessment.positiveIndicators.map((pos, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{pos}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Official Source Evidence */}
        {assessment.officialSourceEvidence && (
          <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-lg text-xs text-teal-900">
            <span className="font-bold">Official Verification Trace:</span> {assessment.officialSourceEvidence}
          </div>
        )}

        {/* Missing or Inaccessible notes */}
        {assessment.missingEvidenceNotes && (
          <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Inspection Notice:</span> {assessment.missingEvidenceNotes}
            </div>
          </div>
        )}

        {/* Safety Precautions & Guidance */}
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Recommended Student Precautions</h5>
          <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
            {assessment.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>

        {/* Limitation Statement */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
          <strong>Transparency Disclaimer:</strong> This score is based solely on observable technical signals, domain reputation,
          and public text patterns at the time of inspection. A lower score does NOT guarantee genuine employment or an authentic offer.
          Never pay money or disclose banking/OTP details for any internship.
        </div>
      </div>
    </div>
  );
};
