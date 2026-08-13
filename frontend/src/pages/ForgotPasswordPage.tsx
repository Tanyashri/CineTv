import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/auth.context';
import { Mail, KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword, isLoading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch {
      // Error handled in AuthContext
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass glow w-full max-w-md rounded-2xl p-8 shadow-2xl"
      >
        <Link to="/login" className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Sign In
        </Link>

        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg">
            <KeyRound className="h-7 w-7 text-white" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">Forgot Password</h2>
          <p className="mt-1 text-sm text-slate-400">Enter your email and we'll send you reset instructions</p>
        </div>

        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-6 text-center"
          >
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400 mb-2" />
            <h3 className="text-lg font-semibold text-white">Reset Email Sent</h3>
            <p className="mt-2 text-sm text-slate-300">
              If an account exists for <span className="font-semibold text-primary-400">{email}</span>, you will receive a password reset link shortly.
            </p>
          </motion.div>
        ) : (
          <>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-surface-600 bg-surface-800 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-primary-500 hover:to-primary-400 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
