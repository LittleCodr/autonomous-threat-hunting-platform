# Demo Scenarios

To ensure the platform is immediately demonstrable to the university professor, the database will be seeded with synthetic telemetry that naturally triggers the platform's detection and hunt engines.

## Scenario A: Account Compromise (Primary Demo)
**Goal:** Show the full Detect -> Hunt -> Correlate -> Assess -> Explain flow.
1. **Events:**
   - 08:41:02 - Failed login (User: `alex.morgan`, IP: `185.XX.XX.XX`)
   - 08:41:11 - Failed login (User: `alex.morgan`, IP: `185.XX.XX.XX`)
   - 08:41:23 - Successful login (User: `alex.morgan`, IP: `185.XX.XX.XX`)
   - 08:41:31 - New device detected (User: `alex.morgan`, Device: `Unknown_Mac`)
   - 08:42:04 - Sensitive resource accessed (Database Backup)
   - 08:42:21 - Suspicious network connection (Outbound large transfer)
2. **Expected Platform Behavior:**
   - Rule `BRUTE_FORCE_SUCCESS` triggers at 08:41:23.
   - Hunt Engine automatically pulls the next 5 minutes of logs for `alex.morgan` and `185.XX.XX.XX`.
   - Incident is built. Risk Score hits ~87/100 (Critical).
   - AI generates a report identifying an account takeover and data exfiltration attempt.

## Scenario B: Reconnaissance / Port Scanning
**Goal:** Demonstrate low-level network anomaly detection.
1. **Events:**
   - Rapid sequence of connection attempts to a single internal server (`10.0.0.50`) on sequential ports.
2. **Expected Platform Behavior:**
   - Rule `PORT_SCAN` triggers.
   - Incident created. Risk Score ~65/100 (Medium).
   - AI identifies reconnaissance behavior.

## Scenario C: Insider Threat / Suspicious Process
**Goal:** Demonstrate endpoint telemetry correlation.
1. **Events:**
   - Standard user `j.smith` executes PowerShell script bypassing execution policy.
   - Immediately followed by an outbound connection to an unknown IP.
2. **Expected Platform Behavior:**
   - Rule `SUSPICIOUS_PROCESS_NETWORK_ACTIVITY` triggers.
   - Timeline links process execution to network traffic.
   - AI identifies potential beaconing or insider data gathering.

## Background Noise (Benign Telemetry)
The database will contain 95% benign activity (normal logins, standard web traffic) to demonstrate the platform's ability to isolate anomalies from the noise.
