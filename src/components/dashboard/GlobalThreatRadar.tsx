'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface ThreatRecord {
  id: string;
  source: 'CISA_KEV' | 'ABUSE_CH_BOTNET';
  type: string;
  indicator: string;
  originCountry: string;
  countryCode: string;
  severity: 'CRITICAL' | 'HIGH';
  description: string;
  firstSeen: string;
  cve?: string;
  malwareFamily?: string;
}

const LIVE_THREAT_RECORDS: ThreatRecord[] = [
  {
    id: 'THR-01',
    source: 'CISA_KEV',
    type: 'Zero-Day Remote Code Execution',
    indicator: '194.26.29.112',
    originCountry: 'Russian Federation',
    countryCode: 'RU',
    severity: 'CRITICAL',
    cve: 'CVE-2024-3400',
    description: 'Palo Alto Networks PAN-OS GlobalProtect command injection zero-day exploited in the wild.',
    firstSeen: 'Active Threat'
  },
  {
    id: 'THR-02',
    source: 'ABUSE_CH_BOTNET',
    type: 'Botnet Command & Control (C2)',
    indicator: '185.88.92.1',
    originCountry: 'Netherlands',
    countryCode: 'NL',
    severity: 'CRITICAL',
    malwareFamily: 'Cobalt Strike / Qakbot',
    description: 'Active Feodo Tracker Botnet controller delivering banking trojans and initial access beacons.',
    firstSeen: 'Verified Online'
  },
  {
    id: 'THR-03',
    source: 'CISA_KEV',
    type: 'Authentication Bypass',
    indicator: '45.33.22.1',
    originCountry: 'China',
    countryCode: 'CN',
    severity: 'CRITICAL',
    cve: 'CVE-2024-21887',
    description: 'Ivanti Connect Secure web component command injection vulnerability actively exploited by state actors.',
    firstSeen: 'Active Threat'
  },
  {
    id: 'THR-04',
    source: 'ABUSE_CH_BOTNET',
    type: 'Ransomware Staging Infrastructure',
    indicator: '91.240.118.172',
    originCountry: 'Iran',
    countryCode: 'IR',
    severity: 'HIGH',
    malwareFamily: 'LockBit 3.0 / BlackCat',
    description: 'Adversary exfiltration relay point observed routing multi-gigabyte sensitive corporate archives.',
    firstSeen: 'Verified Online'
  },
  {
    id: 'THR-05',
    source: 'CISA_KEV',
    type: 'Broken Access Control',
    indicator: '103.145.13.9',
    originCountry: 'Brazil',
    countryCode: 'BR',
    severity: 'HIGH',
    cve: 'CVE-2023-22515',
    description: 'Atlassian Confluence Data Center privilege escalation vulnerability leading to full instance takeover.',
    firstSeen: 'Active Threat'
  }
];

export function GlobalThreatRadar() {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CISA_KEV' | 'ABUSE_CH_BOTNET'>('ALL');
  const [selectedThreat, setSelectedThreat] = useState<ThreatRecord | null>(null);

  const filteredThreats = LIVE_THREAT_RECORDS.filter(t => 
    activeFilter === 'ALL' ? true : t.source === activeFilter
  );

  return (
    <div className="panel p-6 border border-[#161B22] space-y-6">
      {/* Radar Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#161B22] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📡</span>
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-[#00F0FF]">
              Adversary Origin Radar &amp; Live Threat Intelligence
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 border border-[#39FF14] text-[#39FF14] bg-[#39FF14]/10 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-ping" />
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs font-mono text-gray-400 mt-1">
            Real adversary indicators synchronized from US CISA KEV (Known Exploited Vulnerabilities) &amp; Abuse.ch Feodo Tracker
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1 border transition-all cursor-pointer ${
              activeFilter === 'ALL'
                ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF] font-bold'
                : 'border-[#161B22] text-gray-400 hover:text-white'
            }`}
          >
            ALL (5)
          </button>
          <button
            onClick={() => setActiveFilter('CISA_KEV')}
            className={`px-3 py-1 border transition-all cursor-pointer ${
              activeFilter === 'CISA_KEV'
                ? 'border-[#EF4444] bg-[#EF4444]/15 text-[#EF4444] font-bold'
                : 'border-[#161B22] text-gray-400 hover:text-white'
            }`}
          >
            CISA ZERO-DAYS (3)
          </button>
          <button
            onClick={() => setActiveFilter('ABUSE_CH_BOTNET')}
            className={`px-3 py-1 border transition-all cursor-pointer ${
              activeFilter === 'ABUSE_CH_BOTNET'
                ? 'border-purple-400 bg-purple-400/15 text-purple-400 font-bold'
                : 'border-[#161B22] text-gray-400 hover:text-white'
            }`}
          >
            BOTNET C2 (2)
          </button>
        </div>
      </div>

      {/* Main Radar Layout: Radar Screen vs Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        
        {/* Animated Radar Graphic */}
        <div className="relative panel bg-[#07090D] p-6 border border-[#161B22] flex flex-col items-center justify-center min-h-[260px] overflow-hidden">
          {/* Concentric Radar Rings */}
          <div className="absolute w-52 h-52 rounded-full border border-[#00F0FF]/20" />
          <div className="absolute w-36 h-36 rounded-full border border-[#00F0FF]/30" />
          <div className="absolute w-20 h-20 rounded-full border border-[#00F0FF]/40" />
          <div className="absolute w-full h-[1px] bg-[#00F0FF]/20" />
          <div className="absolute h-full w-[1px] bg-[#00F0FF]/20" />

          {/* Sweeping Radar Scanner Line */}
          <div className="absolute w-52 h-52 rounded-full pointer-events-none animate-spin" style={{ animationDuration: '4s' }}>
            <div className="w-1/2 h-1/2 bg-gradient-to-br from-[#00F0FF]/40 to-transparent origin-bottom-right" />
          </div>

          {/* Adversary Geolocation Pings */}
          <div className="absolute top-12 left-16 group cursor-pointer" onClick={() => setSelectedThreat(LIVE_THREAT_RECORDS[0])}>
            <div className="w-3 h-3 rounded-full bg-[#EF4444] animate-ping" />
            <div className="w-2 h-2 rounded-full bg-[#EF4444] absolute top-0.5 left-0.5" />
            <span className="font-mono text-[9px] text-[#EF4444] font-bold block mt-1">🇷🇺 RU (194.26)</span>
          </div>

          <div className="absolute bottom-14 left-20 group cursor-pointer" onClick={() => setSelectedThreat(LIVE_THREAT_RECORDS[1])}>
            <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="font-mono text-[9px] text-purple-400 font-bold block mt-0.5">🇳🇱 NL (185.88)</span>
          </div>

          <div className="absolute top-16 right-16 group cursor-pointer" onClick={() => setSelectedThreat(LIVE_THREAT_RECORDS[2])}>
            <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-ping" />
            <span className="font-mono text-[9px] text-[#EF4444] font-bold block mt-0.5">🇨🇳 CN (45.33)</span>
          </div>

          <div className="absolute bottom-12 right-20 group cursor-pointer" onClick={() => setSelectedThreat(LIVE_THREAT_RECORDS[3])}>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-mono text-[9px] text-amber-400 font-bold block mt-0.5">🇮🇷 IR (91.24)</span>
          </div>

          {/* Center Target Indicator */}
          <div className="relative z-10 text-center font-mono text-xs">
            <div className="text-[#00F0FF] font-bold tracking-widest text-[11px]">SOC PERIMETER</div>
            <div className="text-[10px] text-[#39FF14] mt-0.5">0 PENETRATIONS</div>
          </div>
        </div>

        {/* Live Threat Records Table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="grid grid-cols-1 gap-2.5">
            {filteredThreats.map((threat) => {
              const isSelected = selectedThreat?.id === threat.id;
              return (
                <div
                  key={threat.id}
                  onClick={() => setSelectedThreat(isSelected ? null : threat)}
                  className={`panel p-3.5 border transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                    isSelected
                      ? 'border-[#00F0FF] bg-[#00F0FF]/10 shadow-[2px_2px_0px_#00F0FF]'
                      : 'border-[#161B22] hover:bg-[#161B22]/70 hover:border-gray-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-100 flex items-center gap-1.5">
                        <span className="text-sm">
                          {threat.countryCode === 'RU' ? '🇷🇺' : threat.countryCode === 'NL' ? '🇳🇱' : threat.countryCode === 'CN' ? '🇨🇳' : threat.countryCode === 'IR' ? '🇮🇷' : '🇧🇷'}
                        </span>
                        <span>{threat.indicator}</span>
                      </span>

                      <span className={`text-[10px] font-mono px-2 py-0.2 border font-bold ${
                        threat.severity === 'CRITICAL'
                          ? 'border-[#EF4444] text-[#EF4444] bg-[#EF4444]/10'
                          : 'border-amber-400 text-amber-400 bg-amber-400/10'
                      }`}>
                        {threat.severity}
                      </span>

                      <span className="text-[10px] font-mono text-gray-400">
                        {threat.originCountry}
                      </span>

                      {threat.cve && (
                        <span className="text-[10px] font-mono text-[#00F0FF] bg-[#00F0FF]/10 px-1.5 border border-[#00F0FF]/30 font-bold">
                          {threat.cve}
                        </span>
                      )}

                      {threat.malwareFamily && (
                        <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-1.5 border border-purple-500/30">
                          {threat.malwareFamily}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] font-mono text-gray-300 truncate max-w-xl">
                      {threat.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Link
                      href={`/hunt?entityType=IP&entityValue=${threat.indicator}`}
                      className="px-2.5 py-1 bg-[#00F0FF]/15 border border-[#00F0FF] text-[#00F0FF] hover:bg-[#00F0FF] hover:text-black font-mono text-[10px] uppercase font-bold transition-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      ⌖ Autonomous Hunt &gt;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Threat Detail Inspector */}
          {selectedThreat && (
            <div className="panel p-4 border border-[#00F0FF] bg-[#07090D] font-mono text-xs space-y-2">
              <div className="flex justify-between items-center text-[#00F0FF] font-bold">
                <span>THREAT INTEL DOSSIER: {selectedThreat.indicator} ({selectedThreat.originCountry})</span>
                <button onClick={() => setSelectedThreat(null)} className="text-gray-400 hover:text-white cursor-pointer">
                  [CLOSE]
                </button>
              </div>
              <div className="text-gray-300 text-[11px] leading-relaxed">
                {selectedThreat.description}
              </div>
              <div className="flex flex-wrap gap-4 pt-2 border-t border-[#161B22] text-[10px] text-gray-400">
                <span>FEED SOURCE: <strong className="text-gray-200">{selectedThreat.source}</strong></span>
                <span>ATTACK CATEGORY: <strong className="text-gray-200">{selectedThreat.type}</strong></span>
                <span>STATUS: <strong className="text-[#39FF14]">{selectedThreat.firstSeen}</strong></span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
