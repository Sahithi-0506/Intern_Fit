import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Internship } from '@internfit/shared';
import { VerificationBadge, WorkModeBadge, EligibilityBadge, StatusBadge } from '../common/Badge';
import { ExternalRedirectModal } from './ExternalRedirectModal';
import { IveAppliedModal } from './IveAppliedModal';
import {
  MapPin,
  Calendar,
  Banknote,
  Bookmark,
  ExternalLink,
  CheckCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface InternshipCardProps {
  internship: Internship;
  onToggleSave: (id: string) => void;
  onMatchSkills?: (internship: Internship) => void;
  onRefresh?: () => void;
}

export const InternshipCard: React.FC<InternshipCardProps> = ({
  internship,
  onToggleSave,
  onMatchSkills,
  onRefresh,
}) => {
  const [redirectModalOpen, setRedirectModalOpen] = useState(false);
  const [appliedModalOpen, setAppliedModalOpen] = useState(false);

  // Parse destination domain safely
  let destinationDomain = 'official-portal';
  try {
    destinationDomain = new URL(internship.originalApplicationUrl).hostname;
  } catch {
    destinationDomain = 'official-portal';
  }

  // Format deadline
  const formatDeadline = (dateStr: string | null) => {
    if (!dateStr) return 'Rolling intake / Ongoing';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-xl border border-pink-100 shadow-xs hover:border-pink-300 hover:shadow-sm transition-all p-6 flex flex-col justify-between group">
      <div>
        {/* Top Badges & Save action */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <VerificationBadge status={internship.verificationStatus} />
            <WorkModeBadge mode={internship.workMode} />
            {internship.applicationStatus && (
              <StatusBadge status={internship.applicationStatus} />
            )}
          </div>

          <button
            onClick={() => onToggleSave(internship.id)}
            className={`p-1.5 rounded-lg border transition-colors ${
              internship.isSaved
                ? 'bg-amber-50 text-amber-600 border-amber-200'
                : 'text-slate-400 hover:text-slate-600 border-pink-100 hover:bg-pink-50'
            }`}
            title={internship.isSaved ? 'Remove from saved' : 'Save internship'}
          >
            <Bookmark className={`w-4 h-4 ${internship.isSaved ? 'fill-amber-500' : ''}`} />
          </button>
        </div>

        {/* Company & Role */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              {internship.companyName}
            </span>
          </div>
          <Link
            to={`/opportunities/${internship.id}`}
            className="text-lg font-bold text-slate-900 group-hover:text-rose-700 transition-colors line-clamp-1 mt-0.5"
          >
            {internship.title}
          </Link>
        </div>

        {/* Short Description */}
        <p className="text-slate-600 text-xs line-clamp-2 mb-4 leading-relaxed">
          {internship.description}
        </p>

        {/* Key Attributes Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4 bg-pink-50/40 p-3 rounded-lg border border-pink-100">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{internship.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Banknote className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-800">{internship.stipendAmount}</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Deadline: {formatDeadline(internship.applicationDeadline)}</span>
          </div>
        </div>

        {/* Skills Tag preview */}
        {internship.skills && internship.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {internship.skills.slice(0, 4).map((s, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700"
              >
                {s.skillName}
              </span>
            ))}
            {internship.skills.length > 4 && (
              <span className="px-1.5 py-0.5 rounded text-[11px] text-slate-400">
                +{internship.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-pink-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link
            to={`/opportunities/${internship.id}`}
            className="text-xs font-semibold text-slate-700 hover:text-rose-700 flex items-center gap-1 py-1.5 px-2.5 rounded-lg hover:bg-pink-50 transition-colors"
          >
            Details
            <ArrowRight className="w-3 h-3" />
          </Link>

          {onMatchSkills && (
            <button
              onClick={() => onMatchSkills(internship)}
              className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-pink-50 hover:bg-pink-100/80 border border-pink-200 transition-colors"
              title="Compare resume with internship requirements"
            >
              <Sparkles className="w-3 h-3 text-rose-600" />
              Match Skills
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Apply Now button -> opens destination modal */}
          <button
            onClick={() => setRedirectModalOpen(true)}
            className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 py-1.5 px-3.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all shadow-rose-900/10"
          >
            Apply Now
            <ExternalLink className="w-3 h-3" />
          </button>

          {/* Explicit "I've Applied" button */}
          {!internship.applicationStatus && (
            <button
              onClick={() => setAppliedModalOpen(true)}
              className="text-xs font-semibold text-rose-700 hover:bg-pink-50 border border-pink-200 py-1.5 px-2.5 rounded-lg flex items-center gap-1 transition-colors"
              title="Record that you submitted this application on the external portal"
            >
              <CheckCircle className="w-3 h-3 text-rose-600" />
              I've Applied
            </button>
          )}
        </div>
      </div>

      {/* Destination Modal */}
      <ExternalRedirectModal
        isOpen={redirectModalOpen}
        onClose={() => setRedirectModalOpen(false)}
        internshipTitle={internship.title}
        companyName={internship.companyName}
        destinationUrl={internship.originalApplicationUrl}
        destinationDomain={destinationDomain}
        onConfirmedOpen={() => {
          // Keep applied button visible so student can confirm upon return
        }}
      />

      {/* I've Applied Confirmation Modal */}
      <IveAppliedModal
        isOpen={appliedModalOpen}
        onClose={() => setAppliedModalOpen(false)}
        internshipId={internship.id}
        internshipTitle={internship.title}
        companyName={internship.companyName}
        onSuccess={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
};
