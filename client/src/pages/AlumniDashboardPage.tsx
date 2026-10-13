import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import { AlumniReview } from '@internfit/shared';
import { SubmitReviewModal } from '../components/alumni/SubmitReviewModal';
import { Modal } from '../components/common/Modal';
import {
  GraduationCap,
  CheckCircle,
  Clock,
  Plus,
  MessageSquare,
  AlertCircle,
  XCircle,
  Briefcase,
  ExternalLink,
  Trash2,
  Send,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AlumniDashboardPage: React.FC = () => {
  const { user, alumniProfile, refreshUser } = useAuth();
  const [reviews, setReviews] = useState<AlumniReview[]>([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [requestAccessModalOpen, setRequestAccessModalOpen] = useState(false);
  const [requestNote, setRequestNote] = useState('');
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Status state
  const [accessStatus, setAccessStatus] = useState<string>('not_requested');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  const fetchReviewsAndStatus = async () => {
    setLoading(true);
    try {
      const [reviewRes, statusRes] = await Promise.all([
        api.get('/alumni/my-reviews'),
        api.get('/alumni/access-status').catch(() => ({ data: { success: false } })),
      ]);

      if (reviewRes.data.success) {
        setReviews(reviewRes.data.items);
      }

      if (statusRes.data?.success) {
        setAccessStatus(statusRes.data.verificationStatus);
        setRejectionReason(statusRes.data.rejectionReason);
      } else if (alumniProfile?.verificationStatus) {
        setAccessStatus(alumniProfile.verificationStatus);
        setRejectionReason(alumniProfile.rejectionReason);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsAndStatus();
  }, []);

  const isVerified = accessStatus === 'approved';

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestingAccess(true);
    setAccessError(null);

    try {
      await api.post('/alumni/request-access', {
        requestNote: requestNote.trim() || undefined,
      });
      setRequestAccessModalOpen(false);
      setRequestNote('');
      await refreshUser();
      await fetchReviewsAndStatus();
    } catch (err: any) {
      setAccessError(err.response?.data?.message || err.message || 'Failed to submit access request.');
    } finally {
      setRequestingAccess(false);
    }
  };

  const handleWithdrawReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to withdraw this review?')) return;
    try {
      await api.delete(`/alumni/reviews/${reviewId}`);
      fetchReviewsAndStatus();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to withdraw review.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f9] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl border border-pink-100 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-rose-700 text-xs font-bold uppercase tracking-wider mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              Alumni Experience Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Alumni Portal
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Share authentic internship feedback, career advice, and work culture insights with students.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isVerified ? (
              <button
                onClick={() => setReviewModalOpen(true)}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm shadow-rose-200 transition"
              >
                <Plus className="w-4 h-4" />
                Submit Internship Review
              </button>
            ) : accessStatus === 'pending' ? (
              <div className="text-xs font-semibold px-3 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Access Request Pending
              </div>
            ) : (
              <button
                onClick={() => setRequestAccessModalOpen(true)}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm shadow-rose-200 transition"
              >
                <Send className="w-4 h-4" />
                Request Alumni Access
              </button>
            )}

            <Link
              to="/opportunities"
              className="px-3.5 py-2.5 rounded-xl border border-pink-200 text-rose-700 hover:bg-pink-50 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Briefcase className="w-3.5 h-3.5" />
              Browse Opportunities
            </Link>
          </div>
        </div>

        {/* Verification Status Card */}
        <div className="bg-white rounded-2xl border border-pink-100 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                  isVerified
                    ? 'bg-emerald-100 text-emerald-800'
                    : accessStatus === 'rejected' || accessStatus === 'revoked'
                    ? 'bg-rose-100 text-rose-800'
                    : accessStatus === 'pending'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {isVerified ? (
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                ) : accessStatus === 'rejected' || accessStatus === 'revoked' ? (
                  <XCircle className="w-6 h-6 text-rose-600" />
                ) : accessStatus === 'pending' ? (
                  <Clock className="w-6 h-6 text-amber-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-slate-500" />
                )}
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  {isVerified
                    ? 'Alumni Verification Approved'
                    : accessStatus === 'pending'
                    ? 'Access Request Pending Placement Cell Review'
                    : accessStatus === 'revoked'
                    ? 'Alumni Access Revoked'
                    : accessStatus === 'rejected'
                    ? 'Alumni Access Request Rejected'
                    : 'Alumni Access Not Requested Yet'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isVerified
                    ? 'Your alumni credentials are verified. You can post reviews for any genuine internship opportunity.'
                    : accessStatus === 'pending'
                    ? 'Your verification request has been forwarded to the Placement Cell. You will be able to post reviews once approved.'
                    : accessStatus === 'rejected' || accessStatus === 'revoked'
                    ? `Status notice: ${rejectionReason || 'Please contact the Placement Cell or submit an updated request.'}`
                    : 'Click "Request Alumni Access" to request verification from the Admin / Placement Cell.'}
                </p>
              </div>
            </div>

            <div className="self-end sm:self-center">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isVerified
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : accessStatus === 'pending'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : accessStatus === 'rejected' || accessStatus === 'revoked'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {accessStatus}
              </span>
            </div>
          </div>

          {alumniProfile && (
            <div className="p-4 bg-pink-50/50 rounded-xl border border-pink-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-700">
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Batch & Degree:</span>
                <span className="font-semibold text-slate-900">
                  {alumniProfile.degree} ({alumniProfile.graduationYear})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Branch:</span>
                <span className="font-semibold text-slate-900">{alumniProfile.branch}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Current Company:</span>
                <span className="font-semibold text-slate-900">{alumniProfile.currentCompany}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Current Role:</span>
                <span className="font-semibold text-slate-900">{alumniProfile.currentRole}</span>
              </div>
            </div>
          )}
        </div>

        {/* My Reviews Section */}
        <div className="bg-white rounded-2xl border border-pink-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-pink-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">My Submitted Reviews</h3>
              <p className="text-xs text-slate-500">
                Track moderation status. Only approved reviews are visible to students. You may withdraw pending reviews.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-pink-50 text-rose-700 border border-pink-200">
              {reviews.length} Total
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-rose-600" />
              Loading your reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <MessageSquare className="w-10 h-10 text-pink-200 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No reviews submitted yet</p>
              <p className="text-xs text-slate-400 mt-1">
                {isVerified
                  ? 'Click "Submit Internship Review" above to review an employer or internship.'
                  : 'Once your alumni access is approved, you will be able to share internship reviews here.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-pink-100">
              {reviews.map(rev => (
                <div key={rev.id} className="py-4 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{rev.companyName}</span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          rev.moderationStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rev.moderationStatus === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rev.moderationStatus}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>Submitted: {new Date(rev.createdAt).toLocaleDateString()}</span>
                      {rev.moderationStatus === 'pending' && (
                        <button
                          onClick={() => handleWithdrawReview(rev.id)}
                          className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 hover:underline"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Withdraw Review
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 text-xs text-slate-600">
                    {rev.workCultureRating && <span>Culture Rating: <strong>{rev.workCultureRating}/5</strong></span>}
                    {rev.learningRating && <span>Learning Rating: <strong>{rev.learningRating}/5</strong></span>}
                  </div>

                  <p className="text-xs text-slate-700 bg-pink-50/40 p-3 rounded-lg border border-pink-100">
                    {rev.reviewText}
                  </p>

                  {rev.applicationAdvice && (
                    <p className="text-xs text-slate-600">
                      <strong className="text-rose-900">Application Advice:</strong> {rev.applicationAdvice}
                    </p>
                  )}

                  {rev.moderationNotes && (
                    <p className="text-xs text-rose-700 italic">
                      Moderation note: {rev.moderationNotes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL: SUBMIT REVIEW */}
        <SubmitReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          onSuccess={fetchReviewsAndStatus}
        />

        {/* MODAL: REQUEST ALUMNI ACCESS */}
        <Modal
          isOpen={requestAccessModalOpen}
          onClose={() => setRequestAccessModalOpen(false)}
          title="Request Alumni Access"
        >
          <form onSubmit={handleRequestAccess} className="space-y-4">
            {accessError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {accessError}
              </div>
            )}

            <p className="text-xs text-slate-600">
              Submit an access request to the college Admin / Placement Cell. Include any verification details (e.g., student ID, current corporate affiliation, or badge photo link) in your note:
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Verification Note for Placement Cell
              </label>
              <textarea
                rows={4}
                value={requestNote}
                onChange={e => setRequestNote(e.target.value)}
                placeholder="e.g. Graduated in batch of 2023 with CSE degree. Currently working at Microsoft India. Requesting review privileges."
                className="w-full px-3 py-2 rounded-lg border border-pink-200 text-sm focus:ring-2 focus:ring-rose-500 bg-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRequestAccessModalOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={requestingAccess}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm flex items-center gap-2 shadow-sm"
              >
                {requestingAccess && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Access Request
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};
