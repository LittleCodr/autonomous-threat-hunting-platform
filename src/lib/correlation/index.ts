import { SecurityEvent, Incident, Severity } from "@/types";

export function buildIncident(events: SecurityEvent[], title: string, baseSeverity: Severity): Incident {
  // Map out entities to determine threat type and MITRE tactics
  const threatTypes = new Set<string>();
  const mitreTactics = new Set<string>();

  events.forEach(e => {
    if (e.event_type.includes("LOGIN")) {
      threatTypes.add("Authentication Anomaly");
      mitreTactics.add("TA0006: Credential Access");
    }
    if (e.event_type.includes("NETWORK")) {
      threatTypes.add("Network Recon / C2");
      mitreTactics.add("TA0007: Discovery");
    }
    if (e.process) {
      threatTypes.add("Malicious Execution");
      mitreTactics.add("TA0002: Execution");
    }
    if (e.event_type === "DATA_TRANSFER" || e.action === "DATA_TRANSFER") {
      threatTypes.add("Data Exfiltration");
      mitreTactics.add("TA0010: Exfiltration");
    }
    if (e.event_type === "NEW_DEVICE_DETECTED") {
      threatTypes.add("Unknown Asset Infiltration");
      mitreTactics.add("TA0001: Initial Access");
    }
    if (e.event_type === "PRIVILEGE_ESCALATION") {
      threatTypes.add("Privilege Abuse");
      mitreTactics.add("TA0004: Privilege Escalation");
    }
  });

  return {
    title,
    status: "INVESTIGATING",
    severity: baseSeverity,
    risk_score: 0, // Computed in risk engine
    threat_type: Array.from(threatTypes).join(" / ") || "Unknown Anomaly",
    mitre_tactics: Array.from(mitreTactics),
    created_at: new Date(),
    updated_at: new Date(),
    events
  };
}
