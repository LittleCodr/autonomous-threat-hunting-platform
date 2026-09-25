# MVP Scope

This document explicitly defines what is IN and OUT of the Minimum Viable Product (MVP) to prevent feature creep.

## IN SCOPE (Must Haves for Demo)

1. **Pre-Seeded Database:** 
   - A synthetic dataset mimicking realistic network and authentication telemetry.
2. **Deterministic Detection Rules:**
   - E.g., Multiple failed logins -> Successful login.
   - E.g., Login from unseen IP.
3. **Autonomous Hunt Engine:**
   - Automated correlation of IP/User/Time upon trigger.
4. **Risk Scoring:**
   - A calculated 0-100 score demonstrating risk severity.
5. **AI Analysis:**
   - A mock LLM provider (or real API key if supplied) to generate the final incident report.
6. **Neubrutalist UI:**
   - Command Center, Incident Investigation view, and Event Explorer.

## OUT OF SCOPE (Deferred for Future)

1. **Real-time Log Ingestion:**
   - No Logstash, Filebeat, or Splunk forwarder integrations.
2. **Authentication / RBAC:**
   - No login screen or role-based access for the analysts using the platform (assume single tenant admin).
3. **Automated Remediation:**
   - The platform will not actually block IPs or suspend users (read-only analysis).
4. **Complex Rule Builder:**
   - Rules are hardcoded/seeded, no drag-and-drop rule UI in MVP.
5. **Distributed Infrastructure:**
   - No microservices or event streaming platforms (Kafka).
6. **Advanced ML Pipeline:**
   - A basic Isolation Forest script is fine, but no continuous model training or neural networks.
