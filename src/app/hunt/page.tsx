'use client';

import React, { useState } from 'react';
import { CyberButton } from '@/components/ui/CyberButton';
import { SeverityIndicator } from '@/components/ui/SeverityIndicator';
import { SecurityEvent } from '@/types';
import Link from 'next/link';

export default function ThreatHunting() {
  const [entityType, setEntityType] = useState<'USER' | 'IP' | 'DEVICE' | 'PROCESS'>('USER');
  const [entityValue, setEntityValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [huntResults, setHuntResults] = useState<{
    totalEvents: number;
    executionTimeMs: number;
    events: SecurityEvent[];
    connectedEntities: {
      users: string[];
      ips: string[];
      devices: string[];
      processes: string[];
    };
    createdIncidentId?: string;
  } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  const presets = [
    { type: 'USER' as const, value: 'alex.morgan', label: 'alex.morgan (User)' },
    { type: 'IP' as const, value: '185.88.92.1', label: '185.88.92.1 (External Hacker)' },
    { type: 'IP' as const, value: '194.26.29.112', label: '194.26.29.112 (CISA Zero-Day IP)' },
    { type: 'PROCESS' as const, value: 'powershell.exe -ExecutionPolicy Bypass', label: 'powershell.exe (Script)' },
    { type: 'IP' as const, value: '45.33.22.1', label: '45.33.22.1 (Port Scanner)' },
    { type: 'DEVICE' as const, value: 'CORP-LAP-02', label: 'CORP-LAP-02 (Computer)' },
  ];

  const handleExecuteHunt = async (type = entityType, value = entityValue) => {
    if (!value.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/hunt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: type,
          entityValue: value.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setHuntResults(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToIncident = async () => {
    if (!entityValue.trim()) return;
    setPromoting(true);
    try {
      const res = await fetch('/api/hunt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityValue: entityValue.trim(),
          promoteToIncident: true
        })
      });
      const data = await res.json();
      if (data.success && data.createdIncidentId) {
        setHuntResults(prev => prev ? { ...prev, createdIncidentId: data.createdIncidentId } : null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#161B22] pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold uppercase tracking-tight flex items-center gap-3 text-gray-100">
            Detective Search
            <span className="text-xs font-mono px-2 py-0.5 border border-[#00F0FF] text-[#00F0FF] bg-[#00F0FF]/10">
              CROSS-LOG CLUE HUNTER
            </span>
          </h1>
          <p className="text-sm font-mono text-gray-400 mt-1">
            Pick a person, an internet address, or a computer, and see everything they touched in seconds
          </p>
        </div>
        <div className="font-mono text-xs text-gray-400 flex items-center gap-2">
          <span>DETECTIVE STATUS:</span>
          <span className="text-[#39FF14] font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-ping" />
            READY
          </span>
        </div>
      </header>

      {/* Quick Click Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest mr-2 font-bold">Quick Clues:</span>
        {presets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setEntityType(p.type);
              setEntityValue(p.value);
              handleExecuteHunt(p.type, p.value);
            }}
            className="px-3 py-1.5 bg-[#0D1117] border border-[#161B22] hover:border-[#00F0FF] hover:text-[#00F0FF] text-xs font-mono text-gray-300 transition-colors cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Search Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="panel p-6 neubrutalist-border neubrutalist-shadow space-y-6 border border-[#161B22]">
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-[#00F0FF] flex justify-between items-center">
              <span>Who or What to Search</span>
              <span className="text-xs text-gray-500">STAGE 1</span>
            </h2>

            <div className="space-y-4 font-mono text-sm">
              <div className="space-y-2">
                <label className="text-gray-300 block text-xs tracking-wider">SEARCH TARGET</label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value as any)}
                  className="w-full bg-[#07090D] border border-[#161B22] text-gray-200 p-2.5 focus:border-[#00F0FF] outline-none font-mono text-xs"
                >
                  <option value="USER">Person / User Account</option>
                  <option value="IP">Internet Address (IP)</option>
                  <option value="DEVICE">Computer / Workstation</option>
                  <option value="PROCESS">Program / Command Run</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 block text-xs tracking-wider">EXACT NAME OR IP</label>
                <input
                  type="text"
                  value={entityValue}
                  onChange={(e) => setEntityValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExecuteHunt()}
                  placeholder="e.g. alex.morgan or 185.88.92.1"
                  className="w-full bg-[#07090D] border border-[#161B22] text-gray-200 p-2.5 focus:border-[#00F0FF] outline-none font-mono text-xs"
                />
              </div>

              <div className="pt-2 border-t border-[#161B22] space-y-2">
                <span className="text-gray-400 block text-xs tracking-wider">PLACES THE DETECTIVE CHECKS:</span>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 font-mono">
                  <span className="text-[#39FF14]">✔ Login attempts</span>
                  <span className="text-[#39FF14]">✔ Internet sockets</span>
                  <span className="text-[#39FF14]">✔ Scripts & commands</span>
                  <span className="text-[#39FF14]">✔ Files downloaded</span>
                </div>
              </div>
            </div>

            <CyberButton
              variant="primary"
              onClick={() => handleExecuteHunt()}
              disabled={loading}
              className="w-full py-3 flex items-center justify-center gap-2 font-bold"
            >
              {loading ? (
                <>
                  <span className="animate-spin">◴</span>
                  <span>SEARCHING LOGS...</span>
                </>
              ) : (
                <>
                  <span>⌖ RUN DETECTIVE SEARCH</span>
                </>
              )}
            </CyberButton>
          </div>

          {/* Connected Clues Discovery Card */}
          {huntResults && (
            <div className="panel p-5 space-y-4 border-[#00F0FF]/40 border">
              <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-[#00F0FF]">
                Connected People & Machines Found
              </h3>
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">User Accounts</span>
                  <div className="text-gray-100 font-bold mt-0.5">
                    {huntResults.connectedEntities.users.length > 0
                      ? huntResults.connectedEntities.users.join(', ')
                      : 'None identified'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Hacker / Remote IPs</span>
                  <div className="text-[#EF4444] font-bold mt-0.5">
                    {huntResults.connectedEntities.ips.length > 0
                      ? huntResults.connectedEntities.ips.join(', ')
                      : 'None identified'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Computers Involved</span>
                  <div className="text-gray-200 font-bold mt-0.5">
                    {huntResults.connectedEntities.devices.length > 0
                      ? huntResults.connectedEntities.devices.join(', ')
                      : 'Standard Workstations'}
                  </div>
                </div>
              </div>

              {huntResults.totalEvents > 0 && (
                <div className="pt-3 border-t border-[#161B22]">
                  {huntResults.createdIncidentId ? (
                    <Link
                      href={`/incidents/${huntResults.createdIncidentId}`}
                      className="block text-center py-2.5 px-3 bg-[#39FF14]/10 border border-[#39FF14] text-[#39FF14] text-xs font-mono uppercase tracking-widest font-bold hover:bg-[#39FF14] hover:text-[#07090D] transition-colors"
                    >
                      ✔ OPEN NEW BREAK-IN CASE &gt;
                    </Link>
                  ) : (
                    <CyberButton
                      variant="danger"
                      onClick={handlePromoteToIncident}
                      disabled={promoting}
                      className="w-full text-xs font-bold"
                    >
                      {promoting ? 'CREATING CASE...' : '⚡ OPEN CASE FROM THESE CLUES'}
                    </CyberButton>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-4">
          {!huntResults ? (
            <div className="panel h-full border border-dashed border-[#161B22] flex flex-col items-center justify-center text-gray-500 font-mono text-sm min-h-[460px] p-8 text-center">
              <div className="text-5xl mb-4 text-[#00F0FF]/30">⌖</div>
              <p className="text-gray-200 font-bold text-base">Detective Standing By</p>
              <p className="text-xs mt-2 text-gray-400 max-w-md">
                Click one of the Quick Clues above (like <code className="text-[#00F0FF]">alex.morgan</code> or <code className="text-[#00F0FF]">185.88.92.1</code>) to see the detective link their full timeline across the database in milliseconds.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Metabar */}
              <div className="panel p-4 flex flex-wrap justify-between items-center gap-4 neubrutalist-border border border-[#161B22]">
                <div className="flex items-center gap-4 font-mono text-xs">
                  <div>
                    <span className="text-gray-500">CLUES FOUND: </span>
                    <span className="text-[#00F0FF] font-bold text-sm">{huntResults.totalEvents}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">TIME TAKEN: </span>
                    <span className="text-[#39FF14] font-bold">{huntResults.executionTimeMs}ms</span>
                  </div>
                </div>
                <div className="font-mono text-xs text-gray-300">
                  LOOKED UP: <span className="text-[#00F0FF] font-bold">[{entityType}] {entityValue}</span>
                </div>
              </div>

              {/* Clues Table */}
              <div className="panel overflow-hidden neubrutalist-border border border-[#161B22]">
                <div className="overflow-x-auto">
                  <table className="w-full data-table">
                    <thead>
                      <tr>
                        <th>TIME</th>
                        <th>WHAT HAPPENED</th>
                        <th>USER</th>
                        <th>SOURCE IP</th>
                        <th>COMMAND / ACTION</th>
                        <th>DANGER</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-xs">
                      {huntResults.events.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center p-8 text-gray-500">
                            No matching security events found for this target.
                          </td>
                        </tr>
                      ) : (
                        huntResults.events.map((evt: any, i) => (
                          <tr
                            key={evt.id || i}
                            onClick={() => setSelectedEvent(evt)}
                            className={`cursor-pointer transition-colors ${
                              selectedEvent?.id === evt.id ? 'bg-[#00F0FF]/15 border-l-2 border-[#00F0FF]' : 'hover:bg-[#161B22]'
                            }`}
                          >
                            <td className="text-gray-400 whitespace-nowrap">
                              {new Date(evt.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="font-bold text-gray-200">{evt.event_type}</td>
                            <td>{evt.user || '-'}</td>
                            <td className={evt.source_ip?.startsWith('185') || evt.source_ip?.startsWith('194') ? 'text-[#EF4444] font-bold' : 'text-gray-300'}>
                              {evt.source_ip || '-'}
                            </td>
                            <td className="text-gray-400 max-w-[200px] truncate">
                              {evt.process || evt.action || '-'}
                            </td>
                            <td>
                              <SeverityIndicator severity={evt.severity} showLabel={false} />
                            </td>
                            <td>
                              <button className="text-[#00F0FF] uppercase tracking-wider text-[10px] hover:underline font-bold">
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Event Inspector */}
              {selectedEvent && (
                <div className="panel p-5 border-[#00F0FF] space-y-3 font-mono text-xs border">
                  <div className="flex justify-between items-center border-b border-[#161B22] pb-2">
                    <span className="text-[#00F0FF] font-bold uppercase">
                      Inspect Clue: {selectedEvent.event_type}
                    </span>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      [CLOSE]
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
                    <div>
                      <span className="text-gray-500 block text-[10px]">TIME</span>
                      <span className="text-gray-200">{new Date(selectedEvent.timestamp).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">ACCOUNT</span>
                      <span className="text-gray-200 font-bold">{selectedEvent.user || 'None'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">ORIGINATING IP</span>
                      <span className="text-[#EF4444] font-bold">{selectedEvent.source_ip || 'None'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">TARGET IP</span>
                      <span className="text-gray-200">{selectedEvent.destination_ip || 'None'}</span>
                    </div>
                  </div>
                  {selectedEvent.process && (
                    <div className="bg-[#07090D] p-3 border border-[#161B22] text-amber-300 break-all">
                      <span className="text-gray-500 block text-[10px] mb-1">COMMAND RUN:</span>
                      <code>{selectedEvent.process}</code>
                    </div>
                  )}
                  {selectedEvent.metadata && (
                    <div className="bg-[#07090D] p-3 border border-[#161B22] text-gray-300">
                      <span className="text-gray-500 block text-[10px] mb-1">SECURITY ATTRIBUTES:</span>
                      <pre className="text-[11px] overflow-x-auto">{JSON.stringify(selectedEvent.metadata, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
