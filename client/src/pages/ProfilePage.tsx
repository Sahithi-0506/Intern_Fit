import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, CheckCircle, Loader2, AlertCircle, Info, ShieldCheck } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, studentProfile, updateProfile } = useAuth();

  const [collegeName, setCollegeName] = useState('');
  const [degree, setDegree] = useState('B.Tech');
  const [branch, setBranch] = useState('Computer Science');
  const [yearOfStudy, setYearOfStudy] = useState(3);
  const [graduationYear, setGraduationYear] = useState(2027);
  const [cgpa, setCgpa] = useState('8.0');
  const [hasBacklogs, setHasBacklogs] = useState(false);
  const [bio, setBio] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (studentProfile) {
      setCollegeName(studentProfile.collegeName || '');
      setDegree(studentProfile.degree || 'B.Tech');
      setBranch(studentProfile.branch || 'Computer Science');
      setYearOfStudy(studentProfile.yearOfStudy || 3);
      setGraduationYear(studentProfile.graduationYear || 2027);
      setCgpa(studentProfile.cgpa !== null && studentProfile.cgpa !== undefined ? String(studentProfile.cgpa) : '8.0');
      setHasBacklogs(studentProfile.hasActiveBacklogs || false);
      setBio(studentProfile.bio || '');
      setLinkedinUrl(studentProfile.linkedinUrl || '');
      setGithubUrl(studentProfile.githubUrl || '');
    }
  }, [studentProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setLoading(true);

    try {
      await updateProfile({
        collegeName: collegeName.trim() || undefined,
        degree: degree.trim() || undefined,
        branch: branch.trim() || undefined,
        yearOfStudy: Number(yearOfStudy),
        graduationYear: Number(graduationYear),
        cgpa: parseFloat(cgpa) || undefined,
        hasActiveBacklogs: hasBacklogs,
        bio: bio.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
      });
      setSuccessMsg('Profile updated successfully! Academic eligibility checks will reflect these criteria.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <User className="w-8 h-8 text-teal-600" />
          Student Academic Profile
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Your academic profile powers independent eligibility evaluations across all internship listings.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Verification Status Banner */}
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span className="font-semibold text-teal-900">Registered College Email:</span>
            <span className="font-mono text-teal-800">{user?.email}</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-teal-200 text-teal-900 font-bold uppercase text-[10px]">
            {user?.isEmailVerified ? 'Verified Domain' : 'Verification Pending'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                College / Institution Name
              </label>
              <input
                type="text"
                value={collegeName}
                onChange={e => setCollegeName(e.target.value)}
                placeholder="e.g. InternFit Engineering Institute"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Degree Program *
              </label>
              <select
                value={degree}
                onChange={e => setDegree(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="B.Tech">B.Tech / B.E.</option>
                <option value="M.Tech">M.Tech / M.E.</option>
                <option value="BCA">BCA</option>
                <option value="MCA">MCA</option>
                <option value="B.Sc Computer Science">B.Sc Computer Science</option>
                <option value="Dual Degree">Dual Degree (B.Tech + M.Tech)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Branch / Specialization *
              </label>
              <input
                type="text"
                value={branch}
                onChange={e => setBranch(e.target.value)}
                placeholder="e.g. Computer Science and Engineering"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Year of Study *
                </label>
                <select
                  value={yearOfStudy}
                  onChange={e => setYearOfStudy(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                  <option value={5}>5th Year</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Graduation Year *
                </label>
                <input
                  type="number"
                  min="2024"
                  max="2035"
                  value={graduationYear}
                  onChange={e => setGraduationYear(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Cumulative CGPA (Out of 10) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={cgpa}
                onChange={e => setCgpa(e.target.value)}
                placeholder="e.g. 8.45"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                id="backlogs"
                checked={hasBacklogs}
                onChange={e => setHasBacklogs(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
              <label htmlFor="backlogs" className="ml-2 text-xs font-semibold text-slate-700 cursor-pointer">
                I currently have active academic backlogs
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Short Professional Bio
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="e.g. 3rd year CSE student interested in backend systems, distributed databases, and high-performance Java APIs."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={e => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                GitHub Profile URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Save Academic Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
