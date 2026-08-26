import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'muted';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-zinc-900 text-zinc-50 border-transparent dark:bg-zinc-100 dark:text-zinc-900',
    secondary: 'bg-zinc-100 text-zinc-800 border-transparent dark:bg-zinc-800 dark:text-zinc-200',
    outline: 'border border-zinc-200 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    muted: 'bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
