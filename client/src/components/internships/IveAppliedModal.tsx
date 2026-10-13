import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../api/client';
import { CheckCircle, Loader2, Info } from 'lucide-react';

interface IveAppliedModalProps {
  isOpen: boolean;
  onClose: () => void;
  internshipId: string;
  internshipTitle: string;
  companyName: string;
  defaultPlatform?: string;
  onSuccess: () => void;
}

export const IveAppliedModal: React.FC<IveAppliedModalProps> = ({
  isOpen,
  onClose,
  internshipId,
  internshipTitle,
  companyName,
  defaultPlatform = 'Official Careers Portal',
  onSuccess,
}) => {
  const [platform, setPlatform] = useState(defaultPlatform);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post('/applications/record', {
        internshipId,
        externalPlatform: platform.trim() || 'Official Portal',
        notes: notes.trim() || undefined,
        appliedAt: new Date().toISOString(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Application in Tracker" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-700">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <div>
            You are recording a <strong>self-reported application</strong> for{' '}
            <strong>{internshipTitle}</strong> at <strong>{companyName}</strong>.
            A confirmation notice will be sent to your verified college email.
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            External Platform Used *
          </label>
          <select
            value={platform}
            onChange={e => setPlatform(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          >
            <option value="Official Careers Portal">Official Careers Portal</option>
            <option value="Workday / Enterprise ATS">Workday / Enterprise ATS</option>
            <option value="Greenhouse / Lever">Greenhouse / Lever</option>
            <option value="Unstop / Campus Drive">Unstop / Campus Drive</option>
            <option value="LinkedIn Easy Apply">LinkedIn Easy Apply</option>
            <option value="Other Legitimate Platform">Other Legitimate Platform</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Application Notes / Tracking ID (Optional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g., Application Reference #104928, used resume version 2, completed coding test."
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
          />
        </div>

        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Confirm "I've Applied"
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
