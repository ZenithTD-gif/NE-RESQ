import React from 'react';
import { LucideIcon, ShieldCheck } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = ShieldCheck,
  title,
  description,
  actionText,
  onAction,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl liquid-glass-card border border-cyan-500/20 ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-surfaceLight border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-cyan-glow">
        <Icon className="w-8 h-8 text-cyan-400" />
      </div>
      <h3 className="text-base sm:text-lg font-black text-white">{title}</h3>
      <p className="text-xs sm:text-sm text-charcoal-muted max-w-md mt-1.5 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-5 py-2.5 rounded-full bg-cyan-400 text-black text-xs font-bold hover:bg-cyan-300 transition-all shadow-cyan-glow"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
