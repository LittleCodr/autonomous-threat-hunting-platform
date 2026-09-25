# Autonomous Cyber Threat Hunting Platform
## Project Overview & Technical Architecture
**Prepared for Mentor Review**

---

## 1. Executive Summary
The Autonomous Cyber Threat Hunting Platform is a modern, web-based security operations center (SOC) application designed to automate the initial stages of incident response. Unlike generic dashboards, it actively processes telemetry data, correlates suspicious events, scores risk, and leverages AI to synthesize forensic evidence into actionable insights.

The platform is built to emulate a serious, production-grade cybersecurity tool.

## 2. Core Workflow: DETECT → HUNT → CORRELATE → ASSESS → EXPLAIN

The system operates autonomously through five distinct backend engines triggered in real-time when new telemetry data is ingested via the API (`/api/ingest`):

1. **Detection Engine (`src/lib/detection`)**
   - **Role:** Evaluates incoming telemetry against predefined security rules (e.g., Brute Force, Port Scan).
   - **Mechanism:** Continuous evaluation loop. If a pattern matches (e.g., 5 failed logins followed by a success within 5 minutes), it triggers an investigation.

2. **Autonomous Hunt Engine (`src/lib/hunting`)**
   - **Role:** Gathers contextual evidence.
   - **Mechanism:** Once an event triggers a detection, the Hunt Engine automatically queries the database for all related events connected to the same User or IP Address within a 15-minute window of the anomaly.

3. **Correlation Engine (`src/lib/correlation`)**
   - **Role:** Stitches isolated events into a unified Incident.
   - **Mechanism:** Maps entity overlaps (Users, Devices, IPs) to determine the likely Threat Vector (e.g., "Authentication Anomaly", "Network Exfiltration").

4. **Risk Engine (`src/lib/risk`)**
   - **Role:** Quantifies the severity of the incident on a scale of 0-100.
   - **Mechanism:** Evaluates correlation density (number of events) and specific metadata modifiers (e.g., if data exfiltration exceeds 1MB, the risk score spikes).

5. **AI Synthesis Layer (`src/lib/ai`)**
   - **Role:** Explains the incident in plain English for security analysts.
   - **Mechanism:** Extracts unique entities and feeds the correlated timeline to an LLM (or deterministic fallback) to generate a forensic summary, explain why it's suspicious, and recommend mitigation steps.

---

## 3. Technology Stack

- **Frontend Framework:** Next.js (App Router, Server Components)
- **Styling:** Tailwind CSS + Custom CSS (`globals.css`)
- **Database:** Firebase Firestore (NoSQL, optimized for rapid, unstructured telemetry ingestion)
- **Backend APIs:** Next.js Route Handlers (`/api/ingest`, `/api/seed`)
- **Server Execution:** Firebase Admin SDK v12 (Service Account authorized)

---

## 4. UI / UX Design Philosophy (Neubrutalism)
The interface is intentionally designed to break away from standard enterprise SaaS templates. It utilizes a **Neubrutalist** (Neo-brutalist) design language to reflect a raw, forensic, and highly technical environment.

**Key Aesthetic Elements:**
- **Color Palette:** Deep black/dark grey (`#0D1117`, `#161B22`) backgrounds with electric accents (`#00F0FF` cyan, `#39FF14` acid green, `#EF4444` pure red).
- **Hard Geometry:** Sharp corners with solid 1px borders instead of soft drop-shadows. Offset hard shadows for depth (`.neubrutalist-shadow`).
- **Typography:** Monospace fonts (`JetBrains Mono`) for data, logs, and telemetry to emphasize technical precision, paired with `Space Grotesk` for sharp, highly legible headers.
- **Micro-interactions:** Subtle hover states, electric glowing borders on active states, and raw, uppercase tracking.

---

## 5. System Features & Views

- **Command Center (`/`)**: High-level dashboard showing active threat counts, average triage time, and a real-time feed of prioritized incidents.
- **Incident Investigation (`/incidents/[id]`)**: The core forensic view. Displays the AI synthesis report, a chronologically correlated timeline of the attack, extracted entities, and immediate response actions (e.g., "Isolate Host").
- **Event Explorer (`/events`)**: A dense, searchable data table displaying the raw, unfiltered telemetry stream entering the system.
- **Threat Hunting (`/hunt`)**: A manual interface allowing analysts to query the database by specific entity values (IP, User) and time ranges to find hidden threats.
- **System & Rules (`/rules`)**: An audit log displaying currently active detection rules and a history of every autonomous investigation run by the backend engines.

---

## 6. How the Demo Works
To demonstrate the platform's capabilities without waiting for real attacks, the application features a `/api/seed` endpoint. When triggered, it blasts the ingestion engine with dozens of simulated log entries representing specific attack chains (e.g., Account Compromise, Port Scanning). 

Because the backend engines are active, the system autonomously intercepts these logs, hunts the context, and generates the incidents visible in the UI in real-time.
