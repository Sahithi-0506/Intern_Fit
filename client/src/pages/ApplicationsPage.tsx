import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Application } from '@internfit/shared';
import { ApplicationTracker } from '../components/tracker/ApplicationTracker';
import { Send, Loader2, Sparkles } from 'lucide-react';

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/applications');
      if (res.data.success) {
        setApplications(res.data.items);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Send className="w-8 h-8 text-teal-600" />
          My Application Tracker
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Monitor your self-reported applications, recorded external submission timestamps, personal notes, and interview milestones.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          <span className="text-sm text-slate-500">Loading your applications...</span>
        </div>
      ) : (
        <ApplicationTracker applications={applications} onRefresh={fetchApplications} />
      )}
    </div>
  );
};
