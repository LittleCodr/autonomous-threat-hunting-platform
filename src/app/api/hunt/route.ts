import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { SecurityEvent } from "@/types";
import { Query, QueryDocumentSnapshot, Timestamp } from "firebase-admin/firestore";
import { buildIncident } from "@/lib/correlation";
import { evaluateRisk } from "@/lib/risk";
import { generateAIAnalysis } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const { entityType, entityValue, promoteToIncident = false } = await req.json();

    if (!entityValue || !entityValue.trim()) {
      return NextResponse.json({ error: "Entity value is required" }, { status: 400 });
    }

    const value = entityValue.trim();
    const type = (entityType || "USER").toUpperCase();
    const eventsRef = adminDb.collection("security_events");

    let query: Query;
    if (type === "IP" || type === "IP ADDRESS") {
      query = eventsRef.where("source_ip", "==", value);
    } else if (type === "DEVICE") {
      query = eventsRef.where("device", "==", value);
    } else if (type === "PROCESS") {
      query = eventsRef.where("process", "==", value);
    } else {
      // Default to USER
      query = eventsRef.where("user", "==", value);
    }

    const snapshot = await query.limit(100).get();
    const events: SecurityEvent[] = snapshot.docs.map((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        timestamp: data.timestamp ? data.timestamp.toDate() : new Date()
      } as SecurityEvent;
    });

    // Also check destination_ip if type is IP
    if (type === "IP" || type === "IP ADDRESS") {
      const destSnapshot = await eventsRef.where("destination_ip", "==", value).limit(50).get();
      destSnapshot.docs.forEach((doc: QueryDocumentSnapshot) => {
        if (!events.some((e: SecurityEvent) => e.id === doc.id)) {
          const data = doc.data();
          events.push({
            ...data,
            id: doc.id,
            timestamp: data.timestamp ? data.timestamp.toDate() : new Date()
          } as SecurityEvent);
        }
      });
    }

    // Sort chronologically
    events.sort((a: SecurityEvent, b: SecurityEvent) => b.timestamp.getTime() - a.timestamp.getTime());

    // Extract correlated entities
    const connectedUsers = Array.from(new Set(events.map((e: SecurityEvent) => e.user).filter(Boolean)));
    const connectedIps = Array.from(new Set(events.map((e: SecurityEvent) => e.source_ip).filter(Boolean)));
    const connectedDevices = Array.from(new Set(events.map((e: SecurityEvent) => e.device).filter(Boolean)));
    const connectedProcesses = Array.from(new Set(events.map((e: SecurityEvent) => e.process).filter(Boolean)));

    let createdIncidentId: string | undefined = undefined;

    // Optional promotion to incident
    if (promoteToIncident && events.length > 0) {
      const incident = buildIncident(events, `MANUAL_HUNT: ${type} - ${value}`, "HIGH");
      const risk = evaluateRisk(incident);
      incident.risk_score = risk.score;
      incident.risk_breakdown = risk.breakdown;

      const incRef = adminDb.collection("incidents").doc();
      createdIncidentId = incRef.id;
      const incData = { ...incident };
      delete incData.events;
      
      await incRef.set({
        ...incData,
        id: incRef.id,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });

      const ai = await generateAIAnalysis(incident);
      await adminDb.collection("ai_analyses").doc().set({
        ...ai,
        incidentId: incRef.id,
        generated_at: Timestamp.now()
      });

      // Update events
      const batch = adminDb.batch();
      events.forEach((e: SecurityEvent) => {
        if (e.id) batch.update(eventsRef.doc(e.id), { incidentId: incRef.id });
      });
      await batch.commit();
    }

    const executionTimeMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      query: { entityType: type, entityValue: value },
      executionTimeMs,
      totalEvents: events.length,
      events,
      connectedEntities: {
        users: connectedUsers,
        ips: connectedIps,
        devices: connectedDevices,
        processes: connectedProcesses
      },
      createdIncidentId
    });

  } catch (error: any) {
    console.error("Hunt error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
