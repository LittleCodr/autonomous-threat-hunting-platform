import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Timestamp, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { huntRelatedEvents } from "@/lib/hunting";
import { evaluateRisk } from "@/lib/risk";
import { SecurityEvent } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id || body.incidentId;
    const action = body.action;

    if (!id) {
      return NextResponse.json({ error: "Incident ID required" }, { status: 400 });
    }

    const incRef = adminDb.collection("incidents").doc(id);
    const incDoc = await incRef.get();

    if (!incDoc.exists) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    const incData = incDoc.data();

    if (action === "ISOLATE_HOST" || action === "CONTAIN") {
      await incRef.update({
        status: "CONTAINED",
        contained_at: Timestamp.now(),
        contained_by: "SOC_ANALYST_01",
        containment_action: "Endpoint Network Sockets Quarantined & Process Termination Initiated",
        updated_at: Timestamp.now()
      });

      return NextResponse.json({
        success: true,
        message: "Endpoint quarantined and incident status marked as CONTAINED",
        status: "CONTAINED"
      });
    }

    if (action === "CLOSE") {
      await incRef.update({
        status: "CLOSED",
        closed_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });

      return NextResponse.json({
        success: true,
        message: "Incident marked as CLOSED",
        status: "CLOSED"
      });
    }

    if (action === "REOPEN") {
      await incRef.update({
        status: "INVESTIGATING",
        updated_at: Timestamp.now()
      });

      return NextResponse.json({
        success: true,
        message: "Incident reopened",
        status: "INVESTIGATING"
      });
    }

    if (action === "DEEP_HUNT") {
      // Re-trigger autonomous correlation with a wider window
      const eventsSnapshot = await adminDb.collection("security_events").where("incidentId", "==", id).get();
      const events = eventsSnapshot.docs.map((d: QueryDocumentSnapshot) => d.data()) as SecurityEvent[];

      if (events.length > 0) {
        const trigger = events[0];
        const additionalEvents = await huntRelatedEvents(trigger);

        // Link any newly discovered events
        const batch = adminDb.batch();
        let newCount = 0;
        additionalEvents.forEach((ev: SecurityEvent) => {
          if (ev.id && !events.some((e: SecurityEvent) => e.id === ev.id)) {
            batch.update(adminDb.collection("security_events").doc(ev.id), { incidentId: id });
            newCount++;
          }
        });

        if (newCount > 0) {
          const allEvents = [...events, ...additionalEvents];
          const newRisk = evaluateRisk({
            ...incData,
            events: allEvents
          } as any);
          await incRef.update({
            risk_score: newRisk.score,
            risk_breakdown: newRisk.breakdown,
            updated_at: Timestamp.now()
          });
          await batch.commit();
        }

        return NextResponse.json({
          success: true,
          message: `Deep hunt completed. Discovered ${newCount} additional correlated telemetry events.`,
          newEventsCount: newCount
        });
      }
    }

    return NextResponse.json({ error: "Invalid action specified" }, { status: 400 });
  } catch (err: any) {
    console.error("Action handler error:", err);
    return NextResponse.json({ error: err.message || "Failed to process incident action" }, { status: 500 });
  }
}
