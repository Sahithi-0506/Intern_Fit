import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Internship, ListingStatus } from '@internfit/shared';
import { Modal } from '../components/common/Modal';
import { Building, Plus, CheckCircle, Clock, Archive, Loader2, AlertCircle, ExternalLink } from 'lucide-react';

export const PlacementDashboardPage: React.FC = () => {
  const [listings, setListings] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form State
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
  const [sourceNotes, setSourceNotes] = useState('Official placement cell verified communication');
  const [status, setStatus] = useState<ListingStatus>('published');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/placement/listings');
      if (res.data.success) {
        setListings(res.data.items);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

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
        listingStatus: status,
        verificationStatus: 'placement_cell_verified' as const,
        requiredSkills: ['Java', 'SQL', 'Data Structures'],
        preferredSkills: ['Docker'],
      };

      await api.post('/placement/listings', payload);
      setCreateModalOpen(false);
      fetchListings();
    } catch (err: any) {
      setError(err.message || 'Failed to create listing.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: ListingStatus) => {
    try {
      await api.patch(`/placement/listings/${id}/status`, { status: newStatus });
      fetchListings();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building className="w-8 h-8 text-amber-600" />
            Placement Cell Management Desk
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Publish verified opportunities, manage application intake status, and record supporting audit evidence.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Publish New Opportunity
        </button>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Managed Opportunities ({listings.length})</h3>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
            <span className="text-xs text-slate-500">Loading placement listings...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <th className="py-3 px-6">Company & Role</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Stipend</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {listings.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-medium">
                      <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                      <div className="text-xs text-teal-700">{item.companyName}</div>
                    </td>
                    <td className="py-3.5 px-4">{item.city} ({item.workMode})</td>
                    <td className="py-3.5 px-4 font-semibold">{item.stipendAmount}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                        item.listingStatus === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.listingStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] max-w-[150px] truncate">
                      <a href={item.originalApplicationUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-teal-600 flex items-center gap-1">
                        {new URL(item.originalApplicationUrl).hostname}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <select
                        value={item.listingStatus}
                        onChange={e => handleStatusChange(item.id, e.target.value as ListingStatus)}
                        className="px-2 py-1 border border-slate-300 rounded text-xs bg-white focus:outline-none"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="expired">Expired</option>
                        <option value="closed">Closed</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Listing Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Publish Internship Opportunity" maxWidth="xl">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-600 block mb-1">Company Name *</label>
              <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} required className="w-full px-3 py-2 border rounded-lg text-xs" />
            </div>
            <div>
              <label className="font-bold text-slate-600 block mb-1">Role Title *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-3 py-2 border rounded-lg text-xs" />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-600 block mb-1">Full Description *</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} required className="w-full px-3 py-2 border rounded-lg text-xs" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-600 block mb-1">City *</label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)} required className="w-full px-3 py-2 border rounded-lg text-xs" />
            </div>
            <div>
              <label className="font-bold text-slate-600 block mb-1">Work Mode</label>
              <select value={workMode} onChange={e => setWorkMode(e.target.value as any)} className="w-full px-3 py-2 border rounded-lg text-xs bg-white">
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-600 block mb-1">Stipend *</label>
              <input type="text" value={stipendAmount} onChange={e => setStipendAmount(e.target.value)} required className="w-full px-3 py-2 border rounded-lg text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-600 block mb-1">Original Application URL *</label>
              <input type="url" value={originalUrl} onChange={e => setOriginalUrl(e.target.value)} placeholder="https://careers.company.com/apply" required className="w-full px-3 py-2 border rounded-lg text-xs font-mono" />
            </div>
            <div>
              <label className="font-bold text-slate-600 block mb-1">Source Evidence Notes</label>
              <input type="text" value={sourceNotes} onChange={e => setSourceNotes(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-teal-600 text-white font-bold rounded-lg flex items-center gap-1.5">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Opportunity'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
