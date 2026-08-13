import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'Failed to load movie data. Please check your connection and try again.',
  onRetry,
}) => {
  return (
    <div className="flex min-h-[35vh] flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/10 p-8 text-center backdrop-blur-md">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 mb-4">
        <AlertCircle className="h-7 w-7" />
      </div>

      <h3 className="text-base font-bold text-white mb-1">{title}</h3>
      <p className="max-w-md text-xs text-slate-400 mb-6">{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 rounded-xl bg-surface-800 border border-surface-600 px-4 py-2 text-xs font-semibold text-white hover:bg-surface-700 transition-all shadow-md"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};
