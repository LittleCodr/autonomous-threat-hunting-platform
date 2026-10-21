import { Incident, RiskBreakdown } from "@/types";

export function evaluateRisk(incident: Incident): { score: number; breakdown: RiskBreakdown } {
  let base = 0;
  
  // Baseline scoring by severity
  switch (incident.severity) {
    case "INFO": base = 15; break;
    case "LOW": base = 30; break;
    case "MEDIUM": base = 50; break;
    case "HIGH": base = 75; break;
    case "CRITICAL": base = 90; break;
  }

  const eventCount = incident.events?.length || 0;
  
  // Correlation density modifier
  let densityModifier = 0;
  if (eventCount >= 10) densityModifier = 10;
  else if (eventCount >= 5) densityModifier = 5;

  // Specific high-risk metadata modifiers (e.g. data exfiltration > 1MB)
  let exfilModifier = 0;
  const hasDataExfil = incident.events?.some(e => 
    e.action === "DATA_TRANSFER" || 
    e.event_type === "DATA_TRANSFER" ||
    (e.metadata?.bytes && parseInt(e.metadata.bytes) > 1000000)
  );
  if (hasDataExfil) exfilModifier = 15;

  // New untrusted device modifier
  let deviceModifier = 0;
  const hasNewDevice = incident.events?.some(e => e.event_type === "NEW_DEVICE_DETECTED");
  if (hasNewDevice) deviceModifier = 10;

  const total = Math.min(100, Math.max(0, base + densityModifier + exfilModifier + deviceModifier));

  return {
    score: total,
    breakdown: {
      base,
      densityModifier,
      exfilModifier,
      deviceModifier,
      total
    }
  };
}

export function calculateRiskScore(incident: Incident): number {
  return evaluateRisk(incident).score;
}
