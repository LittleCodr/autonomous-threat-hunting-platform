import { RiskMeter } from "@/components/ui/RiskMeter";
import { SeverityIndicator } from "@/components/ui/SeverityIndicator";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { Incident, InvestigationRun } from "@/types";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

export const dynamic = 'force-dynamic';

export default async function CommandCenter() {
  const incidentsQuery = await adminDb.collection("incidents").orderBy("created_at", "desc").limit(5).get();
  const incidents = incidentsQuery.docs.map((d: QueryDocumentSnapshot) => ({ ...d.data(), id: d.id })) as Incident[];

  const runsQuery = await adminDb.collection("investigation_runs").orderBy("start_time", "desc").limit(5).get();
  const runs = runsQuery.docs.map((d: QueryDocumentSnapshot) => ({ ...d.data(), id: d.id })) as InvestigationRun[];

  const activeThreats = incidents.filter(i => i.status !== "CLOSED").length;
  
  // Real count of processed events
  const eventsCount = await adminDb.collection("security_events").count().get();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex justify-between items-end border-b border-[#161B22] pb-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight">Command Center</h1>
          <p className="text-sm font-mono text-gray-500 mt-1">SYSTEM STATUS: <span className="text-[#39FF14]">NOMINAL</span></p>
        </div>
        <div className="font-mono text-xs text-right opacity-70">
          <div>NODE: PROD-1</div>
          <div>UPTIME: 99.9%</div>
        </div>
      </header>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="panel p-4 neubrutalist-border">
          <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">Active Threats</div>
          <div className="text-3xl font-bold font-mono text-[#EF4444] mt-2">{activeThreats}</div>
        </div>
        <div className="panel p-4 neubrutalist-border">
          <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">Events Processed</div>
          <div className="text-3xl font-bold font-mono text-[#00F0FF] mt-2">{eventsCount.data().count}</div>
        </div>
        <div className="panel p-4 neubrutalist-border">
          <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">Autonomous Runs</div>
          <div className="text-3xl font-bold font-mono text-[#39FF14] mt-2">{runs.length}</div>
        </div>
        <div className="panel p-4 neubrutalist-border">
          <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">Avg Triage Time</div>
          <div className="text-3xl font-bold font-mono text-gray-300 mt-2">~1.2s</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Threat Timeline / Active Incidents */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-gray-400">Critical Incidents</h2>
          
          {incidents.length === 0 ? (
            <div className="panel p-8 text-center text-gray-500 font-mono text-sm">NO ACTIVE INCIDENTS</div>
          ) : (
            incidents.map(incident => (
              <Link key={incident.id} href={`/incidents/${incident.id}`} className="block panel p-4 hover:bg-[#161B22] transition-colors group cursor-pointer neubrutalist-shadow mb-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-gray-500">{incident.id}</span>
                      <SeverityIndicator severity={incident.severity} />
                      <StatusBadge status={incident.status as any} />
                    </div>
                    <h3 className="text-lg font-bold group-hover:text-[#00F0FF] transition-colors">{incident.title}</h3>
                    <div className="font-mono text-xs text-gray-400 flex gap-4">
                      <span>TYPE: {incident.threat_type}</span>
                    </div>
                  </div>
                  <RiskMeter score={incident.risk_score} className="w-24 text-center py-2 px-1" />
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Right Context Panel */}
        <div className="space-y-8">
          <div>
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Investigation Queue</h2>
            <div className="panel divide-y divide-[#161B22]">
              {runs.map(run => (
                <div key={run.id} className={`p-3 flex justify-between items-center ${run.status === 'RUNNING' ? 'bg-[#00F0FF]/5 border-l-2 border-[#00F0FF]' : ''}`}>
                  <div>
                    <div className={`text-sm font-bold ${run.status === 'RUNNING' ? 'text-[#00F0FF]' : 'text-gray-300'}`}>{run.id}</div>
                    <div className="font-mono text-xs text-gray-500">TRIGGER: {run.trigger_event_id}</div>
                  </div>
                  <span className={`font-mono text-xs ${run.status === 'RUNNING' ? 'text-[#00F0FF] animate-pulse' : 'text-[#39FF14]'}`}>
                    {run.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
