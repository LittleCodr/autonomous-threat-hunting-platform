import { SecurityEvent, Incident, Severity } from "@/types";

export function buildIncident(events: SecurityEvent[], title: string, baseSeverity: Severity): Incident {
  // Map out entities to determine threat type
  const threatTypes = new Set<string>();
  events.forEach(e => {
    if (e.event_type.includes("LOGIN")) threatTypes.add("Authentication Anomaly");
    if (e.event_type.includes("NETWORK")) threatTypes.add("Network Exfiltration / C2");
    if (e.process) threatTypes.add("Malicious Execution");
  });

  return {
    title,
    status: "INVESTIGATING",
    severity: baseSeverity,
    risk_score: 0, // Assigned later
    threat_type: Array.from(threatTypes).join(" / ") || "Unknown Anomaly",
    created_at: new Date(),
    updated_at: new Date(),
    events
  };
}
