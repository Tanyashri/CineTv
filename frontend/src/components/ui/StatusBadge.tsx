type Status = 'connected' | 'disconnected' | 'pending';

interface StatusBadgeProps {
  status: Status;
  label?: string;
}

const statusConfig: Record<Status, { dot: string; bg: string; text: string; defaultLabel: string }> = {
  connected: {
    dot: 'bg-emerald-400',
    bg: 'bg-emerald-400/10',
    text: 'text-emerald-400',
    defaultLabel: 'Connected',
  },
  disconnected: {
    dot: 'bg-red-400',
    bg: 'bg-red-400/10',
    text: 'text-red-400',
    defaultLabel: 'Disconnected',
  },
  pending: {
    dot: 'bg-amber-400 animate-pulse',
    bg: 'bg-amber-400/10',
    text: 'text-amber-400',
    defaultLabel: 'Pending',
  },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {label ?? config.defaultLabel}
    </span>
  );
}
