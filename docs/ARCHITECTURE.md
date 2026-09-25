# Architecture

## 1. High-Level Architecture
The system follows a monolith structure with Next.js serving as both the frontend client and the API backend. A PostgreSQL database stores all state, configuration, and telemetry.

```mermaid
graph TD
    Client[Next.js Frontend] -->|API Requests| API[Next.js API Routes / Server Actions]
    API --> Db[PostgreSQL Database]
    API --> Engine[Detection & Hunt Engine]
    API --> ML[ML Anomaly Detection]
    API --> AI[AI Explanation Service]
```

## 2. Frontend Architecture
Next.js App Router structure. UI components are modularized following a Neubrutalist design system.
- `/app`: Pages and layouts.
- `/components/ui`: Reusable primitives (CyberButton, StatusBadge).
- `/components/dashboard`: Command center modules.
- `/components/incidents`: Investigation views and timelines.

## 3. Backend Architecture
Business logic is encapsulated in a `/lib` directory, keeping API routes thin.
- `/lib/detection`: Rule evaluation.
- `/lib/hunting`: Related event retrieval.
- `/lib/correlation`: Timeline and incident building.
- `/lib/risk`: Scoring algorithms.
- `/lib/ai`: LLM provider abstraction.

## 4. Incident Lifecycle Flow

```mermaid
sequenceDiagram
    participant Source as Telemetry/DB
    participant Detect as Detection Engine
    participant Hunt as Hunt Engine
    participant Correlate as Correlation Engine
    participant Risk as Risk Engine
    participant AI as AI Layer
    participant UI as Dashboard

    Source->>Detect: New Security Event
    Detect->>Detect: Evaluate Rules
    alt Is Suspicious?
        Detect->>Hunt: Trigger Investigation (EventID)
        Hunt->>Source: Query Related Events (IP, User, Time)
        Source-->>Hunt: Return Event Batch
        Hunt->>Correlate: Pass Event Batch
        Correlate->>Correlate: Build Timeline & Connect Entities
        Correlate->>Risk: Pass Incident Context
        Risk->>Risk: Calculate Risk Score (0-100)
        Risk->>AI: Pass Structured Evidence
        AI->>AI: Generate Explanation & Recommendations
        AI->>UI: Save to DB & Alert UI
    end
```

## 5. Security Boundaries
- The AI layer is strictly downstream of the data; it does not query the database directly. It only receives sanitized, structured JSON.
- API endpoints are protected against injection through Prisma parameterized queries.
- Environment variables securely hold LLM API keys and DB credentials.
