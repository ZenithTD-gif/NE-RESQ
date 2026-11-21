# NE-RESQ — Northeast Emergency Response & Safety Platform
### One Region. One Network. One Mission — Saving Lives.

[![Production Build](https://img.shields.io/badge/Build-Passing-emerald)](https://github.com)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org)
[![PostgreSQL PostGIS](https://img.shields.io/badge/PostGIS-Spatial-blue)](https://postgis.net)
[![Three.js](https://img.shields.io/badge/Three.js-Liquid%20Glass%203D-red)](https://threejs.org)

NE-RESQ is a production-oriented, multi-portal disaster intelligence and emergency response platform engineered specifically for the eight Northeast Indian states:
1. **Assam** (35 Districts, SEOC: 1070/1079)
2. **Arunachal Pradesh** (26 Districts, SEOC: 1070)
3. **Meghalaya** (12 Districts, SEOC: 1070)
4. **Manipur** (16 Districts, SEOC: 1070)
5. **Mizoram** (11 Districts, SEOC: 1070)
6. **Nagaland** (16 Districts, SEOC: 1070)
7. **Tripura** (8 Districts, SEOC: 1070)
8. **Sikkim** (6 Districts, SEOC: 1070)

---

## 1. Visual Design System — Apple iOS Liquid Glass 3D

NE-RESQ features an Apple iOS Liquid Glass 3D visual language:
- **Pearl White canvas** (`#F8F9FC`) and soft white (`#FFFFFF`)
- **Translucent frosted glass** with 24px backdrop blur and thin reflective borders
- **Emergency coral red** (`#E94B55`) and **soft maroon** (`#A82E42`) emergency accents
- **Deep charcoal typography** (`#20232A`) with high readability
- **Three.js & React Three Fiber**:
  - Interactive 3D Northeast terrain hero with procedural Brahmaputra river valley elevation and 8 floating state beacon markers
  - 3D pulsating emergency orb with dynamic raymarching on the SOS portal
  - Progressive enhancement with a responsive CSS 3D fallback (`SceneFallback`) for low-end devices or when `prefers-reduced-motion` is active

---

## 2. Strict "Zero-Mock" Engineering Policy

NE-RESQ enforces zero fabricated data:
- **No fake alerts or river levels**: If IMD or CWC feeds lack production API tokens, the platform truthfully shows:  
  `"Service not connected — configuration required."`
- **Truthful SOS Dispatch**: A rescue request is never reported as dispatched or accepted until an authorized coordinator assigns a verified team in the database.
- **Offline PWA Reliability**: When offline, SOS requests are queued locally on the device with truthful status:  
  `"Pending synchronization — not yet delivered."`

---

## 3. Product Portals & Modules

- **Public Citizen Portal** (`/`): 3D terrain hero, live verified alert ticker, KPI statistics, 8-state directory
- **Geospatial Intelligence Map** (`/map`): 2D/3D toggle, PostGIS layer toggles (Shelters, Gauges, Hazards), district filter
- **Official Alerts** (`/alerts`): IMD & SDMA advisories, severity badges, recommended safety actions, provider status
- **Hydrological Monitoring** (`/monitoring`): Brahmaputra & Barak CWC gauges (Guwahati, Dibrugarh, Silchar, Singtam)
- **Emergency SOS Dispatch** (`/sos`): Automated GPS triangulation, manual fallback, medical/trauma flags, offline sync queue
- **Live SOS Tracking** (`/sos/track/[id]`): Real-time status history timeline, assigned NDRF/SDRF commander contact
- **Designated Shelters** (`/shelters`): Verified government camps, live occupancy percentages, medical posts, potable water
- **Evacuation Guidance** (`/evacuation`): Pathway routing avoiding verified flooded roads and landslides
- **Community Reports** (`/reports`): Citizen incident submissions with deduplication and DEOC review queue
- **AI Safety Assistant** (`/assistant`): Zero-hallucination RAG assistant grounded in official NDMA/ASDMA guidelines
- **Disaster Preparedness** (`/preparedness`): Offline 72-hour survival kit and flood/landslide checklists
- **Control Room Operations** (`/portal/control-room`): Triage terminal, team assignment, status transitions
- **Rescue Tactical Terminal** (`/portal/rescue`): NDRF/SDRF field unit mission acceptance and status updates
- **Shelter Manager Terminal** (`/portal/shelter`): Live resident headcount logging and relief supplies inventory
- **District Admin Terminal** (`/portal/district`): Official district warning broadcast and community review

---

## 4. Quick Start & Local Development

### Prerequisites
- Node.js >= v18.0.0
- npm >= v9.0.0

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/ne-resq.git
cd ne-resq

# Install dependencies in the web workspace
cd apps/web
npm install

# Run automated end-to-end verification test suite
npm test

# Run local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build
```bash
npm run build
npm run start
```

---

## 5. Automated Verification Tests

The test suite validates the core operational workflows:
```bash
npm test
```
Verifies:
1. Northeast Geographic Scope (8 states, 124 districts, official SEOC 1070 helplines)
2. Database Zero-Mock Policy (unconnected external providers explicitly marked)
3. CWC Brahmaputra Basin Stations & Danger Level thresholds
4. SOS Creation, Tracking ID generation, and retrieval
5. Rescue Team Assignment and status transition audit history
6. Community Report code generation and review queue

---

## 6. Documentation Directory

Detailed specifications are maintained in the `/docs` folder:
- [`docs/ARCHITECTURE.md`](file:///Users/tridipdeka/Documents/GU%20Hackathon%20/docs/ARCHITECTURE.md) — System boundaries, data flow, trust boundaries
- [`docs/DATABASE.md`](file:///Users/tridipdeka/Documents/GU%20Hackathon%20/docs/DATABASE.md) — 36-table relational schema, PostGIS spatial queries, ERD
- [`docs/DATA_SOURCES.md`](file:///Users/tridipdeka/Documents/GU%20Hackathon%20/docs/DATA_SOURCES.md) — IMD, CWC, NDMA SACHET, and NRSC Bhuvan provider specs
- [`docs/DEPLOYMENT.md`](file:///Users/tridipdeka/Documents/GU%20Hackathon%20/docs/DEPLOYMENT.md) — Vercel & Supabase production deployment guide
- [`docs/SECURITY.md`](file:///Users/tridipdeka/Documents/GU%20Hackathon%20/docs/SECURITY.md) — RBAC, RLS policies, audit logs, privacy safeguards
- [`docs/API.md`](file:///Users/tridipdeka/Documents/GU%20Hackathon%20/docs/API.md) — REST API endpoints and payload schemas

---

## 7. License & Disclaimer

NE-RESQ is an independent emergency management technology platform. All official alerts, river levels, and meteorological warnings are attributed directly to their respective issuing authorities (IMD, CWC, NDMA, SDMAs).
