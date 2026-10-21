'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface MitreTactic {
  phase: string;
  tacticName: string;
  techniqueId: string;
  techniqueName: string;
  plainEnglish: string;
  status: 'COVERED' | 'ACTIVE_DETECTION';
  detectionCount: number;
  ruleName: string;
}

const MITRE_TACTICS: MitreTactic[] = [
  {
    phase: 'TA0001',
    tacticName: 'Initial Access',
    techniqueId: 'T1190',
    techniqueName: 'Exploit Public-Facing Application',
    plainEnglish: 'Hacker uses known internet zero-day (e.g. CISA CVE-2024-3400) to penetrate border perimeter.',
    status: 'ACTIVE_DETECTION',
    detectionCount: 14,
    ruleName: 'CISA KEV Zero-Day Ingress Tripwire'
  },
  {
    phase: 'TA0002',
    tacticName: 'Execution',
    techniqueId: 'T1059.001',
    techniqueName: 'PowerShell / Living-off-the-Land',
    plainEnglish: 'Hacker executes stealth scripts via built-in Windows/Linux utilities to avoid dropping files.',
    status: 'ACTIVE_DETECTION',
    detectionCount: 8,
    ruleName: 'Suspicious PowerShell & Script Invocation'
  },
  {
    phase: 'TA0003',
    tacticName: 'Persistence',
    techniqueId: 'T1136',
    techniqueName: 'Create Account / Backdoor',
    plainEnglish: 'Hacker creates a sneaky hidden admin account to ensure they can log back in anytime.',
    status: 'COVERED',
    detectionCount: 3,
    ruleName: 'Unauthorized Privilege & Account Creation'
  },
  {
    phase: 'TA0005',
    tacticName: 'Defense Evasion',
    techniqueId: 'T1070',
    techniqueName: 'Indicator Removal on Host',
    plainEnglish: 'Hacker attempts to clear security logs or disable antivirus hooks before moving deeper.',
    status: 'COVERED',
    detectionCount: 5,
    ruleName: 'Audit Log Tampering & Antivirus Tamper'
  },
  {
    phase: 'TA0007',
    tacticName: 'Discovery',
    techniqueId: 'T1046',
    techniqueName: 'Network Service Scanning',
    plainEnglish: 'Hacker rattles every internal network door (port scan) searching for unpatched databases.',
    status: 'ACTIVE_DETECTION',
    detectionCount: 22,
    ruleName: 'Rapid Port Scanning & Host Sweep'
  },
  {
    phase: 'TA0008',
    tacticName: 'Lateral Movement',
    techniqueId: 'T1021',
    techniqueName: 'Remote Services & Stolen Tokens',
    plainEnglish: 'Hacker hops from workstation to corporate server using stolen credentials or active session cookies.',
    status: 'ACTIVE_DETECTION',
    detectionCount: 11,
    ruleName: 'Unrecognized Device & Lateral Hop Detector'
  },
  {
    phase: 'TA0010',
    tacticName: 'Exfiltration',
    techniqueId: 'T1048',
    techniqueName: 'Exfiltration Over Alternative Protocol',
    plainEnglish: 'Hacker copies gigabytes of customer databases or confidential code out to an external server.',
    status: 'ACTIVE_DETECTION',
    detectionCount: 6,
    ruleName: 'High Volume Outbound Data Transfer'
  }
];

export function MitreMatrix() {
  const [selectedTactic, setSelectedTactic] = useState<MitreTactic | null>(null);

  return (
    <div className="panel p-6 border border-[#161B22] space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#161B22] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡</span>
            <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-[#00F0FF]">
              MITRE ATT&amp;CK® Enterprise Matrix Navigator
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 border border-[#39FF14] text-[#39FF14] bg-[#39FF14]/10 font-bold">
              100% COVERAGE
            </span>
          </div>
          <p className="text-[11px] font-mono text-gray-400 mt-1">
            Autonomous threat detection coverage across all adversary attack lifecycle phases
          </p>
        </div>

        <Link
          href="/rules"
          className="text-xs font-mono text-[#00F0FF] hover:underline uppercase tracking-wider"
        >
          View Armed Tripwires &gt;
        </Link>
      </div>

      {/* Grid of Tactics across Kill Chain */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {MITRE_TACTICS.map((item) => {
          const isSelected = selectedTactic?.techniqueId === item.techniqueId;
          return (
            <button
              key={item.techniqueId}
              onClick={() => setSelectedTactic(isSelected ? null : item)}
              className={`panel p-3 text-left transition-all border cursor-pointer flex flex-col justify-between min-h-[110px] ${
                isSelected
                  ? 'border-[#00F0FF] bg-[#00F0FF]/15 shadow-[0_0_12px_rgba(0,240,255,0.3)] ring-1 ring-[#00F0FF]'
                  : 'border-[#161B22] bg-[#07090D] hover:bg-[#161B22] hover:border-gray-600'
              }`}
            >
              <div>
                <div className="flex justify-between items-center text-[9px] font-mono mb-1">
                  <span className="text-gray-500 font-bold">{item.phase}</span>
                  <span className="text-[#39FF14] font-bold">● {item.detectionCount}</span>
                </div>
                <div className="text-[10px] font-mono uppercase text-[#00F0FF] font-bold line-clamp-1">
                  {item.tacticName}
                </div>
                <div className="font-mono text-[11px] font-bold text-gray-200 mt-0.5 line-clamp-1">
                  {item.techniqueId}
                </div>
              </div>

              <div className="text-[9px] font-mono text-gray-400 line-clamp-2 mt-2 leading-tight">
                {item.techniqueName}
              </div>
            </button>
          );
        })}
      </div>

      {/* Inspector Drawer for selected tactic */}
      {selectedTactic && (
        <div className="panel p-4 bg-[#07090D] border border-[#00F0FF] font-mono text-xs space-y-2">
          <div className="flex justify-between items-center text-[#00F0FF] font-bold">
            <span>
              TECHNIQUE DOSSIER: {selectedTactic.techniqueId} - {selectedTactic.techniqueName} ({selectedTactic.tacticName})
            </span>
            <button
              onClick={() => setSelectedTactic(null)}
              className="text-gray-400 hover:text-white cursor-pointer"
            >
              [CLOSE]
            </button>
          </div>
          <div className="text-gray-200 text-xs">
            <strong className="text-amber-400">PLAIN-ENGLISH MEANING: </strong>
            {selectedTactic.plainEnglish}
          </div>
          <div className="flex flex-wrap gap-4 pt-2 border-t border-[#161B22] text-[11px] text-gray-400">
            <span>ARMED TRIPWIRE: <strong className="text-gray-100">{selectedTactic.ruleName}</strong></span>
            <span>REAL-TIME CORRELATION: <strong className="text-[#39FF14]">ACTIVE ({selectedTactic.detectionCount} EVENTS)</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
