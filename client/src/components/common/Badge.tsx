import React from 'react';
import { RiskLevel, VerificationStatus, EligibilityResult, WorkMode, ApplicationStatus } from '@internfit/shared';
import { ShieldCheck, ShieldAlert, AlertTriangle, HelpCircle, CheckCircle, Clock } from 'lucide-react';

export const RiskBadge: React.FC<{ level: RiskLevel }> = ({ level }) => {
  switch (level) {
    case 'lower_risk':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Lower Observed Risk
        </span>
      );
    case 'moderate_risk':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          Moderate Observed Risk
        </span>
      );
    case 'high_risk':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          High Observed Risk
        </span>
      );
    case 'insufficient_evidence':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          Insufficient Evidence
        </span>
      );
  }
};

export const VerificationBadge: React.FC<{ status: VerificationStatus }> = ({ status }) => {
  if (status === 'placement_cell_verified') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-pink-50 text-rose-800 border border-pink-200" title="Reviewed and verified by college placement cell">
        <CheckCircle className="w-3 h-3 text-rose-600" />
        Placement Verified
      </span>
    );
  }
  if (status === 'third_party_verified') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
        <CheckCircle className="w-3 h-3 text-blue-600" />
        Corporate Verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
      <Clock className="w-3 h-3 text-slate-400" />
      Unverified Source
    </span>
  );
};

export const EligibilityBadge: React.FC<{ result: EligibilityResult }> = ({ result }) => {
  switch (result) {
    case 'eligible':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
          Eligible
        </span>
      );
    case 'ineligible':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          Ineligible
        </span>
      );
    case 'unable_to_determine':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          Criteria Incomplete
        </span>
      );
  }
};

export const WorkModeBadge: React.FC<{ mode: WorkMode }> = ({ mode }) => {
  switch (mode) {
    case 'remote':
      return <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">Remote</span>;
    case 'hybrid':
      return <span className="px-2 py-0.5 rounded text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">Hybrid</span>;
    case 'onsite':
      return <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Onsite</span>;
    default:
      return <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">Location TBD</span>;
  }
};

export const StatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
  const map: Record<ApplicationStatus, { label: string; color: string }> = {
    saved: { label: 'Saved', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    applied_self_reported: { label: 'Applied (Self-reported)', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    under_review: { label: 'Under Review', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    shortlisted: { label: 'Shortlisted', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    interview: { label: 'Interview Scheduled', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    selected: { label: 'Selected / Offer', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Not Selected', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    withdrawn: { label: 'Withdrawn', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  };

  const item = map[status] || { label: status, color: 'bg-slate-100 text-slate-700 border-slate-200' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${item.color}`}>
      {item.label}
    </span>
  );
};
