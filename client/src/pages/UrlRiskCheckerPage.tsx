import React from 'react';
import { UrlCheckerPanel } from '../components/risk/UrlCheckerPanel';
import { ShieldAlert, ShieldCheck, AlertTriangle, Eye, Lock } from 'lucide-react';

export const UrlRiskCheckerPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <ShieldCheck className="w-8 h-8 text-teal-600" />
          Independent Internship URL Risk Inspector
        </h1>
        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
          Inspect any internship URL — whether found on WhatsApp, Telegram, LinkedIn, or external boards — before submitting your personal information.
        </p>
      </div>

      {/* Main Checker Panel */}
      <UrlCheckerPanel />

      {/* Educational & Safety Section */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4 text-xs text-slate-600">
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
          <Eye className="w-4 h-4 text-slate-500" />
          How InternFit Detects Potential Internship Fraud Signals
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs text-rose-700">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Payment Demands
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Legitimate internships NEVER demand money. We flag requests for "security deposits", "registration fees", or "laptop purchases".
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs text-amber-700">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Domain Mismatch
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              We verify destination domains against official corporate domains to catch typosquatting and impersonation of major IT recruiters.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs text-teal-800">
              <Lock className="w-4 h-4 text-teal-600" />
              SSRF & Redirect Guard
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              All link inspections run through strict server-side request filters, blocking internal networks, private IPs, and malicious redirect hops.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
