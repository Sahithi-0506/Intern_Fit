import React, { useState } from 'react';
import { UrlRiskAssessment } from '@internfit/shared';
import { api } from '../../api/client';
import { RiskScoreCard } from './RiskScoreCard';
import { ShieldCheck, Search, Loader2, AlertCircle } from 'lucide-react';

export const UrlCheckerPanel: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<UrlRiskAssessment | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAssessment(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please paste a valid internship URL to inspect.');
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setError('Please provide a complete URL starting with http:// or https://');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/risk/check-url', { url: trimmed });
      if (res.data.success) {
        setAssessment(res.data.assessment);
      }
    } catch (err: any) {
      setError(err.message || 'Inspection failed. Please ensure the URL is reachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-pink-100 shadow-xs ${compact ? 'p-6' : 'p-8'}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2.5 text-rose-700 font-bold text-sm uppercase tracking-wider mb-2">
          <ShieldCheck className="w-5 h-5 text-rose-600" />
          Independent Internship Safety & Link Verification
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Have an internship link? Check it before applying.
        </h3>
        <p className="text-slate-600 text-sm mt-1 mb-6 leading-relaxed">
          Inspect external job postings for phishing domains, registration fee demands, unauthorized recruiter redirects, and SSRF risks using observable technical evidence.
        </p>

        {/* Input Form */}
        <form onSubmit={handleCheck} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={url}
                onChange={e => {
                  setUrl(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Paste internship link (e.g., https://careers.company.com/job/1234)"
                className="w-full px-4 py-3.5 pl-11 bg-slate-50 border border-pink-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white text-slate-900 transition-all font-mono"
                disabled={loading}
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold rounded-xl text-sm shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 shadow-rose-900/10"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Inspecting Signals...
                </>
              ) : (
                'Check Risk'
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-[11px] text-slate-400">
            InternFit never submits external applications automatically or downloads arbitrary executable files.
          </p>
        </form>

        {/* Results */}
        {assessment && (
          <div className="mt-8 animate-fade-in">
            <RiskScoreCard assessment={assessment} />
          </div>
        )}
      </div>
    </div>
  );
};
