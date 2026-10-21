import { adminDb } from "@/lib/firebase/admin";
import { Incident, InvestigationRun } from "@/types";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { CommandCenterClient } from "@/components/dashboard/CommandCenterClient";
import { serializeFirestore } from "@/lib/firebase/serialize";

export default async function CommandCenter() {
  let incidents: Incident[] = [];
  let runs: InvestigationRun[] = [];
  let count = 0;

  try {
    const incidentsQuery = await adminDb.collection("incidents").orderBy("created_at", "desc").limit(20).get();
    incidents = incidentsQuery.docs.map((d: QueryDocumentSnapshot) => {
      return serializeFirestore<Incident>({
        ...d.data(),
        id: d.id
      });
    });

    const runsQuery = await adminDb.collection("investigation_runs").orderBy("start_time", "desc").limit(20).get();
    runs = runsQuery.docs.map((d: QueryDocumentSnapshot) => {
      return serializeFirestore<InvestigationRun>({
        ...d.data(),
        id: d.id
      });
    });

    const eventsCountSnap = await adminDb.collection("security_events").count().get();
    count = eventsCountSnap.data().count;
  } catch (err) {
    console.warn("Static build-time fallback active:", err);
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
