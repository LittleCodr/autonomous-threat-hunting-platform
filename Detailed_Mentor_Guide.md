# Autonomous Cyber Threat Hunting Platform - Mentor Discussion Guide

This guide is designed to help you completely understand the inner workings of the platform we built, so you can confidently explain the technical decisions, architecture, and workflow to your mentor.

---

## 1. The Big Picture: What Did We Build?

**The Pitch:** 
We built an **Autonomous Cyber Threat Hunting Platform**. 
Most traditional security tools (like a basic SIEM - Security Information and Event Management) just collect logs and show them on a dashboard, leaving the security analyst to manually sift through thousands of events to figure out what happened. 

**Our Innovation:**
Our platform automates the *first 30 minutes* of a security analyst's job. When a suspicious event happens, the system doesn't just raise an alert; it autonomously spiders through the database, gathers all related context, correlates it into an "Incident," scores the risk, and uses AI to explain it in plain English. 

---

## 2. The Architecture & Stack (How It's Built)

If your mentor asks about your tech stack, here is exactly what we used and **why**:

1. **Frontend: Next.js (App Router)**
   * **Why?** Next.js allows us to use **React Server Components**. This means instead of sending a ton of Javascript to the browser to fetch data, we fetch the data directly on the server securely, and just send the finished HTML to the browser. It's incredibly fast and secure.
2. **Styling: Tailwind CSS**
   * **Why?** Rapid UI development without leaving the HTML files. We used it to build a custom **Neubrutalist** design system (hard borders, high contrast, monospace fonts) to make the app feel like a serious, raw forensic tool rather than a generic startup dashboard.
3. **Database: Firebase Firestore (NoSQL)**
   * **Why?** Security telemetry (logs) comes in massive, unstructured volumes. A relational database (like PostgreSQL) requires rigid schemas which break when logs have different shapes. Firestore is a NoSQL document database, meaning it can ingest thousands of wildly different security events instantly and query them in milliseconds.
4. **Backend Logic: Next.js Route Handlers + Firebase Admin SDK**
   * **Why?** By using Firebase Admin inside Next.js API routes (`/api/ingest`), our backend runs with secure, elevated privileges. It bypasses client-side security rules, allowing our autonomous engines to process data securely out of the user's sight.

---

## 3. The 5 Autonomous Engines (The Core Logic)

This is the most important part to explain. The platform is powered by a pipeline of 5 engines. When a log is sent to our `/api/ingest` endpoint, it goes through this sequence:

### Engine 1: The Detection Engine
* **What it does:** It's the tripwire. It looks at the incoming stream of events and checks them against hardcoded Sigma-style rules.
* **Example:** We built a `BRUTE_FORCE_SUCCESS` rule. It looks at the last 5 minutes of logs. If it sees multiple `LOGIN_FAILED` events followed immediately by a `LOGIN_SUCCESS` from the same IP, it trips the alarm.

### Engine 2: The Autonomous Hunt Engine
* **What it does:** Context gathering. If the Detection engine trips an alarm on an IP address (e.g., `185.88.92.1`), the Hunt engine automatically asks Firestore: *"Give me EVERY log involving this IP address or this User from 15 minutes before the alarm to 15 minutes after."*
* **Why it's cool:** It saves the analyst from having to manually type database queries to figure out what the hacker did before and after the alert.

### Engine 3: The Correlation Engine
* **What it does:** It takes the messy pile of related logs found by the Hunt Engine and stitches them together into a unified **Incident**. 
* **Mechanism:** It looks at the metadata to classify the attack (e.g., if it sees network logs and process logs, it classifies the incident vector).

### Engine 4: The Risk Engine
* **What it does:** Calculates a deterministic severity score from 0 to 100.
* **Mechanism:** It starts with a base score, then adds modifiers. For example, if it sees a `DATA_TRANSFER` event over 1MB, it spikes the risk score by 15 points because data exfiltration is highly critical.

### Engine 5: The AI Synthesis Engine
* **What it does:** It looks at the entire correlated incident and generates a human-readable forensic report.
* **Mechanism:** It extracts the unique IPs, Users, and Devices, and formulates a summary of *why* the sequence of events is suspicious, along with recommended mitigation steps (like isolating the host).

---

## 4. How to Guide the Demo

When you show this to your mentor, walk them through it in this exact order:

1. **Start at the Event Explorer (`/events`)**: 
   * Say: *"This is the raw telemetry feed. Normally, analysts stare at this all day."*
2. **Show the Command Center (`/`)**: 
   * Say: *"Instead, our platform intercepts the logs and generates this prioritized dashboard."*
3. **Click into a specific Incident (`/incidents/123`)**: 
   * Say: *"Here is where the magic happens. The Hunt Engine automatically built this timeline of the attack, the Risk engine scored it, and the AI Engine synthesized a report of what happened and how to fix it."*
4. **Show the System & Rules Page (`/rules`)**: 
   * Say: *"This proves it's autonomous. You can see the audit log of every time the backend engines triggered and how many entities they examined in milliseconds."*

---

## 5. Summary of Technical Wins to Mention
If your mentor asks what was technically difficult, mention these:
* **Circumventing Firebase Index Limits:** We had to query events by `IP` and sort them by `timestamp`. Firebase normally requires you to build composite indexes in the cloud for this, which takes time. We solved this by fetching the records by IP and executing the chronological sorting **in-memory** in Javascript.
* **Real-time Pipeline:** We built the entire 5-engine pipeline to execute synchronously on a single API route so the moment a threat is detected, the full incident is instantly available in the database.
