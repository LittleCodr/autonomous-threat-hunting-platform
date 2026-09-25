# API Specification

These APIs represent the Next.js API Routes (`/app/api/...`) that will power the frontend. Since we are using Next.js App Router, some of these might be implemented as Server Actions where appropriate, but this spec defines the logical boundaries.

## 1. Events API

### `GET /api/events`
- **Description:** Retrieve raw security events with optional filtering.
- **Query Params:** `timeRange`, `severity`, `user`, `ip`, `limit`
- **Response:** Array of `SecurityEvent` objects.

### `GET /api/events/:id`
- **Description:** Get detailed JSON payload for a single event.

### `POST /api/events/ingest`
- **Description:** Ingest new telemetry (used by the seed script or external mock agent).
- **Body:** `SecurityEvent` payload.

## 2. Incidents API

### `GET /api/incidents`
- **Description:** List all active incidents.
- **Query Params:** `status`, `severity`

### `GET /api/incidents/:id`
- **Description:** Get full incident context including the correlated timeline and AI analysis.
- **Response:** `Incident` object with `events`, `analysis`, and `investigations`.

### `POST /api/incidents/:id/investigate`
- **Description:** Manually trigger the autonomous hunt engine for a given incident/event.

## 3. Threat Hunting API

### `POST /api/hunt`
- **Description:** Execute a manual hunt query across the database.
- **Body:** `{ "entityType": "IP", "entityValue": "192.168.1.1", "timeWindow": "24h" }`
- **Response:** Array of correlated events and entity matches.

## 4. Dashboard Stats

### `GET /api/dashboard/stats`
- **Description:** Aggregate metrics for the Command Center.
- **Response:** `{ activeThreats, eventsProcessed, topIPs, riskDistribution }`

## 5. Internal Engines (Abstracted behind API or called directly via Service)

### `POST /api/detection/run`
- **Description:** Manually run the rules engine against the latest events (useful for demo triggers).

### `POST /api/ai/analyze`
- **Description:** Trigger the LLM generation for a given structured incident payload.
