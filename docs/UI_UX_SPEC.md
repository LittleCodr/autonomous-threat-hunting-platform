# UI/UX Specification

## 1. Visual Identity & Theme
The platform employs a **Neubrutalist / Cyber-Hacker** aesthetic. It must feel like a tactical security operations tool, not a generic SaaS dashboard or AI wrapper.

### Core Principles
- Hard borders (e.g., `border-2 border-slate-700`).
- Asymmetric layouts.
- Controlled offset shadows (e.g., `box-shadow: 4px 4px 0px rgba(0,255,255, 0.2)`).
- Sharp or slightly rounded geometry (`rounded-none` or `rounded-sm`).
- High contrast, dark mode only.
- Dense information hierarchy.
- No meaningless gradients, glassmorphism, or stock illustrations.

## 2. Color System
Base palette is near-black/charcoal.

- **Background:** `#07090D`
- **Surface/Panels:** `#0D1117`
- **Borders/Lines:** `#161B22` or `#1F2937`
- **Primary Accent (Electric Cyan):** `#00F0FF`
- **Secondary Accent (Acid Green):** `#39FF14`

### Severity Colors
- **NORMAL (Muted Green):** `#4ADE80`
- **INFO (Blue):** `#3B82F6`
- **LOW (Green):** `#22C55E`
- **MEDIUM (Amber):** `#F59E0B`
- **HIGH (Orange):** `#F97316`
- **CRITICAL (Red):** `#EF4444`

## 3. Typography
- **Primary Font:** Modern grotesk / technical sans-serif (e.g., Inter, Space Grotesk, or Roboto).
- **Secondary Font:** Monospace (e.g., JetBrains Mono, Fira Code) used strictly for technical data: IPs, hashes, timestamps, Event IDs, processes, and command-like content.

## 4. UI Components

### Panels & Cards
Avoid floating blobs. Use bordered panels with distinct headers.
```css
.panel {
  border: 1px solid #1f2937;
  background-color: #0d1117;
}
```

### Badges & Labels
Uppercase micro-labels for metadata.
Example: `[CRITICAL]` `[INVESTIGATING]` `[IP: 192.168.1.1]`

### Timelines
Vertical lines connecting distinct, bordered event nodes. Status pulses on active nodes.

### Microinteractions
- Subtle scanning indicators (a sweeping gradient line across a bounding box).
- Status transitions (e.g., `RUNNING` text pulsing).
- Hover effects on tables highlighting the row with a technical border.

## 5. Layout Structure
- **Global:** Left navigation rail (icon-heavy, technical tooltips). Main workspace center-right.
- **Incident View:** Header block spanning the top. Timeline on the left/center, Context/Evidence and AI Analysis on the right panel.
- **Responsiveness:** Desktop-first (1440px). Graceful degradation to 1024px.
