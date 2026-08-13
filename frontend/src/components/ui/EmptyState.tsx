import React from 'react';
import { Film, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  description = 'There is nothing to display here yet.',
  actionText = 'Explore Movies',
  actionLink = '/discover',
  onAction,
  icon,
}) => {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-surface-700/60 bg-surface-900/40 p-8 text-center backdrop-blur-md">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-800 text-slate-400 border border-surface-700 shadow-inner mb-4">
        {icon || <Film className="h-8 w-8 text-primary-400" />}
      </div>

      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="max-w-md text-xs text-slate-400 mb-6">{description}</p>

      {onAction ? (
        <button onClick={onAction} className="btn-primary">
          <span>{actionText}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      ) : actionLink ? (
        <Link to={actionLink} className="btn-primary">
          <span>{actionText}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
};
