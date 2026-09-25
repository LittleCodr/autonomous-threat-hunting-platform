import { StatusBadge } from "@/components/ui/StatusBadge";
import { SeverityIndicator } from "@/components/ui/SeverityIndicator";
import { adminDb } from "@/lib/firebase/admin";
import { InvestigationRun } from "@/types";
import { rules, DetectionRule } from "@/lib/detection";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

export const dynamic = 'force-dynamic';

export default async function RulesAndRuns() {
  const runsQuery = await adminDb.collection("investigation_runs").orderBy("start_time", "desc").limit(20).get();
  
  const runs = runsQuery.docs.map((d: QueryDocumentSnapshot) => {
    const data = d.data();
    return { ...data, id: d.id } as InvestigationRun;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header className="flex justify-between items-end border-b border-[#161B22] pb-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight">System & Rules</h1>
          <p className="text-sm font-mono text-gray-500 mt-1">Detection Logic & Autonomous Audit Log</p>
        </div>
      </header>

      {/* Detection Rules */}
      <section>
        <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Active Detection Rules</h2>
        <div className="panel overflow-hidden neubrutalist-border">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>RULE ID</th>
                <th>NAME</th>
                <th>STATUS</th>
                <th>SEVERITY</th>
                <th>DESCRIPTION</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {rules.map((r: DetectionRule) => (
                <tr key={r.id}>
                  <td className="text-gray-400">{r.id}</td>
                  <td className="font-bold text-[#00F0FF]">{r.name}</td>
                  <td><span className="text-[#39FF14]">ACTIVE</span></td>
                  <td><SeverityIndicator severity={r.severity} showLabel={false} /></td>
                  <td className="text-gray-400">{r.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Investigation Runs */}
      <section>
        <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Autonomous Hunt Audit Log</h2>
        <div className="panel overflow-hidden neubrutalist-border">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>RUN ID</th>
                <th>TRIGGER EVENT</th>
                <th>STATUS</th>
                <th>EVENTS EXAMINED</th>
                <th>ENTITIES FOUND</th>
                <th>INCIDENT ID</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {runs.map(r => (
                <tr key={r.id}>
                  <td className="font-bold text-gray-200">{r.id}</td>
                  <td className="text-gray-400">{r.trigger_event_id}</td>
                  <td><StatusBadge status={r.status as any} /></td>
                  <td className="text-right">{r.events_examined || 0}</td>
                  <td className="text-right">{r.entities_examined || 0}</td>
                  <td className="text-right text-[#00F0FF]">{r.incidentId || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
