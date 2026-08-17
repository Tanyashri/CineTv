import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth.context';
import { Mail, Lock, AlertCircle, Film } from 'lucide-react';
import { motion } from 'framer-motion';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, signInWithGoogle, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      navigate(from, { replace: true });
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

  return (
    <div className="w-full bg-[var(--background)] text-[var(--text-primary)] flex flex-col md:grid md:grid-cols-2 md:overflow-hidden overflow-visible" style={{ height: 'calc(100vh - 80px)', minHeight: 'calc(100vh - 80px)' }}>
      
      {/* CSS Keyframe Animations Injection */}
      <style>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
          50% { transform: translateY(-12px) rotate(calc(var(--rot, 0deg) + 2deg)); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
          50% { transform: translateY(12px) rotate(calc(var(--rot, 0deg) - 2deg)); }
        }
        @keyframes rise-slow {
          0% { transform: translateY(105%) translateX(0px); opacity: 0; }
          10% { opacity: 0.55; }
          90% { opacity: 0.55; }
          100% { transform: translateY(-10%) translateX(var(--drift, 10px)); opacity: 0; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.1); }
        }
        @keyframes film-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-34px); }
        }
      `}</style>

      {/* ─── LEFT SIDE: CineTV Animated Branding / Visual Section ─── */}
      <div className="relative w-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[var(--background)] via-[var(--surface-elevated)] to-[var(--background)] border-b md:border-b-0 md:border-r border-[var(--border)] overflow-hidden select-none" style={{ minHeight: '360px' }}>
        
        {/* ─── ANIMATION CONTAINER (z-index: 1) ─── */}
        <div className="absolute inset-0 z-1 overflow-hidden pointer-events-none">
          
          {/* Soft Cinematic Background Glows */}
          <div
            className="absolute -top-1/4 -left-1/4 w-[85%] h-[85%] rounded-full bg-[#ef4444] blur-[140px] pointer-events-none"
            style={{ animation: 'pulse-slow 12s ease-in-out infinite' }}
          />
          <div
            className="absolute -bottom-1/4 -right-1/4 w-[85%] h-[85%] rounded-full bg-[#b91c1c] blur-[140px] pointer-events-none"
            style={{ animation: 'pulse-slow 16s ease-in-out infinite', animationDelay: '-4s' }}
          />

          {/* Film Strip Borders (Scrolling Sprocket Tracks) */}
          <div className="absolute top-0 bottom-0 left-6 w-6 border-r border-dashed border-[var(--border)] opacity-20 overflow-hidden">
            <div
              className="flex flex-col gap-4 py-4"
              style={{ animation: 'film-scroll 4s linear infinite' }}
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="w-3.5 h-4.5 rounded-[3px] border border-[var(--border)] bg-[var(--surface-elevated)] shrink-0" />
              ))}
            </div>
          </div>
          <div className="absolute top-0 bottom-0 right-6 w-6 border-l border-dashed border-[var(--border)] opacity-20 overflow-hidden">
            <div
              className="flex flex-col gap-4 py-4"
              style={{ animation: 'film-scroll 4s linear infinite' }}
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="w-3.5 h-4.5 rounded-[3px] border border-[var(--border)] bg-[var(--surface-elevated)] shrink-0" />
              ))}
            </div>
          </div>

          {/* Rotating Film Reels */}
          {/* Reel 1 (Top Left) */}
          <div
            className="absolute top-[8%] left-[8%] opacity-15 dark:opacity-20 text-[var(--text-primary)]"
            style={{
              width: '180px',
              height: '180px',
              animation: 'spin-slow 24s linear infinite'
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="50" cy="50" r="16" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="50" cy="50" r="4.5" fill="currentColor" />
              {Array.from({ length: 5 }).map((_, i) => {
                const angle = (i * 2 * Math.PI) / 5;
                const cx = 50 + 26 * Math.cos(angle);
                const cy = 50 + 26 * Math.sin(angle);
                return <circle key={i} cx={cx} cy={cy} r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />;
              })}
            </svg>
          </div>

          {/* Reel 2 (Bottom Right) */}
          <div
            className="absolute bottom-[8%] right-[8%] opacity-10 dark:opacity-15 text-[var(--text-primary)]"
            style={{
              width: '130px',
              height: '130px',
              animation: 'spin-slow 30s linear infinite',
              animationDirection: 'reverse'
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="50" cy="50" r="16" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="50" cy="50" r="4.5" fill="currentColor" />
              {Array.from({ length: 5 }).map((_, i) => {
                const angle = (i * 2 * Math.PI) / 5;
                const cx = 50 + 26 * Math.cos(angle);
                const cy = 50 + 26 * Math.sin(angle);
                return <circle key={i} cx={cx} cy={cy} r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />;
              })}
            </svg>
          </div>

          {/* Floating Film Strips */}
          {/* Film Strip 1 (Top Right) */}
          <div
            className="absolute top-[12%] right-[10%] opacity-15 dark:opacity-20 text-[var(--text-primary)]"
            style={{
              width: '110px',
              height: '55px',
              animation: 'float-slow 8s ease-in-out infinite',
              '--rot': '12deg'
            } as React.CSSProperties}
          >
            <svg viewBox="0 0 100 50" className="w-full h-full">
              <rect x="2" y="2" width="96" height="46" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <line x1="26" y1="2" x2="26" y2="48" stroke="currentColor" strokeWidth="1" />
              <line x1="50" y1="2" x2="50" y2="48" stroke="currentColor" strokeWidth="1" />
              <line x1="74" y1="2" x2="74" y2="48" stroke="currentColor" strokeWidth="1" />
              {Array.from({ length: 8 }).map((_, i) => (
                <g key={i}>
                  <rect x={6 + i * 12} y="5" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="0.75" fill="none" />
                  <rect x={6 + i * 12} y="41" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="0.75" fill="none" />
                </g>
              ))}
            </svg>
          </div>

          {/* Film Strip 2 (Bottom Left) */}
          <div
            className="absolute bottom-[16%] left-[10%] opacity-15 dark:opacity-20 text-[var(--text-primary)]"
            style={{
              width: '110px',
              height: '55px',
              animation: 'float-slower 9s ease-in-out infinite',
              '--rot': '-8deg'
            } as React.CSSProperties}
          >
            <svg viewBox="0 0 100 50" className="w-full h-full">
              <rect x="2" y="2" width="96" height="46" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <line x1="26" y1="2" x2="26" y2="48" stroke="currentColor" strokeWidth="1" />
              <line x1="50" y1="2" x2="50" y2="48" stroke="currentColor" strokeWidth="1" />
              <line x1="74" y1="2" x2="74" y2="48" stroke="currentColor" strokeWidth="1" />
              {Array.from({ length: 8 }).map((_, i) => (
                <g key={i}>
                  <rect x={6 + i * 12} y="5" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="0.75" fill="none" />
                  <rect x={6 + i * 12} y="41" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="0.75" fill="none" />
                </g>
              ))}
            </svg>
          </div>

          {/* Floating Soft Glowing Circles */}
          <div
            className="absolute top-[40%] left-[20%] w-16 h-16 rounded-full bg-[#E50914] blur-xl opacity-30 pointer-events-none"
            style={{ animation: 'float-slow 6s ease-in-out infinite' }}
          />
          <div
            className="absolute top-[35%] right-[20%] w-20 h-20 rounded-full bg-[#E50914] blur-2xl opacity-25 pointer-events-none"
            style={{ animation: 'float-slower 7s ease-in-out infinite' }}
          />

          {/* Rising Light Particles */}
          {Array.from({ length: 12 }).map((_, i) => {
            const size = (i % 3) * 2 + 3; // 3px, 5px, 7px
            const left = (i * 8.5) % 100;
            const delay = i * 0.8;
            const duration = 8 + (i % 4) * 2.5; // 8s to 15.5s
            const drift = (i % 2 === 0 ? 30 : -30) + 'px';
            return (
              <div
                key={i}
                className="absolute rounded-full bg-[#E50914] blur-[0.5px]"
                style={{
                  width: size,
                  height: size,
                  left: `${left}%`,
                  bottom: '-10px',
                  animation: `rise-slow ${duration}s linear infinite`,
                  animationDelay: `${delay}s`,
                  '--drift': drift
                } as React.CSSProperties}
              />
            );
          })}

        </div>

        {/* ─── BRANDING CONTENT (z-index: 2) ─── */}
        <div className="relative z-2 flex flex-col items-center justify-center max-w-md px-4 pointer-events-none">
          <div className="flex items-center gap-3 mb-4">
            <Film className="h-10 w-10 text-[#E50914]" />
            <span className="text-3xl font-black tracking-wider text-[var(--text-primary)]">CineTV</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] leading-tight">
            Your Next Story Starts Here
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] font-medium leading-relaxed">
            AI-powered movie discovery, personalized for you.
          </p>
        </div>
      </div>

      {/* ─── RIGHT SIDE: Auth Form ─── */}
      <div className="w-full flex items-center justify-center p-8 sm:p-12 md:p-16 bg-[var(--background)] overflow-y-auto scrollbar-thin">
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[420px] flex flex-col"
        >
          {/* Welcome Text */}
          <div>
            <h2 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">Welcome Back</h2>
            <p className="mt-1.5 text-sm text-[var(--text-secondary)] font-medium">Sign in to your CineTV account</p>
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" style={{ left: '16px' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-card)] h-12 pr-4 text-sm sm:text-base text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914]/30 outline-none transition-all"
                  style={{ paddingLeft: '48px' }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-bold text-[#E50914] hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" style={{ left: '16px' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-card)] h-12 pr-4 text-sm sm:text-base text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914]/30 outline-none transition-all"
                  style={{ paddingLeft: '48px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#E50914] hover:bg-[#F6121D] text-white font-bold rounded-xl text-sm sm:text-base disabled:opacity-50 mt-2 shadow-lg shadow-[#E50914]/20 transition-all flex items-center justify-center cursor-pointer"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--border)]"></div>
            <span className="text-[11px] uppercase text-[var(--text-muted)] font-bold tracking-wider">or</span>
            <div className="h-px flex-1 bg-[var(--border)]"></div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full border border-[var(--border)] bg-[var(--surface-card)] hover:bg-[var(--surface-elevated)] text-[var(--text-primary)] h-12 font-bold text-sm sm:text-base flex items-center justify-center gap-3 rounded-xl transition-all cursor-pointer"
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

          {/* Footer sign up */}
          <p className="mt-8 text-center text-sm text-[var(--text-secondary)] font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#E50914] hover:underline transition-colors">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

    </div>
  );
}
