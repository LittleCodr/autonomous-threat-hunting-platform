'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { CyberButton } from '@/components/ui/CyberButton';
import { SeverityIndicator } from '@/components/ui/SeverityIndicator';
import { SecurityEvent } from '@/types';
import Link from 'next/link';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface EventExplorerClientProps {
  initialEvents: SecurityEvent[];
}

export function EventExplorerClient({ initialEvents }: EventExplorerClientProps) {
  const [events, setEvents] = useState<SecurityEvent[]>(initialEvents);
  const [search, setSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedEventType, setSelectedEventType] = useState<string>('ALL');
  const [inspectEvent, setInspectEvent] = useState<SecurityEvent | null>(null);
  const [isLiveStreaming] = useState(true);

  // Real-time Firebase streaming listener
  useEffect(() => {
    try {
      const q = query(
        collection(db, 'security_events'),
        orderBy('timestamp', 'desc'),
        limit(150)
      );

      const unsub = onSnapshot(q, (snapshot) => {
        const live = snapshot.docs.map(doc => {
          const d = doc.data();
          return {
            ...d,
            id: doc.id,
            timestamp: d.timestamp?.toDate ? d.timestamp.toDate() : new Date()
          } as SecurityEvent;
        });
        if (live.length > 0) {
          setEvents(live);
        }
      }, () => {});

      return () => unsub();
    } catch (e) {
      console.warn('Real-time events error:', e);
    }
  }, []);

  const eventTypes = useMemo(() => {
    const types = new Set(events.map(e => e.event_type));
    return ['ALL', ...Array.from(types)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      if (selectedSeverity !== 'ALL' && evt.severity !== selectedSeverity) return false;
      if (selectedEventType !== 'ALL' && evt.event_type !== selectedEventType) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          evt.event_type.toLowerCase().includes(q) ||
          (evt.user && evt.user.toLowerCase().includes(q)) ||
          (evt.source_ip && evt.source_ip.toLowerCase().includes(q)) ||
          (evt.destination_ip && evt.destination_ip.toLowerCase().includes(q)) ||
          (evt.device && evt.device.toLowerCase().includes(q)) ||
          (evt.process && evt.process.toLowerCase().includes(q)) ||
          (evt.action && evt.action.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [events, search, selectedSeverity, selectedEventType]);

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'LOGIN_FAILED': return '❌ Wrong Password';
      case 'LOGIN_SUCCESS': return '🔓 Successful Login';
      case 'PROCESS_EXECUTION': return '⚡ Script / Program Run';
      case 'NETWORK_CONNECTION': return '🌐 Internet Connection';
      case 'DATA_TRANSFER': return '📦 File Transfer';
      case 'NEW_DEVICE_DETECTED': return '💻 New Computer Logged In';
      case 'RESOURCE_ACCESS': return '📂 Database / File Opened';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="panel p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 neubrutalist-border border border-[#161B22]">
        <div className="flex-1 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by IP, username, command line, or activity..."
              className="w-full bg-[#07090D] border border-[#161B22] px-4 py-2.5 text-xs font-mono text-gray-200 focus:outline-none focus:border-[#00F0FF] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-200 text-xs font-mono"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="bg-[#07090D] border border-[#161B22] px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none focus:border-[#00F0FF]"
          >
            {eventTypes.map(t => (
              <option key={t} value={t}>{t === 'ALL' ? 'ALL ACTIVITY TYPES' : t}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
          <span className="text-[#39FF14] font-bold">{isLiveStreaming ? "FIREBASE REAL-TIME SYNC" : "OFFLINE"}</span>
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <span className="text-gray-400 uppercase tracking-widest text-[11px] mr-1 font-bold">Danger:</span>
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'].map(sev => {
          const isActive = selectedSeverity === sev;
          return (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1.5 border transition-all cursor-pointer ${
                isActive
                  ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF] font-bold shadow-[2px_2px_0px_#00F0FF]'
                  : 'border-[#161B22] bg-[#0D1117] text-gray-400 hover:text-gray-200 hover:border-gray-700'
              }`}
            >
              {sev === 'CRITICAL' ? '🚨 CRITICAL' : sev === 'HIGH' ? '⚠ HIGH' : sev}
            </button>
          );
        })}
        <span className="ml-auto text-gray-400">
          Showing <span className="text-[#00F0FF] font-bold">{filteredEvents.length}</span> of {events.length} live records
        </span>
      </div>

      {/* Main Table */}
      <div className="panel overflow-hidden neubrutalist-border border border-[#161B22]">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>TIME</th>
                <th>WHAT HAPPENED</th>
                <th>ACCOUNT</th>
                <th>HACKER / SOURCE IP</th>
                <th>TARGET IP</th>
                <th>COMPUTER</th>
                <th>COMMAND / ACTION</th>
                <th>DANGER</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center p-12 text-gray-500">
                    No security events match the current filter.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr
                    key={evt.id}
                    onClick={() => setInspectEvent(evt)}
                    className="group cursor-pointer hover:bg-[#161B22] transition-colors"
                  >
                    <td className="text-gray-400 whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="font-bold text-gray-200">
                      {getActivityLabel(evt.event_type)}
                      {evt.incidentId && (
                        <span className="ml-2 text-[9px] px-1.5 py-0.5 bg-[#EF4444]/20 border border-[#EF4444] text-[#EF4444] font-bold">
                          CASE LINKED
                        </span>
                      )}
                    </td>
                    <td>{evt.user || '-'}</td>
                    <td className={evt.source_ip?.startsWith('185') || evt.source_ip?.startsWith('194') || evt.source_ip?.startsWith('45') ? 'text-[#EF4444] font-bold' : ''}>
                      {evt.source_ip || '-'}
                    </td>
                    <td className="text-gray-400">{evt.destination_ip || '-'}</td>
                    <td>{evt.device || '-'}</td>
                    <td className="text-gray-400 max-w-[180px] truncate">
                      {evt.process || evt.action || '-'}
                    </td>
                    <td>
                      <SeverityIndicator severity={evt.severity} showLabel={false} />
                    </td>
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectEvent(evt);
                        }}
                        className="text-[#00F0FF] opacity-80 group-hover:opacity-100 uppercase tracking-widest text-[10px] hover:underline font-bold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Inspection Modal / Drawer */}
      {inspectEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="panel w-full max-w-3xl border border-[#00F0FF] neubrutalist-shadow p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-[#161B22] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-gray-500 font-bold">{inspectEvent.id}</span>
                  <SeverityIndicator severity={inspectEvent.severity} />
                  {inspectEvent.incidentId && (
                    <Link
                      href={`/incidents/${inspectEvent.incidentId}`}
                      className="text-xs font-mono text-[#00F0FF] border border-[#00F0FF] px-2 py-0.5 hover:bg-[#00F0FF] hover:text-[#07090D] transition-colors font-bold"
                    >
                      VIEW LINKED BREAK-IN CASE &gt;
                    </Link>
                  )}
                </div>
                <h2 className="text-2xl font-bold uppercase tracking-tight text-gray-100">
                  {getActivityLabel(inspectEvent.event_type)} ({inspectEvent.event_type})
                </h2>
              </div>
              <button
                onClick={() => setInspectEvent(null)}
                className="text-gray-400 hover:text-white text-lg font-mono font-bold"
              >
                ✕
              </button>
            </div>

            {/* Entity Attributes Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
              <div className="panel p-3 border-[#161B22]">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Exact Timestamp</span>
                <span className="text-gray-200 mt-1 block">
                  {new Date(inspectEvent.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="panel p-3 border-[#161B22]">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Account</span>
                <span className="text-gray-200 font-bold mt-1 block">{inspectEvent.user || 'None'}</span>
              </div>
              <div className="panel p-3 border-[#161B22]">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Originating IP</span>
                <span className="text-[#EF4444] font-bold mt-1 block">{inspectEvent.source_ip || 'None'}</span>
              </div>
              <div className="panel p-3 border-[#161B22]">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Target IP</span>
                <span className="text-gray-200 mt-1 block">{inspectEvent.destination_ip || 'None'}</span>
              </div>
            </div>

            {/* Process / Action Payload */}
            {(inspectEvent.process || inspectEvent.action) && (
              <div className="space-y-2">
                <span className="font-mono text-xs uppercase tracking-widest text-amber-400 font-bold">
                  What Command or Action Took Place:
                </span>
                <div className="bg-[#07090D] p-4 border border-[#161B22] font-mono text-xs text-amber-300 break-all">
                  {inspectEvent.process || inspectEvent.action}
                </div>
              </div>
            )}

            {/* Metadata Viewer */}
            {inspectEvent.metadata && (
              <div className="space-y-2">
                <span className="font-mono text-xs uppercase tracking-widest text-[#00F0FF] font-bold">
                  Raw Telemetry Metadata:
                </span>
                <pre className="bg-[#07090D] p-4 border border-[#161B22] font-mono text-xs text-gray-300 overflow-x-auto max-h-48">
                  {JSON.stringify(inspectEvent.metadata, null, 2)}
                </pre>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-[#161B22]">
              <div className="flex gap-2">
                {inspectEvent.source_ip && (
                  <Link
                    href={`/hunt`}
                    className="cyber-button text-xs font-bold"
                  >
                    ⌖ Search all logs for this IP: {inspectEvent.source_ip}
                  </Link>
                )}
                {inspectEvent.user && (
                  <Link
                    href={`/hunt`}
                    className="cyber-button text-xs font-bold"
                  >
                    ⌖ Search all logs for user: {inspectEvent.user}
                  </Link>
                )}
              </div>
              <CyberButton variant="secondary" onClick={() => setInspectEvent(null)}>
                Close Drawer
              </CyberButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
