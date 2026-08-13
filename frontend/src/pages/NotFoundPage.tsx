import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, Film } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* Animated icon */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, -5, 5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-600/20 to-accent-500/20"
        >
          <Film className="h-12 w-12 text-primary-400" />
        </motion.div>

        {/* Error code */}
        <h1 className="mb-2 text-8xl font-extrabold tracking-tighter">
          <span className="gradient-text">404</span>
        </h1>

        <h2 className="mb-4 text-2xl font-semibold text-white">Scene Not Found</h2>

        <p className="mx-auto mb-8 max-w-md text-slate-400">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back to the main feature.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-shadow hover:shadow-xl"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
