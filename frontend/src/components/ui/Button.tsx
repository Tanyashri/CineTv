import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'rounded-md bg-gradient-to-b from-[#f6121d] to-[#d80712] text-white shadow-[0_10px_22px_-12px_rgba(229,9,20,0.95)] ring-1 ring-white/10 hover:brightness-110 hover:shadow-[0_15px_28px_-12px_rgba(229,9,20,1)] active:translate-y-px',
  secondary:
    'rounded-md border border-white/20 bg-white/10 text-slate-200 shadow-sm hover:border-white/45 hover:bg-white/18 hover:text-white active:translate-y-px',
  ghost:
    'rounded-md text-slate-400 hover:bg-white/10 hover:text-white active:translate-y-px',
  danger:
    'rounded-md bg-[#9d0710] text-white shadow-[0_10px_22px_-12px_rgba(157,7,16,.9)] hover:bg-[#bd0813] active:translate-y-px',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, children, className = '', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center gap-2 font-semibold tracking-[0.01em] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
