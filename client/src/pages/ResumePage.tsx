import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { ResumeUploader } from '../components/resume/ResumeUploader';
import { FileText, Sparkles, CheckCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ResumePage: React.FC = () => {
  const [currentResume, setCurrentResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchResume = async () => {
    setLoading(true);
    try {
      const res = await api.get('/resume/my-resume');
      if (res.data.success) {
        setCurrentResume(res.data.resume);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <FileText className="w-8 h-8 text-teal-600" />
          Resume Upload & Natural Language Skill Analysis
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Upload your PDF resume once. InternFit will parse your credentials, extract key technical and core CS skills,
          and compute real-time skill coverage across any opportunity.
        </p>
      </div>

      <ResumeUploader
        currentResume={currentResume}
        onUploadSuccess={res => setCurrentResume(res)}
        onDeleteSuccess={() => setCurrentResume(null)}
      />

      {currentResume && (
        <div className="bg-teal-50/60 rounded-xl border border-teal-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-teal-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              Resume Ready for Instant Skill Matching!
            </h4>
            <p className="text-xs text-teal-800">
              Browse genuine listings and click "Match Skills" on any card to see your exact coverage percentage and missing skills.
            </p>
          </div>
          <Link
            to="/opportunities"
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm transition-all shadow-teal-900/20"
          >
            Explore Opportunities
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
};
