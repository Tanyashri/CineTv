import React from 'react';

export const MovieCardSkeleton: React.FC = () => {
  return (
    <div className="glass group overflow-hidden rounded-xl border border-surface-700/80 p-2 animate-pulse">
      <div className="aspect-[2/3] w-full rounded-lg bg-surface-800" />
      <div className="mt-2.5 space-y-2">
        <div className="h-3.5 w-3/4 rounded bg-surface-700" />
        <div className="h-2.5 w-1/2 rounded bg-surface-800" />
        <div className="h-6 w-full rounded bg-surface-800 mt-2" />
      </div>
    </div>
  );
};

export const MovieGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const MovieDetailsSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-72 sm:h-96 w-full rounded-2xl bg-surface-800" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="aspect-[2/3] w-full rounded-xl bg-surface-800" />
        <div className="md:col-span-2 space-y-4">
          <div className="h-8 w-2/3 rounded bg-surface-700" />
          <div className="h-4 w-1/3 rounded bg-surface-800" />
          <div className="h-24 w-full rounded bg-surface-800" />
          <div className="h-10 w-48 rounded bg-surface-700" />
        </div>
      </div>
    </div>
  );
};
