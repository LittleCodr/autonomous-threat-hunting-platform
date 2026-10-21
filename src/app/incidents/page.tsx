import { adminDb } from "@/lib/firebase/admin";
import { Incident } from "@/types";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { IncidentsListClient } from "@/components/incidents/IncidentsListClient";
import { serializeFirestore } from "@/lib/firebase/serialize";

export default async function IncidentsList() {
  let incidents: Incident[] = [];

  try {
    const incidentsQuery = await adminDb.collection("incidents").orderBy("created_at", "desc").limit(100).get();
    incidents = incidentsQuery.docs.map((d: QueryDocumentSnapshot) => {
      const data = d.data();
      return serializeFirestore<Incident>({
        ...data,
        id: d.id,
      });
    });
  } catch (err) {
    console.warn("Static build-time fallback active for incidents:", err);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#161B22] pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold uppercase tracking-tight flex items-center gap-3 text-gray-100">
            Caught Break-Ins & Threats
            <span className="text-xs font-mono px-2 py-0.5 border border-[#EF4444] text-[#EF4444] bg-[#EF4444]/10">
              SYNTHESIZED CASES
            </span>
          </h1>
          <p className="text-sm font-mono text-gray-400 mt-1">
            All attacks caught by the automatic detective, with calculated danger levels and instant computer lockdown options
          </p>
        </div>
        <div className="font-mono text-xs text-gray-400">
          <span>TOTAL CASES IN DATABASE: </span>
          <span className="text-[#00F0FF] font-bold">{incidents.length}</span>
        </div>
      </header>

      <IncidentsListClient initialIncidents={incidents} />
    </div>
  );
}
