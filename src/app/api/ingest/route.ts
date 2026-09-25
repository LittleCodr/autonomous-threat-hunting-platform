import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { runDetection } from "@/lib/detection";
import { huntRelatedEvents } from "@/lib/hunting";
import { buildIncident } from "@/lib/correlation";
import { calculateRiskScore } from "@/lib/risk";
import { generateAIAnalysis } from "@/lib/ai";
import { SecurityEvent } from "@/types";
import { Timestamp, QueryDocumentSnapshot } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    
    // Support bulk array or single event
    const eventsToProcess: any[] = Array.isArray(payload) ? payload : [payload];
    const results = [];

    for (const rawEvent of eventsToProcess) {
      const event: SecurityEvent = {
        ...rawEvent,
        timestamp: new Date(rawEvent.timestamp || Date.now())
      };

      // 1. Ingest Event
      const eventRef = adminDb.collection("security_events").doc();
      await eventRef.set({
        ...event,
        timestamp: Timestamp.fromDate(event.timestamp)
      });
      event.id = eventRef.id;

      // Fetch recent context (last 5 mins) for rule evaluation
      const fiveMinsAgo = new Date(event.timestamp.getTime() - 5 * 60 * 1000);
      const recentQuery = await adminDb.collection("security_events")
        .where("timestamp", ">=", Timestamp.fromDate(fiveMinsAgo))
        .get();
      
      const recentEvents = recentQuery.docs.map((doc: QueryDocumentSnapshot) => {
        const data = doc.data();
        return { ...data, id: doc.id, timestamp: data.timestamp.toDate() } as SecurityEvent;
      });
      recentEvents.push(event);

      // 2. Detection Engine
      const detection = runDetection(recentEvents);
      if (detection) {
        // 3. Autonomous Hunt
        const runRef = adminDb.collection("investigation_runs").doc();
        await runRef.set({
          trigger_event_id: detection.triggerEvent.id,
          status: "RUNNING",
          start_time: Timestamp.now(),
        });

        const relatedEvents = await huntRelatedEvents(detection.triggerEvent);
        
        // 4. Correlation Engine
        const incident = buildIncident(relatedEvents, detection.rule.name, detection.rule.severity);
        
        // 5. Risk Scoring
        incident.risk_score = calculateRiskScore(incident);

        // Save Incident
        const incidentRef = adminDb.collection("incidents").doc();
        incident.id = incidentRef.id;
        
        const { events, ...incidentData } = incident;
        await incidentRef.set({
          ...incidentData,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now()
        });

        // Link events to incident
        const batch = adminDb.batch();
        relatedEvents.forEach(e => {
          if (e.id) {
            batch.update(adminDb.collection("security_events").doc(e.id), { incidentId: incident.id });
          }
        });
        await batch.commit();

        // 6. AI Explanation
        const aiAnalysis = await generateAIAnalysis(incident);
        await adminDb.collection("ai_analyses").doc().set({
          ...aiAnalysis,
          generated_at: Timestamp.now()
        });

        // Finalize Run
        await runRef.update({
          incidentId: incident.id,
          end_time: Timestamp.now(),
          events_examined: relatedEvents.length,
          entities_examined: new Set(relatedEvents.map(e => e.user).concat(relatedEvents.map(e => e.source_ip))).size,
          status: "COMPLETED"
        });

        results.push({ eventId: event.id, incidentId: incident.id, detection: detection.rule.name });
      } else {
        results.push({ eventId: event.id, status: "Ingested" });
      }
    }

    return NextResponse.json({ success: true, results });

  } catch (error: any) {
    console.error("Ingestion pipeline error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
