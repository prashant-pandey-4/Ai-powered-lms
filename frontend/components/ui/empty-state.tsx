import React from 'react';
import Link from 'next/link';
import { LucideIcon, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  badge,
  primaryAction,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`relative overflow-hidden flex flex-col items-center justify-center rounded-3xl border border-dashed border-app p-10 sm:p-14 text-center bg-card shadow-lg ${className}`}
    >
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 rounded-full bg-[#f97316]/5 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-sm space-y-4">
        {/* Glowing Icon Container */}
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f97316]/20 to-[#f59e0b]/10 border border-[#f97316]/30 text-[#f97316] shadow-lg shadow-[#f97316]/10">
          <Icon className="h-7 w-7" />
          {badge && (
            <span className="absolute -top-2 -right-2 flex h-5 items-center rounded-full bg-[#f97316] px-1.5 text-[9px] font-bold text-white shadow-sm">
              {badge}
            </span>
          )}
        </div>

        {/* Text Content */}
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-app tracking-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Buttons */}
        {(primaryAction || secondaryAction) && (
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 w-full">
            {primaryAction && (
              primaryAction.href ? (
                <Link href={primaryAction.href} className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full glow-amber-btn px-5 py-2.5 text-xs font-bold text-white transition-all">
                    {primaryAction.icon && <primaryAction.icon className="h-3.5 w-3.5" />}
                    {primaryAction.label}
                  </button>
                </Link>
              ) : (
                <button
                  onClick={primaryAction.onClick}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full glow-amber-btn px-5 py-2.5 text-xs font-bold text-white transition-all"
                >
                  {primaryAction.icon && <primaryAction.icon className="h-3.5 w-3.5" />}
                  {primaryAction.label}
                </button>
              )
            )}

            {secondaryAction && (
              secondaryAction.href ? (
                <Link href={secondaryAction.href} className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-app bg-card-2 px-5 py-2.5 text-xs font-bold text-app hover:border-[#f97316]/60 transition-colors">
                    {secondaryAction.icon && <secondaryAction.icon className="h-3.5 w-3.5" />}
                    {secondaryAction.label}
                  </button>
                </Link>
              ) : (
                <button
                  onClick={secondaryAction.onClick}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-app bg-card-2 px-5 py-2.5 text-xs font-bold text-app hover:border-[#f97316]/60 transition-colors"
                >
                  {secondaryAction.icon && <secondaryAction.icon className="h-3.5 w-3.5" />}
                  {secondaryAction.label}
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
