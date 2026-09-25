import { RiskMeter } from "@/components/ui/RiskMeter";
import { SeverityIndicator } from "@/components/ui/SeverityIndicator";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { Incident } from "@/types";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

export const dynamic = 'force-dynamic';

export default async function IncidentsList() {
  const incidentsQuery = await adminDb.collection("incidents").orderBy("created_at", "desc").limit(50).get();
  
  const incidents = incidentsQuery.docs.map((d: QueryDocumentSnapshot) => {
    const data = d.data();
    return { ...data, id: d.id, created_at: data.created_at?.toDate() } as Incident;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end border-b border-[#161B22] pb-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight">Incidents Queue</h1>
          <p className="text-sm font-mono text-gray-500 mt-1">Active Threat Correlated Events</p>
        </div>
      </header>

      <div className="space-y-4">
        {incidents.length === 0 ? (
          <div className="panel p-8 text-center text-gray-500 font-mono text-sm">NO INCIDENTS RECORDED</div>
        ) : (
          incidents.map(incident => (
            <Link key={incident.id} href={`/incidents/${incident.id}`} className="block panel p-5 hover:bg-[#161B22] transition-colors group cursor-pointer neubrutalist-shadow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-gray-500">{incident.id}</span>
                    <SeverityIndicator severity={incident.severity} />
                    <StatusBadge status={incident.status as any} />
                    <span className="font-mono text-xs text-gray-500 ml-2">
                      {incident.created_at?.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold group-hover:text-[#00F0FF] transition-colors">{incident.title}</h3>
                  <div className="font-mono text-sm text-[#EF4444] tracking-widest">
                    VECTOR: {incident.threat_type}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="font-mono text-xs text-gray-400">RISK SCORE</span>
                  <RiskMeter score={incident.risk_score} className="w-32 py-2" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
