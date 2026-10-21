# Autonomous Threat Hunting Platform

An enterprise autonomous cyber defense and threat hunting platform engineered for sub-second adversary detection, attack chain correlation, and deterministic SOAR response.

## Key Capabilities

- **Real-Time Telemetry & Firebase Synchronization**: Bidirectional real-time event ingestion and reactive snapshot streams powered by Google Cloud Firestore.
- **5-Stage Autonomous Detective Engine**:
  1. **Tripwire**: High-throughput event parsing for suspicious access patterns, rapid port scans, and living-off-the-land scripts.
  2. **Entity Correlation Graph**: Temporal sliding-window graph traversal across user identities, IP sockets, and host endpoints.
  3. **Attack Story Builder**: Chronological narrative reconstruction of multi-stage intrusions.
  4. **Explainable Risk Scoring**: Transparent scoring algorithm factoring event density, exfiltration volume, and unrecognized devices.
  5. **Plain-Language Dossier Synthesis**: Root-cause summaries and smoking-gun forensic evidence ready for technical teams and leadership.
- **Global Adversary Radar & Real-World Threat Ingestion**: Ingests live indicators from US CISA Known Exploited Vulnerabilities (KEV) catalog and Abuse.ch Feodo Tracker botnet C2 feeds.
- **MITRE ATT&CK® Enterprise Coverage**: Comprehensive mapping across Initial Access, Execution, Persistence, Defense Evasion, Discovery, Lateral Movement, and Exfiltration.
- **Automated SOAR Containment Playbooks**: Deterministic 5-step containment response executing perimeter firewall null-routing, session token revocation, endpoint host isolation, volatile RAM dumps, and SHA-256 tamper-proof evidence seals.

## Architecture

```
[ Ingest Stream / CISA KEV / Abuse.ch ]
                 │
                 ▼
     [ Detection Engine (Rules) ]
                 │ (Tripwire Trigger)
                 ▼
     [ Graph Correlation Engine ] ─── (±60m Window) ───▶ [ Security Events ]
                 │
                 ▼
       [ Risk & Scoring Engine ]
                 │
                 ▼
       [ Incidents Collection ] ◀─── [ Real-Time Firestore onSnapshot ] ───▶ [ SOC Command Center ]
                 │
                 ▼
      [ Automated SOAR Playbook ] (Firewall Drop, Host Isolate, Token Revoke, Memory Dump, SHA-256)
```

## Quick Start

### 1. Prerequisites
- Node.js 18+
- npm or yarn

### 2. Environment Configuration
Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="your_private_key"
```

### 3. Installation & Run
```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to access the Command Center.
