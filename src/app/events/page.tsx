import { CyberButton } from "@/components/ui/CyberButton";
import { SeverityIndicator } from "@/components/ui/SeverityIndicator";
import { adminDb } from "@/lib/firebase/admin";
import { SecurityEvent } from "@/types";

import { QueryDocumentSnapshot } from "firebase-admin/firestore";

export const dynamic = 'force-dynamic';

export default async function EventExplorer() {
  const eventsQuery = await adminDb.collection("security_events").orderBy("timestamp", "desc").limit(100).get();
  
  const events = eventsQuery.docs.map((d: QueryDocumentSnapshot) => {
    const data = d.data();
    return { ...data, id: d.id, timestamp: data.timestamp.toDate() } as SecurityEvent;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end border-b border-[#161B22] pb-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight">Event Explorer</h1>
          <p className="text-sm font-mono text-gray-500 mt-1">Raw Telemetry Data Stream</p>
        </div>
        <div className="flex gap-4">
          <input type="text" placeholder="Search events, IPs, users..." className="panel px-4 py-2 text-sm font-mono focus:outline-none focus:border-[#00F0FF] transition-colors w-64 bg-transparent border-[#161B22]" />
          <CyberButton variant="primary">Filter</CyberButton>
        </div>
      </header>

      <div className="panel overflow-hidden neubrutalist-border">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>TIME</th>
                <th>EVENT</th>
                <th>USER</th>
                <th>SOURCE IP</th>
                <th>DEVICE</th>
                <th>PROCESS</th>
                <th>SEVERITY</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-gray-500">No events found. Seed the database.</td>
                </tr>
              ) : (
                events.map((evt: SecurityEvent) => (
                  <tr key={evt.id} className="group cursor-pointer hover:bg-[#161B22]">
                    <td className="text-gray-400">{evt.timestamp.toLocaleTimeString()}</td>
                    <td className="font-bold text-gray-200">{evt.event_type}</td>
                    <td>{evt.user || '-'}</td>
                    <td className={evt.source_ip?.startsWith("185") ? "text-[#EF4444]" : ""}>{evt.source_ip || '-'}</td>
                    <td>{evt.device || '-'}</td>
                    <td className="text-gray-400">{evt.process || evt.action || '-'}</td>
                    <td><SeverityIndicator severity={evt.severity} showLabel={false} /></td>
                    <td>
                      <button className="text-[#00F0FF] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest text-[10px]">
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-[#161B22] flex justify-between items-center bg-[#0D1117]">
          <span className="font-mono text-xs text-gray-500">Showing {events.length} events</span>
          <div className="flex gap-2">
            <CyberButton variant="secondary" disabled className="opacity-50">&lt; PREV</CyberButton>
            <CyberButton variant="secondary">NEXT &gt;</CyberButton>
          </div>
        </div>
      </div>
    </div>
  );
}
