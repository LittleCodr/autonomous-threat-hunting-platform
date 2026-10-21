import { SecurityEvent, Severity } from "@/types";

export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  mitreTactic: string;
  mitreTechnique: string;
  evaluate: (events: SecurityEvent[]) => SecurityEvent | null;
}

export const rules: DetectionRule[] = [
  {
    id: "RUL-01",
    name: "BRUTE_FORCE_SUCCESS",
    description: "Multiple failed logins followed by a successful login within 5 minutes",
    severity: "CRITICAL",
    mitreTactic: "Credential Access",
    mitreTechnique: "T1110 (Brute Force)",
    evaluate: (events: SecurityEvent[]) => {
      const successEvents = events.filter(e => e.event_type === "LOGIN_SUCCESS");
      for (const success of successEvents) {
        const precedingFailures = events.filter(e => 
          e.event_type === "LOGIN_FAILED" && 
          e.user === success.user && 
          e.timestamp <= success.timestamp &&
          (success.timestamp.getTime() - e.timestamp.getTime()) < 5 * 60 * 1000 // within 5 mins
        );
        if (precedingFailures.length >= 2) {
          return success; 
        }
      }
      return null;
    }
  },
  {
    id: "RUL-02",
    name: "MASS_DATA_EXFILTRATION",
    description: "Abnormal volume outbound network data transfer exceeding baseline thresholds",
    severity: "CRITICAL",
    mitreTactic: "Exfiltration",
    mitreTechnique: "T1048 (Exfiltration Over Alternative Protocol)",
    evaluate: (events: SecurityEvent[]) => {
      for (const event of events) {
        if (
          event.event_type === "DATA_TRANSFER" || 
          event.action === "DATA_TRANSFER" ||
          (event.metadata?.bytes && Number(event.metadata.bytes) > 50000000)
        ) {
          return event;
        }
      }
      return null;
    }
  },
  {
    id: "RUL-03",
    name: "PRIVILEGE_ESCALATION_ANOMALY",
    description: "Unauthorized elevation of account privileges or shadow administrator assignment",
    severity: "HIGH",
    mitreTactic: "Privilege Escalation",
    mitreTechnique: "T1078 (Valid Accounts)",
    evaluate: (events: SecurityEvent[]) => {
      for (const event of events) {
        if (
          event.event_type === "PRIVILEGE_ESCALATION" ||
          event.event_type === "ROLE_ASSIGNMENT" ||
          (event.action && event.action.toLowerCase().includes("admin grant"))
        ) {
          return event;
        }
      }
      return null;
    }
  },
  {
    id: "RUL-04",
    name: "PORT_SCAN",
    description: "Rapid sequence of connection attempts across multiple ports within 60s",
    severity: "HIGH",
    mitreTactic: "Discovery",
    mitreTechnique: "T1046 (Network Service Discovery)",
    evaluate: (events: SecurityEvent[]) => {
      const connections = events.filter(e => e.event_type === "NETWORK_CONNECTION");
      const byIp: Record<string, SecurityEvent[]> = {};
      connections.forEach(c => {
        if (!c.source_ip) return;
        if (!byIp[c.source_ip]) byIp[c.source_ip] = [];
        byIp[c.source_ip].push(c);
      });
      for (const ip in byIp) {
        if (byIp[ip].length >= 5) { 
          const sorted = byIp[ip].sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime());
          const timeSpan = sorted[sorted.length - 1].timestamp.getTime() - sorted[0].timestamp.getTime();
          if (timeSpan <= 60000) return sorted[sorted.length - 1]; // 5+ connections in 1 min
        }
      }
      return null;
    }
  },
  {
    id: "RUL-05",
    name: "SUSPICIOUS_PROCESS_NETWORK_ACTIVITY",
    description: "Execution of script interpreter (powershell/bash) followed by network egress",
    severity: "CRITICAL",
    mitreTactic: "Execution",
    mitreTechnique: "T1059.001 (Command and Scripting Interpreter)",
    evaluate: (events: SecurityEvent[]) => {
      const procs = events.filter(e => e.event_type === "PROCESS_EXECUTION" && e.process && (e.process.includes("powershell") || e.process.includes("cmd.exe") || e.process.includes("/bin/sh")));
      for (const p of procs) {
        const net = events.find(e => e.event_type === "NETWORK_CONNECTION" && e.source_ip === p.source_ip && e.timestamp >= p.timestamp);
        if (net) return net;
      }
      return null;
    }
  }
];

export function runDetection(recentEvents: SecurityEvent[]): { rule: DetectionRule, triggerEvent: SecurityEvent } | null {
  for (const rule of rules) {
    const trigger = rule.evaluate(recentEvents);
    if (trigger) {
      return { rule, triggerEvent: trigger };
    }
  }
  return null;
}
