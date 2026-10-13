import React from 'react';
import { ShieldCheck, Lock, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-pink-100 text-slate-600 py-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <span className="font-extrabold text-xl text-slate-900">
              Intern<span className="text-rose-600">Fit</span>
            </span>
            <p className="mt-2 text-slate-500 text-sm leading-relaxed max-w-md">
              A university career ecosystem connecting students with verified internship opportunities across India,
              transparent fraud risk evaluation, explainable resume matching, and self-reported application tracking.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs text-rose-700 bg-pink-50 w-fit px-3 py-1 rounded-full border border-pink-200">
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              <span>Independent URL SSRF Inspection & Student Data Privacy Protection</span>
            </div>
          </div>

          <div>
            <h4 className="text-slate-900 font-semibold mb-3">Core Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/opportunities" className="hover:text-rose-600 transition-colors">Real Opportunities</a></li>
              <li><a href="/check-risk" className="hover:text-rose-600 transition-colors">URL Risk Inspector</a></li>
              <li><a href="/resume" className="hover:text-rose-600 transition-colors">NLP Resume Matcher</a></li>
              <li><a href="/applications" className="hover:text-rose-600 transition-colors">Application Tracker</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 font-semibold mb-3">Placement & Guidance</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/admin-placement" className="hover:text-rose-600 transition-colors">Admin / Placement Cell Desk</a></li>
              <li><a href="/alumni/dashboard" className="hover:text-rose-600 transition-colors">Alumni Experience Portal</a></li>
              <li><span className="text-xs text-slate-500 flex items-center gap-1"><Lock className="w-3 h-3 text-rose-500" /> Secure Token Verification</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-pink-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} InternFit Platform. Developed for College Placement & Student Career Success.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-rose-600">Evidence-based Fraud Scoring</span>
            <span>•</span>
            <span className="hover:text-rose-600">Official Careers Destinations Only</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
