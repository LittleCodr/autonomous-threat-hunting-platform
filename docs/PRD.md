# Product Requirements Document (PRD)

## 1. Product Overview
The Autonomous Cyber Threat Hunting Platform is an advanced security operations interface designed to detect, hunt, correlate, assess, and explain suspicious security events. It acts as an autonomous threat hunting engine, automatically turning disparate telemetry into contextualized incident reports.

## 2. Problem Statement
Traditional SIEM solutions often stop at generating alerts ("Suspicious login detected"), requiring manual intervention by cybersecurity analysts to investigate related events, build a timeline, and assess risk. This manual process is time-consuming and error-prone, particularly for complex attack chains.

## 3. Target Users
- **Tier 1/2 SOC Analysts:** Need to quickly understand an incident's context and severity.
- **Threat Hunters:** Require deep visibility into related entity behaviors.
- **Cybersecurity Engineers / Instructors:** Seeking to demonstrate an automated detection-to-explanation pipeline.

## 4. Core Use Cases
- **Autonomous Investigation:** Automatically querying and correlating related events when a suspicious event is detected.
- **Risk Assessment:** Generating a quantifiable risk score based on rule and ML evidence.
- **AI Explanation:** Using an LLM to generate readable explanations of incidents, why they are suspicious, and recommending response steps.
- **Manual Threat Hunting:** Allowing analysts to search events and explore entities manually.

## 5. Product Goals
- Demonstrate a complete flow: DETECT → HUNT → CORRELATE → ASSESS → EXPLAIN.
- Provide a visually exceptional, professional-grade cybersecurity interface, avoiding generic SaaS templates.
- Automate the preliminary investigation steps an analyst would typically perform.

## 6. Non-Goals
- Replacing human analysts or providing a fully autonomous defense mechanism.
- Building an enterprise-ready, distributed SIEM capable of ingesting petabytes of data.
- Introducing unnecessary microservices, event buses (e.g., Kafka), or Kubernetes clusters.

## 7. MVP Scope
- Seeded synthetic security events.
- Deterministic detection rules.
- A minimal ML anomaly detection pipeline (Isolation Forest).
- Autonomous correlation engine linking IP, User, Device, and Time.
- Simple risk scoring engine (0-100).
- AI integration (mockable for demos, extensible to a real LLM).
- Neubrutalist UI with dark cyber-hacker aesthetics.

## 8. Future Scope
- Live ingestion from real telemetry sources.
- Custom detection rule builder.
- Automated remediation actions.
- Multi-tenant support.

## 9. Functional Requirements
- **Detection:** Identifying suspicious activity using pre-defined deterministic rules.
- **Threat Hunting:** Automatically searching for additional evidence related to a suspicious event (IP, User, Device, Time).
- **Correlation:** Connecting related events and building an incident timeline.
- **Risk Assessment:** Calculating a project-defined 0–100 risk score based on correlations and anomaly scores.
- **AI Explanation:** Converting structured evidence into an incident summary, outlining key evidence, likely threats, and recommended checks.
- **Autonomy:** Executing predefined investigation steps automatically after detection without user input.

## 10. Non-Functional Requirements
- **Performance:** Fast, snappy UI responses, specifically for investigation timelines.
- **Security:** Use environment variables for secrets; validate API inputs; do not expose API keys to the frontend.
- **Design:** Consistent neubrutalist visual language; responsive layout (optimized for 1440px desktop).

## 11. Success Criteria
- The platform can successfully synthesize a series of individual events (e.g., failed logins, new device login, suspicious process) into a single, cohesive incident report with a risk score and an AI-generated explanation.

## 12. Demo Scenario
- A pre-seeded environment demonstrating an account compromise (Scenario A), port scanning (Scenario B), and suspicious network activity (Scenario C), ready for immediate demonstration.

## 13. Risks and Limitations
- The "AI" explanation relies on structured input to prevent hallucination; the LLM must not invent telemetry.
- Risk scores are illustrative and project-defined, not a recognized universal cybersecurity standard.
- The MVP operates on seeded data rather than live enterprise ingestion.
