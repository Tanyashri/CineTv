import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/auth.context';

// Lazy-loaded pages for performance & bundle splitting
const DiscoverPage = lazy(() => import('@/pages/DiscoverPage').then((m) => ({ default: m.DiscoverPage })));
const MovieDetailsPage = lazy(() => import('@/pages/MovieDetailsPage').then((m) => ({ default: m.MovieDetailsPage })));
const RecommendationsPage = lazy(() => import('@/pages/RecommendationsPage').then((m) => ({ default: m.RecommendationsPage })));
const WatchlistPage = lazy(() => import('@/pages/WatchlistPage').then((m) => ({ default: m.WatchlistPage })));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage').then((m) => ({ default: m.FavoritesPage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const HealthPage = lazy(() => import('@/pages/HealthPage').then((m) => ({ default: m.HealthPage })));
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const VerifyEmailPage = lazy(() => import('@/pages/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
    </div>
  );
}

// Redirect authenticated users away from /login and /register
function AnonymousOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageFallback />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

// Route Guard for "/": Allows HomePage to render if user hasn't seen the Dome intro yet, otherwise requires authentication
function HomeRouteGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageFallback />;

  const hasSeenIntro = Boolean(localStorage.getItem('cinetv_intro_seen'));

  if (!isAuthenticated && hasSeenIntro) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <HomePage />;
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<RootLayout />}>
          {/* Main Root Route: Plays Dome Intro on first visit, then mandates Sign In */}
          <Route path="/" element={<HomeRouteGuard />} />
          <Route
            path="/discover"
            element={
              <ProtectedRoute>
                <DiscoverPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/movie/:id"
            element={
              <ProtectedRoute>
                <MovieDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <RecommendationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/health" element={<HealthPage />} />

          {/* Auth Guarded Anonymous Routes */}
          <Route
            path="/login"
            element={
              <AnonymousOnlyRoute>
                <LoginPage />
              </AnonymousOnlyRoute>
            }
          />
          <Route
            path="/signin"
            element={<Navigate to="/login" replace />}
          />
          <Route
            path="/register"
            element={
              <AnonymousOnlyRoute>
                <RegisterPage />
              </AnonymousOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={<Navigate to="/register" replace />}
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* Protected Routes (Requires Auth) */}
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <WatchlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
