import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Internship, ListingStatus, AlumniReview, AlumniProfile, User, AlumniAccessRequest } from '@internfit/shared';
import { Modal } from '../components/common/Modal';
import {
  Building2,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Archive,
  Loader2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  GraduationCap,
  Mail,
  ShieldCheck,
  UserCheck,
  UserX,
  Trash2,
  Globe,
  TrendingUp,
} from 'lucide-react';

export const AdminPlacementDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'opportunities' | 'alumni-requests' | 'alumni-accounts' | 'reviews' | 'domains' | 'outbox'>('opportunities');

  // Opportunities state
  const [opportunities, setOpportunities] = useState<Internship[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [oppFilterStatus, setOppFilterStatus] = useState<string>('all');

  // Opportunity form state
  const [companyName, setCompanyName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [selectionProcess, setSelectionProcess] = useState('');
  const [location, setLocation] = useState('Bengaluru, Karnataka');
  const [city, setCity] = useState('Bengaluru');
  const [workMode, setWorkMode] = useState<'onsite' | 'hybrid' | 'remote'>('hybrid');
  const [duration, setDuration] = useState('3 Months');
  const [stipendAmount, setStipendAmount] = useState('₹30,000 / month');
  const [category, setCategory] = useState<'paid_internship' | 'hiring_challenge'>('paid_internship');
  const [deadline, setDeadline] = useState('2026-12-31T23:59:59');
  const [degrees, setDegrees] = useState('B.Tech, M.Tech, MCA');
  const [years, setYears] = useState('3, 4');
  const [branches, setBranches] = useState('Computer Science, Information Technology');
  const [minCgpa, setMinCgpa] = useState('7.0');
  const [allowsBacklogs, setAllowsBacklogs] = useState(false);
  const [originalUrl, setOriginalUrl] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceNotes, setSourceNotes] = useState('Placement Cell verified campus posting');
  const [reqSkills, setReqSkills] = useState('JavaScript, React, Node.js');
  const [prefSkills, setPrefSkills] = useState('TypeScript, Docker');
  const [savingOpp, setSavingOpp] = useState(false);
  const [oppError, setOppError] = useState<string | null>(null);

  // Alumni access requests state
  const [alumniRequests, setAlumniRequests] = useState<AlumniAccessRequest[]>([]);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState('');

  // Alumni accounts state
  const [alumniAccounts, setAlumniAccounts] = useState<(AlumniProfile & { user: User })[]>([]);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [selectedRevokeUserId, setSelectedRevokeUserId] = useState<string | null>(null);
  const [revokeNotes, setRevokeNotes] = useState('');

  // Reviews state
  const [reviews, setReviews] = useState<AlumniReview[]>([]);
  const [reviewRejectModalOpen, setReviewRejectModalOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [reviewRejectNotes, setReviewRejectNotes] = useState('');

  // Domains & Outbox state
  const [domains, setDomains] = useState<any[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [newCollegeName, setNewCollegeName] = useState('');
  const [outbox, setOutbox] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'opportunities') {
        const query = oppFilterStatus !== 'all' ? `?status=${oppFilterStatus}` : '';
        const res = await api.get(`/admin-placement/opportunities${query}`);
        if (res.data.success) setOpportunities(res.data.items);
      } else if (activeTab === 'alumni-requests') {
        const res = await api.get('/admin-placement/alumni/requests');
        if (res.data.success) setAlumniRequests(res.data.items);
      } else if (activeTab === 'alumni-accounts') {
        const res = await api.get('/admin-placement/alumni');
        if (res.data.success) setAlumniAccounts(res.data.items);
      } else if (activeTab === 'reviews') {
        const res = await api.get('/admin-placement/reviews');
        if (res.data.success) setReviews(res.data.items);
      } else if (activeTab === 'domains') {
        const res = await api.get('/admin-placement/domains');
        if (res.data.success) setDomains(res.data.items);
      } else if (activeTab === 'outbox') {
        const res = await api.get('/admin-placement/outbox');
        if (res.data.success) setOutbox(res.data.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, oppFilterStatus]);

  // Handle Opportunity Creation
  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setOppError(null);
    setSavingOpp(true);

    try {
      const payload = {
        companyName: companyName.trim(),
        title: title.trim(),
        description: description.trim(),
        responsibilities: responsibilities.trim() || undefined,
        selectionProcess: selectionProcess.trim() || undefined,
        location: location.trim(),
        city: city.trim(),
        workMode,
        duration: duration.trim(),
        stipendAmount: stipendAmount.trim(),
        isStipendDisclosed: true,
        category,
        applicationDeadline: deadline ? new Date(deadline).toISOString() : undefined,
        eligibleDegrees: degrees.split(',').map(d => d.trim()).filter(Boolean),
        eligibleYears: years.split(',').map(y => parseInt(y.trim(), 10)).filter(n => !isNaN(n)),
        eligibleBranches: branches.split(',').map(b => b.trim()).filter(Boolean),
        minCgpa: minCgpa ? parseFloat(minCgpa) : null,
        allowsBacklogs,
        originalApplicationUrl: originalUrl.trim(),
        sourceType: 'placement_cell_notice' as const,
        sourceUrl: sourceUrl.trim() || originalUrl.trim(),
        sourceEvidenceNotes: sourceNotes.trim() || undefined,
        listingStatus: 'published' as ListingStatus,
        verificationStatus: 'placement_cell_verified' as const,
        requiredSkills: reqSkills.split(',').map(s => s.trim()).filter(Boolean),
        preferredSkills: prefSkills.split(',').map(s => s.trim()).filter(Boolean),
      };

      await api.post('/admin-placement/opportunities', payload);
      setCreateModalOpen(false);
      resetOpportunityForm();
      loadData();
    } catch (err: any) {
      setOppError(err.response?.data?.message || err.message || 'Failed to create opportunity.');
    } finally {
      setSavingOpp(false);
    }
  };

  const resetOpportunityForm = () => {
    setCompanyName('');
    setTitle('');
    setDescription('');
    setResponsibilities('');
    setSelectionProcess('');
    setOriginalUrl('');
    setSourceUrl('');
    setOppError(null);
  };

  const handleUpdateOppStatus = async (id: string, newStatus: ListingStatus) => {
    try {
      await api.patch(`/admin-placement/opportunities/${id}/status`, { status: newStatus });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOpp = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) return;
    try {
      await api.delete(`/admin-placement/opportunities/${id}`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Alumni Access Requests
  const handleApproveAlumniRequest = async (requestId: number) => {
    try {
      await api.post(`/admin-placement/alumni/requests/${requestId}/decision`, {
        status: 'approved',
        decisionNotes: 'Verified via institute alumni records',
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmRejectAlumniRequest = async () => {
    if (!selectedRequestId) return;
    try {
      await api.post(`/admin-placement/alumni/requests/${selectedRequestId}/decision`, {
        status: 'rejected',
        decisionNotes: rejectionNotes.trim() || 'Could not verify alumni credentials',
      });
      setRejectModalOpen(false);
      setSelectedRequestId(null);
      setRejectionNotes('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Alumni Revocation
  const handleConfirmRevokeAlumni = async () => {
    if (!selectedRevokeUserId) return;
    try {
      await api.post(`/admin-placement/alumni/${selectedRevokeUserId}/revoke`, {
        notes: revokeNotes.trim() || 'Alumni access revoked by Placement Cell',
      });
      setRevokeModalOpen(false);
      setSelectedRevokeUserId(null);
      setRevokeNotes('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Review Moderation
  const handleApproveReview = async (reviewId: string) => {
    try {
      await api.post(`/admin-placement/reviews/${reviewId}/decision`, {
        status: 'approved',
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmRejectReview = async () => {
    if (!selectedReviewId) return;
    try {
      await api.post(`/admin-placement/reviews/${selectedReviewId}/decision`, {
        status: 'rejected',
        moderationNotes: reviewRejectNotes.trim() || 'Does not comply with campus review guidelines',
      });
      setReviewRejectModalOpen(false);
      setSelectedReviewId(null);
      setReviewRejectNotes('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Domain Addition
  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain || !newCollegeName) return;
    try {
      await api.post('/admin-placement/domains', {
        domain: newDomain.trim().toLowerCase(),
        collegeName: newCollegeName.trim(),
      });
      setNewDomain('');
      setNewCollegeName('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle SMTP Diagnostic Test
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpFeedback, setSmtpFeedback] = useState<{ message: string; success: boolean } | null>(null);

  const handleTestSmtp = async () => {
    setTestingSmtp(true);
    setSmtpFeedback(null);
    try {
      const res = await api.post('/admin-placement/smtp/test', { recipient: 'achyutha0506@gmail.com' });
      setSmtpFeedback({ message: res.data.message, success: res.data.success });
      const outboxRes = await api.get('/admin-placement/outbox');
      if (outboxRes.data.success) setOutbox(outboxRes.data.items);
    } catch (err: any) {
      setSmtpFeedback({ message: err.response?.data?.message || err.message, success: false });
    } finally {
      setTestingSmtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f9] py-8">
      <div className="page-container">
        {/* Header Banner */}
        <div className="bg-white border border-pink-100 rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-rose-700 text-xs font-bold uppercase tracking-wider mb-2">
                <Building2 className="w-3.5 h-3.5" />
                Unified Campus Console
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Admin & Placement Cell Dashboard
              </h1>
              <p className="text-slate-600 text-sm sm:text-base mt-1">
                Manage genuine opportunities, moderate alumni access requests, approve verified reviews, and oversee campus security.
              </p>
            </div>

            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-all shadow-sm shadow-rose-200"
            >
              <Plus className="w-4 h-4" />
              Publish Opportunity
            </button>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-pink-100">
            <div className="bg-pink-50/60 p-4 rounded-xl border border-pink-100">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Opportunities</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{opportunities.length}</div>
            </div>
            <div className="bg-pink-50/60 p-4 rounded-xl border border-pink-100">
              <span className="text-xs font-semibold text-rose-700 uppercase">Pending Alumni Requests</span>
              <div className="text-2xl font-black text-rose-600 mt-1">
                {alumniRequests.filter(r => r.status === 'pending').length}
              </div>
            </div>
            <div className="bg-pink-50/60 p-4 rounded-xl border border-pink-100">
              <span className="text-xs font-semibold text-emerald-700 uppercase">Approved Alumni</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {alumniAccounts.filter(a => a.verificationStatus === 'approved').length}
              </div>
            </div>
            <div className="bg-pink-50/60 p-4 rounded-xl border border-pink-100">
              <span className="text-xs font-semibold text-amber-700 uppercase">Pending Reviews</span>
              <div className="text-2xl font-black text-amber-600 mt-1">
                {reviews.filter(r => r.moderationStatus === 'pending').length}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-pink-200 mb-6 overflow-x-auto space-x-2">
          {[
            { id: 'opportunities', label: 'Manage Opportunities', icon: Building2 },
            { id: 'alumni-requests', label: 'Alumni Access Requests', icon: UserCheck },
            { id: 'alumni-accounts', label: 'Alumni Directory & Access', icon: GraduationCap },
            { id: 'reviews', label: 'Review Moderation', icon: MessageSquare },
            { id: 'domains', label: 'College Domains', icon: Globe },
            { id: 'outbox', label: 'Email Outbox Logs', icon: Mail },
          ].map(tab => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  isSel
                    ? 'border-rose-600 text-rose-700 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-rose-600 hover:border-pink-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSel ? 'text-rose-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OPPORTUNITIES */}
        {activeTab === 'opportunities' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-pink-100">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <span className="font-semibold">Filter Status:</span>
                <select
                  value={oppFilterStatus}
                  onChange={e => setOppFilterStatus(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-pink-200 text-sm focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  <option value="all">All Listings</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts</option>
                  <option value="closed">Closed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="text-xs text-slate-500">
                Showing {opportunities.length} opportunities published under Placement Cell oversight
              </div>
            </div>

            {loading ? (
              <div className="bg-white rounded-xl border border-pink-100 p-12 text-center text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-rose-600" />
                Loading opportunities...
              </div>
            ) : opportunities.length === 0 ? (
              <div className="bg-white rounded-xl border border-pink-100 p-12 text-center text-slate-500">
                No opportunities found matching this filter. Click "Publish Opportunity" to add one.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {opportunities.map(opp => (
                  <div key={opp.id} className="bg-white border border-pink-100 rounded-xl p-5 hover:border-pink-200 transition shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-rose-700 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200">
                            {opp.companyName}
                          </span>
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                              opp.listingStatus === 'published'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : opp.listingStatus === 'draft'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {opp.listingStatus}
                          </span>
                          <span className="text-xs text-slate-400 capitalize">• {opp.workMode}</span>
                          <span className="text-xs text-slate-400">• {opp.city}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{opp.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{opp.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                          <span>Stipend: <strong className="text-slate-800">{opp.stipendAmount}</strong></span>
                          <span>Duration: <strong className="text-slate-800">{opp.duration}</strong></span>
                          {opp.applicationDeadline && (
                            <span>Deadline: <strong className="text-slate-800">{new Date(opp.applicationDeadline).toLocaleDateString()}</strong></span>
                          )}
                        </div>
                      </div>

                      {/* Action Controls */}
                      <div className="flex items-center gap-2 self-end md:self-center">
                        <a
                          href={opp.originalApplicationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200"
                          title="View External Application URL"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        {opp.listingStatus !== 'published' ? (
                          <button
                            onClick={() => handleUpdateOppStatus(opp.id, 'published')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition"
                          >
                            Publish
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateOppStatus(opp.id, 'draft')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition"
                          >
                            Unpublish
                          </button>
                        )}

                        {opp.listingStatus !== 'archived' && (
                          <button
                            onClick={() => handleUpdateOppStatus(opp.id, 'archived')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-600 hover:bg-slate-700 text-white transition"
                          >
                            Archive
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteOpp(opp.id)}
                          className="p-2 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-pink-50 border border-pink-200"
                          title="Delete opportunity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ALUMNI ACCESS REQUESTS */}
        {activeTab === 'alumni-requests' && (() => {
          const pendingRequests = alumniRequests.filter(r => r.status === 'pending');
          return (
            <div className="bg-white border border-pink-100 rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-pink-100 flex justify-between items-center bg-pink-50/40">
                <div>
                  <h3 className="font-bold text-slate-900">Alumni Access Requests</h3>
                  <p className="text-xs text-slate-500">Incoming access applications submitted by alumni requiring Placement Cell review and decision</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold">
                  {pendingRequests.length} Pending Decision
                </span>
              </div>

              {loading ? (
                <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-rose-600" />
                  Loading access requests...
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="p-12 text-center text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-700">No pending alumni access requests</p>
                  <p className="text-xs text-slate-400">All incoming access applications have been reviewed. Approved alumni can be managed in the Alumni Directory.</p>
                </div>
              ) : (
                <div className="divide-y divide-pink-100">
                  {pendingRequests.map(req => (
                    <div key={req.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900">
                            {req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Alumnus'}
                          </span>
                          <span className="text-xs text-slate-500">({req.user?.email})</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full uppercase bg-amber-100 text-amber-800">
                            Pending Decision
                          </span>
                          <span className="text-xs text-slate-400">
                            • Submitted {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {req.alumniProfile && (
                          <div className="text-xs text-slate-600 flex flex-wrap gap-3 mt-1">
                            <span>Company: <strong className="text-slate-800">{req.alumniProfile.currentCompany}</strong></span>
                            <span>Role: <strong className="text-slate-800">{req.alumniProfile.currentRole}</strong></span>
                            <span>Batch: <strong className="text-slate-800">{req.alumniProfile.graduationYear} ({req.alumniProfile.branch})</strong></span>
                            {req.alumniProfile.linkedinUrl && (
                              <a
                                href={req.alumniProfile.linkedinUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-rose-600 hover:underline flex items-center gap-1 font-medium"
                              >
                                LinkedIn <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}

                        {req.requestNote && (
                          <p className="text-xs text-slate-700 bg-pink-50/70 p-2.5 rounded-lg border border-pink-100 mt-2">
                            <strong className="text-rose-900">Alumnus Note:</strong> {req.requestNote}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveAlumniRequest(req.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve Access
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequestId(req.id);
                            setRejectModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs flex items-center gap-1.5 transition"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 3: ALUMNI DIRECTORY & ACCESS MANAGEMENT */}
        {activeTab === 'alumni-accounts' && (
          <div className="bg-white border border-pink-100 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-pink-100 bg-pink-50/40">
              <h3 className="font-bold text-slate-900">Alumni Directory & Account Privileges</h3>
              <p className="text-xs text-slate-500">Manage alumni accounts, approve pending/revoked accounts, or revoke review posting permissions</p>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-rose-600" />
                Loading alumni accounts...
              </div>
            ) : alumniAccounts.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No alumni registered yet.</div>
            ) : (
              <div className="divide-y divide-pink-100">
                {alumniAccounts.map(al => (
                  <div key={al.userId} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900">
                          {al.user.firstName} {al.user.lastName}
                        </span>
                        <span className="text-xs text-slate-500">({al.user.email})</span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            al.verificationStatus === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : al.verificationStatus === 'revoked'
                              ? 'bg-slate-200 text-slate-700 border border-slate-300'
                              : al.verificationStatus === 'rejected'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {al.verificationStatus}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 flex flex-wrap gap-3 mt-1">
                        <span>Company: <strong className="text-slate-800">{al.currentCompany}</strong></span>
                        <span>Role: <strong className="text-slate-800">{al.currentRole}</strong></span>
                        <span>Graduation Year: <strong className="text-slate-800">{al.graduationYear}</strong></span>
                        {al.linkedinUrl && (
                          <a href={al.linkedinUrl} target="_blank" rel="noreferrer" className="text-rose-600 hover:underline flex items-center gap-1 font-medium">
                            LinkedIn <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {al.rejectionReason && (
                        <p className="text-xs text-rose-700 bg-rose-50 p-2 rounded border border-rose-100 mt-2">
                          Status note: {al.rejectionReason}
                        </p>
                      )}
                    </div>

                    <div>
                      {al.verificationStatus === 'approved' ? (
                        <button
                          onClick={() => {
                            setSelectedRevokeUserId(al.userId);
                            setRevokeModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          Revoke Access
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            try {
                              await api.post(`/admin-placement/alumni/${al.userId}/approve`, {
                                notes: 'Access approved via directory',
                              });
                              loadData();
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Approve / Restore Access
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ALUMNI REVIEW MODERATION */}
        {activeTab === 'reviews' && (
          <div className="bg-white border border-pink-100 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-pink-100 bg-pink-50/40">
              <h3 className="font-bold text-slate-900">Alumni Review Moderation Queue</h3>
              <p className="text-xs text-slate-500">
                Students can only see reviews after they are approved here by the Admin / Placement Cell.
              </p>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-rose-600" />
                Loading reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No alumni reviews submitted yet.</div>
            ) : (
              <div className="divide-y divide-pink-100">
                {reviews.map(rev => (
                  <div key={rev.id} className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
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
                        <span className="text-xs text-slate-400">
                          • By {rev.reviewerName || 'Alumnus'} • {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 flex gap-4 mt-1 mb-2 font-medium">
                        {rev.workCultureRating && <span>Culture: {rev.workCultureRating}/5</span>}
                        {rev.learningRating && <span>Learning: {rev.learningRating}/5</span>}
                      </div>

                      <p className="text-sm text-slate-800 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                        {rev.reviewText}
                      </p>

                      {rev.applicationAdvice && (
                        <p className="text-xs text-slate-600 mt-2">
                          <strong className="text-rose-900">Application Advice:</strong> {rev.applicationAdvice}
                        </p>
                      )}

                      {rev.moderationNotes && (
                        <p className="text-xs text-rose-700 italic mt-1">
                          Moderator note: {rev.moderationNotes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-start">
                      {rev.moderationStatus !== 'approved' && (
                        <button
                          onClick={() => handleApproveReview(rev.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve Review
                        </button>
                      )}

                      {rev.moderationStatus !== 'rejected' && (
                        <button
                          onClick={() => {
                            setSelectedReviewId(rev.id);
                            setReviewRejectModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs flex items-center gap-1.5 transition"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject Review
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: COLLEGE EMAIL DOMAINS */}
        {activeTab === 'domains' && (
          <div className="space-y-6">
            <div className="bg-white border border-pink-100 rounded-xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-2">Add Approved College Email Domain</h3>
              <p className="text-xs text-slate-500 mb-4">
                Students and alumni can only register using email addresses from these verified campus domains.
              </p>

              <form onSubmit={handleAddDomain} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="e.g. nitt.edu, iitb.ac.in"
                  value={newDomain}
                  onChange={e => setNewDomain(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-pink-200 text-sm focus:ring-2 focus:ring-rose-500 bg-white"
                  required
                />
                <input
                  type="text"
                  placeholder="College / Institute Name"
                  value={newCollegeName}
                  onChange={e => setNewCollegeName(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-pink-200 text-sm focus:ring-2 focus:ring-rose-500 bg-white"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-sm transition shadow-sm"
                >
                  Add College Domain
                </button>
              </form>
            </div>

            <div className="bg-white border border-pink-100 rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-pink-100 bg-pink-50/40">
                <h3 className="font-bold text-slate-900">Approved Domain Allowlist</h3>
              </div>
              <div className="divide-y divide-pink-100">
                {domains.map(d => (
                  <div key={d.id} className="p-4 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-sm font-bold text-rose-700 bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
                        @{d.domain}
                      </span>
                      <span className="text-sm text-slate-800 ml-3 font-medium">{d.collegeName}</span>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                      Active Allowlist
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: EMAIL OUTBOX LOGS */}
        {activeTab === 'outbox' && (
          <div className="space-y-4">
            {/* SMTP Test & Diagnostics Panel */}
            <div className="bg-white border border-pink-100 rounded-xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h4 className="font-bold text-slate-900 text-sm">SMTP STARTTLS Delivery Configuration</h4>
                    <span className="text-[11px] font-mono bg-pink-50 text-rose-700 px-2 py-0.5 rounded border border-pink-200">
                      smtp.gmail.com:587
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Configured sender: <strong className="text-slate-700">achyutha0506@gmail.com</strong> (STARTTLS Port 587)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTestSmtp}
                  disabled={testingSmtp}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-semibold text-xs rounded-lg transition shadow-xs flex items-center gap-2 shrink-0"
                >
                  {testingSmtp && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Send Diagnostic Test Email
                </button>
              </div>

              {smtpFeedback && (
                <div
                  className={`mt-4 p-3 rounded-lg text-xs flex items-center gap-2 border ${
                    smtpFeedback.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{smtpFeedback.message}</span>
                </div>
              )}
            </div>

            <div className="bg-white border border-pink-100 rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-pink-100 bg-pink-50/40">
                <h3 className="font-bold text-slate-900">Email Outbox Delivery Audit Logs</h3>
                <p className="text-xs text-slate-500">Transparent record of verification and notification emails sent through SMTP</p>
              </div>
            {outbox.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No emails logged in outbox.</div>
            ) : (
              <div className="divide-y divide-pink-100">
                {outbox.map(log => (
                  <div key={log.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{log.subject}</div>
                      <div className="text-slate-500 mt-0.5">To: {log.recipientEmail}</div>
                      {log.lastError && (
                        <div className="text-rose-600 mt-1 font-mono text-[11px]">Error: {log.lastError}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-semibold px-2.5 py-1 rounded-full uppercase text-[10px] ${
                          log.status === 'sent'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'dry_run_logged'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.status}
                      </span>
                      <span className="text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}

        {/* MODAL: CREATE OPPORTUNITY */}
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Publish Verified Internship Opportunity"
        >
          <form onSubmit={handleCreateOpportunity} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {oppError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {oppError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Microsoft India, Swiggy"
                  className="w-full px-3 py-2 rounded-lg border border-pink-200 text-sm focus:ring-2 focus:ring-rose-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Internship Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Software Engineering Intern"
                  className="w-full px-3 py-2 rounded-lg border border-pink-200 text-sm focus:ring-2 focus:ring-rose-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Opportunity Description *</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Detailed project requirements, team overview, and qualifications..."
                className="w-full px-3 py-2 rounded-lg border border-pink-200 text-sm focus:ring-2 focus:ring-rose-500 bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Mode</label>
                <select
                  value={workMode}
                  onChange={e => setWorkMode(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-pink-200 text-sm focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">Onsite</option>
                  <option value="remote">Remote</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-pink-200 text-sm focus:ring-2 focus:ring-rose-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Stipend Amount</label>
                <input
                  type="text"
                  value={stipendAmount}
                  onChange={e => setStipendAmount(e.target.value)}
                  placeholder="₹30,000 / month"
                  className="w-full px-3 py-2 rounded-lg border border-pink-200 text-sm focus:ring-2 focus:ring-rose-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Original Application URL *</label>
                <input
                  type="url"
                  required
                  value={originalUrl}
                  onChange={e => setOriginalUrl(e.target.value)}
                  placeholder="https://careers.company.com/job/..."
                  className="w-full px-3 py-2 rounded-lg border border-pink-200 text-sm focus:ring-2 focus:ring-rose-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Application Deadline</label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-pink-200 text-sm focus:ring-2 focus:ring-rose-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Required Skills (comma separated)</label>
                <input
                  type="text"
                  value={reqSkills}
                  onChange={e => setReqSkills(e.target.value)}
                  placeholder="React, Node.js, Python, SQL"
                  className="w-full px-3 py-2 rounded-lg border border-pink-200 text-sm focus:ring-2 focus:ring-rose-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Skills (comma separated)</label>
                <input
                  type="text"
                  value={prefSkills}
                  onChange={e => setPrefSkills(e.target.value)}
                  placeholder="Docker, AWS, TypeScript"
                  className="w-full px-3 py-2 rounded-lg border border-pink-200 text-sm focus:ring-2 focus:ring-rose-500 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-pink-100">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingOpp}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm flex items-center gap-2 shadow-sm"
              >
                {savingOpp && <Loader2 className="w-4 h-4 animate-spin" />}
                Publish Opportunity
              </button>
            </div>
          </form>
        </Modal>

        {/* MODAL: REJECT ALUMNI ACCESS */}
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title="Reject Alumni Access Request"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Please provide a reason for rejecting this alumnus verification request. This note will be sent to the user.
            </p>
            <textarea
              rows={3}
              value={rejectionNotes}
              onChange={e => setRejectionNotes(e.target.value)}
              placeholder="e.g. Unable to verify graduation details with university records..."
              className="w-full px-3 py-2 rounded-lg border border-pink-200 text-sm focus:ring-2 focus:ring-rose-500 bg-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejectAlumniRequest}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </Modal>

        {/* MODAL: REVOKE ALUMNI ACCESS */}
        <Modal
          isOpen={revokeModalOpen}
          onClose={() => setRevokeModalOpen(false)}
          title="Revoke Alumni Access"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Revoking access will remove this alumnus's privilege to submit internship reviews. Provide a moderation reason below:
            </p>
            <textarea
              rows={3}
              value={revokeNotes}
              onChange={e => setRevokeNotes(e.target.value)}
              placeholder="e.g. Policy violation or company credentials outdated..."
              className="w-full px-3 py-2 rounded-lg border border-pink-200 text-sm focus:ring-2 focus:ring-rose-500 bg-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRevokeModalOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevokeAlumni}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm"
              >
                Revoke Access
              </button>
            </div>
          </div>
        </Modal>

        {/* MODAL: REJECT REVIEW */}
        <Modal
          isOpen={reviewRejectModalOpen}
          onClose={() => setReviewRejectModalOpen(false)}
          title="Reject Alumni Review"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Provide an optional moderation note explaining why this review cannot be published:
            </p>
            <textarea
              rows={3}
              value={reviewRejectNotes}
              onChange={e => setReviewRejectNotes(e.target.value)}
              placeholder="e.g. Unverified statements or inappropriate language..."
              className="w-full px-3 py-2 rounded-lg border border-pink-200 text-sm focus:ring-2 focus:ring-rose-500 bg-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReviewRejectModalOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejectReview}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
