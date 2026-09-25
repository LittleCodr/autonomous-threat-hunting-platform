import React from 'react';

interface StatusBadgeProps {
  status: 'OPEN' | 'INVESTIGATING' | 'CLOSED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getColors = () => {
    switch (status) {
      case 'OPEN':
      case 'FAILED':
        return 'border-[#EF4444] text-[#EF4444] bg-[#EF4444]/10'; // Critical red
      case 'INVESTIGATING':
      case 'RUNNING':
        return 'border-[#00F0FF] text-[#00F0FF] bg-[#00F0FF]/10 animate-pulse'; // Electric Cyan
      case 'CLOSED':
      case 'COMPLETED':
        return 'border-[#39FF14] text-[#39FF14] bg-[#39FF14]/10'; // Acid green
      default:
        return 'border-gray-500 text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 border text-xs font-mono uppercase tracking-wider ${getColors()} ${className}`}
    >
      [{status}]
    </span>
  );
}
