import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { testFirestoreConnection } from '../services/firebase.ts';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Settings,
  User,
  Mail,
  Shield,
  Key,
  LogOut,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Moon,
  Sun,
  Database,
  Sliders,
  Sparkles,
  RefreshCw,
  Check,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

export function SettingsPage() {
  const {
    currentUser,
    userProfile,
    updateName,
    resetPassword,
    updateUserPassword,
    logout,
    deleteAccount,
    isDemoMode,
  } = useAuth();
  const navigate = useNavigate();

  // Profile fields
  const [name, setName] = useState(userProfile?.displayName || '');
  const [organization, setOrganization] = useState(() => localStorage.getItem('trustx_user_org') || 'AI Safety Laboratory');
  const [analystRole, setAnalystRole] = useState(() => localStorage.getItem('trustx_user_role') || 'Lead Research Auditor');
  const [nameUpdated, setNameUpdated] = useState(false);

  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('trustx_theme') as 'dark' | 'light') || 'dark';
  });

  // Password reset state
  const [resetSent, setResetSent] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // Direct password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Database connection diagnostic
  const [dbStatus, setDbStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [dbLatency, setDbLatency] = useState<number | null>(null);

  // Audit Preferences
  const [sensitivity, setSensitivity] = useState<'strict' | 'balanced' | 'permissive'>(() => {
    return (localStorage.getItem('trustx_pref_sensitivity') as any) || 'balanced';
  });
  const [maxClaims, setMaxClaims] = useState<number>(() => {
    return parseInt(localStorage.getItem('trustx_pref_max_claims') || '6', 10);
  });
  const [enableSecurityScan, setEnableSecurityScan] = useState<boolean>(() => {
    return localStorage.getItem('trustx_pref_security') !== 'false';
  });
  const [autoPersistCloud, setAutoPersistCloud] = useState<boolean>(() => {
    return localStorage.getItem('trustx_pref_persist') !== 'false';
  });
  const [prefsSaved, setPrefsSaved] = useState(false);

  // Apply theme to document element
  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('trustx_theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  useEffect(() => {
    if (userProfile?.displayName) {
      setName(userProfile.displayName);
    }
  }, [userProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await updateName(name.trim());
      localStorage.setItem('trustx_user_org', organization);
      localStorage.setItem('trustx_user_role', analystRole);
      setNameUpdated(true);
      setTimeout(() => setNameUpdated(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update analyst profile.');
    }
  };

  const handlePasswordReset = async () => {
    const targetEmail = currentUser?.email || userProfile?.email;
    if (!targetEmail) {
      setError('No email address registered for password recovery.');
      return;
    }
    try {
      const res = await resetPassword(targetEmail);
      setResetSent(true);
      setResetMessage(res.message);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to dispatch reset email.');
    }
  };

  const handleDirectPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword.length < 6) {
      setPasswordError('New password must contain at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Passwords do not match. Please verify your confirm password.');
      return;
    }
    try {
      setPasswordUpdating(true);
      await updateUserPassword(newPassword);
      setPasswordUpdated(true);
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setPasswordUpdated(false), 5000);
    } catch (err: any) {
      setPasswordError(err?.message || 'Failed to update password.');
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleTestDatabase = async () => {
    setDbStatus('testing');
    const start = performance.now();
    try {
      const isOk = await testFirestoreConnection();
      const end = performance.now();
      setDbLatency(Math.round(end - start));
      setDbStatus(isOk ? 'connected' : 'error');
    } catch {
      setDbStatus('error');
    }
  };

  const handleSavePreferences = () => {
    localStorage.setItem('trustx_pref_sensitivity', sensitivity);
    localStorage.setItem('trustx_pref_max_claims', String(maxClaims));
    localStorage.setItem('trustx_pref_security', String(enableSecurityScan));
    localStorage.setItem('trustx_pref_persist', String(autoPersistCloud));
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 3000);
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      navigate('/register');
    } catch (err: any) {
      setError(err?.message || 'Could not delete account. Re-authentication may be required.');
      setShowDeleteModal(false);
    }
  };

  const displayEmail = currentUser?.email || userProfile?.email || (isDemoMode ? 'guest.analyst@trustx-ai.org' : 'analyst@trustx-ai.org');
  const displayUid = currentUser?.uid || userProfile?.uid || (isDemoMode ? 'demo_sandbox_user' : 'analyst_active');

  return (
    <div className="min-h-screen bg-[#080D18] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-[#111D30] border border-[#1E2D48] rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center space-x-2 mb-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
              Profile & Configuration
            </span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-white">System Settings</h1>
          <p className="text-xs text-slate-300 mt-1">
            Manage your researcher identity, cloud database synchronization, verification sensitivity, and display preferences.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Analyst Identity */}
        <div className="bg-[#111D30] border border-[#1E2D48] rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-white flex items-center space-x-2">
              <User className="w-4 h-4 text-cyan-400" />
              <span>Analyst Identity</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-500/40">
              Verified Profile
            </span>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Jordan Hayes"
                  className="w-full px-3.5 py-2.5 bg-[#080D18] border border-[#1E2D48] focus:border-cyan-400 focus:outline-none rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Email Address</label>
                <input
                  type="text"
                  disabled
                  value={displayEmail}
                  className="w-full px-3.5 py-2.5 bg-[#080D18]/50 border border-[#1E2D48] rounded-lg text-sm text-slate-400 cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Organization / Institution</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. AI Safety Laboratory"
                  className="w-full px-3.5 py-2.5 bg-[#080D18] border border-[#1E2D48] focus:border-cyan-400 focus:outline-none rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Analyst Title</label>
                <input
                  type="text"
                  value={analystRole}
                  onChange={(e) => setAnalystRole(e.target.value)}
                  placeholder="e.g. Lead Research Auditor"
                  className="w-full px-3.5 py-2.5 bg-[#080D18] border border-[#1E2D48] focus:border-cyan-400 focus:outline-none rounded-lg text-sm text-white"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition glow-cyan"
              >
                Save Profile Changes
              </button>
              {nameUpdated && (
                <span className="text-xs text-emerald-400 flex items-center space-x-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Profile updated successfully!</span>
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Section 2: Theme & Display Mode */}
        <div className="bg-[#111D30] border border-[#1E2D48] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-white flex items-center space-x-2">
              <Moon className="w-4 h-4 text-cyan-400" />
              <span>Theme & Display Mode</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Active: {theme === 'dark' ? 'Dark Laboratory' : 'High-Contrast Light'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`p-4 rounded-xl border text-left flex items-start space-x-3 transition ${
                theme === 'dark'
                  ? 'bg-cyan-950/40 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/50'
                  : 'bg-[#080D18] border-[#1E2D48] text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="p-2 rounded-lg bg-[#080D18] border border-[#1E2D48]">
                <Moon className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="font-semibold text-xs text-white">Dark Theme (Default Lab)</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Deep space background with glowing cyber accents for prolonged laboratory audits.
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={`p-4 rounded-xl border text-left flex items-start space-x-3 transition ${
                theme === 'light'
                  ? 'bg-cyan-950/40 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/50'
                  : 'bg-[#080D18] border-[#1E2D48] text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="p-2 rounded-lg bg-[#080D18] border border-[#1E2D48]">
                <Sun className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="font-semibold text-xs text-white">High-Contrast Light</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Clean crisp paper aesthetic with high contrast for daytime document evaluation.
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Section 3: Verification & Laboratory Preferences */}
        <div className="bg-[#111D30] border border-[#1E2D48] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Verification Laboratory Preferences</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Engine Config</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Verification Rigor Sensitivity</label>
              <div className="grid grid-cols-3 gap-2">
                {(['strict', 'balanced', 'permissive'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSensitivity(mode)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-medium capitalize border transition ${
                      sensitivity === mode
                        ? 'bg-cyan-950/40 border-cyan-400 text-cyan-300'
                        : 'bg-[#080D18] border-[#1E2D48] text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {sensitivity === 'strict' && 'Flags any statement lacking explicit academic or primary documentation.'}
                {sensitivity === 'balanced' && 'Standard empirical corroboration with external grounding checks.'}
                {sensitivity === 'permissive' && 'Focuses primarily on direct factual contradictions and AST code errors.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Max Grounded Claims per Audit</label>
              <div className="grid grid-cols-4 gap-2">
                {[4, 6, 8, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setMaxClaims(num)}
                    className={`py-2 rounded-lg text-xs font-medium border transition ${
                      maxClaims === num
                        ? 'bg-cyan-950/40 border-cyan-400 text-cyan-300'
                        : 'bg-[#080D18] border-[#1E2D48] text-slate-400 hover:text-white'
                    }`}
                  >
                    {num} Claims
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Higher counts provide exhaustive coverage; lower counts optimize for maximum velocity.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3 rounded-xl bg-[#080D18] border border-[#1E2D48] flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Static AST Code Scanning</div>
                <div className="text-[11px] text-slate-400">Detect SQLi, secrets, and dangerous deserialization</div>
              </div>
              <input
                type="checkbox"
                checked={enableSecurityScan}
                onChange={(e) => setEnableSecurityScan(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#080D18] border border-[#1E2D48] flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Auto-Persist to Firestore Cloud</div>
                <div className="text-[11px] text-slate-400">Record verification constellation graph automatically</div>
              </div>
              <input
                type="checkbox"
                checked={autoPersistCloud}
                onChange={(e) => setAutoPersistCloud(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={handleSavePreferences}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition"
            >
              Save Audit Preferences
            </button>
            {prefsSaved && (
              <span className="text-xs text-emerald-400 flex items-center space-x-1 font-mono">
                <Check className="w-3.5 h-3.5" />
                <span>Preferences saved!</span>
              </span>
            )}
          </div>
        </div>

        {/* Section 4: Live Cloud Firestore Diagnostics */}
        <div className="bg-[#111D30] border border-[#1E2D48] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-white flex items-center space-x-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Cloud Firestore Database Diagnostics</span>
            </h2>
            <button
              type="button"
              onClick={handleTestDatabase}
              disabled={dbStatus === 'testing'}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#080D18] text-cyan-300 hover:text-white border border-[#1E2D48] hover:border-cyan-400 transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${dbStatus === 'testing' ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#080D18] border border-[#1E2D48]">
              <span className="text-[10px] text-slate-500 font-mono block">Google Cloud Project</span>
              <span className="text-xs font-bold text-white font-mono">{firebaseConfig.projectId}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#080D18] border border-[#1E2D48]">
              <span className="text-[10px] text-slate-500 font-mono block">Dedicated Database ID</span>
              <span className="text-xs font-bold text-cyan-300 font-mono truncate block" title={firebaseConfig.firestoreDatabaseId}>
                {firebaseConfig.firestoreDatabaseId}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#080D18] border border-[#1E2D48]">
              <span className="text-[10px] text-slate-500 font-mono block">Connection Status</span>
              <span className="text-xs font-bold font-mono flex items-center space-x-1 mt-0.5">
                {dbStatus === 'connected' && (
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Online ({dbLatency}ms latency)</span>
                  </span>
                )}
                {dbStatus === 'error' && <span className="text-amber-400">Restricted / Offline</span>}
                {dbStatus === 'testing' && <span className="text-cyan-400 animate-pulse">Pinging server...</span>}
                {dbStatus === 'idle' && <span className="text-emerald-400">Provisioned & Active</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Section 5: Authentication & Security Credentials */}
        <div className="bg-[#111D30] border border-[#1E2D48] rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold font-heading text-white flex items-center space-x-2">
            <Key className="w-4 h-4 text-violet-400" />
            <span>Authentication Credentials</span>
          </h2>

          <div className="p-4 rounded-xl bg-[#080D18] border border-[#1E2D48] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-white mb-0.5">Password Reset Link</h4>
                <p className="text-[11px] text-slate-400">
                  Send a password recovery email to <span className="text-cyan-400 font-mono">{displayEmail}</span>.
                </p>
              </div>
              <button
                type="button"
                onClick={handlePasswordReset}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#111D30] text-cyan-300 hover:text-white border border-[#1E2D48] hover:border-cyan-400 transition whitespace-nowrap glow-cyan"
              >
                {resetSent ? 'Link Dispatched' : 'Send Reset Link'}
              </button>
            </div>

            {resetSent && (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Password Reset Dispatched</span>
                </div>
                <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                  {resetMessage || `Recovery message dispatched for ${displayEmail}.`}
                </p>
                <p className="text-[10px] text-slate-300 font-mono mt-1">
                  Tip: Check your <strong className="text-white">Spam / Junk</strong> folder for <span className="text-cyan-300">noreply@alert-script-2bvhw.firebaseapp.com</span>, or update your password directly below without waiting for email delivery.
                </p>
              </div>
            )}
          </div>

          {/* Direct Password Update Form */}
          <div className="p-4 rounded-xl bg-[#080D18] border border-[#1E2D48] space-y-3">
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Direct Password Update</h4>
              <p className="text-[11px] text-slate-400">
                Instantly change your account password directly on this device without email delivery delays.
              </p>
            </div>

            {passwordError && (
              <div className="p-2.5 rounded-lg bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordUpdated && (
              <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Password changed successfully! You can now use your new password.</span>
              </div>
            )}

            <form onSubmit={handleDirectPasswordChange} className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      className="w-full pl-8 pr-9 py-2 bg-[#111D30] border border-[#1E2D48] focus:border-cyan-400 focus:outline-none rounded-lg text-xs text-white placeholder-slate-600 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 transition"
                      aria-label="Toggle new password visibility"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      className="w-full pl-8 pr-9 py-2 bg-[#111D30] border border-[#1E2D48] focus:border-cyan-400 focus:outline-none rounded-lg text-xs text-white placeholder-slate-600 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 transition"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordUpdating || !newPassword || !confirmNewPassword}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition flex items-center space-x-1.5"
              >
                <span>{passwordUpdating ? 'Updating...' : 'Update Password Directly'}</span>
              </button>
            </form>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#080D18] border border-[#1E2D48]">
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Authentication Identifier</h4>
              <p className="text-[11px] text-slate-400 font-mono">
                UID: {displayUid}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40">
              Verified Session
            </span>
          </div>
        </div>

        {/* Section 6: Danger Zone */}
        <div className="bg-[#111D30] border border-rose-950/80 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold font-heading text-rose-400 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-rose-400" />
            <span>Danger Zone</span>
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Sign Out of Session</h4>
              <p className="text-[11px] text-slate-400">Terminates active authentication and clears local session cache.</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#080D18] text-slate-300 hover:text-white border border-[#1E2D48] hover:border-rose-400 transition flex items-center space-x-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#1E2D48]">
            <div>
              <h4 className="text-xs font-bold text-rose-400 mb-0.5">Delete Researcher Account</h4>
              <p className="text-[11px] text-slate-400">
                Permanently wipes all profile data, local cache, and registered verifications.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/40 transition"
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111D30] border border-rose-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center space-x-3 mb-4 text-rose-400">
                <Trash2 className="w-6 h-6" />
                <h3 className="text-base font-bold text-white">Permanently Delete Account?</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                This will eradicate your researcher record, local session data, and custom verification audit preferences.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition"
                >
                  Confirm Account Deletion
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
