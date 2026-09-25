import { SecurityEvent, Severity } from "@/types";

export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  evaluate: (events: SecurityEvent[]) => SecurityEvent | null;
}

export const rules: DetectionRule[] = [
  {
    id: "RUL-01",
    name: "BRUTE_FORCE_SUCCESS",
    description: "Multiple failed logins followed by a successful login",
    severity: "CRITICAL",
    evaluate: (events: SecurityEvent[]) => {
      const successEvents = events.filter(e => e.event_type === "LOGIN_SUCCESS");
      for (const success of successEvents) {
        const precedingFailures = events.filter(e => 
          e.event_type === "LOGIN_FAILED" && 
          e.user === success.user && 
          e.timestamp < success.timestamp &&
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
    id: "RUL-04",
    name: "PORT_SCAN",
    description: "Rapid sequence of connection attempts to single/multiple ports",
    severity: "HIGH",
    evaluate: (events: SecurityEvent[]) => {
      const connections = events.filter(e => e.event_type === "NETWORK_CONNECTION");
      const byIp: Record<string, SecurityEvent[]> = {};
      connections.forEach(c => {
        if (!c.source_ip) return;
        if (!byIp[c.source_ip]) byIp[c.source_ip] = [];
        byIp[c.source_ip].push(c);
      });
      for (const ip in byIp) {
        if (byIp[ip].length > 10) { 
          const sorted = byIp[ip].sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime());
          const timeSpan = sorted[sorted.length - 1].timestamp.getTime() - sorted[0].timestamp.getTime();
          if (timeSpan < 60000) return sorted[sorted.length - 1]; // 10 connections in 1 min
        }
      }
      return null;
    }
  },
  {
    id: "RUL-05",
    name: "SUSPICIOUS_PROCESS_NETWORK_ACTIVITY",
    description: "Suspicious process execution followed by network connection",
    severity: "CRITICAL",
    evaluate: (events: SecurityEvent[]) => {
      const procs = events.filter(e => e.event_type === "PROCESS_EXECUTION" && e.process && e.process.includes("powershell"));
      for (const p of procs) {
        const net = events.find(e => e.event_type === "NETWORK_CONNECTION" && e.source_ip && e.timestamp > p.timestamp);
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
