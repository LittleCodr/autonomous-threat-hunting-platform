import React from 'react';

interface SeverityIndicatorProps {
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  showLabel?: boolean;
  className?: string;
}

export function SeverityIndicator({ severity, showLabel = true, className = '' }: SeverityIndicatorProps) {
  const config = {
    INFO: { color: 'bg-blue-500', text: 'text-blue-500' },
    LOW: { color: 'bg-green-500', text: 'text-green-500' },
    MEDIUM: { color: 'bg-amber-500', text: 'text-amber-500' },
    HIGH: { color: 'bg-orange-500', text: 'text-orange-500' },
    CRITICAL: { color: 'bg-red-500', text: 'text-red-500 animate-pulse' },
  };

  const { color, text } = config[severity] || config.INFO;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-2 h-2 rounded-none ${color}`} />
      {showLabel && (
        <span className={`text-xs font-mono font-bold uppercase tracking-widest ${text}`}>
          {severity}
        </span>
      )}
    </div>
  );
}
