import React, { useState } from 'react';
import { Application, ApplicationStatus } from '@internfit/shared';
import { api } from '../../api/client';
import { StatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  Send,
  Building,
  Calendar,
  ExternalLink,
  Edit3,
  Clock,
  CheckCircle,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface ApplicationTrackerProps {
  applications: Application[];
  onRefresh: () => void;
}

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({ applications, onRefresh }) => {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [editNotesOpen, setEditNotesOpen] = useState(false);
  const [updateStatusOpen, setUpdateStatusOpen] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [statusVal, setStatusVal] = useState<ApplicationStatus>('applied_self_reported');
  const [statusNote, setStatusNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOpenNotes = (app: Application) => {
    setSelectedApp(app);
    setNotesText(app.notes || '');
    setEditNotesOpen(true);
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setLoading(true);
    try {
      await api.patch(`/applications/${selectedApp.id}/notes`, { notes: notesText });
      onRefresh();
      setEditNotesOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatus = (app: Application) => {
    setSelectedApp(app);
    setStatusVal(app.status);
    setStatusNote('');
    setUpdateStatusOpen(true);
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setLoading(true);
    try {
      await api.patch(`/applications/${selectedApp.id}/status`, {
        status: statusVal,
        notes: statusNote || undefined,
      });
      onRefresh();
      setUpdateStatusOpen(false);
    } finally {
      setLoading(false);
    }
  };

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Send className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-800">No applications recorded yet</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
          Browse verified opportunities, apply on the official career portals, and click "I've Applied" to track your milestones here.
        </p>
        <a
          href="/opportunities"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition-colors"
        >
          Browse Opportunities
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map(app => (
        <div
          key={app.id}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                {app.internship?.companyName || 'Employer'}
              </span>
              <StatusBadge status={app.status} />
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                via {app.externalPlatform}
              </span>
            </div>

            <h4 className="text-base font-bold text-slate-900">
              {app.internship?.title || 'Internship Opportunity'}
            </h4>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Applied: {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                Destination: {app.destinationDomain}
              </span>
            </div>

            {app.notes && (
              <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-start gap-2">
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="italic">{app.notes}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
            <button
              onClick={() => handleOpenNotes(app)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Notes
            </button>

            <button
              onClick={() => handleOpenStatus(app)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100/80 text-teal-800 border border-teal-200 flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              Update Status
            </button>

            {app.internship?.originalApplicationUrl && (
              <a
                href={app.internship.originalApplicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                title="Open original listing destination"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      ))}

      {/* Edit Notes Modal */}
      <Modal
        isOpen={editNotesOpen}
        onClose={() => setEditNotesOpen(false)}
        title="Edit Application Notes"
        maxWidth="md"
      >
        <form onSubmit={handleSaveNotes} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Personal Tracking Notes
            </label>
            <textarea
              value={notesText}
              onChange={e => setNotesText(e.target.value)}
              placeholder="e.g. Application ID, interview dates, preparation reminders..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditNotesOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold"
            >
              Save Notes
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={updateStatusOpen}
        onClose={() => setUpdateStatusOpen(false)}
        title="Update Milestone (Self-Reported)"
        maxWidth="md"
      >
        <form onSubmit={handleSaveStatus} className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Note:</strong> Milestones updated here are recorded as self-reported student updates.
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Current Milestone
            </label>
            <select
              value={statusVal}
              onChange={e => setStatusVal(e.target.value as ApplicationStatus)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="applied_self_reported">Applied (Self-reported)</option>
              <option value="under_review">Under Review</option>
              <option value="shortlisted">Shortlisted for Assessment</option>
              <option value="interview">Interview Scheduled</option>
              <option value="selected">Selected / Offer Extended</option>
              <option value="rejected">Not Selected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Milestone Update Note (Optional)
            </label>
            <input
              type="text"
              value={statusNote}
              onChange={e => setStatusNote(e.target.value)}
              placeholder="e.g. Received invitation for Round 1 technical interview on Friday"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setUpdateStatusOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold"
            >
              Update Milestone
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
