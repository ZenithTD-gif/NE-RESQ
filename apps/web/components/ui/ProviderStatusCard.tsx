import React from 'react';
import { ExternalProviderStatus } from '@app-types';
import { ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ProviderStatusCardProps {
  provider: ExternalProviderStatus;
}

export function ProviderStatusCard({ provider }: ProviderStatusCardProps) {
  return (
    <div className="p-5 rounded-2xl liquid-glass-card border border-cyan-500/20 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-white text-sm">{provider.displayName}</h4>
          {provider.isConnected ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 shadow-emerald-glow">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              <AlertCircle className="w-3 h-3 text-amber-400" />
              Not Connected
            </span>
          )}
        </div>
        <p className="text-xs text-charcoal-muted leading-relaxed mb-3">
          {provider.statusMessage}
        </p>
      </div>

      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
        <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">
          Feed: {provider.providerName}
        </span>
        {provider.documentationUrl && (
          <a
            href={provider.documentationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-charcoal hover:text-cyan-400 transition-colors"
          >
            <span>Config Spec</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
