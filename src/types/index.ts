export type Severity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Status = "OPEN" | "INVESTIGATING" | "CLOSED" | "RUNNING" | "COMPLETED" | "FAILED" | "CONTAINED";

export interface SecurityEvent {
  id?: string;
  timestamp: Date;
  user?: string;
  source_ip?: string;
  destination_ip?: string;
  device?: string;
  event_type: string;
  process?: string;
  action?: string;
  severity: Severity;
  metadata?: any;
  incidentId?: string;
}

export interface RiskBreakdown {
  base: number;
  densityModifier: number;
  exfilModifier: number;
  deviceModifier: number;
  total: number;
}

export interface Incident {
  id?: string;
  title: string;
  status: Status;
  severity: Severity;
  risk_score: number;
  risk_breakdown?: RiskBreakdown;
  threat_type: string;
  mitre_tactics?: string[];
  contained_at?: Date;
  contained_by?: string;
  containment_action?: string;
  created_at: Date;
  updated_at: Date;
  events?: SecurityEvent[];
}

export interface InvestigationRun {
  id?: string;
  incidentId: string;
  trigger_event_id: string;
  start_time: Date;
  end_time?: Date;
  events_examined: number;
  entities_examined: number;
  status: Status;
  duration?: string;
}

export interface AIAnalysis {
  id?: string;
  incidentId: string;
  summary: string;
  why_suspicious: string;
  key_evidence: string[];
  likely_threat: string;
  recommended_checks: string[];
  mitre_tactics?: string[];
  generated_at: Date;
}
