import { RiskMeter } from "@/components/ui/RiskMeter";
import { SeverityIndicator } from "@/components/ui/SeverityIndicator";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CyberButton } from "@/components/ui/CyberButton";
import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { Incident, SecurityEvent, AIAnalysis } from "@/types";
import { notFound } from "next/navigation";

import { QueryDocumentSnapshot } from "firebase-admin/firestore";

export const dynamic = 'force-dynamic';

export default async function IncidentInvestigationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  if (!resolvedParams?.id) return notFound();
  
  const doc = await adminDb.collection("incidents").doc(resolvedParams.id).get();
  if (!doc.exists) return notFound();
  
  const incident = { id: doc.id, ...doc.data() } as Incident;

  // Get correlated events
  const eventsQuery = await adminDb.collection("security_events")
    .where("incidentId", "==", incident.id)
    .get();
    
  const timelineEvents = eventsQuery.docs.map((d: QueryDocumentSnapshot) => {
    const data = d.data();
    return { ...data, id: d.id, timestamp: data.timestamp.toDate() } as SecurityEvent;
  }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Get AI Analysis
  const aiQuery = await adminDb.collection("ai_analyses")
    .where("incidentId", "==", incident.id)
    .limit(1)
    .get();
  const aiAnalysis = aiQuery.empty ? null : aiQuery.docs[0].data() as AIAnalysis;

  const users = Array.from(new Set(timelineEvents.map((e: SecurityEvent) => e.user).filter(Boolean)));
  const ips = Array.from(new Set(timelineEvents.map((e: SecurityEvent) => e.source_ip).filter(Boolean)));
  const devices = Array.from(new Set(timelineEvents.map((e: SecurityEvent) => e.device).filter(Boolean)));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <Link href="/" className="text-[#00F0FF] font-mono text-xs hover:underline uppercase tracking-widest mb-4 inline-block">
          &lt; Return to Command Center
        </Link>
        
        <header className="panel p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 neubrutalist-border neubrutalist-shadow">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-gray-500">{incident.id}</span>
              <SeverityIndicator severity={incident.severity} />
              <StatusBadge status={incident.status as any} />
            </div>
            <h1 className="text-3xl font-bold uppercase tracking-tight">{incident.title}</h1>
            <div className="font-mono text-sm text-[#EF4444] tracking-widest">
              THREAT VECTOR: {incident.threat_type}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <RiskMeter score={incident.risk_score} className="w-32" />
            <div className="flex flex-col gap-2">
              <CyberButton variant="primary">Generate Report</CyberButton>
              <CyberButton variant="danger">Isolate Host</CyberButton>
            </div>
          </div>
        </header>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-gray-400">Correlated Timeline ({timelineEvents.length} Events)</h2>
          <div className="panel p-6 relative">
            <div className="timeline-line hidden md:block ml-4" />
            <div className="space-y-6">
              {timelineEvents.map((event: SecurityEvent, i: number) => (
                <div key={i} className="relative z-10 flex flex-col md:flex-row gap-4 group">
                  <div className="w-24 shrink-0 font-mono text-xs text-[#00F0FF] pt-1 md:text-right bg-cyber-panel">
                    {event.timestamp.toLocaleTimeString()}
                  </div>
                  <div className="flex-1 panel p-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-[#161B22] transition-colors">
                    <div>
                      <div className="font-bold">{event.event_type}</div>
                      <div className="font-mono text-xs text-gray-400 mt-1">
                        {event.user || event.process || event.action} {event.source_ip ? `| ${event.source_ip}` : ''}
                      </div>
                    </div>
                    <SeverityIndicator severity={event.severity} showLabel={false} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Analysis & Evidence */}
        <div className="space-y-8">
          {aiAnalysis && (
            <div>
              <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-[#00F0FF] mb-4 flex items-center gap-2">
                <span className="animate-pulse">●</span> AI Synthesis
              </h2>
              <div className="panel p-5 space-y-4 border-[#00F0FF]">
                <p className="text-sm leading-relaxed text-gray-300">{aiAnalysis.summary}</p>
                <p className="text-sm leading-relaxed text-gray-300">{aiAnalysis.why_suspicious}</p>
                
                <div className="mt-4 pt-4 border-t border-[#161B22]">
                  <div className="font-mono text-xs uppercase text-[#EF4444] mb-2">Recommended Actions:</div>
                  <ul className="text-xs font-mono text-gray-400 space-y-2 list-disc list-inside">
                    {aiAnalysis.recommended_checks.map((chk, idx) => (
                      <li key={idx}>{chk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Extracted Entities</h2>
            <div className="panel p-4 space-y-3">
              {users.map((u: any) => (
                <div key={u as string} className="flex justify-between items-center text-sm">
                  <span className="font-mono text-gray-400">USER</span>
                  <span className="font-bold">{u as string}</span>
                </div>
              ))}
              {ips.map((ip: any) => (
                <div key={ip as string} className="flex justify-between items-center text-sm">
                  <span className="font-mono text-gray-400">IP ADDRESS</span>
                  <span className="font-mono text-[#EF4444]">{ip as string}</span>
                </div>
              ))}
              {devices.map((d: any) => (
                <div key={d as string} className="flex justify-between items-center text-sm">
                  <span className="font-mono text-gray-400">DEVICE</span>
                  <span className="font-bold">{d as string}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
