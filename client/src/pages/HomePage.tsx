import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import { Internship, StudentDashboardStats } from '@internfit/shared';
import { UrlCheckerPanel } from '../components/risk/UrlCheckerPanel';
import { InternshipCard } from '../components/internships/InternshipCard';
import { SkillMatchModal } from '../components/resume/SkillMatchModal';
import {
  Briefcase,
  ShieldCheck,
  FileText,
  Bookmark,
  Send,
  GraduationCap,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [recentInternships, setRecentInternships] = useState<Internship[]>([]);
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [selectedMatchInternship, setSelectedMatchInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await api.get('/internships?limit=4');
      if (res.data.success) {
        setRecentInternships(res.data.items);
      }

      if (user && user.role === 'student') {
        const statsRes = await api.get('/applications/dashboard-stats');
        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleToggleSave = async (id: string) => {
    try {
      await api.post(`/internships/${id}/save`);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Light-Pink Hero Header */}
      <section className="bg-gradient-to-b from-pink-100/70 via-pink-50/40 to-[#fff8f9] py-16 px-4 sm:px-6 lg:px-8 border-b border-pink-100">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-white border border-pink-200 text-rose-700 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            Official University Placement Ecosystem
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            InternFit — Find internships. Check risk. Match your skills.
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Discover verified corporate opportunities across India, evaluate suspicious application links with explainable fraud signals, and analyze your resume skill gaps.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 -mt-10">
        {/* Prominent URL-checking panel */}
        <section>
          <UrlCheckerPanel />
        </section>

        {/* Real DB-backed Student Statistics (if student logged in) */}
        {user?.role === 'student' && stats && (
          <section className="bg-white rounded-2xl border border-pink-100 p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-600" />
              Your Real Application & Discovery Dashboard
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-pink-50/40 border border-pink-100">
                <span className="text-xs text-slate-500 font-medium block">Total Open Listings</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.totalOpportunities}</span>
              </div>
              <div className="p-4 rounded-xl bg-rose-50/60 border border-pink-100">
                <span className="text-xs text-rose-700 font-medium block">Tracked Applications</span>
                <span className="text-2xl font-black text-rose-900 mt-1 block">{stats.appliedCount}</span>
              </div>
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100">
                <span className="text-xs text-amber-700 font-medium block">Saved Bookmarks</span>
                <span className="text-2xl font-black text-amber-800 mt-1 block">{stats.savedCount}</span>
              </div>
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <span className="text-xs text-indigo-700 font-medium block">Under Review / Active</span>
                <span className="text-2xl font-black text-indigo-800 mt-1 block">
                  {(stats.applicationsByStatus?.under_review || 0) +
                    (stats.applicationsByStatus?.interview || 0) +
                    (stats.applicationsByStatus?.shortlisted || 0)}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Alumni Welcome Card (if alumni logged in) */}
        {user?.role === 'alumni' && (
          <section className="bg-white rounded-2xl border border-pink-100 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-rose-700 text-xs font-bold uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-rose-600" />
                Alumni Experience & Guidance Portal
              </div>
              <h3 className="text-lg font-bold text-slate-900">Welcome, {user.firstName}!</h3>
              <p className="text-xs text-slate-600 max-w-xl">
                As a verified college graduate, you can share authentic internship experiences, write company reviews, and offer guidance to students once verified by the Placement Cell.
              </p>
            </div>
            <Link
              to="/alumni/dashboard"
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 self-start sm:self-center"
            >
              Open Alumni Portal
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </section>
        )}

        {/* Admin / Placement Cell Welcome Card */}
        {user?.role === 'admin_placement_cell' && (
          <section className="bg-white rounded-2xl border border-pink-100 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-rose-700 text-xs font-bold uppercase tracking-wider">
                <Briefcase className="w-4 h-4 text-rose-600" />
                Admin / Placement Cell Management Desk
              </div>
              <h3 className="text-lg font-bold text-slate-900">Welcome, {user.firstName} (Placement Cell)!</h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Publish genuine corporate opportunities, review alumni access requests, moderate reviews, and inspect application URLs under campus oversight.
              </p>
            </div>
            <Link
              to="/admin-placement"
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 self-start sm:self-center"
            >
              Go to Management Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </section>
        )}

        {/* Navigation Cards */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Core Services & Navigation</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/opportunities"
              className="bg-white rounded-xl border border-pink-100 p-5 shadow-xs hover:border-pink-300 hover:shadow-md transition-all group flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-pink-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-rose-700 transition-colors">
                  Opportunities
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Browse genuine paid internships, hiring challenges, and tech roles in Bengaluru, Pune, Hyderabad, and Remote.
                </p>
              </div>
            </Link>

            {user?.role === 'alumni' ? (
              <>
                <Link
                  to="/alumni/dashboard"
                  className="bg-white rounded-xl border border-pink-100 p-5 shadow-xs hover:border-pink-300 hover:shadow-md transition-all group flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-pink-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-rose-700 transition-colors">
                      Write an Experience Review
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Share honest insights about corporate culture, interview rounds, and work expectations.
                    </p>
                  </div>
                </Link>

                <Link
                  to="/alumni/dashboard"
                  className="bg-white rounded-xl border border-pink-100 p-5 shadow-xs hover:border-pink-300 hover:shadow-md transition-all group flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-pink-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-rose-700 transition-colors">
                      My Submitted Reviews
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Check review moderation status (Pending, Approved, Rejected) and withdraw reviews.
                    </p>
                  </div>
                </Link>
              </>
            ) : user?.role === 'admin_placement_cell' ? (
              <>
                <Link
                  to="/admin-placement"
                  className="bg-white rounded-xl border border-pink-100 p-5 shadow-xs hover:border-pink-300 hover:shadow-md transition-all group flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-pink-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-rose-700 transition-colors">
                      Publish & Edit Opportunities
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Add corporate openings with eligibility criteria, deadlines, and direct employer application links.
                    </p>
                  </div>
                </Link>

                <Link
                  to="/admin-placement"
                  className="bg-white rounded-xl border border-pink-100 p-5 shadow-xs hover:border-pink-300 hover:shadow-md transition-all group flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-pink-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-rose-700 transition-colors">
                      Alumni Requests & Directory
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Review incoming alumni access requests, verify graduation credentials, and manage directory permissions.
                    </p>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/resume"
                  className="bg-white rounded-xl border border-pink-100 p-5 shadow-xs hover:border-pink-300 hover:shadow-md transition-all group flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-pink-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-rose-700 transition-colors">
                      Resume & Skill Gaps
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Upload your PDF resume to extract skills and compute explainable coverage percentages per role.
                    </p>
                  </div>
                </Link>

                <Link
                  to="/applications"
                  className="bg-white rounded-xl border border-pink-100 p-5 shadow-xs hover:border-pink-300 hover:shadow-md transition-all group flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-pink-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-rose-700 transition-colors">
                      My Applications
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Track your self-reported applications, milestone timelines, notes, and deadlines.
                    </p>
                  </div>
                </Link>
              </>
            )}

            <Link
              to="/saved"
              className="bg-white rounded-xl border border-pink-100 p-5 shadow-xs hover:border-pink-300 hover:shadow-md transition-all group flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-pink-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-rose-700 transition-colors">
                  Saved Internships
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Quick access to bookmarked opportunities to apply before approaching deadlines.
                </p>
              </div>
            </Link>

            <Link
              to="/opportunities"
              className="bg-white rounded-xl border border-pink-100 p-5 shadow-xs hover:border-pink-300 hover:shadow-md transition-all group flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-pink-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-rose-700 transition-colors">
                  Alumni Reviews
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Read authentic workplace experiences and interview advice written by verified college alumni.
                </p>
              </div>
            </Link>

            <Link
              to="/profile"
              className="bg-white rounded-xl border border-pink-100 p-5 shadow-xs hover:border-pink-300 hover:shadow-md transition-all group flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-pink-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-rose-700 transition-colors">
                  My Profile
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Update degree, branch, year of study, and CGPA for automated academic eligibility checks.
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* Recent Genuine Opportunities */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recently Verified Opportunities Across India</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Authentic opportunities with direct links to official employer career portals.
              </p>
            </div>
            <Link
              to="/opportunities"
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              View All Opportunities
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentInternships.map(internship => (
              <InternshipCard
                key={internship.id}
                internship={internship}
                onToggleSave={handleToggleSave}
                onMatchSkills={int => setSelectedMatchInternship(int)}
                onRefresh={loadData}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Skill Match Modal */}
      {selectedMatchInternship && (
        <SkillMatchModal
          isOpen={!!selectedMatchInternship}
          onClose={() => setSelectedMatchInternship(null)}
          internshipId={selectedMatchInternship.id}
          internshipTitle={selectedMatchInternship.title}
          companyName={selectedMatchInternship.companyName}
        />
      )}
    </div>
  );
};
