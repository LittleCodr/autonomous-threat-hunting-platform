import React from 'react';
import Link from 'next/link';

export function NavigationRail() {
  const links = [
    { name: 'Command Center', path: '/', icon: '◱' },
    { name: 'Incidents', path: '/incidents', icon: '⚠' },
    { name: 'Event Explorer', path: '/events', icon: '≡' },
    { name: 'Threat Hunting', path: '/hunt', icon: '⌖' },
    { name: 'System / Rules', path: '/rules', icon: '⚙' },
  ];

  return (
    <nav className="w-16 flex flex-col border-r border-[#161B22] bg-[#0D1117] shrink-0 h-full">
      <div className="h-16 flex items-center justify-center border-b border-[#161B22] text-[#00F0FF] font-bold text-xl">
        Δ
      </div>
      <div className="flex-1 flex flex-col items-center py-4 gap-6">
        {links.map((link) => (
          <Link
            key={link.path}
            href={link.path}
            className="group relative flex items-center justify-center w-10 h-10 hover:bg-[#161B22] transition-colors"
            title={link.name}
          >
            <span className="text-gray-400 group-hover:text-[#00F0FF] text-xl">
              {link.icon}
            </span>
          </Link>
        ))}
      </div>
      <div className="h-16 flex items-center justify-center border-t border-[#161B22] text-xs text-gray-600 font-mono">
        v1.0
      </div>
    </nav>
  );
}
