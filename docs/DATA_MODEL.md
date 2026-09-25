# Data Model

The PostgreSQL schema designed for Prisma.

## Firestore Collections

```typescript
// Collection: users
type User = {
  id: string; // Document ID
  username: string;
  role: string;
  department?: string;
}

// Collection: security_events
type SecurityEvent = {
  id: string; // Document ID
  timestamp: FirebaseFirestore.Timestamp;
  user?: string;
  source_ip?: string;
  destination_ip?: string;
  device?: string;
  event_type: string;
  process?: string;
  action?: string;
  severity: string; // INFO, LOW, MEDIUM, HIGH, CRITICAL
  metadata?: any; // Flexible payload for additional telemetry
  incidentId?: string; // Reference to incidents collection
}

// Collection: detection_rules
type DetectionRule = {
  id: string; // Document ID
  name: string;
  description: string;
  severity: string;
  logic_payload: any; // Representation of the rule logic
  status: string; // ACTIVE, DISABLED
  last_triggered?: FirebaseFirestore.Timestamp;
}

// Collection: incidents
type Incident = {
  id: string; // Document ID
  title: string;
  status: string; // OPEN, INVESTIGATING, CLOSED
  severity: string;
  risk_score?: number;
  threat_type?: string;
  created_at: FirebaseFirestore.Timestamp;
  updated_at: FirebaseFirestore.Timestamp;
}

// Collection: investigation_runs
type InvestigationRun = {
  id: string; // Document ID
  incidentId: string; // Reference to incidents collection
  trigger_event_id: string; // Reference to security_events collection
  start_time: FirebaseFirestore.Timestamp;
  end_time?: FirebaseFirestore.Timestamp;
  events_examined: number;
  entities_examined: number;
  status: string; // RUNNING, COMPLETED, FAILED
}

// Collection: ai_analyses
type AIAnalysis = {
  id: string; // Document ID
  incidentId: string; // Reference to incidents collection
  summary: string;
  why_suspicious: string;
  key_evidence: any;
  likely_threat: string;
  recommended_checks: any;
  generated_at: FirebaseFirestore.Timestamp;
}
```

## Entity Notes
- **security_events:** The foundational telemetry row.
- **incidents:** An aggregated container for correlated events.
- **investigation_runs:** Audit trail for the autonomous hunt engine.
- **ai_analyses:** The structured output from the LLM, stored explicitly to avoid recalculation.
