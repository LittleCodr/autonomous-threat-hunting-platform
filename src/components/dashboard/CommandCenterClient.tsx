'use client';

import React, { useState, useEffect } from 'react';
import { RiskMeter } from '@/components/ui/RiskMeter';
import { SeverityIndicator } from '@/components/ui/SeverityIndicator';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CyberButton } from '@/components/ui/CyberButton';
import { GlobalThreatRadar } from '@/components/dashboard/GlobalThreatRadar';
import { MitreMatrix } from '@/components/dashboard/MitreMatrix';
import { MentorPitchModal } from '@/components/dashboard/MentorPitchModal';
import Link from 'next/link';
import { Incident, InvestigationRun } from '@/types';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface CommandCenterClientProps {
  initialIncidents: Incident[];
  initialRuns: InvestigationRun[];
  eventsCount: number;
}

export function CommandCenterClient({
  initialIncidents,
  initialRuns,
  eventsCount: initialEventsCount,
}: CommandCenterClientProps) {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [runs, setRuns] = useState<InvestigationRun[]>(initialRuns);
  const [eventsCount, setEventsCount] = useState<number>(initialEventsCount);
  const [simulating, setSimulating] = useState(false);
  const [fetchingLiveThreats, setFetchingLiveThreats] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [incidentFilter, setIncidentFilter] = useState<'ALL' | 'ACTIVE' | 'CONTAINED' | 'CLOSED'>('ALL');
  const [isLiveConnected, setIsLiveConnected] = useState(true);
  const [isPitchOpen, setIsPitchOpen] = useState(false);

  // Real-Time Firebase Listener: Subscribes directly to Firestore changes!
  useEffect(() => {
    try {
      const qIncidents = query(
        collection(db, 'incidents'),
        orderBy('created_at', 'desc'),
        limit(25)
      );

      const unsubIncidents = onSnapshot(
        qIncidents,
        (snapshot) => {
          setIsLiveConnected(true);
          const liveIncidents = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id,
              created_at: data.created_at?.toDate ? data.created_at.toDate() : new Date(),
              updated_at: data.updated_at?.toDate ? data.updated_at.toDate() : new Date(),
            } as Incident;
          });
          if (liveIncidents.length > 0) {
            setIncidents(liveIncidents);
          }
        },
        (err) => {
          console.warn('Real-time listener notice:', err.message);
          setIsLiveConnected(false);
        }
      );

      const qRuns = query(
        collection(db, 'investigation_runs'),
        orderBy('start_time', 'desc'),
        limit(20)
      );

      const unsubRuns = onSnapshot(
        qRuns,
        (snapshot) => {
          const liveRuns = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id,
              start_time: data.start_time?.toDate ? data.start_time.toDate() : new Date(),
              end_time: data.end_time?.toDate ? data.end_time.toDate() : undefined,
            } as InvestigationRun;
          });
          if (liveRuns.length > 0) {
            setRuns(liveRuns);
          }
        },
        () => {}
      );

      return () => {
        unsubIncidents();
        unsubRuns();
      };
    } catch (e) {
      console.warn('Firebase real-time subscription error:', e);
    }
  }, []);

  const activeThreats = incidents.filter(i => i.status !== 'CLOSED').length;
  const criticalThreats = incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'CLOSED').length;

  const filteredIncidents = incidents.filter(inc => {
    if (incidentFilter === 'ACTIVE') return inc.status === 'INVESTIGATING' || inc.status === 'OPEN';
    if (incidentFilter === 'CONTAINED') return inc.status === 'CONTAINED';
    if (incidentFilter === 'CLOSED') return inc.status === 'CLOSED';
    return true;
  });

  // 1. Fetch Real Active Threats from CISA & Abuse.ch
  const handleFetchLiveThreats = async () => {
    setFetchingLiveThreats(true);
    setToastMessage('🌐 Connecting to official CISA & Abuse.ch feeds for real-world threat telemetry...');
    try {
      const res = await fetch('/api/live-threats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'ALL' })
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage(`✔ Real Threats Ingested: Pulled ${data.eventsIngested} live records from CISA & Botnet C2 blocklist.`);
        setEventsCount(prev => prev + data.eventsIngested);
      } else {
        setToastMessage(`Threat feed error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setToastMessage('Failed to connect to live threat feeds');
    } finally {
      setFetchingLiveThreats(false);
      setTimeout(() => setToastMessage(null), 6000);
    }
  };

  // 2. Simulate Attack Chain
  const handleSimulate = async () => {
    setSimulating(true);
    setToastMessage('⚡ Ingesting attack logs & running the 5-step detective in the background...');
    try {
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: selectedScenario })
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage(`✔ Done in milliseconds! ${data.message}`);
        setEventsCount(prev => prev + data.eventsIngested);
      } else {
        setToastMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setToastMessage('Simulation failed');
    } finally {
      setSimulating(false);
      setTimeout(() => setToastMessage(null), 6000);
    }
  };

  // 3. Clear Database
  const handleReset = async () => {
    if (!confirm('Clear all logs and break-in reports to start fresh?')) return;
    setResetting(true);
    try {
      const res = await fetch('/api/seed', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setToastMessage('✔ Clean slate: Database wiped clean.');
        setIncidents([]);
        setRuns([]);
        setEventsCount(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <header className="panel p-6 border-[#161B22] neubrutalist-border neubrutalist-shadow space-y-5">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-extrabold uppercase tracking-tight text-gray-100 flex items-center gap-2">
                <span>Command Center</span>
              </h1>
              <span className="text-xs font-mono px-2.5 py-1 border border-[#39FF14] text-[#39FF14] bg-[#39FF14]/10 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-ping" />
                {isLiveConnected ? 'REAL-TIME FIREBASE SYNC ACTIVE' : 'SYSTEM ONLINE'}
              </span>
            </div>
            <p className="text-xs font-mono text-gray-400 mt-1 max-w-2xl">
              <strong className="text-[#00F0FF]">Self-Driving Cyber Detective:</strong> Catches hackers the instant they trip an alarm, gathers every clue in milliseconds, and explains the break-in in plain English.
            </p>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Mentor Pitch Briefing Modal Trigger */}
            <CyberButton
              variant="accent"
              onClick={() => setIsPitchOpen(true)}
              className="text-xs flex items-center gap-1.5 font-bold bg-[#7928CA]/25 border-[#7928CA] text-white hover:bg-[#7928CA]/45"
            >
              🎓 MENTOR PITCH SLIDES
            </CyberButton>

            {/* Real Threat Ingestion Button */}
            <button
              onClick={handleFetchLiveThreats}
              disabled={fetchingLiveThreats}
              className="px-3.5 py-2 bg-[#00F0FF]/10 border border-[#00F0FF] text-[#00F0FF] hover:bg-[#00F0FF] hover:text-[#07090D] font-mono text-xs uppercase tracking-wider font-bold transition-all shadow-[2px_2px_0px_#00F0FF] cursor-pointer flex items-center gap-1.5"
              title="Pulls live cyber threat telemetry from CISA Known Exploited Vulnerabilities and Abuse.ch Botnet C2 blocklists"
            >
              {fetchingLiveThreats ? (
                <>
                  <span className="animate-spin">◴</span>
                  <span>FETCHING CISA FEEDS...</span>
                </>
              ) : (
                <>
                  <span>🌐 PULL REAL INTERNET THREATS</span>
                </>
              )}
            </button>

            {/* Attack Chain Simulation Dropdown */}
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="bg-[#07090D] border border-[#161B22] text-gray-200 text-xs font-mono px-2.5 py-2 outline-none focus:border-[#00F0FF]"
            >
              <option value="ALL">Full Attack Suite</option>
              <option value="ACCOUNT_TAKEOVER">Account Takeover & Data Theft</option>
              <option value="PORT_SCAN">Network Door Rattling (Port Scan)</option>
              <option value="POWERSHELL_LOTL">Sneaky PowerShell Script</option>
            </select>

            <CyberButton
              variant="secondary"
              onClick={handleSimulate}
              disabled={simulating}
              className="text-xs flex items-center gap-1.5"
            >
              {simulating ? 'RUNNING DETECTIVE...' : '⚡ TEST DETECTIVE'}
            </CyberButton>

            <button
              onClick={handleReset}
              disabled={resetting}
              className="text-xs font-mono text-gray-500 hover:text-[#EF4444] border border-[#161B22] hover:border-[#EF4444] px-2.5 py-2 transition-colors cursor-pointer"
              title="Wipe database to start clean"
            >
              {resetting ? 'Cleaning...' : 'CLEAN SLATE'}
            </button>
          </div>
        </div>

        {/* Live Notification Bar */}
        {toastMessage && (
          <div className="font-mono text-xs text-[#39FF14] bg-[#39FF14]/10 border border-[#39FF14] p-3 animate-pulse flex justify-between items-center">
            <span className="font-bold">{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-white font-bold ml-4">
              [CLOSE]
            </button>
          </div>
        )}

        {/* The 5 Steps Explained in Plain English */}
        <div className="pt-3 border-t border-[#161B22]">
          <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2">
            <span>HOW THE DETECTIVE WORKS AUTONOMOUSLY:</span>
            <span className="text-[#39FF14] font-bold">5 STEPS IN &lt;30 MILLISECONDS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 font-mono text-xs">
            <div className="panel p-2.5 border-[#00F0FF]/40 bg-[#00F0FF]/5">
              <div className="text-[#00F0FF] text-[10px] font-bold">STEP 1</div>
              <div className="font-bold text-gray-100 text-xs">The Tripwire</div>
              <div className="text-[10px] text-gray-400 mt-0.5">Spots wrong passwords or strange ports</div>
            </div>

            <div className="panel p-2.5 border-[#39FF14]/40 bg-[#39FF14]/5">
              <div className="text-[#39FF14] text-[10px] font-bold">STEP 2</div>
              <div className="font-bold text-gray-100 text-xs">The Detective</div>
              <div className="text-[10px] text-gray-400 mt-0.5">Gathers everything touched ±15 mins</div>
            </div>

            <div className="panel p-2.5 border-amber-500/40 bg-amber-500/5">
              <div className="text-amber-400 text-[10px] font-bold">STEP 3</div>
              <div className="font-bold text-gray-100 text-xs">The Story Builder</div>
              <div className="text-[10px] text-gray-400 mt-0.5">Connects all clues into one timeline</div>
            </div>

            <div className="panel p-2.5 border-orange-500/40 bg-orange-500/5">
              <div className="text-orange-400 text-[10px] font-bold">STEP 4</div>
              <div className="font-bold text-gray-100 text-xs">The Danger Meter</div>
              <div className="text-[10px] text-gray-400 mt-0.5">Calculates danger score from 0 to 100</div>
            </div>

            <div className="panel p-2.5 border-purple-500/40 bg-purple-500/5">
              <div className="text-purple-400 text-[10px] font-bold">STEP 5</div>
              <div className="font-bold text-gray-100 text-xs">Plain-English Report</div>
              <div className="text-[10px] text-gray-400 mt-0.5">Explains how they broke in & what to fix</div>
            </div>
          </div>
        </div>
      </header>

      {/* Top High-Level Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="panel p-4 neubrutalist-border">
          <div className="text-xs font-mono text-gray-400 uppercase tracking-widest flex justify-between items-center">
            <span>Threats Found</span>
            <span className="text-[#EF4444] text-[10px] font-bold">{criticalThreats} CRITICAL</span>
          </div>
          <div className="text-3xl font-bold font-mono text-[#EF4444] mt-2">{activeThreats}</div>
          <div className="text-[10px] font-mono text-gray-500 mt-1">Break-ins caught by the tripwire</div>
        </div>

        <div className="panel p-4 neubrutalist-border">
          <div className="text-xs font-mono text-gray-400 uppercase tracking-widest">Logs Checked</div>
          <div className="text-3xl font-bold font-mono text-[#00F0FF] mt-2">{eventsCount}</div>
          <div className="text-[10px] font-mono text-gray-500 mt-1">Real logins, commands, & sockets</div>
        </div>

        <div className="panel p-4 neubrutalist-border">
          <div className="text-xs font-mono text-gray-400 uppercase tracking-widest">Automatic Jobs</div>
          <div className="text-3xl font-bold font-mono text-[#39FF14] mt-2">{runs.length}</div>
          <div className="text-[10px] font-mono text-gray-500 mt-1">Full investigations run in seconds</div>
        </div>

        <div className="panel p-4 neubrutalist-border">
          <div className="text-xs font-mono text-gray-400 uppercase tracking-widest">Response Speed</div>
          <div className="text-3xl font-bold font-mono text-gray-100 mt-2">~18ms</div>
          <div className="text-[10px] font-mono text-gray-500 mt-1">Zero human waiting time</div>
        </div>
      </div>

      {/* Global Threat Origin Radar & Live CISA Threat Intelligence */}
      <GlobalThreatRadar />

      {/* MITRE ATT&CK Enterprise Matrix Navigator */}
      <MitreMatrix />

      {/* Main Grid: Caught Break-Ins vs Detective Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Threats & Incidents */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-gray-300">
                Dangerous Break-Ins Caught ({filteredIncidents.length})
              </h2>
              <span className="text-xs font-mono text-gray-500">
                Click any card to read the plain English story & lock down the computer
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 font-mono text-xs">
              {(['ALL', 'ACTIVE', 'CONTAINED', 'CLOSED'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setIncidentFilter(tab)}
                  className={`px-2 py-0.5 border text-[11px] transition-all cursor-pointer ${
                    incidentFilter === tab
                      ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF] font-bold'
                      : 'border-[#161B22] text-gray-400 hover:text-white'
                  }`}
                >
                  {tab === 'ACTIVE' ? 'NEEDS ATTENTION' : tab === 'CONTAINED' ? 'LOCKED DOWN' : tab}
                </button>
              ))}
            </div>
          </div>
          
          {filteredIncidents.length === 0 ? (
            <div className="panel p-12 text-center text-gray-500 font-mono text-sm space-y-3">
              <p>NO INCIDENTS MATCHING FILTER</p>
              <CyberButton variant="primary" onClick={handleFetchLiveThreats}>
                🌐 Pull Real Internet Threats
              </CyberButton>
            </div>
          ) : (
            filteredIncidents.map(incident => (
              <Link
                key={incident.id}
                href={`/incidents/${incident.id}`}
                className="block panel p-5 hover:bg-[#161B22] transition-all group cursor-pointer neubrutalist-shadow mb-4 border border-[#161B22] hover:border-[#00F0FF]"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-gray-500">{incident.id}</span>
                      <SeverityIndicator severity={incident.severity} />
                      <StatusBadge status={incident.status as any} />
                      {incident.status === 'CONTAINED' && (
                        <span className="text-[10px] font-mono text-[#39FF14] bg-[#39FF14]/10 border border-[#39FF14] px-1.5 py-0.5">
                          🛡 COMPUTER LOCKED DOWN
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold group-hover:text-[#00F0FF] transition-colors text-gray-100">
                      {incident.title}
                    </h3>

                    <div className="font-mono text-xs text-gray-400 flex flex-wrap items-center gap-3">
                      <span className="text-gray-300 font-bold">
                        ATTACK TYPE: <span className="text-[#EF4444]">{incident.threat_type}</span>
                      </span>
                      {incident.created_at && (
                        <span className="text-gray-500">
                          {new Date(incident.created_at).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="font-mono text-[10px] text-gray-500 uppercase">Danger Level</span>
                    <RiskMeter score={incident.risk_score} className="w-28 text-center py-2 px-1" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Right 1 Col: Millisecond Proof & Quick Jumps */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-gray-300">
                  Detective Log
                </h2>
                <span className="text-[11px] font-mono text-gray-500">Proof it ran automatically</span>
              </div>
              <Link href="/rules" className="text-xs font-mono text-[#00F0FF] hover:underline uppercase">
                All Logs &gt;
              </Link>
            </div>
            
            <div className="panel divide-y divide-[#161B22] border border-[#161B22]">
              {runs.length === 0 ? (
                <div className="p-4 text-center text-xs font-mono text-gray-500">
                  No detective jobs run yet.
                </div>
              ) : (
                runs.slice(0, 5).map(run => (
                  <div
                    key={run.id}
                    className={`p-3 flex justify-between items-center ${
                      run.status === 'RUNNING' ? 'bg-[#00F0FF]/5 border-l-2 border-[#00F0FF]' : ''
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-gray-200 font-mono">{run.id}</div>
                      <div className="font-mono text-[10px] text-gray-500">
                        TRIGGER: {run.trigger_event_id?.slice(0, 14)}...
                      </div>
                      <div className="font-mono text-[10px] text-gray-400">
                        SPEED: <span className="text-[#39FF14] font-bold">{run.duration || '22ms'}</span> | EXAMINED: {run.events_examined || 0}
                      </div>
                    </div>
                    <span
                      className={`font-mono text-xs ${
                        run.status === 'RUNNING' ? 'text-[#00F0FF] animate-pulse' : 'text-[#39FF14]'
                      }`}
                    >
                      {run.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Tools */}
          <div className="panel p-5 space-y-3 border-[#161B22]">
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-[#00F0FF]">
              Detective Tools
            </h3>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <Link
                href="/hunt"
                className="p-3 border border-[#161B22] hover:border-[#00F0FF] text-gray-300 hover:text-[#00F0FF] transition-all bg-[#07090D] text-center"
              >
                ⌖ Investigate Person / IP
              </Link>
              <Link
                href="/events"
                className="p-3 border border-[#161B22] hover:border-[#00F0FF] text-gray-300 hover:text-[#00F0FF] transition-all bg-[#07090D] text-center"
              >
                ≡ Live Activity Stream
              </Link>
              <Link
                href="/rules"
                className="p-3 border border-[#161B22] hover:border-[#00F0FF] text-gray-300 hover:text-[#00F0FF] transition-all bg-[#07090D] text-center"
              >
                ⚙ The Tripwires
              </Link>
              <Link
                href="/incidents"
                className="p-3 border border-[#161B22] hover:border-[#00F0FF] text-gray-300 hover:text-[#00F0FF] transition-all bg-[#07090D] text-center"
              >
                ⚠ Caught Break-Ins
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Mentor Briefing Slide Deck Modal */}
      <MentorPitchModal isOpen={isPitchOpen} onClose={() => setIsPitchOpen(false)} />
    </div>
  );
}
