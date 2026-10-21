import { adminDb } from "@/lib/firebase/admin";
import { Incident, SecurityEvent, AIAnalysis } from "@/types";
import { notFound } from "next/navigation";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { IncidentInvestigationClient } from "@/components/incidents/IncidentInvestigationClient";
import { serializeFirestore } from "@/lib/firebase/serialize";

export const dynamic = 'force-dynamic';

export default async function IncidentInvestigationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  if (!resolvedParams?.id) return notFound();
  
  const doc = await adminDb.collection("incidents").doc(resolvedParams.id).get();
  if (!doc.exists) return notFound();
  
  const incident = serializeFirestore<Incident>({
    ...doc.data(),
    id: doc.id
  });

  // Get correlated events
  const eventsQuery = await adminDb.collection("security_events")
    .where("incidentId", "==", incident.id)
    .get();
    
  const rawTimelineEvents = eventsQuery.docs.map((d: QueryDocumentSnapshot) => {
    return serializeFirestore<SecurityEvent>({
      ...d.data(),
      id: d.id
    });
  });

  const timelineEvents = rawTimelineEvents.sort((a: SecurityEvent, b: SecurityEvent) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Get AI Analysis
  const aiQuery = await adminDb.collection("ai_analyses")
    .where("incidentId", "==", incident.id)
    .limit(1)
    .get();
  
  let aiAnalysis: AIAnalysis | null = null;
  if (!aiQuery.empty) {
    aiAnalysis = serializeFirestore<AIAnalysis>({
      ...aiQuery.docs[0].data(),
      id: aiQuery.docs[0].id
    });
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <IncidentInvestigationClient
        incident={incident}
        timelineEvents={timelineEvents}
        aiAnalysis={aiAnalysis}
      />
    </div>
  );
}
