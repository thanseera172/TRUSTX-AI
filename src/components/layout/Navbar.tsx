import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.tsx';
import {
  ShieldCheck,
  PlusCircle,
  LayoutDashboard,
  History,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  User,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export function Navbar() {
  const { currentUser, userProfile, isDemoMode, setIsDemoMode, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'New Verification', path: '/new-verification', icon: PlusCircle },
    { name: 'History', path: '/history', icon: History },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Help & Docs', path: '/help', icon: HelpCircle },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#080D18]/90 backdrop-blur-md border-b border-[#1E2D48]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform glow-cyan">
              <ShieldCheck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-heading text-lg font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                  TRUSTX <span className="text-cyan-400">AI</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#111D30] text-cyan-300 border border-cyan-500/30">
                  LAB v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider">EVIDENCE BEFORE TRUST</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-[#111D30]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Action & User Profile */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Demo Badge */}
            {isDemoMode && (
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>DEMO MODE</span>
              </span>
            )}

            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#111D30] border border-[#1E2D48] hover:border-cyan-500/50 transition"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-500 flex items-center justify-center text-xs font-bold text-slate-950">
                    {(userProfile?.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="text-xs text-white max-w-[120px] truncate font-medium">
                    {userProfile?.displayName || currentUser.email?.split('@')[0]}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#111D30] border border-[#1E2D48] shadow-2xl py-1 z-50">
                    <div className="px-4 py-2 border-b border-[#1E2D48]">
                      <p className="text-xs font-semibold text-white truncate">
                        {userProfile?.displayName || 'Analyst'}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                    <Link
                      to="/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Account Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 transition text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-[#111D30] rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-md transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#111D30] transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0D1524] border-b border-[#1E2D48] px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-300 hover:bg-[#111D30]'
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-[#1E2D48]">
            {currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-950/30"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({currentUser.email})</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm text-slate-300 bg-[#111D30] rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold text-slate-950 bg-cyan-400 rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
