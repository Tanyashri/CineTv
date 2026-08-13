import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/auth.context';
import { Lock, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword, isLoading, error, clearError } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || undefined;

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    try {
      await resetPassword(password, token);
      setIsSuccess(true);
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
          className="glass glow w-full max-w-md rounded-2xl p-8 text-center shadow-2xl"
        >
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400 mb-2" />
          <h2 className="text-2xl font-bold text-white">Password Updated!</h2>
          <p className="mt-2 text-sm text-slate-300">
            Your password has been successfully reset. You can now log in with your new credentials.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 w-full rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white hover:bg-primary-500 transition-all"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass glow w-full max-w-md rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">Reset Password</h2>
          <p className="mt-1 text-sm text-slate-400">Set a new secure password for your account</p>
        </div>

        {(error || validationError) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{validationError || error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-surface-600 bg-surface-800 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
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
              'Reset Password'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
