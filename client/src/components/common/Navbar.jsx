import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Recycle, Menu, X, Award, User, LogOut, ShieldCheck, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { toast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.info('You have been logged out.');
    navigate('/');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Mobile Sidebar Trigger */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-brand-700 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                <Recycle className="w-5 h-5" />
              </div>
              <div>
                <span className="font-heading font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-brand-700 transition-colors">
                  Eco<span className="text-brand-600">Track</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-800 border border-brand-200">
                  Smart Waste
                </span>
              </div>
            </Link>
          </div>

          {/* Center Links (for landing / guest) */}
          {!isAuthenticated && !isAuthPage && (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="/#features" className="hover:text-brand-700 transition-colors">Features</a>
              <a href="/#how-it-works" className="hover:text-brand-700 transition-colors">How It Works</a>
              <a href="/#rewards" className="hover:text-brand-700 transition-colors">Rewards</a>
              <Link to="/rewards" className="hover:text-brand-700 transition-colors">Leaderboard</Link>
            </nav>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Points Pill (Residents) */}
                {!isAdmin && (
                  <Link
                    to="/rewards"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
                    title="View Recycling Rewards"
                  >
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>{user?.points || 0} pts</span>
                  </Link>
                )}

                {/* Role Pill */}
                {isAdmin ? (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    Resident
                  </span>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
                    aria-expanded={dropdownOpen}
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-700 text-white font-bold flex items-center justify-center text-xs">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="hidden md:inline text-sm font-semibold text-slate-800 max-w-[120px] truncate">
                      {user?.name}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setDropdownOpen(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-200 py-2 z-20">
                        <div className="px-4 py-2 border-b border-slate-100">
                          <p className="text-xs font-medium text-slate-400">Signed in as</p>
                          <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
                        </div>

                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          Account Settings
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-purple-700 hover:bg-purple-50 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4 text-purple-500" />
                            Admin Console
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-700 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-700 hover:bg-brand-800 rounded-xl transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
