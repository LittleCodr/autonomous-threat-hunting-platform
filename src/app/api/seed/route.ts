import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { runDetection } from "@/lib/detection";
import { huntRelatedEvents } from "@/lib/hunting";
import { buildIncident } from "@/lib/correlation";
import { evaluateRisk } from "@/lib/risk";
import { generateAIAnalysis } from "@/lib/ai";
import { SecurityEvent } from "@/types";
import { Timestamp } from "firebase-admin/firestore";

async function processEventsInternal(eventsToProcess: any[]) {
  const results = [];
  const batchIngested: SecurityEvent[] = [];

  for (const rawEvent of eventsToProcess) {
    const runStartTime = Date.now();
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
    batchIngested.push(event);

    // Context window
    const windowStart = new Date(event.timestamp.getTime() - 10 * 60 * 1000);
    const recentQuery = await adminDb.collection("security_events")
      .where("timestamp", ">=", Timestamp.fromDate(windowStart))
      .get();
    
    const recentEventsMap = new Map<string, SecurityEvent>();
    recentQuery.docs.forEach((doc) => {
      const data = doc.data();
      recentEventsMap.set(doc.id, { ...data, id: doc.id, timestamp: data.timestamp.toDate() } as SecurityEvent);
    });
    batchIngested.forEach(be => {
      if (be.id) recentEventsMap.set(be.id, be);
    });
    const recentEvents = Array.from(recentEventsMap.values());

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
      const riskResult = evaluateRisk(incident);
      incident.risk_score = riskResult.score;
      incident.risk_breakdown = riskResult.breakdown;

      // Save Incident
      const incidentRef = adminDb.collection("incidents").doc();
      incident.id = incidentRef.id;
      
      const incidentData = { ...incident };
      delete incidentData.events;
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
        incidentId: incident.id,
        generated_at: Timestamp.now()
      });

      const durationMs = Date.now() - runStartTime;
      await runRef.update({
        incidentId: incident.id,
        end_time: Timestamp.now(),
        events_examined: relatedEvents.length,
        entities_examined: new Set(relatedEvents.map(e => e.user).concat(relatedEvents.map(e => e.source_ip))).size,
        duration: `${Math.max(22, Math.round(durationMs))}ms`,
        status: "COMPLETED"
      });

      results.push({ eventId: event.id, incidentId: incident.id, detection: detection.rule.name, risk_score: incident.risk_score });
    } else {
      results.push({ eventId: event.id, status: "Ingested" });
    }
  }

  return results;
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const scenario = body.scenario || "ALL";
    const now = Date.now();
    let events: any[] = [];

    const scenarioA = [
      { timestamp: new Date(now - 280000).toISOString(), user: "alex.morgan", source_ip: "185.88.92.1", device: "Unknown_Mac", event_type: "LOGIN_FAILED", severity: "MEDIUM" },
      { timestamp: new Date(now - 260000).toISOString(), user: "alex.morgan", source_ip: "185.88.92.1", device: "Unknown_Mac", event_type: "LOGIN_FAILED", severity: "MEDIUM" },
      { timestamp: new Date(now - 240000).toISOString(), user: "alex.morgan", source_ip: "185.88.92.1", device: "Unknown_Mac", event_type: "LOGIN_SUCCESS", severity: "CRITICAL" },
      { timestamp: new Date(now - 220000).toISOString(), user: "alex.morgan", source_ip: "185.88.92.1", device: "Unknown_Mac", event_type: "NEW_DEVICE_DETECTED", severity: "HIGH" },
      { timestamp: new Date(now - 160000).toISOString(), user: "alex.morgan", source_ip: "185.88.92.1", event_type: "RESOURCE_ACCESS", action: "Production Database Customer Backup", severity: "HIGH" },
      { timestamp: new Date(now - 120000).toISOString(), user: "alex.morgan", source_ip: "185.88.92.1", destination_ip: "45.101.22.9", event_type: "DATA_TRANSFER", action: "DATA_TRANSFER", metadata: { bytes: "4200000000" }, severity: "CRITICAL" }
    ];

    const scenarioB = [
      { timestamp: new Date(now - 55000).toISOString(), source_ip: "45.33.22.1", destination_ip: "10.0.0.50", event_type: "NETWORK_CONNECTION", action: "PORT_22", severity: "INFO" },
      { timestamp: new Date(now - 50000).toISOString(), source_ip: "45.33.22.1", destination_ip: "10.0.0.50", event_type: "NETWORK_CONNECTION", action: "PORT_80", severity: "INFO" },
      { timestamp: new Date(now - 45000).toISOString(), source_ip: "45.33.22.1", destination_ip: "10.0.0.50", event_type: "NETWORK_CONNECTION", action: "PORT_443", severity: "INFO" },
      { timestamp: new Date(now - 40000).toISOString(), source_ip: "45.33.22.1", destination_ip: "10.0.0.50", event_type: "NETWORK_CONNECTION", action: "PORT_445", severity: "INFO" },
      { timestamp: new Date(now - 35000).toISOString(), source_ip: "45.33.22.1", destination_ip: "10.0.0.50", event_type: "NETWORK_CONNECTION", action: "PORT_3389", severity: "INFO" },
      { timestamp: new Date(now - 30000).toISOString(), source_ip: "45.33.22.1", destination_ip: "10.0.0.50", event_type: "NETWORK_CONNECTION", action: "PORT_1433", severity: "INFO" },
      { timestamp: new Date(now - 25000).toISOString(), source_ip: "45.33.22.1", destination_ip: "10.0.0.50", event_type: "NETWORK_CONNECTION", action: "PORT_8080", severity: "INFO" },
      { timestamp: new Date(now - 20000).toISOString(), source_ip: "45.33.22.1", destination_ip: "10.0.0.50", event_type: "NETWORK_CONNECTION", action: "PORT_8443", severity: "INFO" }
    ];

    const scenarioC = [
      { timestamp: new Date(now - 190000).toISOString(), user: "j.smith", source_ip: "10.0.1.15", device: "CORP-LAP-02", event_type: "PROCESS_EXECUTION", process: "powershell.exe -ExecutionPolicy Bypass -NoProfile -enc SQBFAFgA", severity: "HIGH" },
      { timestamp: new Date(now - 170000).toISOString(), user: "j.smith", source_ip: "10.0.1.15", device: "CORP-LAP-02", event_type: "NETWORK_CONNECTION", action: "OUTBOUND_C2_SOCKET", destination_ip: "185.12.55.1", severity: "CRITICAL" }
    ];

    const benignTraffic = [
      { timestamp: new Date(now - 350000).toISOString(), user: "sarah.connor", source_ip: "192.168.1.102", device: "FINANCE-PC-1", event_type: "LOGIN_SUCCESS", severity: "INFO" },
      { timestamp: new Date(now - 320000).toISOString(), user: "sarah.connor", source_ip: "192.168.1.102", device: "FINANCE-PC-1", event_type: "RESOURCE_ACCESS", action: "Quarterly_Forecast.xlsx", severity: "INFO" },
      { timestamp: new Date(now - 210000).toISOString(), user: "mike.ross", source_ip: "192.168.1.144", device: "DEV-MAC-4", event_type: "LOGIN_SUCCESS", severity: "INFO" },
      { timestamp: new Date(now - 150000).toISOString(), user: "mike.ross", source_ip: "192.168.1.144", device: "DEV-MAC-4", event_type: "NETWORK_CONNECTION", action: "PORT_443", destination_ip: "140.82.121.4", severity: "INFO" }
    ];

    if (scenario === "ACCOUNT_TAKEOVER") {
      events = scenarioA;
    } else if (scenario === "PORT_SCAN") {
      events = scenarioB;
    } else if (scenario === "POWERSHELL_LOTL") {
      events = scenarioC;
    } else {
      events = [...benignTraffic, ...scenarioC, ...scenarioB, ...scenarioA];
    }

    const results = await processEventsInternal(events);

    return NextResponse.json({
      success: true,
      scenario,
      eventsIngested: events.length,
      pipelineResults: results,
      message: `Successfully ingested and autonomously analyzed ${events.length} security events.`
    });

  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const collections = ["security_events", "incidents", "investigation_runs", "ai_analyses"];
    let deletedCount = 0;

    for (const col of collections) {
      const snap = await adminDb.collection(col).limit(200).get();
      const batch = adminDb.batch();
      snap.docs.forEach(doc => {
        batch.delete(doc.ref);
        deletedCount++;
      });
      if (snap.size > 0) {
        await batch.commit();
      }
    }

    return NextResponse.json({
      success: true,
      message: `Database reset completed. Purged ${deletedCount} documents across collections.`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
