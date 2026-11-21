import React from 'react';

interface LiquidCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: 'emergency' | 'emerald' | 'amber' | 'none';
  interactive?: boolean;
}

export function LiquidCard({
  children,
  className = '',
  glow = 'none',
  interactive = false,
  ...props
}: LiquidCardProps) {
  const glowStyles = {
    emergency: 'hover:border-emergency/40 hover:shadow-emergency-glow',
    emerald: 'hover:border-emerald-500/40 hover:shadow-emerald-500/20',
    amber: 'hover:border-amber-500/40 hover:shadow-amber-500/20',
    none: ''
  }[glow];

  return (
    <div
      className={`liquid-glass-card rounded-3xl p-6 relative overflow-hidden ${
        interactive ? 'cursor-pointer hover:-translate-y-1' : ''
      } ${glowStyles} ${className}`}
      {...props}
    >
      {/* Subtle glossy top refraction line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
      {children}
    </div>
  );
}
