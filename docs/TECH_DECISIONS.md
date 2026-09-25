# Technical Decisions

This document justifies the choices made for the MVP architecture.

## 1. Why Next.js (App Router)?
- **Velocity:** Full-stack framework allows building the API and frontend simultaneously.
- **Server Components:** Reduces client-side bundle size, crucial for a data-dense UI like a SOC dashboard.
- **Server Actions:** Streamlines mutations (like triggering a manual hunt) without writing boilerplate API routes.

## 2. Why PostgreSQL + Prisma?
- **Relational Data:** Security events, rules, and incidents map cleanly to a relational structure.
- **Prisma:** Provides absolute type safety from database to UI. When an `Incident` is fetched, TypeScript guarantees the payload structure, preventing runtime errors in the dashboard.

## 3. Why Monolith over Microservices?
- **Scope:** This is an academic MVP, not a production enterprise system.
- **Overhead:** Managing Kafka, Kubernetes, and separate services would detract time from the core feature (the autonomous hunt flow and UI).

## 4. Why Neubrutalism UI?
- **Differentiation:** Standard SaaS templates look like generic CRUDS or "AI wrappers".
- **Functionality:** High contrast, sharp borders, and monospaced typography naturally suit technical, high-density data visualization required by cybersecurity analysts.

## 5. Mock AI vs. Real LLM
- **Reliability:** Demos often fail due to network issues or API rate limits. The architecture supports an abstract `AILayer`. By default, it can use a static mock generator for the demo, but can easily be swapped to an OpenAI/Gemini API call via environment variables.

## 6. Python Integration (Anomaly Detection)
- Instead of building a heavy ML pipeline, the anomaly detection (Isolation Forest) can be implemented as a lightweight Python script that the Next.js backend spawns as a child process during data seeding or ingestion. This satisfies the ML requirement simply.
