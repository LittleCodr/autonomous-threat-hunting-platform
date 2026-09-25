# Technical Requirements Document (TRD)

## Technical Stack Overview
The technical stack is chosen for developer velocity, strong typing, and professional UI delivery while remaining appropriately sized for an academic MVP.

### Frontend
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (using a custom Neubrutalist configuration)
- **State Management:** React Hooks & Context where necessary
- **Charts/Visualizations:** Recharts or simple SVG/canvas for lightweight rendering (only where genuinely needed).

### Backend
- **Framework:** Next.js API Routes / Server Actions
- **Language:** TypeScript
- **Architecture:** Monolith (No microservices for MVP)

### Database
- **Database:** Firebase Cloud Firestore
- **SDK:** Firebase Admin SDK & Firebase Client SDK

### Machine Learning
- **Anomaly Detection:** Python script/service using `scikit-learn` (Isolation Forest) for MVP. Can be a lightweight Flask/FastAPI service or executed via Next.js invoking a Python script.
- **Data Processing:** Python / Pandas for feature extraction and training (if done offline or during seed generation).

### AI Integration
- **LLM Abstraction:** A service layer that calls an LLM API (e.g., OpenAI or Gemini).
- **Mocking:** A mock provider is built-in for offline/demo reliability.

### Deployment
- **Containerization:** Docker-ready (Dockerfile for the Next.js app, docker-compose for PostgreSQL).

## Excluded Technologies (Non-Goals)
To avoid overengineering, the following are explicitly EXCLUDED:
- Kafka / RabbitMQ
- Kubernetes
- Microservices architectures
- Redis (unless session caching becomes strictly necessary)
- Elasticsearch / OpenSearch

## Sub-System Details

### 1. Detection Engine
- Implemented as a TypeScript module that evaluates incoming or seeded `SecurityEvent` records against predefined `DetectionRule` logic.

### 2. Autonomous Hunt Engine
- A routine triggered when a rule is matched.
- Extracts entities (IP, User, Device) from the triggering event.
- Queries the database for related events within a time window (-/+ N minutes).

### 3. Correlation Engine
- Analyzes the output of the Hunt Engine.
- Groups events by entity overlap.
- Constructs a chronological incident timeline.

### 4. Risk Scoring
- A project-defined algorithmic scoring mechanism (0-100).
- Variables: Rule severity, ML anomaly score, density of correlated events, and specific entity risk multipliers.

### 5. AI Explanation Layer
- Converts the correlated JSON payload into a structured prompt.
- Sends to the LLM (or Mock provider) asking for: summary, why_suspicious, key_evidence, likely_threat, recommended_checks.
- Outputs structured text integrated into the UI.
