import { Incident } from "@/types";

export function calculateRiskScore(incident: Incident): number {
  let score = 0;
  
  // Baseline scoring by severity
  switch (incident.severity) {
    case "INFO": score += 10; break;
    case "LOW": score += 30; break;
    case "MEDIUM": score += 50; break;
    case "HIGH": score += 75; break;
    case "CRITICAL": score += 90; break;
  }

  const eventCount = incident.events?.length || 0;
  
  // Correlation density modifier
  if (eventCount > 5) score += 5;
  if (eventCount > 20) score += 5;

  // Specific high-risk metadata modifiers
  const hasDataExfil = incident.events?.some(e => 
    e.action === "DATA_TRANSFER" || 
    (e.metadata?.bytes && parseInt(e.metadata.bytes) > 1000000)
  );
  if (hasDataExfil) score = Math.min(100, score + 15);

  const hasNewDevice = incident.events?.some(e => e.event_type === "NEW_DEVICE_DETECTED");
  if (hasNewDevice) score = Math.min(100, score + 10);

  return Math.min(100, score);
}
