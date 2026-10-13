import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Briefcase,
  ShieldCheck,
  FileText,
  Bookmark,
  Send,
  User,
  LogOut,
  Menu,
  X,
  Building2,
  GraduationCap,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/95 border-b border-pink-100 text-slate-800 sticky top-0 z-40 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-pink-100 border border-pink-200 flex items-center justify-center text-rose-600 group-hover:scale-105 transition-transform shadow-xs">
                <Briefcase className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center">
                  Intern<span className="text-rose-600">Fit</span>
                </span>
                <span className="text-[10px] text-rose-800/80 -mt-1 font-semibold tracking-wider uppercase">
                  College Placement & Verification
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/opportunities"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/opportunities')
                    ? 'bg-pink-50 text-rose-700 font-semibold'
                    : 'text-slate-600 hover:text-rose-700 hover:bg-pink-50/70'
                }`}
              >
                <Briefcase className="w-4 h-4 text-rose-500" />
                Opportunities
              </Link>

              {/* Student Only Navigation */}
              {user && user.role === 'student' && (
                <>
                  <Link
                    to="/check-risk"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/check-risk')
                        ? 'bg-pink-50 text-rose-700 font-semibold'
                        : 'text-slate-600 hover:text-rose-700 hover:bg-pink-50/70'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Check URL Risk
                  </Link>

                  <Link
                    to="/resume"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/resume')
                        ? 'bg-pink-50 text-rose-700 font-semibold'
                        : 'text-slate-600 hover:text-rose-700 hover:bg-pink-50/70'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-rose-500" />
                    Resume & Skills
                  </Link>

                  <Link
                    to="/applications"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/applications')
                        ? 'bg-pink-50 text-rose-700 font-semibold'
                        : 'text-slate-600 hover:text-rose-700 hover:bg-pink-50/70'
                    }`}
                  >
                    <Send className="w-4 h-4 text-rose-500" />
                    My Applications
                  </Link>

                  <Link
                    to="/saved"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/saved')
                        ? 'bg-pink-50 text-rose-700 font-semibold'
                        : 'text-slate-600 hover:text-rose-700 hover:bg-pink-50/70'
                    }`}
                  >
                    <Bookmark className="w-4 h-4 text-rose-500" />
                    Saved
                  </Link>
                </>
              )}

              {/* Public Check URL Risk when not signed in */}
              {!user && (
                <Link
                  to="/check-risk"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/check-risk')
                      ? 'bg-pink-50 text-rose-700 font-semibold'
                      : 'text-slate-600 hover:text-rose-700 hover:bg-pink-50/70'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Check URL Risk
                </Link>
              )}

              {/* Alumni Role Navigation */}
              {user && user.role === 'alumni' && (
                <Link
                  to="/alumni"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/alumni')
                      ? 'bg-pink-50 text-rose-700 font-semibold border-b-2 border-rose-500'
                      : 'text-slate-600 hover:text-rose-700 hover:bg-pink-50/70'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-rose-600" />
                  Alumni Hub
                </Link>
              )}

              {/* Admin / Placement Cell Unified Navigation */}
              {user && user.role === 'admin_placement_cell' && (
                <>
                  <Link
                    to="/admin-placement"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/admin-placement')
                        ? 'bg-pink-50 text-rose-700 font-semibold border-b-2 border-rose-500'
                        : 'text-slate-600 hover:text-rose-700 hover:bg-pink-50/70'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-rose-600" />
                    Admin / Placement Cell
                  </Link>
                  <Link
                    to="/check-risk"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/check-risk')
                        ? 'bg-pink-50 text-rose-700 font-semibold'
                        : 'text-slate-600 hover:text-rose-700 hover:bg-pink-50/70'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Check URL Risk
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-50 hover:bg-pink-100/70 border border-pink-200 text-slate-800 text-sm transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                    {user.firstName[0]}
                  </div>
                  <span className="font-medium text-slate-800">{user.firstName}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold tracking-wide">
                    {user.role === 'admin_placement_cell' ? 'Admin / Placement Cell' : user.role === 'alumni' ? 'Alumni' : 'Student'}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-pink-50 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-rose-700 px-3.5 py-2 rounded-lg hover:bg-pink-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all shadow-rose-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-pink-50"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-pink-100 px-4 pt-2 pb-4 space-y-1 bg-white shadow-lg">
          <Link
            to="/opportunities"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-pink-50 hover:text-rose-700"
          >
            Opportunities
          </Link>

          {(!user || user.role === 'student' || user.role === 'admin_placement_cell') && (
            <Link
              to="/check-risk"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-pink-50 hover:text-rose-700"
            >
              Check URL Risk
            </Link>
          )}

          {user && user.role === 'student' && (
            <>
              <Link
                to="/resume"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-pink-50 hover:text-rose-700"
              >
                Resume & Skills
              </Link>
              <Link
                to="/applications"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-pink-50 hover:text-rose-700"
              >
                My Applications
              </Link>
              <Link
                to="/saved"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-pink-50 hover:text-rose-700"
              >
                Saved Internships
              </Link>
            </>
          )}

          {user && user.role === 'alumni' && (
            <Link
              to="/alumni"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-rose-700 bg-pink-50 font-semibold"
            >
              Alumni Hub (Reviews & Verification)
            </Link>
          )}

          {user && user.role === 'admin_placement_cell' && (
            <Link
              to="/admin-placement"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-rose-700 bg-pink-50 font-semibold"
            >
              Admin / Placement Cell Dashboard
            </Link>
          )}

          {user && (
            <>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-pink-50 hover:text-rose-700"
              >
                My Profile ({user.firstName})
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-rose-600 hover:bg-pink-50"
              >
                Sign Out
              </button>
            </>
          )}

          {!user && (
            <div className="pt-2 border-t border-pink-100 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm font-medium text-rose-700 bg-pink-50 rounded-lg border border-pink-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm font-semibold text-white bg-rose-600 rounded-lg shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
