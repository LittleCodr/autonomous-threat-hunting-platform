import React, { ButtonHTMLAttributes } from 'react';

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export function CyberButton({ children, variant = 'primary', className = '', ...props }: CyberButtonProps) {
  const baseClasses = 'cyber-button font-mono uppercase text-xs px-4 py-2 transition-all';
  
  const variantClasses = {
    primary: 'border-[#00F0FF] text-[#00F0FF] hover:bg-[#00F0FF] hover:text-[#07090D] shadow-[4px_4px_0px_rgba(0,240,255,0.2)]',
    secondary: 'border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14] hover:text-[#07090D] shadow-[4px_4px_0px_rgba(57,255,20,0.2)]',
    danger: 'border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444] hover:text-[#07090D] shadow-[4px_4px_0px_rgba(239,68,68,0.2)]',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
