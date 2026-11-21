import React from 'react';

export type BadgeVariant = 
  | 'ADVISORY' 
  | 'WATCH' 
  | 'WARNING' 
  | 'SEVERE_WARNING' 
  | 'EMERGENCY'
  | 'SUBMITTED'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'CLOSED'
  | 'CONNECTED'
  | 'DISCONNECTED';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const norm = status.toUpperCase();

  let colorClasses = 'bg-surfaceLight text-charcoal-muted border-white/10';
  let dotColor = 'bg-slate-400';

  if (norm.includes('EMERGENCY') || norm.includes('CRITICAL') || norm.includes('SEVERE')) {
    colorClasses = 'bg-emergency/15 text-emergency border-emergency/40 shadow-emergency-glow';
    dotColor = 'bg-emergency animate-pulse';
  } else if (norm.includes('WARNING') || norm.includes('WATCH') || norm.includes('ASSIGNED')) {
    colorClasses = 'bg-amber-500/15 text-amber-400 border-amber-500/40';
    dotColor = 'bg-amber-400';
  } else if (norm.includes('VERIFIED') || norm.includes('CONNECTED') || norm.includes('AVAILABLE') || norm.includes('CLOSED')) {
    colorClasses = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-emerald-glow';
    dotColor = 'bg-emerald-400';
  } else if (norm.includes('SUBMITTED') || norm.includes('ADVISORY') || norm.includes('REVIEW') || norm.includes('GAUGE') || norm.includes('SHELTER')) {
    colorClasses = 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40 shadow-cyan-glow';
    dotColor = 'bg-cyan-400';
  }

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold border backdrop-blur-md ${colorClasses} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{status.replace(/_/g, ' ')}</span>
    </span>
  );
}
