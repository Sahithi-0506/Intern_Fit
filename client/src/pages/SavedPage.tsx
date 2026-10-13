import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Internship } from '@internfit/shared';
import { InternshipCard } from '../components/internships/InternshipCard';
import { SkillMatchModal } from '../components/resume/SkillMatchModal';
import { Bookmark, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SavedPage: React.FC = () => {
  const [savedInternships, setSavedInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Internship | null>(null);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await api.get('/internships/saved');
      if (res.data.success) {
        setSavedInternships(res.data.items);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleToggleSave = async (id: string) => {
    try {
      await api.post(`/internships/${id}/save`);
      fetchSaved();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Bookmark className="w-8 h-8 text-amber-500" />
          Saved Internships & Bookmarks
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Opportunities you have bookmarked to review or apply to before their application deadlines.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          <span className="text-sm text-slate-500">Loading saved bookmarks...</span>
        </div>
      ) : savedInternships.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-slate-200 p-8 space-y-3">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">No saved internships yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the bookmark icon on any internship card to save it for quick reference here.
          </p>
          <Link
            to="/opportunities"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold"
          >
            Browse Opportunities
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedInternships.map(internship => (
            <InternshipCard
              key={internship.id}
              internship={internship}
              onToggleSave={handleToggleSave}
              onMatchSkills={int => setSelectedMatch(int)}
              onRefresh={fetchSaved}
            />
          ))}
        </div>
      )}

      {selectedMatch && (
        <SkillMatchModal
          isOpen={!!selectedMatch}
          onClose={() => setSelectedMatch(null)}
          internshipId={selectedMatch.id}
          internshipTitle={selectedMatch.title}
          companyName={selectedMatch.companyName}
        />
      )}
    </div>
  );
};
