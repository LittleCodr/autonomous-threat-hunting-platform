import React from 'react';

interface RiskMeterProps {
  score: number;
  className?: string;
}

export function RiskMeter({ score, className = '' }: RiskMeterProps) {
  let color = 'text-green-500 border-green-500 bg-green-500/10';
  let label = 'LOW';
  
  if (score >= 40 && score < 70) {
    color = 'text-amber-500 border-amber-500 bg-amber-500/10';
    label = 'MEDIUM';
  } else if (score >= 70 && score < 90) {
    color = 'text-orange-500 border-orange-500 bg-orange-500/10';
    label = 'HIGH';
  } else if (score >= 90) {
    color = 'text-red-500 border-red-500 bg-red-500/10';
    label = 'CRITICAL';
  }

  return (
    <div className={`flex flex-col gap-1 panel p-3 ${color} ${className}`}>
      <div className="text-xs font-mono uppercase tracking-widest opacity-80">Risk Score</div>
      <div className="flex items-end gap-2">
        <div className="text-4xl font-bold font-mono tracking-tighter">
          {score}
        </div>
        <div className="text-sm font-mono mb-1">/ 100</div>
      </div>
      <div className="text-xs font-mono font-bold tracking-widest mt-1">
        {label}
      </div>
    </div>
  );
}
