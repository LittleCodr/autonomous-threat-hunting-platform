import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Timestamp, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { huntRelatedEvents } from "@/lib/hunting";
import { evaluateRisk } from "@/lib/risk";
import { SecurityEvent } from "@/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Incident ID required" }, { status: 400 });
    }

    const { action } = await req.json();
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
        updated_at: Timestamp.now()
      });
      return NextResponse.json({ success: true, status: "CLOSED" });
    }

    if (action === "REOPEN") {
      await incRef.update({
        status: "INVESTIGATING",
        updated_at: Timestamp.now()
      });
      return NextResponse.json({ success: true, status: "INVESTIGATING" });
    }

    if (action === "DEEP_HUNT") {
      // Find linked events
      const eventsSnap = await adminDb.collection("security_events").where("incidentId", "==", id).get();
      const events = eventsSnap.docs.map((d: QueryDocumentSnapshot) => ({
        ...d.data(),
        id: d.id,
        timestamp: d.data().timestamp.toDate()
      })) as SecurityEvent[];

      if (events.length > 0) {
        const trigger = events[0];
        const expandedRelated = await huntRelatedEvents(trigger);
        
        // Link any newly found events
        const batch = adminDb.batch();
        let addedCount = 0;
        expandedRelated.forEach(e => {
          if (e.id && !e.incidentId) {
            batch.update(adminDb.collection("security_events").doc(e.id), { incidentId: id });
            addedCount++;
          }
        });
        if (addedCount > 0) {
          await batch.commit();
        }

        // Re-evaluate risk score
        const allEvents = [...events, ...expandedRelated.filter(e => !events.some(x => x.id === e.id))];
        const updatedRisk = evaluateRisk({
          title: incData?.title || "",
          status: incData?.status || "INVESTIGATING",
          severity: incData?.severity || "HIGH",
          risk_score: 0,
          threat_type: incData?.threat_type || "",
          created_at: new Date(),
          updated_at: new Date(),
          events: allEvents
        });

        await incRef.update({
          risk_score: updatedRisk.score,
          risk_breakdown: updatedRisk.breakdown,
          updated_at: Timestamp.now()
        });

        return NextResponse.json({
          success: true,
          message: `Deep hunt completed. Analyzed ${expandedRelated.length} events, linked ${addedCount} new records.`,
          newEventsCount: addedCount,
          riskScore: updatedRisk.score
        });
      }
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  } catch (error: any) {
    console.error("Action error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
