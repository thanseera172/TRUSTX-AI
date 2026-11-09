import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';

export function RegisterPage() {
  const { register, loginWithGoogle, setIsDemoMode } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your confirm password field.');
      return;
    }
    if (!termsAccepted) {
      setError('You must accept the terms of service to create an account.');
      return;
    }

    try {
      setLoading(true);
      await register(name.trim(), email.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      let msg = 'Failed to create account.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists. Please log in.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'The password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'The email address is invalid.';
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      setLoading(true);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setError(err?.message || 'Google authentication was cancelled or encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    setIsDemoMode(true);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#080D18] flex items-center justify-center p-4 cyber-grid">
      <div className="w-full max-w-md bg-[#111D30] border border-[#1E2D48] rounded-2xl p-8 shadow-2xl relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center mx-auto mb-3 shadow-lg glow-cyan">
            <ShieldCheck className="w-7 h-7 text-slate-950 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-white">Create Analyst Account</h2>
          <p className="text-xs text-slate-400 mt-1">Initialize your TRUSTX AI verification laboratory profile</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Jordan Hayes"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-[#080D18] border border-[#1E2D48] focus:border-cyan-400 focus:outline-none rounded-lg text-sm text-white placeholder-slate-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan.hayes@ai-safety.org"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-[#080D18] border border-[#1E2D48] focus:border-cyan-400 focus:outline-none rounded-lg text-sm text-white placeholder-slate-600 transition font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-9 pr-10 py-2.5 bg-[#080D18] border border-[#1E2D48] focus:border-cyan-400 focus:outline-none rounded-lg text-sm text-white placeholder-slate-600 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-9 pr-10 py-2.5 bg-[#080D18] border border-[#1E2D48] focus:border-cyan-400 focus:outline-none rounded-lg text-sm text-white placeholder-slate-600 transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start space-x-2.5 pt-1">
            <button
              type="button"
              onClick={() => setTermsAccepted(!termsAccepted)}
              className="mt-0.5 text-cyan-400 hover:text-cyan-300 transition flex-shrink-0"
            >
              {termsAccepted ? <CheckSquare className="w-4 h-4 text-cyan-400" /> : <Square className="w-4 h-4 text-slate-500" />}
            </button>
            <label
              onClick={() => setTermsAccepted(!termsAccepted)}
              className="text-xs text-slate-400 cursor-pointer select-none leading-tight"
            >
              I agree to the{' '}
              <span className="text-cyan-400 underline">Terms of Verification</span> and understand that TRUSTX AI
              evaluates empirical evidence without guaranteeing 100% infallible truth.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition shadow-md flex items-center justify-center space-x-2 mt-4 glow-cyan"
          >
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#1E2D48]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-[#111D30] text-slate-500 font-mono">OR</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-[#080D18] border border-[#1E2D48] hover:border-slate-500 text-xs font-semibold text-white transition flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign Up with Google</span>
          </button>

          <button
            type="button"
            onClick={handleGuestAccess}
            className="w-full py-2.5 px-4 rounded-lg bg-[#0D1524] border border-cyan-500/30 hover:border-cyan-400 text-xs font-semibold text-cyan-300 transition flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Instant Guest Analyst Access</span>
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
