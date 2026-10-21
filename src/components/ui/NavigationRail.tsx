'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavigationRail() {
  const pathname = usePathname();

  const links = [
    { name: 'Command Center', subtitle: 'Main Dashboard', path: '/', icon: '◱' },
    { name: 'Threats & Incidents', subtitle: 'Caught Break-Ins', path: '/incidents', icon: '⚠' },
    { name: 'Live Security Feed', subtitle: 'Raw Computer Logs', path: '/events', icon: '≡' },
    { name: 'Detective Search', subtitle: 'Investigate Person / IP', path: '/hunt', icon: '⌖' },
    { name: 'Tripwires & Proof', subtitle: 'Rules & Millisecond Audit', path: '/rules', icon: '⚙' },
  ];

  return (
    <nav className="w-16 md:w-20 flex flex-col border-r border-[#161B22] bg-[#07090D] shrink-0 h-full select-none z-30">
      {/* Brand Icon */}
      <div className="h-16 flex flex-col items-center justify-center border-b border-[#161B22] text-[#00F0FF]">
        <div className="relative font-black text-2xl tracking-tighter">
          Δ
          <span className="absolute -top-1 -right-2 w-2 h-2 bg-[#39FF14] rounded-full animate-ping" />
        </div>
        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">DETECTIVE</span>
      </div>

      {/* Nav Links */}
      <div className="flex-1 flex flex-col items-center py-6 gap-6">
        {links.map((link) => {
          const isActive = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path));
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`group relative flex items-center justify-center w-12 h-12 border transition-all ${
                isActive
                  ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                  : 'border-transparent text-gray-500 hover:text-gray-200 hover:border-[#161B22] hover:bg-[#0D1117]'
              }`}
              title={link.name}
            >
              <span className="text-xl font-mono">{link.icon}</span>

              {/* Tooltip on hover */}
              <div className="pointer-events-none absolute left-16 md:left-20 whitespace-nowrap bg-[#0D1117] border border-[#00F0FF]/40 text-xs font-mono px-3 py-2 text-gray-100 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-2xl rounded-none">
                <div className="font-bold text-[#00F0FF]">{link.name}</div>
                <div className="text-[10px] text-gray-400">{link.subtitle}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Status Footer */}
      <div className="h-16 flex flex-col items-center justify-center border-t border-[#161B22] text-[10px] text-gray-500 font-mono">
        <span className="text-[#39FF14] flex items-center gap-1 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14]" />
          ACTIVE
        </span>
        <span className="text-[9px] text-gray-600">FIREBASE LIVE</span>
      </div>
    </nav>
  );
}
