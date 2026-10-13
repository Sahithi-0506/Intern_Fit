import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, Lock, Mail, User as UserIcon, Loader2, AlertCircle, CheckCircle, GraduationCap } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<'student' | 'alumni'>('student');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Alumni specific
  const [graduationYear, setGraduationYear] = useState(2024);
  const [degree, setDegree] = useState('B.Tech');
  const [branch, setBranch] = useState('Computer Science');
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [mentorship, setMentorship] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState<{ message: string; token?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      };

      if (role === 'alumni') {
        payload.alumniInfo = {
          graduationYear: Number(graduationYear),
          degree: degree.trim(),
          branch: branch.trim(),
          currentCompany: currentCompany.trim(),
          currentRole: currentRole.trim(),
          linkedinUrl: linkedinUrl.trim(),
          isOpenToMentorship: mentorship,
        };
      }

      const res = await register(payload);
      setRegisteredSuccess({
        message: res.message,
        token: res.verificationToken,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#fff8f9]">
      <div className="max-w-xl w-full space-y-6 bg-white p-8 rounded-2xl border border-pink-100 shadow-sm">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-pink-50 border border-pink-200 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create an InternFit Account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Institutional registration validated against the approved college email domain list
          </p>
        </div>

        {/* Success Banner */}
        {registeredSuccess ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-900 text-base">Registration Successful!</h4>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  {registeredSuccess.message}
                </p>
              </div>
            </div>

            {registeredSuccess.token && (
              <div className="p-4 bg-white rounded-lg border border-emerald-200 text-xs text-slate-700 space-y-2">
                <span className="font-bold text-emerald-900 block">Instant Verification Link:</span>
                <p className="text-[11px] text-slate-500">
                  Click the button below to verify your email address immediately:
                </p>
                <Link
                  to={`/verify-email?token=${registeredSuccess.token}`}
                  className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-sm transition"
                >
                  Verify Email Address Now →
                </Link>
              </div>
            )}

            <div className="pt-2 text-center">
              <Link to="/login" className="text-xs font-bold text-emerald-800 underline">
                Return to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Toggle */}
            <div className="flex rounded-xl bg-pink-50/70 p-1 border border-pink-100">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  role === 'student' ? 'bg-white text-rose-800 shadow-sm border border-pink-100' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🎓 College Student
              </button>
              <button
                type="button"
                onClick={() => setRole('alumni')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  role === 'alumni' ? 'bg-white text-rose-800 shadow-sm border border-pink-100' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🏛️ Alumnus
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="e.g. Rahul"
                  className="w-full px-3 py-2 border border-pink-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="e.g. Sharma"
                  className="w-full px-3 py-2 border border-pink-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                College Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. student@internfit.edu or candidate@nitt.edu"
                className="w-full px-3 py-2 border border-pink-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono bg-white"
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Must match an approved domain (e.g. @internfit.edu, @nitt.edu, @iitb.ac.in). Public Gmail/Yahoo is rejected.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 number"
                className="w-full px-3 py-2 border border-pink-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                required
              />
            </div>

            {/* Alumni Specific Fields */}
            {role === 'alumni' && (
              <div className="p-4 bg-pink-50/50 border border-pink-100 rounded-xl space-y-3">
                <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <GraduationCap className="w-4 h-4 text-rose-600" />
                  Alumni Experience Details
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Degree Program</label>
                    <input
                      type="text"
                      value={degree}
                      onChange={e => setDegree(e.target.value)}
                      placeholder="B.Tech"
                      className="w-full px-2.5 py-1.5 border border-pink-200 rounded-lg text-xs bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Graduation Year</label>
                    <input
                      type="number"
                      value={graduationYear}
                      onChange={e => setGraduationYear(parseInt(e.target.value, 10))}
                      className="w-full px-2.5 py-1.5 border border-pink-200 rounded-lg text-xs bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Current Company</label>
                    <input
                      type="text"
                      value={currentCompany}
                      onChange={e => setCurrentCompany(e.target.value)}
                      placeholder="Microsoft / TCS"
                      className="w-full px-2.5 py-1.5 border border-pink-200 rounded-lg text-xs bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Current Role</label>
                    <input
                      type="text"
                      value={currentRole}
                      onChange={e => setCurrentRole(e.target.value)}
                      placeholder="Software Engineer"
                      className="w-full px-2.5 py-1.5 border border-pink-200 rounded-lg text-xs bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">LinkedIn Profile URL *</label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={e => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-2.5 py-1.5 border border-pink-200 rounded-lg text-xs bg-white"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-sm transition-all flex items-center justify-center gap-2 shadow-rose-200"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register Account'}
            </button>

            <div className="text-center pt-2 border-t border-pink-100 text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-rose-700 hover:text-rose-800">
                Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
