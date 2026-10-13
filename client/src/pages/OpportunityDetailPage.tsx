import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { Internship, AlumniReview } from '@internfit/shared';
import { VerificationBadge, WorkModeBadge, StatusBadge } from '../components/common/Badge';
import { ExternalRedirectModal } from '../components/internships/ExternalRedirectModal';
import { IveAppliedModal } from '../components/internships/IveAppliedModal';
import { SkillMatchModal } from '../components/resume/SkillMatchModal';
import { AlumniReviewCard } from '../components/alumni/AlumniReviewCard';
import { SubmitReviewModal } from '../components/alumni/SubmitReviewModal';
import {
  MapPin,
  Calendar,
  Banknote,
  Bookmark,
  ExternalLink,
  CheckCircle,
  Sparkles,
  ShieldCheck,
  Building,
  Info,
  Clock,
  ArrowLeft,
  Loader2,
  GraduationCap,
  MessageSquare,
} from 'lucide-react';

export const OpportunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [internship, setInternship] = useState<Internship | null>(null);
  const [reviews, setReviews] = useState<AlumniReview[]>([]);
  const [loading, setLoading] = useState(true);

  const [redirectModalOpen, setRedirectModalOpen] = useState(false);
  const [appliedModalOpen, setAppliedModalOpen] = useState(false);
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [submitReviewModalOpen, setSubmitReviewModalOpen] = useState(false);

  const fetchDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/internships/${id}`);
      if (res.data.success) {
        setInternship(res.data.internship);
        setReviews(res.data.reviews || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleToggleSave = async () => {
    if (!internship) return;
    try {
      const res = await api.post(`/internships/${internship.id}/save`);
      setInternship({ ...internship, isSaved: res.data.isSaved });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        <span className="text-sm text-slate-500">Loading opportunity details...</span>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-800">Opportunity not found</h3>
        <p className="text-xs text-slate-500">The listing may have expired, closed, or moved.</p>
        <Link to="/opportunities" className="inline-block px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold">
          Back to Listings
        </Link>
      </div>
    );
  }

  let destinationDomain = 'official-portal';
  try {
    destinationDomain = new URL(internship.originalApplicationUrl).hostname;
  } catch {
    destinationDomain = 'official-portal';
  }

  const requiredSkills = internship.skills?.filter(s => s.skillType === 'required') || [];
  const preferredSkills = internship.skills?.filter(s => s.skillType === 'preferred') || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Opportunities
        </Link>
      </div>

      {/* Main Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                {internship.companyName}
              </span>
              <VerificationBadge status={internship.verificationStatus} />
              <WorkModeBadge mode={internship.workMode} />
              {internship.applicationStatus && <StatusBadge status={internship.applicationStatus} />}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {internship.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                {internship.location}
              </span>
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Banknote className="w-4 h-4 text-slate-400" />
                {internship.stipendAmount}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-slate-400" />
                Duration: {internship.duration}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                Deadline: {internship.applicationDeadline ? new Date(internship.applicationDeadline).toLocaleDateString('en-IN') : 'Ongoing'}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            <button
              onClick={() => setRedirectModalOpen(true)}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>Apply Now</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            {!internship.applicationStatus && (
              <button
                onClick={() => setAppliedModalOpen(true)}
                className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                I've Applied
              </button>
            )}

            <button
              onClick={() => setMatchModalOpen(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Analyze My Match
            </button>

            <button
              onClick={handleToggleSave}
              className={`px-4 py-2 border rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                internship.isSaved
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${internship.isSaved ? 'fill-amber-500' : ''}`} />
              {internship.isSaved ? 'Saved in Bookmarks' : 'Save Opportunity'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Description & Responsibilities & Skills */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Opportunity Description & Overview
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {internship.description}
            </p>
          </div>

          {/* Responsibilities */}
          {internship.responsibilities && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Key Responsibilities & Scope
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {internship.responsibilities}
              </p>
            </div>
          )}

          {/* Selection Process */}
          {internship.selectionProcess && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Selection & Evaluation Process
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {internship.selectionProcess}
              </p>
            </div>
          )}

          {/* Verified Alumni Reviews Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Verified Alumni Experiences ({reviews.length})
                </h3>
              </div>

              {user && (user.role === 'alumni' || user.role === 'admin_placement_cell') && (
                <button
                  onClick={() => setSubmitReviewModalOpen(true)}
                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                  Write Review
                </button>
              )}
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No alumni reviews posted for {internship.companyName} yet. Verified alumni can share advice above.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <AlumniReviewCard key={r.id} review={r} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Stated Criteria, Skills, and Provenance */}
        <div className="space-y-6">
          {/* Stated Eligibility Requirements */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-slate-500 text-xs">
              Stated Employer Eligibility
            </h3>
            <div className="space-y-2.5">
              <div>
                <span className="text-slate-400 block font-medium">Eligible Degrees:</span>
                <span className="text-slate-800 font-semibold">
                  {internship.eligibleDegrees?.length > 0 ? internship.eligibleDegrees.join(', ') : 'Open to all programs'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Eligible Years:</span>
                <span className="text-slate-800 font-semibold">
                  {internship.eligibleYears?.length > 0 ? internship.eligibleYears.map(y => `Year ${y}`).join(', ') : 'All years eligible'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Eligible Branches:</span>
                <span className="text-slate-800 font-semibold">
                  {internship.eligibleBranches?.length > 0 ? internship.eligibleBranches.join(', ') : 'Open to all engineering branches'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Minimum Cutoff:</span>
                <span className="text-slate-800 font-semibold">
                  {internship.minCgpa ? `${internship.minCgpa} CGPA` : 'No explicit cutoff stated'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Backlog Policy:</span>
                <span className="text-slate-800 font-semibold">
                  {internship.allowsBacklogs ? 'Active backlogs permitted' : '0 active backlogs mandated'}
                </span>
              </div>
            </div>
          </div>

          {/* Required Skills */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold uppercase tracking-wider text-slate-500 text-xs">
              Required Skills ({requiredSkills.length})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {requiredSkills.map((s, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                  {s.skillName}
                </span>
              ))}
            </div>

            {preferredSkills.length > 0 && (
              <>
                <h3 className="font-bold uppercase tracking-wider text-slate-500 text-xs pt-2">
                  Preferred / Bonus Skills ({preferredSkills.length})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {preferredSkills.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                      {s.skillName}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Provenance & Audit Transparency */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 shadow-sm space-y-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Traceability & Audit Evidence
            </div>
            <div className="space-y-1.5 leading-relaxed">
              <div><strong className="text-slate-700">Source:</strong> {internship.sourceType.replace(/_/g, ' ')}</div>
              <div><strong className="text-slate-700">Destination:</strong> <span className="font-mono">{destinationDomain}</span></div>
              {internship.sourceEvidenceNotes && (
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-600 italic">
                  "{internship.sourceEvidenceNotes}"
                </div>
              )}
              <div className="text-[10px] text-slate-400 pt-1">
                Last checked by system: {new Date(internship.lastCheckedAt).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ExternalRedirectModal
        isOpen={redirectModalOpen}
        onClose={() => setRedirectModalOpen(false)}
        internshipTitle={internship.title}
        companyName={internship.companyName}
        destinationUrl={internship.originalApplicationUrl}
        destinationDomain={destinationDomain}
        onConfirmedOpen={() => {}}
      />

      <IveAppliedModal
        isOpen={appliedModalOpen}
        onClose={() => setAppliedModalOpen(false)}
        internshipId={internship.id}
        internshipTitle={internship.title}
        companyName={internship.companyName}
        onSuccess={fetchDetails}
      />

      <SkillMatchModal
        isOpen={matchModalOpen}
        onClose={() => setMatchModalOpen(false)}
        internshipId={internship.id}
        internshipTitle={internship.title}
        companyName={internship.companyName}
      />

      <SubmitReviewModal
        isOpen={submitReviewModalOpen}
        onClose={() => setSubmitReviewModalOpen(false)}
        defaultCompanyName={internship.companyName}
        defaultInternshipId={internship.id}
        onSuccess={() => {
          alert('Thank you! Your review has been submitted for placement cell moderation.');
          fetchDetails();
        }}
      />
    </div>
  );
};
