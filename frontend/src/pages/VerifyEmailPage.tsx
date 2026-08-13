import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, MailCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function VerifyEmailPage() {
  const [status, setStatus] = useState<'verifying' | 'success'>('verifying');
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('success');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass glow w-full max-w-md rounded-2xl p-8 text-center shadow-2xl"
      >
        {status === 'verifying' ? (
          <div>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-400">
              <MailCheck className="h-8 w-8 animate-bounce" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-white">Verifying Email...</h2>
            <p className="mt-2 text-sm text-slate-400">Please wait while we confirm your email address.</p>
          </div>
        ) : (
          <div>
            <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400 mb-2" />
            <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
            <p className="mt-2 text-sm text-slate-300">
              Your email address has been successfully verified. You can now access all CineVerse AI features.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 w-full rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white hover:bg-primary-500 transition-all"
            >
              Continue to CineVerse
            </button>
            <p className="mt-4 text-xs text-slate-500">
              Need to sign in? <Link to="/login" className="text-primary-400 hover:underline">Log in</Link>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
