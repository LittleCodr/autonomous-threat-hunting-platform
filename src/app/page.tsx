import { adminDb } from "@/lib/firebase/admin";
import { Incident, InvestigationRun } from "@/types";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { CommandCenterClient } from "@/components/dashboard/CommandCenterClient";
import { serializeFirestore } from "@/lib/firebase/serialize";

export const dynamic = 'force-dynamic';

export default async function CommandCenter() {
  const incidentsQuery = await adminDb.collection("incidents").orderBy("created_at", "desc").limit(20).get();
  const incidents = incidentsQuery.docs.map((d: QueryDocumentSnapshot) => {
    return serializeFirestore<Incident>({
      ...d.data(),
      id: d.id
    });
  });

  const runsQuery = await adminDb.collection("investigation_runs").orderBy("start_time", "desc").limit(20).get();
  const runs = runsQuery.docs.map((d: QueryDocumentSnapshot) => {
    return serializeFirestore<InvestigationRun>({
      ...d.data(),
      id: d.id
    });
  });

  // Real count of processed events
  let count = 0;
  try {
    const eventsCountSnap = await adminDb.collection("security_events").count().get();
    count = eventsCountSnap.data().count;
  } catch {
    count = 0;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <CommandCenterClient
        initialIncidents={incidents}
        initialRuns={runs}
        eventsCount={count}
      />
    </div>
  );
}
