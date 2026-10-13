import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { CheckCircle, AlertCircle, Loader2, Mail } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      handleVerify(token);
    }
  }, [token]);

  const handleVerify = async (tok: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/verify-email', { token: tok });
      if (res.data.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Verification token is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
          <Mail className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Email Verification</h2>

        {loading && (
          <div className="py-8 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
            <span className="text-xs text-slate-500">Verifying secure token...</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-3">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-semibold text-sm">Your college email address has been successfully verified!</p>
            <Link
              to="/login"
              className="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs"
            >
              Sign In to Your Account
            </Link>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
            <p className="font-semibold">{error}</p>
            <Link to="/login" className="inline-block text-xs font-bold text-slate-600 underline">
              Back to Login
            </Link>
          </div>
        )}

        {!token && !loading && !success && (
          <p className="text-xs text-slate-500">
            No verification token found in URL. Please check the link sent to your college inbox.
          </p>
        )}
      </div>
    </div>
  );
};
