import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, Lock, Mail, Loader2, AlertCircle, Key, Check } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email: email.trim(), password });
      navigate('/opportunities');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#fff8f9]">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border border-pink-100 shadow-sm">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-pink-50 border border-pink-200 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to InternFit</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access genuine internship discovery, fraud risk checks, and resume skill matching
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              College Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. student@internfit.edu"
                className="w-full px-3.5 py-2.5 pl-10 border border-pink-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 bg-white"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-rose-600 hover:text-rose-700 font-semibold">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 pl-10 border border-pink-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 bg-white"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-sm transition-all flex items-center justify-center gap-2 shadow-rose-200"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        {/* Demo Accounts Quick-Fill Section */}
        <div className="pt-4 border-t border-pink-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 text-center">
            Quick Fill Demo Accounts
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('student@internfit.edu', 'Student@123')}
              className="px-2 py-1.5 rounded-lg border border-pink-200 bg-pink-50/70 hover:bg-pink-100/70 text-[11px] font-semibold text-rose-800 transition text-center"
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('alumni@internfit.edu', 'Alumni@123')}
              className="px-2 py-1.5 rounded-lg border border-pink-200 bg-pink-50/70 hover:bg-pink-100/70 text-[11px] font-semibold text-rose-800 transition text-center"
            >
              🏛️ Alumni
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin@internfit.edu', 'Admin@123')}
              className="px-2 py-1.5 rounded-lg border border-pink-200 bg-pink-50/70 hover:bg-pink-100/70 text-[11px] font-semibold text-rose-800 transition text-center"
            >
              🛡️ Admin/Cell
            </button>
          </div>
        </div>

        <div className="text-center pt-2 border-t border-pink-100 text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-rose-600 font-bold hover:underline">
            Register with College Email
          </Link>
        </div>
      </div>
    </div>
  );
};
