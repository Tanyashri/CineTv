import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth.context';
import { Mail, Lock, User as UserIcon, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { register, signInWithGoogle, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await register(email, password, fullName);
      setIsSuccess(true);
    } catch {
      // Error handled in AuthContext
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch {
      // Error handled in AuthContext
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass w-full max-w-md rounded-2xl p-8 text-center shadow-xl"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white">Account Created!</h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300">
            We've sent a verification email to <span className="font-semibold text-primary-400">{email}</span>.
            Please verify your email or log in to continue.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 w-full btn-primary py-2.5 font-bold"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 items-center justify-center px-6 py-6 overflow-y-auto w-full scrollbar-thin">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass w-full max-w-[460px] rounded-3xl p-8 sm:p-10 shadow-2xl"
      >
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600/10 text-primary-400 border border-primary-500/20">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight text-white">Create Account</h2>
          <p className="mt-2 text-sm text-slate-400">Join CineVerse AI for personalized movie recommendations</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-400"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="absolute top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" style={{ left: '16px' }} />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full rounded-xl border border-surface-600 bg-surface-800/90 h-12 pr-4 text-sm sm:text-base text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-primary-500 outline-none transition-all"
                style={{ paddingLeft: '48px' }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" style={{ left: '16px' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-surface-600 bg-surface-800/90 h-12 pr-4 text-sm sm:text-base text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-primary-500 outline-none transition-all"
                style={{ paddingLeft: '48px' }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Password (min 8 characters)
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" style={{ left: '16px' }} />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-surface-600 bg-surface-800/90 h-12 pr-4 text-sm sm:text-base text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-primary-500 outline-none transition-all"
                style={{ paddingLeft: '48px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary h-12 font-bold text-sm sm:text-base disabled:opacity-50 mt-2 shadow-lg shadow-primary-500/25 cursor-pointer"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-surface-700"></div>
          <span className="text-[11px] uppercase text-slate-500 font-bold tracking-wider">or</span>
          <div className="h-px flex-1 bg-surface-700"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full btn-secondary h-12 font-bold text-sm sm:text-base flex items-center justify-center gap-3 cursor-pointer"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
            />
          </svg>
          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary-400 hover:text-primary-300 transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
