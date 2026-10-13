import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../api/client';
import { Loader2, CheckCircle, Star, AlertCircle, Info } from 'lucide-react';

interface SubmitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCompanyName?: string;
  defaultInternshipId?: string | null;
  onSuccess: () => void;
}

export const SubmitReviewModal: React.FC<SubmitReviewModalProps> = ({
  isOpen,
  onClose,
  defaultCompanyName = '',
  defaultInternshipId = null,
  onSuccess,
}) => {
  const [companyName, setCompanyName] = useState(defaultCompanyName);
  const [reviewText, setReviewText] = useState('');
  const [advice, setAdvice] = useState('');
  const [cultureRating, setCultureRating] = useState(5);
  const [learningRating, setLearningRating] = useState(5);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (reviewText.trim().length < 20) {
      setError('Review text must be at least 20 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/alumni/reviews', {
        internshipId: defaultInternshipId || null,
        companyName: companyName.trim(),
        reviewText: reviewText.trim(),
        applicationAdvice: advice.trim() || undefined,
        workCultureRating: cultureRating,
        learningRating: learningRating,
        isAnonymous,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Internship Experience & Advice" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-700">
        <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-lg text-xs text-teal-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <div>
            Your review helps current students prepare for selection rounds. All alumni reviews are moderated by the
            placement cell before being publicly displayed.
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Company Name *
          </label>
          <input
            type="text"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            placeholder="e.g. Infosys Limited, Microsoft, Amazon"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Work Culture Rating (1-5)
            </label>
            <select
              value={cultureRating}
              onChange={e => setCultureRating(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {[5, 4, 3, 2, 1].map(r => (
                <option key={r} value={r}>
                  {r} Stars {r === 5 ? '(Excellent)' : r === 4 ? '(Good)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Learning Quality (1-5)
            </label>
            <select
              value={learningRating}
              onChange={e => setLearningRating(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {[5, 4, 3, 2, 1].map(r => (
                <option key={r} value={r}>
                  {r} Stars {r === 5 ? '(Outstanding)' : r === 4 ? '(Great)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Internship Review & Experience *
          </label>
          <textarea
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            placeholder="Describe your internship experience, mentor support, real project scope, and work expectations..."
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Application & Interview Advice for Juniors (Optional)
          </label>
          <textarea
            value={advice}
            onChange={e => setAdvice(e.target.value)}
            placeholder="e.g. Focus on DSA linked lists, review basic system design, prepare for Java concurrency questions..."
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="anon"
            checked={isAnonymous}
            onChange={e => setIsAnonymous(e.target.checked)}
            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
          />
          <label htmlFor="anon" className="text-xs text-slate-600 cursor-pointer">
            Display anonymously as "Verified Alumnus" to students (Placement cell still verifies your account)
          </label>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Submit for Moderation
          </button>
        </div>
      </form>
    </Modal>
  );
};
