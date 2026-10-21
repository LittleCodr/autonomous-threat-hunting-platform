'use client';

import React, { useState, useMemo } from 'react';
import { RiskMeter } from "@/components/ui/RiskMeter";
import { SeverityIndicator } from "@/components/ui/SeverityIndicator";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { Incident } from "@/types";

interface IncidentsListClientProps {
  initialIncidents: Incident[];
}

export function IncidentsListClient({ initialIncidents }: IncidentsListClientProps) {
  const [incidents] = useState<Incident[]>(initialIncidents);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return incidents.filter(inc => {
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'ACTIVE' && (inc.status === 'CLOSED' || inc.status === 'CONTAINED')) return false;
        if (statusFilter === 'CONTAINED' && inc.status !== 'CONTAINED') return false;
        if (statusFilter === 'CLOSED' && inc.status !== 'CLOSED') return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          inc.title.toLowerCase().includes(q) ||
          inc.threat_type.toLowerCase().includes(q) ||
          (inc.id && inc.id.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [incidents, statusFilter, search]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="panel p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 neubrutalist-border border border-[#161B22]">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by break-in title, attack type, or case ID..."
          className="w-full md:w-88 bg-[#07090D] border border-[#161B22] px-4 py-2.5 text-xs font-mono text-gray-200 focus:outline-none focus:border-[#00F0FF]"
        />

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-gray-400 uppercase text-[10px] font-bold">Filter By Status:</span>
          {[
            { id: 'ALL', label: 'ALL CASES' },
            { id: 'ACTIVE', label: 'NEEDS ATTENTION' },
            { id: 'CONTAINED', label: 'LOCKED DOWN' },
            { id: 'CLOSED', label: 'RESOLVED' }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 border transition-all cursor-pointer ${
                statusFilter === st.id
                  ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF] font-bold shadow-[2px_2px_0px_#00F0FF]'
                  : 'border-[#161B22] bg-[#0D1117] text-gray-400 hover:text-gray-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="panel p-12 text-center text-gray-500 font-mono text-sm border border-[#161B22]">
            NO BREAK-IN CASES MATCH THIS FILTER
          </div>
        ) : (
          filtered.map(incident => (
            <Link
              key={incident.id}
              href={`/incidents/${incident.id}`}
              className="block panel p-5 hover:bg-[#161B22] transition-all group cursor-pointer neubrutalist-shadow border border-[#161B22] hover:border-[#00F0FF]"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs text-gray-500 font-bold">{incident.id}</span>
                    <SeverityIndicator severity={incident.severity} />
                    <StatusBadge status={incident.status as any} />
                    {incident.status === 'CONTAINED' && (
                      <span className="text-[10px] font-mono text-[#39FF14] bg-[#39FF14]/10 border border-[#39FF14] px-1.5 py-0.5 font-bold">
                        🛡 COMPUTER LOCKED DOWN
                      </span>
                    )}
                    <span className="font-mono text-xs text-gray-500 ml-auto md:ml-2">
                      {incident.created_at ? new Date(incident.created_at).toLocaleString() : ''}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold group-hover:text-[#00F0FF] transition-colors text-gray-100">
                    {incident.title}
                  </h3>

                  <div className="font-mono text-xs text-gray-300 flex items-center gap-2">
                    <span className="text-gray-500">ATTACK TYPE:</span>
                    <span className="text-[#EF4444] font-bold">{incident.threat_type}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="font-mono text-[10px] text-gray-400 uppercase font-bold">Danger Level</span>
                  <RiskMeter score={incident.risk_score} className="w-32 py-1.5" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
