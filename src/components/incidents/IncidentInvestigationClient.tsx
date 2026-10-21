'use client';

import React, { useState } from 'react';
import { CyberButton } from '@/components/ui/CyberButton';
import { RiskMeter } from '@/components/ui/RiskMeter';
import { SeverityIndicator } from '@/components/ui/SeverityIndicator';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AttackGraph } from '@/components/incidents/AttackGraph';
import { Incident, SecurityEvent, AIAnalysis } from '@/types';
import Link from 'next/link';

export interface PlaybookStepResult {
  step: string;
  name: string;
  target: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  latencyMs: number;
  details: string;
}

interface IncidentInvestigationClientProps {
  incident: Incident;
  timelineEvents: SecurityEvent[];
  aiAnalysis: AIAnalysis | null;
}

export function IncidentInvestigationClient({
  incident: initialIncident,
  timelineEvents: initialEvents,
  aiAnalysis
}: IncidentInvestigationClientProps) {
  const [incident, setIncident] = useState<Incident>(initialIncident);
  const [events] = useState<SecurityEvent[]>(initialEvents);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [playbookSteps, setPlaybookSteps] = useState<PlaybookStepResult[] | null>(
    (initialIncident as any).playbook_results || null
  );
  const [playbookRunning, setPlaybookRunning] = useState(false);

  const users = Array.from(new Set(events.map(e => e.user).filter(Boolean)));
  const ips = Array.from(new Set(events.map(e => e.source_ip).filter(Boolean)));
  const destIps = Array.from(new Set(events.map(e => e.destination_ip).filter(Boolean)));
  const devices = Array.from(new Set(events.map(e => e.device).filter(Boolean)));

  const handleAction = async (action: 'ISOLATE_HOST' | 'CLOSE' | 'DEEP_HUNT' | 'REOPEN') => {
    setActionLoading(action);
    try {
      const res = await fetch(`/api/incidents/${incident.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        if (action === 'ISOLATE_HOST') {
          setIncident(prev => ({
            ...prev,
            status: 'CONTAINED',
            containment_action: 'Computer network sockets severed & hacker process killed',
            contained_at: new Date()
          }));
          setActionToast('✔ Computer locked down! Network connections severed so the hacker is trapped.');
        } else if (action === 'CLOSE') {
          setIncident(prev => ({ ...prev, status: 'CLOSED' }));
          setActionToast('✔ Incident marked as resolved and closed.');
        } else if (action === 'REOPEN') {
          setIncident(prev => ({ ...prev, status: 'INVESTIGATING' }));
          setActionToast('✔ Incident reopened for active investigation.');
        } else if (action === 'DEEP_HUNT') {
          setActionToast(`✔ Detective dug deeper: ${data.message}`);
          setTimeout(() => window.location.reload(), 1200);
        }
      }
    } catch (err) {
      console.error(err);
      setActionToast('Action failed');
    } finally {
      setActionLoading(null);
      setTimeout(() => setActionToast(null), 5000);
    }
  };

  const handleRunPlaybook = async () => {
    setPlaybookRunning(true);
    try {
      const res = await fetch(`/api/incidents/${incident.id}/playbook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setPlaybookSteps(data.steps);
        setIncident(prev => ({
          ...prev,
          status: 'CONTAINED',
          containment_action: 'All 5 Automated Response Playbook Steps Successfully Executed',
          contained_at: new Date()
        }));
        setActionToast(`⚡ 5-Step Automated SOAR Playbook completed in ${data.totalLatencyMs || 128}ms!`);
      } else {
        setActionToast(`Playbook failed: ${data.error || 'Execution error'}`);
      }
    } catch (err) {
      console.error(err);
      setActionToast('Playbook network error occurred');
    } finally {
      setPlaybookRunning(false);
      setTimeout(() => setActionToast(null), 6000);
    }
  };

  const handleExportDossier = () => {
    const report = `# PLAIN-ENGLISH CYBER INVESTIGATION DOSSIER
INCIDENT ID: ${incident.id}
WHAT HAPPENED: ${incident.title}
DANGER LEVEL: ${incident.risk_score} / 100 (${incident.severity})
STATUS: ${incident.status}
TIME DETECTED: ${incident.created_at ? new Date(incident.created_at).toISOString() : new Date().toISOString()}

==================================================
1. THE STORY OF WHAT HAPPENED (EXECUTIVE SUMMARY)
==================================================
${aiAnalysis?.summary || 'The automatic detective correlated this attack chain in under a second.'}

ROOT CAUSE:
${aiAnalysis?.why_suspicious || 'Unusual sequence of events violating normal security baselines.'}

==================================================
2. SMOKING GUN EVIDENCE & CLUES
==================================================
${(aiAnalysis?.key_evidence || []).map(k => `[CLUE] ${k}`).join('\n')}

==================================================
3. WHO AND WHAT WAS INVOLVED
==================================================
- Target Person / Account: ${users.join(', ') || 'System account'}
- Hacker Internet Address: ${ips.join(', ') || 'Internal'}
- Target Computer / Server: ${devices.join(', ') || 'Corporate server'}
- Data Destination: ${destIps.join(', ') || 'Internal network'}

==================================================
4. WHAT YOU SHOULD DO RIGHT NOW
==================================================
${(aiAnalysis?.recommended_checks || []).map(r => `[ ] ${r}`).join('\n')}

==================================================
5. MINUTE-BY-MINUTE ATTACK TIMELINE (${events.length} LOG EVENTS)
==================================================
${events.map(e => `[${new Date(e.timestamp).toLocaleTimeString()}] ${e.event_type} -> User: ${e.user || '-'} | Hacker IP: ${e.source_ip || '-'} | Action: ${e.process || e.action || '-'}`).join('\n')}

---
Generated by Autonomous Threat Hunting Platform (Self-Driving Cyber Detective)
`;

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Incident_${incident.id}_Plain_English_Report.md`;
    a.click();
    URL.revokeObjectURL(url);
    setActionToast('✔ Report downloaded successfully.');
    setTimeout(() => setActionToast(null), 4000);
  };

  const breakdown = incident.risk_breakdown || {
    base: incident.severity === 'CRITICAL' ? 90 : incident.severity === 'HIGH' ? 75 : 50,
    densityModifier: events.length > 5 ? 5 : 0,
    exfilModifier: events.some(e => e.action === 'DATA_TRANSFER' || e.event_type === 'DATA_TRANSFER') ? 15 : 0,
    deviceModifier: events.some(e => e.event_type === 'NEW_DEVICE_DETECTED') ? 10 : 0,
    total: incident.risk_score
  };

  return (
    <div className="space-y-8">
      {/* Return Navigation & Alert Toast */}
      <div className="flex justify-between items-center">
        <Link
          href="/"
          className="text-[#00F0FF] font-mono text-xs hover:underline uppercase tracking-widest inline-flex items-center gap-2"
        >
          &lt; Return to Command Center
        </Link>
        {actionToast && (
          <div className="font-mono text-xs text-[#39FF14] bg-[#39FF14]/10 border border-[#39FF14] px-4 py-2 font-bold animate-pulse">
            {actionToast}
          </div>
        )}
      </div>

      {/* Computer Locked Down Banner */}
      {incident.status === 'CONTAINED' && (
        <div className="panel p-5 border-[#39FF14] bg-[#39FF14]/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl text-[#39FF14]">🛡</span>
            <div>
              <div className="font-bold text-[#39FF14] text-sm font-mono uppercase tracking-wider">
                COMPUTER IS LOCKED DOWN & QUARANTINED
              </div>
              <div className="text-xs font-mono text-gray-200 mt-0.5">
                {incident.containment_action || 'Network connections severed so the hacker cannot spread or steal more files.'}
              </div>
            </div>
          </div>
          <button
            onClick={() => handleAction('REOPEN')}
            disabled={actionLoading === 'REOPEN'}
            className="text-xs font-mono text-gray-400 hover:text-white underline cursor-pointer"
          >
            Lift Lockdown / Reopen Case
          </button>
        </div>
      )}

      {/* Main Incident Dossier Header */}
      <header className="panel p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 neubrutalist-border neubrutalist-shadow">
        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs text-gray-500 font-bold">CASE ID: {incident.id}</span>
            <SeverityIndicator severity={incident.severity} />
            <StatusBadge status={incident.status as any} />
          </div>

          <h1 className="text-3xl font-extrabold uppercase tracking-tight text-gray-100">
            {incident.title}
          </h1>

          <div className="font-mono text-sm text-gray-300 flex items-center gap-2">
            <span className="text-gray-500">TYPE OF ATTACK:</span>
            <span className="text-[#EF4444] font-bold">{incident.threat_type}</span>
          </div>
        </div>

        {/* Danger Meter & Action Buttons */}
        <div className="flex flex-wrap items-center gap-6">
          <RiskMeter score={incident.risk_score} className="w-36" />
          
          <div className="flex flex-col gap-2 shrink-0">
            {/* Lock Down Computer Button */}
            {incident.status !== 'CONTAINED' && incident.status !== 'CLOSED' ? (
              <CyberButton
                variant="danger"
                onClick={() => handleAction('ISOLATE_HOST')}
                disabled={actionLoading === 'ISOLATE_HOST'}
                className="text-xs font-bold"
              >
                {actionLoading === 'ISOLATE_HOST' ? 'LOCKING DOWN...' : '🛡 LOCK DOWN COMPUTER'}
              </CyberButton>
            ) : (
              <CyberButton
                variant="secondary"
                onClick={() => handleAction('CLOSE')}
                disabled={actionLoading === 'CLOSE' || incident.status === 'CLOSED'}
                className="text-xs font-bold"
              >
                {incident.status === 'CLOSED' ? '✔ Case Resolved' : 'Mark Case Resolved'}
              </CyberButton>
            )}

            {/* Export Plain-English Report */}
            <CyberButton
              variant="primary"
              onClick={handleExportDossier}
              className="text-xs font-bold"
            >
              📥 Download Plain-English Report
            </CyberButton>

            {/* Execute Automated SOAR Playbook Button */}
            <CyberButton
              variant="accent"
              onClick={handleRunPlaybook}
              disabled={playbookRunning}
              className="text-xs font-bold bg-[#7928CA]/20 border-[#7928CA] text-[#00F0FF] hover:bg-[#7928CA]/40"
            >
              {playbookRunning ? '⚡ EXECUTING PLAYBOOK...' : '⚡ RUN 5-STEP SOAR PLAYBOOK'}
            </CyberButton>

            {/* Dig Deeper Button */}
            <button
              onClick={() => handleAction('DEEP_HUNT')}
              disabled={actionLoading === 'DEEP_HUNT'}
              className="text-xs font-mono text-gray-400 hover:text-[#00F0FF] transition-colors text-center mt-1 cursor-pointer"
            >
              {actionLoading === 'DEEP_HUNT' ? 'Detective Searching...' : '⌖ Dig Deeper (Pull 60m of Logs)'}
            </button>
          </div>
        </div>
      </header>

      {/* Attack Lateral Movement Graph */}
      <AttackGraph events={events} incidentTitle={incident.title} />

      {/* Automated SOAR Response Playbook Execution Panel */}
      <section className="panel p-6 border border-[#7928CA]/50 bg-[#0A0D14] space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#161B22] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-[#00F0FF]">
                Automated SOAR Containment Playbook
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 border border-[#7928CA] text-[#7928CA] bg-[#7928CA]/10 font-bold">
                ZERO-HUMAN-DELAY
              </span>
            </div>
            <p className="text-xs font-mono text-gray-400 mt-1">
              Deterministic, sub-second 5-stage automated incident mitigation &amp; forensic evidence preservation
            </p>
          </div>

          <div className="flex items-center gap-3">
            {playbookSteps && (
              <span className="text-xs font-mono text-[#39FF14] bg-[#39FF14]/10 border border-[#39FF14] px-3 py-1 font-bold">
                ✔ 5/5 STEPS APPLIED ({playbookSteps.reduce((acc, s) => acc + s.latencyMs, 0)}ms TOTAL)
              </span>
            )}
            <CyberButton
              variant="accent"
              onClick={handleRunPlaybook}
              disabled={playbookRunning}
              className="text-xs font-bold"
            >
              {playbookRunning ? 'EXECUTING PLAYBOOK...' : playbookSteps ? 'RE-TRIGGER PLAYBOOK' : 'TRIGGER PLAYBOOK NOW'}
            </CyberButton>
          </div>
        </div>

        {/* Playbook Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {[
            {
              num: '1',
              title: 'Firewall Null-Route',
              desc: 'Border firewall blocks all ingress from threat IP',
              target: ips[0] || '185.88.92.1',
              defaultMs: 14
            },
            {
              num: '2',
              title: 'Identity Token Revocation',
              desc: 'Terminates web sessions & forces MFA reset',
              target: users[0] || 'compromised_user',
              defaultMs: 28
            },
            {
              num: '3',
              title: 'Host Network Isolation',
              desc: 'Quarantines endpoint adapter via EDR daemon',
              target: devices[0] || 'WORKSTATION-01',
              defaultMs: 32
            },
            {
              num: '4',
              title: 'Volatile RAM Dump',
              desc: 'Acquires memory dump & socket tree for forensics',
              target: 'PID / Process Tree',
              defaultMs: 45
            },
            {
              num: '5',
              title: 'SHA-256 Seal',
              desc: 'Cryptographic tamper-proof audit verification hash',
              target: `INC-${incident.id ? incident.id.slice(0, 8) : '001'}`,
              defaultMs: 9
            }
          ].map((item, idx) => {
            const stepResult = playbookSteps ? playbookSteps[idx] : null;
            const isApplied = !!stepResult;
            return (
              <div
                key={item.num}
                className={`panel p-3.5 flex flex-col justify-between transition-all border ${
                  isApplied
                    ? 'border-[#39FF14]/60 bg-[#39FF14]/5 shadow-[0_0_10px_rgba(57,255,20,0.15)]'
                    : 'border-[#161B22] bg-[#0D1117] opacity-80'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-[#00F0FF] font-bold">STAGE {item.num}</span>
                    <span className={isApplied ? 'text-[#39FF14] font-bold' : 'text-gray-500'}>
                      {isApplied ? `✔ ${stepResult.latencyMs}ms` : `~${item.defaultMs}ms`}
                    </span>
                  </div>
                  <div className="font-bold text-gray-100 text-xs">{item.title}</div>
                  <div className="text-[11px] font-mono text-gray-400 leading-snug">
                    {stepResult ? stepResult.details : item.desc}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#161B22] font-mono text-[10px] text-gray-400 truncate">
                  <span className="text-gray-500 uppercase mr-1">Target:</span>
                  <span className="text-gray-200 font-bold">{stepResult ? stepResult.target : item.target}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Grid: Story Timeline vs Plain English Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: The Story of the Attack */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-gray-300">
                The Story of the Hack ({events.length} Steps Found)
              </h2>
              <span className="text-xs font-mono text-gray-500">
                Click any step to inspect the computer log and commands
              </span>
            </div>
          </div>

          <div className="panel p-6 relative border border-[#161B22]">
            <div className="timeline-line hidden md:block ml-4" />
            <div className="space-y-6">
              {events.map((event: SecurityEvent, i: number) => {
                const isExpanded = expandedEventId === (event.id || String(i));
                return (
                  <div key={event.id || i} className="relative z-10 flex flex-col md:flex-row gap-4 group">
                    <div className="w-24 shrink-0 font-mono text-xs text-[#00F0FF] pt-1 md:text-right bg-[#0D1117] font-bold select-none">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                    
                    <div
                      onClick={() => setExpandedEventId(isExpanded ? null : (event.id || String(i)))}
                      className={`flex-1 panel p-4 cursor-pointer transition-all ${
                        isExpanded
                          ? 'border-[#00F0FF] bg-[#00F0FF]/10 shadow-[2px_2px_0px_#00F0FF]'
                          : 'hover:bg-[#161B22] border-[#161B22]'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="font-bold text-gray-100 text-sm flex items-center gap-2">
                            <span>
                              {event.event_type === 'LOGIN_FAILED'
                                ? '❌ Wrong Password Entered'
                                : event.event_type === 'LOGIN_SUCCESS'
                                ? '🔓 Successful Break-In / Login'
                                : event.event_type === 'PROCESS_EXECUTION'
                                ? '⚡ Suspicious Script Started'
                                : event.event_type === 'DATA_TRANSFER'
                                ? '📦 Company Files Copied Out'
                                : event.event_type === 'NEW_DEVICE_DETECTED'
                                ? '💻 Unrecognized Computer Logged In'
                                : event.event_type}
                            </span>
                            {isExpanded && <span className="text-[10px] text-[#00F0FF] font-mono">[CLICK TO CLOSE]</span>}
                          </div>

                          <div className="font-mono text-xs text-gray-400">
                            {event.user && <span className="text-gray-200 font-bold mr-2">ACCOUNT: {event.user}</span>}
                            {event.source_ip && (
                              <span className={event.source_ip.startsWith('185') || event.source_ip.startsWith('194') ? 'text-[#EF4444] font-bold' : 'text-gray-400'}>
                                HACKER IP: {event.source_ip}
                              </span>
                            )}
                            {event.destination_ip && (
                              <span className="text-gray-400 ml-2">➔ DEST: {event.destination_ip}</span>
                            )}
                          </div>

                          {(event.process || event.action) && !isExpanded && (
                            <div className="font-mono text-[11px] text-gray-400 truncate max-w-lg mt-1">
                              {event.process || event.action}
                            </div>
                          )}
                        </div>

                        <SeverityIndicator severity={event.severity} showLabel={false} />
                      </div>

                      {/* Expanded View */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-[#161B22] space-y-3 font-mono text-xs">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div>
                              <span className="text-gray-500 block text-[10px]">COMPUTER</span>
                              <span className="text-gray-200">{event.device || 'Office Computer'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block text-[10px]">EXACT TIME</span>
                              <span className="text-gray-200">{new Date(event.timestamp).toISOString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block text-[10px]">DATABASE LOG ID</span>
                              <span className="text-gray-400">{event.id || 'N/A'}</span>
                            </div>
                          </div>

                          {(event.process || event.action) && (
                            <div className="bg-[#07090D] p-3 border border-[#161B22] text-amber-300 break-all">
                              <span className="text-gray-500 block text-[10px] mb-1">COMMAND LINE / ACTION PERFORMED:</span>
                              <code>{event.process || event.action}</code>
                            </div>
                          )}

                          {event.metadata && (
                            <div className="bg-[#07090D] p-3 border border-[#161B22] text-gray-300">
                              <span className="text-gray-500 block text-[10px] mb-1">RAW SECURITY TELEMETRY:</span>
                              <pre className="text-[10px] overflow-x-auto">{JSON.stringify(event.metadata, null, 2)}</pre>
                            </div>
                          )}

                          <div className="flex gap-4 pt-2">
                            {event.source_ip && (
                              <Link
                                href={`/hunt`}
                                className="text-xs text-[#00F0FF] underline hover:text-white"
                              >
                                ⌖ Search all logs for this IP ({event.source_ip})
                              </Link>
                            )}
                            {event.user && (
                              <Link
                                href={`/hunt`}
                                className="text-xs text-[#00F0FF] underline hover:text-white"
                              >
                                ⌖ Search all logs for this user ({event.user})
                              </Link>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Plain-English Report, Danger Math, People & Machines */}
        <div className="space-y-6">
          
          {/* Plain English Report */}
          {aiAnalysis && (
            <div className="space-y-3">
              <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-[#00F0FF] flex items-center gap-2">
                <span className="animate-pulse">●</span> Plain-English Report
              </h2>
              <div className="panel p-5 space-y-4 border-[#00F0FF] neubrutalist-shadow">
                <div>
                  <div className="text-[11px] font-mono uppercase text-gray-400 mb-1 font-bold">What Happened:</div>
                  <p className="text-sm leading-relaxed text-gray-100 font-sans">{aiAnalysis.summary}</p>
                </div>

                <div>
                  <div className="text-[11px] font-mono uppercase text-[#EF4444] mb-1 font-bold">Why It&apos;s Dangerous:</div>
                  <p className="text-xs leading-relaxed text-gray-300 font-sans">{aiAnalysis.why_suspicious}</p>
                </div>

                {aiAnalysis.key_evidence && aiAnalysis.key_evidence.length > 0 && (
                  <div className="pt-3 border-t border-[#161B22]">
                    <div className="font-mono text-[11px] uppercase text-amber-400 mb-2 font-bold">Smoking Guns & Clues:</div>
                    <ul className="text-xs font-mono text-gray-300 space-y-1.5 list-disc list-inside">
                      {aiAnalysis.key_evidence.map((ev, idx) => (
                        <li key={idx}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiAnalysis.recommended_checks && aiAnalysis.recommended_checks.length > 0 && (
                  <div className="pt-3 border-t border-[#161B22]">
                    <div className="font-mono text-[11px] uppercase text-[#39FF14] mb-2 font-bold">What To Do Right Now:</div>
                    <ul className="text-xs font-mono text-gray-200 space-y-1.5 list-disc list-inside">
                      {aiAnalysis.recommended_checks.map((chk, idx) => (
                        <li key={idx}>{chk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Danger Meter Math Breakdown */}
          <div className="panel p-5 space-y-3 border-[#161B22]">
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-gray-200">
              Danger Score Math (How We Calculated {incident.risk_score}/100)
            </h3>
            <div className="font-mono text-xs space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-[#161B22]">
                <span className="text-gray-400">Base severity ({incident.severity})</span>
                <span className="text-gray-200">+{breakdown.base} pts</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#161B22]">
                <span className="text-gray-400">Multiple related events ({events.length} events)</span>
                <span className="text-gray-200">+{breakdown.densityModifier} pts</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#161B22]">
                <span className="text-gray-400">Company files copied outside</span>
                <span className="text-gray-200">+{breakdown.exfilModifier} pts</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#161B22]">
                <span className="text-gray-400">Unrecognized computer used</span>
                <span className="text-gray-200">+{breakdown.deviceModifier} pts</span>
              </div>
              <div className="flex justify-between items-center pt-2 text-[#EF4444] font-bold">
                <span>TOTAL DANGER LEVEL</span>
                <span className="text-base">{breakdown.total} / 100</span>
              </div>
            </div>
          </div>

          {/* People & Machines Involved */}
          <div className="space-y-3">
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-gray-400">
              People & Machines Involved
            </h2>
            <div className="panel p-4 space-y-3 font-mono text-xs border-[#161B22]">
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Account Attacked</span>
                {users.length > 0 ? (
                  users.map(u => (
                    <div key={u} className="flex justify-between items-center mt-1">
                      <span className="font-bold text-gray-100">{u}</span>
                      <Link href="/hunt" className="text-[#00F0FF] text-[10px] hover:underline font-bold">
                        INVESTIGATE &gt;
                      </Link>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400">System daemon</span>
                )}
              </div>

              <div className="pt-2 border-t border-[#161B22]">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Hacker&apos;s Internet Address</span>
                {ips.length > 0 ? (
                  ips.map(ip => (
                    <div key={ip} className="flex justify-between items-center mt-1">
                      <span className="font-mono text-[#EF4444] font-bold">{ip}</span>
                      <Link href="/hunt" className="text-[#00F0FF] text-[10px] hover:underline font-bold">
                        INVESTIGATE &gt;
                      </Link>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400">Internal only</span>
                )}
              </div>

              {devices.length > 0 && (
                <div className="pt-2 border-t border-[#161B22]">
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Computer Affected</span>
                  {devices.map(d => (
                    <div key={d} className="flex justify-between items-center mt-1">
                      <span className="text-gray-200">{d}</span>
                      <span className="text-amber-400 text-[10px] font-bold">COMPROMISED</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
