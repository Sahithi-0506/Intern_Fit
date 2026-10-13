import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { AlumniProfile, AlumniReview, User } from '@internfit/shared';
import {
  Shield,
  CheckCircle,
  XCircle,
  Plus,
  Mail,
  Loader2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  GraduationCap,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'domains' | 'alumni' | 'reviews' | 'outbox'>('domains');

  // Domain state
  const [domains, setDomains] = useState<any[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [newCollegeName, setNewCollegeName] = useState('');

  // Alumni state
  const [alumniList, setAlumniList] = useState<(AlumniProfile & { user: User })[]>([]);

  // Reviews state
  const [reviews, setReviews] = useState<AlumniReview[]>([]);

  // Outbox state
  const [outbox, setOutbox] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'domains') {
        const res = await api.get('/admin/domains');
        if (res.data.success) setDomains(res.data.items);
      } else if (activeTab === 'alumni') {
        const res = await api.get('/admin/alumni');
        if (res.data.success) setAlumniList(res.data.items);
      } else if (activeTab === 'reviews') {
        const res = await api.get('/admin/reviews');
        if (res.data.success) setReviews(res.data.items);
      } else if (activeTab === 'outbox') {
        const res = await api.get('/admin/outbox');
        if (res.data.success) setOutbox(res.data.items);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain || !newCollegeName) return;
    try {
      await api.post('/admin/domains', { domain: newDomain.trim(), collegeName: newCollegeName.trim() });
      setNewDomain('');
      setNewCollegeName('');
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAlumniDecision = async (userId: string, status: 'approved' | 'rejected') => {
    try {
      await api.patch(`/admin/alumni/${userId}/decision`, { status });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReviewDecision = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.patch(`/admin/reviews/${id}/decision`, { status });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Shield className="w-8 h-8 text-rose-600" />
          Administrator Governance Console
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage institutional email domain allowlists, audit alumni credentials, moderate reviews, and monitor email delivery.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-4">
        {[
          { key: 'domains', label: 'Approved Email Domains' },
          { key: 'alumni', label: 'Alumni Verifications' },
          { key: 'reviews', label: 'Review Moderation' },
          { key: 'outbox', label: 'Email Outbox Logs' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`py-3 px-2 border-b-2 font-bold text-xs transition-colors ${
              activeTab === tab.key
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Domains */}
      {activeTab === 'domains' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Add Approved College Email Domain</h3>
            <form onSubmit={handleAddDomain} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newDomain}
                onChange={e => setNewDomain(e.target.value)}
                placeholder="domain.edu (e.g. bits-pilani.ac.in)"
                className="px-3 py-2 border rounded-lg text-xs flex-1 font-mono"
                required
              />
              <input
                type="text"
                value={newCollegeName}
                onChange={e => setNewCollegeName(e.target.value)}
                placeholder="College / Institute Full Name"
                className="px-3 py-2 border rounded-lg text-xs flex-1"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Domain
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b">
                <tr>
                  <th className="py-3 px-6">Domain</th>
                  <th className="py-3 px-6">College / University Name</th>
                  <th className="py-3 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {domains.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-3 px-6 font-mono font-bold text-teal-700">{d.domain}</td>
                    <td className="py-3 px-6">{d.collegeName}</td>
                    <td className="py-3 px-6 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Alumni Verifications */}
      {activeTab === 'alumni' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b">
              <tr>
                <th className="py-3 px-6">Applicant</th>
                <th className="py-3 px-4">Degree & Batch</th>
                <th className="py-3 px-4">Current Employer</th>
                <th className="py-3 px-4">LinkedIn</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-right">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {alumniList.map(a => (
                <tr key={a.userId} className="hover:bg-slate-50">
                  <td className="py-3 px-6 font-bold">
                    {a.user?.firstName} {a.user?.lastName}
                    <div className="text-[11px] text-slate-400 font-mono font-normal">{a.user?.email}</div>
                  </td>
                  <td className="py-3 px-4">{a.degree} ({a.graduationYear}) - {a.branch}</td>
                  <td className="py-3 px-4 font-semibold">{a.currentRole} at {a.currentCompany}</td>
                  <td className="py-3 px-4 font-mono text-[11px]">
                    <a href={a.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline flex items-center gap-1">
                      View Profile
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      a.verificationStatus === 'approved'
                        ? 'bg-emerald-50 text-emerald-700'
                        : a.verificationStatus === 'rejected'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {a.verificationStatus}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right space-x-1">
                    {a.verificationStatus !== 'approved' && (
                      <button
                        onClick={() => handleAlumniDecision(a.userId, 'approved')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold"
                      >
                        Approve
                      </button>
                    )}
                    {a.verificationStatus !== 'rejected' && (
                      <button
                        onClick={() => handleAlumniDecision(a.userId, 'rejected')}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-bold"
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-sm">{r.companyName}</span>
                  <span className="text-slate-400 block text-[11px]">By: {r.reviewerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    r.moderationStatus === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {r.moderationStatus}
                  </span>
                  <button
                    onClick={() => handleReviewDecision(r.id, 'approved')}
                    className="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReviewDecision(r.id, 'rejected')}
                    className="px-2.5 py-1 bg-rose-600 text-white rounded font-bold"
                  >
                    Reject
                  </button>
                </div>
              </div>
              <p className="text-slate-700 bg-slate-50 p-3 rounded-lg leading-relaxed">{r.reviewText}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Email Outbox Logs */}
      {activeTab === 'outbox' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b">
              <tr>
                <th className="py-3 px-6">Recipient</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-right">Logged At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {outbox.map(o => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="py-3 px-6 font-mono font-bold">{o.recipientEmail}</td>
                  <td className="py-3 px-4">{o.subject}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 font-mono">
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right text-slate-400">
                    {new Date(o.createdAt).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
