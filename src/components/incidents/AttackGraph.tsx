'use client';

import React, { useState } from 'react';
import { SecurityEvent } from '@/types';

interface AttackGraphProps {
  events: SecurityEvent[];
  incidentTitle: string;
}

export function AttackGraph({ events, incidentTitle }: AttackGraphProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const attackerIps = Array.from(new Set(events.map(e => e.source_ip).filter(Boolean)));
  const users = Array.from(new Set(events.map(e => e.user).filter(Boolean)));
  const devices = Array.from(new Set(events.map(e => e.device).filter(Boolean)));
  const destIps = Array.from(new Set(events.map(e => e.destination_ip).filter(Boolean)));

  const mainAttacker = attackerIps[0] || '185.88.92.1';
  const mainUser = users[0] || 'victim_account';
  const mainDevice = devices[0] || 'WORKSTATION-01';
  const mainTarget = destIps[0] || 'Database Backup Server';

  const nodes = [
    {
      id: 'attacker',
      label: 'ATTACKER ORIGIN',
      value: mainAttacker,
      type: 'threat',
      icon: '☠',
      color: 'border-[#EF4444] text-[#EF4444] bg-[#EF4444]/10',
      description: `External internet IP triggering tripwires. Associated with suspicious geolocation and consecutive logon attempts.`
    },
    {
      id: 'computer',
      label: 'ENTRY COMPUTER',
      value: mainDevice,
      type: 'endpoint',
      icon: '💻',
      color: 'border-amber-400 text-amber-400 bg-amber-400/10',
      description: `Internal corporate computer where unauthorized session was established and scripts were executed.`
    },
    {
      id: 'user',
      label: 'COMPROMISED IDENTITY',
      value: mainUser,
      type: 'identity',
      icon: '👤',
      color: 'border-[#00F0FF] text-[#00F0FF] bg-[#00F0FF]/10',
      description: `User account whose credentials were brute-forced or stolen to gain unauthorized access.`
    },
    {
      id: 'target',
      label: 'EXFIL / C2 DESTINATION',
      value: mainTarget,
      type: 'target',
      icon: '📦',
      color: 'border-purple-400 text-purple-400 bg-purple-400/10',
      description: `External command & control socket or database storage where sensitive company files were routed.`
    }
  ];

  return (
    <div className="panel p-6 border border-[#161B22] space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#161B22] pb-3">
        <div>
          <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-[#00F0FF] flex items-center gap-2">
            <span>Attack Lateral Movement Topology</span>
            <span className="text-[10px] text-gray-500 font-normal">VISUAL ENTITY GRAPH</span>
          </h3>
          <p className="text-[11px] font-mono text-gray-400 mt-0.5">
            How the threat actor executed: <span className="text-gray-200 font-bold">{incidentTitle}</span> across internet, computer, identity, and data.
          </p>
        </div>
        <span className="text-[10px] font-mono text-[#39FF14] bg-[#39FF14]/10 border border-[#39FF14] px-2 py-0.5 font-bold">
          4 CORRELATED NODES
        </span>
      </div>

      {/* Visual Node Chain */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative py-2">
        {nodes.map((node, index) => {
          const isSelected = selectedNode === node.id;
          return (
            <div key={node.id} className="relative flex flex-col">
              {/* Connector Arrow on Desktop */}
              {index < nodes.length - 1 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-[#00F0FF] font-mono text-xs animate-pulse">
                  ➔
                </div>
              )}

              <button
                onClick={() => setSelectedNode(isSelected ? null : node.id)}
                className={`panel p-4 text-left transition-all border cursor-pointer ${node.color} ${
                  isSelected ? 'shadow-[0_0_15px_rgba(0,240,255,0.4)] scale-102 ring-1 ring-[#00F0FF]' : 'hover:scale-101'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xl">{node.icon}</span>
                  <span className="text-[9px] font-mono tracking-widest uppercase opacity-75 font-bold">
                    STEP {index + 1}
                  </span>
                </div>
                <div className="text-[10px] font-mono uppercase tracking-wider opacity-80">
                  {node.label}
                </div>
                <div className="font-mono text-xs font-bold text-gray-100 truncate mt-1">
                  {node.value}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Node Detail Drawer */}
      {selectedNode && (
        <div className="panel p-4 bg-[#07090D] border border-[#00F0FF] font-mono text-xs space-y-2">
          <div className="flex justify-between items-center text-[#00F0FF] font-bold">
            <span>
              NODE INSPECTION: {nodes.find(n => n.id === selectedNode)?.label} ({nodes.find(n => n.id === selectedNode)?.value})
            </span>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-white"
            >
              [CLOSE]
            </button>
          </div>
          <p className="text-gray-300 text-[11px] leading-relaxed">
            {nodes.find(n => n.id === selectedNode)?.description}
          </p>
        </div>
      )}
    </div>
  );
}
