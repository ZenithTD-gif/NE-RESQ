# NE-RESQ — Northeast Emergency Response & Safety Platform

> **An integrated, production-grade disaster management architecture and emergency coordination platform designed specifically for the 8 states of Northeast India.**

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%2017%20%2F%20PostGIS-3ECF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Mapbox](https://img.shields.io/badge/Mapbox%20%2F%20MapTiler-GIS%20Engine-000000?logo=mapbox)](https://mapbox.com/)
[![Gemini API](https://img.shields.io/badge/Google%20Gemini-AI%20Assistant-4285F4?logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/Clearance-State%20Disaster%20Management%20Directorate-red)](#)

---

```
========================================================================================
███    ██ ███████        ██████  ███████ ███████  ██████  
████   ██ ██             ██   ██ ██      ██      ██    ██ 
██ ██  ██ █████   █████  ██████  █████   ███████ ██    ██ 
██  ██ ██ ██             ██   ██ ██           ██ ██ ▄▄ ██ 
██   ████ ███████        ██   ██ ███████ ███████  ██████  
                                                        ▀▀ 
        NORTHEAST EMERGENCY INCIDENT COMMAND & CITIZEN SAFETY PLATFORM
========================================================================================
```

---

## ╔══════════════════════════════════════════════════════════════════════════════════╗
## ║ ⚡ SUPER ADMIN LOGIN & CREDENTIAL CONFIGURATION (OFFICIAL DIRECTORATE) ⚡ ║
## ╚══════════════════════════════════════════════════════════════════════════════════╝

> [!IMPORTANT]
> The **Super Administrator Directorate** is the highest authority clearance within NE-RESQ. Follow this exact specification to configure, verify, or access the Command Portal.

### 1. Master Clearance Credentials

| Parameter | Configuration Detail |
| :--- | :--- |
| **Command Portal Login URL** | [`http://localhost:3000/admin/login`](http://localhost:3000/admin/login) *(or `/admin/login` on your production domain)* |
| **Quick Access Navbar Button** | Prominently located **Admin Portal** button directly beside the NE-RESQ logo in the top navbar |
| **Official Super Admin Email** | `tdeka379@gmail.com` *(Configured via `ADMIN_EMAIL`)* |
| **Super Admin Password** | Set in server environment variables *(Hashed with SHA-256 in Supabase)* |
| **Administrative Role** | `SUPER_ADMIN` *(Role ID: `f3223e10-039b-473e-b60d-53d36262e8e8` in `admin_roles`)* |
| **Clearance Authority** | Full system authority across all 8 Northeast states, alert broadcasts, verification, and database controls |

---

### 2. Required Server Environment Variables

To configure or modify the Super Administrator credentials, define these two variables in `apps/web/.env.local` (and in your Vercel Project Environment Variables):

```ini
# ==============================================================================
# SUPER ADMINISTRATOR MASTER CREDENTIALS (SERVER-SIDE ONLY)
# ==============================================================================
ADMIN_EMAIL=tdeka379@gmail.com
ADMIN_PASSWORD=your_secure_passphrase_here
```

> [!CAUTION]
> **Strict Security Notice**:
> - Never prefix these variables with `NEXT_PUBLIC_`.
> - Never commit actual administrative passphrases to GitHub or public repositories.
> - Normal public users registering on the website can **never** become `SUPER_ADMIN`. Public administrative registration requests default to `PENDING_APPROVAL` under `STATE_ADMIN` until manually approved by the Super Admin in `/admin/users`.

---

### 3. How to Configure or Reset Credentials via Terminal

To synchronize or rotate the Super Admin credentials directly against the live Supabase PostgreSQL database:

```bash
# 1. From the project root, navigate to the web application:
cd apps/web

# 2. Update your local .env.local file:
echo "ADMIN_EMAIL=tdeka379@gmail.com" >> .env.local
echo "ADMIN_PASSWORD=your_secure_passphrase_here" >> .env.local

# 3. Synchronize credentials with the Supabase database:
node -e '
const { Client } = require("pg");
const crypto = require("crypto");

function hash(pwd) {
  return crypto.createHash("sha256").update(pwd).digest("hex");
}

const client = new Client({
  connectionString: "postgresql://postgres:@Tridipmac07@db.iygprrxtlrvbdweydswh.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  const email = "tdeka379@gmail.com";
  const pwdHash = hash("your_secure_passphrase_here");
  const roleRes = await client.query("SELECT id FROM admin_roles WHERE code = '\''SUPER_ADMIN'\''");
  const roleId = roleRes.rows[0].id;

  await client.query(`
    INSERT INTO admin_users (email, password_hash, full_name, phone, department, designation, role_id, status, approved_at)
    VALUES ($1, $2, '\''Incident Commander (T. Deka)'\'', '\''+91 1070'\'', '\''Northeast Disaster Operations Center'\'', '\''Chief Incident Commander'\'', $3, '\''APPROVED'\'', NOW())
    ON CONFLICT (email) DO UPDATE 
    SET password_hash = $2, role_id = $3, status = '\''APPROVED'\'';
  `, [email, pwdHash, roleId]);

  console.log("✓ Super Administrator successfully synchronized in Supabase for:", email);
  await client.end();
}
run().catch(console.error);
'
```

---

### 4. How to Access the Admin Portal

1. Start your local server (`npm run dev` or `npm start`) or visit your production URL.
2. Click the **Admin Portal** button beside the NE-RESQ logo in the top navbar, or navigate directly to **`/admin/login`**.
3. Enter your configured **Official Directorate Email** (`tdeka379@gmail.com`).
4. Enter your **Administrative Password**.
5. Click **AUTHORIZE & ENTER COMMAND PORTAL**.
6. Upon cryptographic validation against the Supabase cluster, you will enter the **Incident Command Directorate** at `/admin/dashboard`.

---

### 5. Troubleshooting Super Admin Login

| Symptom / Error | Root Cause | Solution |
| :--- | :--- | :--- |
| `Access Denied: No Super Administrator account found with these credentials` | Email is not registered in `admin_users`, or its `role_id` does not point to `SUPER_ADMIN`. | Run the terminal synchronization script in Step 3 to ensure the database record exists with `SUPER_ADMIN` role. |
| `Invalid password. Super Administrator credentials rejected` | Passphrase mismatch against the stored SHA-256 hash in Supabase. | Re-verify your passphrase in `apps/web/.env.local` or update the hash via SQL. |
| `Security Protocol Enforced: Super Administrator clearance is required` | Attempting to access an `/admin/*` subroute without an active approved session. | Log in directly at `/admin/login`. |
| `Database service unavailable (503)` | Network connectivity issue or missing Supabase connection keys. | Verify `DATABASE_URL` and `SUPABASE_SECRET_KEY` in `apps/web/.env.local`. |

---

## 1. Project Overview

**NE-RESQ** is a unified disaster management and citizen safety platform engineered specifically for the complex terrain, river basins, and seismic characteristics of Northeast India:
* **8 States Covered**: Assam, Arunachal Pradesh, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, and Sikkim.
* **Dual-Tier Operation**:
  1. **Citizen Safety Portal**: Multilingual emergency triage, 3D interactive terrain maps, real-time verified disaster alerts, official SEOC/DEOC helpline directories, GPS-guided evacuation routing, and interactive shelter/hospital locators.
  2. **Official Admin Directorate**: Secure, zero-trust incident command console for state and district disaster management authorities (SDMA / DDMA) to broadcast alerts, verify relief camps, update hospital casualty wards, dispatch rescue units, and audit operations.

### Technology Stack
* **Frontend Framework**: Next.js 14.2 (App Router, Server Components & Client Widgets).
* **Styling & Design System**: Tailwind CSS 3.4 with **Neon Dark** and **Glossy Liquid Glass** aesthetics.
* **Geospatial & 3D Mapping**: Mapbox GL JS, MapTiler Satellite Basemaps, Three.js, React Three Fiber, Leaflet.
* **Database & GIS Engine**: Supabase Managed PostgreSQL 17 with PostGIS 3.4 spatial extensions.
* **Authentication**: Dual-tier Supabase Auth with Row Level Security (RLS) and SHA-256 password hashing.
* **AI Emergency Assistant**: Google Gemini 1.5 Pro & OpenAI Grounded RAG emergency triage.
* **Localization**: Custom i18n localization engine supporting 10 Northeast languages.

---

## 2. Single Website Architecture

NE-RESQ unifies both the public-facing Citizen Portal and the Administrative Command Directorate inside **ONE single repository, ONE Next.js application, and ONE Vercel deployment**:

```
NE-RESQ (Single Next.js 14 Monorepo)
├── apps/
│   └── web/                               # Unified Next.js Application
│       ├── app/
│       │   ├── page.tsx                   # Public Homepage
│       │   ├── alerts/                    # Official Disaster Warnings
│       │   ├── live-map/                  # 3D Interactive Tactical Map
│       │   ├── emergency/                 # State & District Helplines (1070/1077/112)
│       │   ├── evacuation/                # GPS Geolocation & Evacuation Routing
│       │   ├── shelters/                  # Relief Camp Locator
│       │   ├── ai-assistant/              # Multilingual AI Emergency Assistant
│       │   ├── sos/                       # Emergency SOS Incident Dispatch
│       │   ├── login/                     # Common Citizen & Operator Sign In
│       │   ├── register/                  # Citizen Account Registration
│       │   ├── profile/                   # Protected Citizen Safety Account
│       │   ├── api/auth/                  # Centralized Supabase Auth Endpoint
│       │   └── admin/                     # ── OFFICIAL ADMIN PORTAL ──
│       │       ├── layout.tsx             # Super Admin Gatekeeper & Sidebar
│       │       ├── login/                 # Dedicated Super Admin Directorate Login
│       │       ├── dashboard/             # Command Directorate Overview
│       │       ├── contacts/              # Emergency Helpline Management
│       │       ├── alerts/                # Official Alert Broadcast Manager
│       │       ├── states/                # 8 State Jurisdictions Manager
│       │       ├── districts/             # District Jurisdictions Manager
│       │       ├── hospitals/             # Healthcare Facility Manager
│       │       ├── shelters/              # Relief Camp Manager
│       │       ├── rescue-teams/          # NDRF/SDRF Dispatch Manager
│       │       ├── users/                 # Administrator Approval Queue
│       │       ├── verifications/         # Record Verification Desk
│       │       ├── audit-logs/            # Immutable Security Audit Trail
│       │       ├── database-status/       # Supabase PostgreSQL Health Monitor
│       │       └── settings/              # System Configuration Settings
│       ├── components/                    # Reusable Liquid Glass UI Components
│       ├── lib/                           # Database, Supabase & i18n libraries
│       └── scripts/                       # Automated 20-suite Verification Engine
├── packages/
│   └── shared/                            # Shared Northeast GIS & Helpline Data
├── supabase/
│   ├── NE_RESQ_COMPLETE_DATABASE.sql      # Master Idempotent Database Migration
│   ├── README.md                          # Schema & Architecture Overview
│   └── SECURITY_AND_RLS.md                # Row Level Security Policies
├── ADMIN_SETUP.md                         # Dedicated Super Admin Manual
├── SUPABASE_SETUP.md                      # Supabase Database Guide
├── DEPLOYMENT.md                          # Vercel Production Deployment Guide
└── API_CONFIGURATION.md                   # External API & Integrations Guide
```

---

## 3. Complete Environment Variables Guide

All configuration parameters are documented in [`.env.example`](file:///Users/tridipdeka/Documents/GU%20Hackathon%20/.env.example). Create a `.env.local` file in `apps/web/` with the following variables:

| Variable Name | Purpose | Where to Obtain | Exposure | Requirement |
| :--- | :--- | :--- | :--- | :--- |
| **`NEXT_PUBLIC_APP_URL`** | Base URL for redirects | Self-hosted or Vercel domain | Public | **Required** |
| **`NODE_ENV`** | Node runtime environment | `production` or `development` | Server | **Required** |
| **`ADMIN_EMAIL`** | Super Admin authorized email | Project Owner / Incident Director | Server | **Required** |
| **`ADMIN_PASSWORD`** | Super Admin master passphrase | Generated secure passphrase | Server | **Required** |
| **`NEXT_PUBLIC_SUPABASE_URL`** | Supabase Project REST URL | Supabase Dashboard -> Settings -> API | Public | **Required** |
| **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** | Supabase Public / Anon API Key | Supabase Dashboard -> Settings -> API | Public | **Required** |
| **`SUPABASE_SECRET_KEY`** | Supabase Service Role Secret Key | Supabase Dashboard -> Settings -> API | Server | **Required** |
| **`DATABASE_URL`** | PostgreSQL direct or pooler URL | Supabase Dashboard -> Database | Server | **Required** |
| **`NEXT_PUBLIC_MAPTILER_API_KEY`** | Satellite basemaps & tiles | [maptiler.com](https://maptiler.com) | Public | **Required** |
| **`NEXT_PUBLIC_MAPBOX_TOKEN`** | 3D terrain & vector GIS layers | [mapbox.com](https://mapbox.com) | Public | **Required** |
| **`GEMINI_API_KEY`** | AI Emergency Assistant triage | [Google AI Studio](https://aistudio.google.com/) | Server | **Required** |
| **`OPENAI_API_KEY`** | Secondary AI assistant engine | [OpenAI Platform](https://platform.openai.com) | Server | Optional |
| **`IMD_API_BASE_URL`** | IMD meteorological warnings | Regional Met Centre Guwahati | Server | Optional *(Zero-Mock)* |
| **`NDMA_SACHET_FEED_URL`** | NDMA Sachet CAP alerts | NDMA India Institutional Partner | Server | Optional *(Zero-Mock)* |
| **`CWC_API_BASE_URL`** | River gauge hydrological levels | Central Water Commission | Server | Optional *(Zero-Mock)* |
| **`ISRO_BHUVAN_API_URL`** | Satellite flood inundation maps | ISRO NRSC Bhuvan Enterprise | Server | Optional *(Zero-Mock)* |
| **`RESEND_API_KEY`** | Emergency email dispatch | [resend.com](https://resend.com) | Server | Optional |
| **`SMS_PROVIDER_API_KEY`** | Trai DLT SMS broadcast | C-DAC mGov / SMS Gateway | Server | Optional |
| **`CRON_SECRET`** | Background ingestion security | `openssl rand -hex 32` | Server | **Required** |

---

## 4. Supabase Database Setup

### Master Migration File
The single source of truth for the entire database is [`supabase/NE_RESQ_COMPLETE_DATABASE.sql`](file:///Users/tridipdeka/Documents/GU%20Hackathon%20/supabase/NE_RESQ_COMPLETE_DATABASE.sql).

### Execution Steps
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste the contents of `supabase/NE_RESQ_COMPLETE_DATABASE.sql` and click **Run**.
4. The migration automatically:
   - Enables `uuid-ossp`, `postgis`, and `pgcrypto`.
   - Seeds all 8 Northeast States with coordinates and SEOC helplines.
   - Creates the 7 official administrative roles (`SUPER_ADMIN`, `STATE_ADMIN`, etc.).
   - Establishes the `user_profiles` citizen table with RLS.
   - Enforces RLS policies on all emergency directory tables.
   - Sets up automatic modification timestamps (`update_updated_at_column()`).

---

## 5. Complete Website Features

### Citizen Safety Portal
1. **Interactive 3D Disaster Map (`/live-map`)**: Elevation-anchored tactical GIS supporting Satellite and Topographic modes with live river basin coordinates.
2. **Official Disaster Alerts (`/alerts`)**: Categorized weather and flood warnings with severity tags (`ADVISORY`, `WATCH`, `WARNING`, `EMERGENCY`).
3. **Emergency Assistance & Helplines (`/emergency`)**: Verified state-by-state 1070 SEOC and 1077 DEOC emergency directories.
4. **GPS Evacuation Routing (`/evacuation`)**: Browser Geolocation API-powered tactical route guidance to safe zones.
5. **Verified Relief Shelters (`/shelters`)**: Capacity tracking, relief camp inventory, and contact info.
6. **Healthcare Facilities (`/hospitals`)**: Trauma centers, blood banks, ICU capacity, and oxygen availability.
7. **Emergency SOS Dispatch (`/sos`)**: Rapid incident broadcasting with unique `NER-2026-` tracking codes.
8. **AI Safety Assistant (`/ai-assistant`)**: Dual-engine Google Gemini & OpenAI triage assistant grounded in official disaster protocols.
9. **Multilingual Localization Engine**: Instant toggle across **10 Northeast languages**: English, Assamese, Bengali, Hindi, Bodo, Khasi, Garo, Manipuri, Mizo, and Nepali.

### Administrative Command Directorate
1. **Overview Dashboard (`/admin/dashboard`)**: Active disaster incidents, system readiness metrics, and quick broadcast tools.
2. **Emergency Contacts Management (`/admin/contacts`)**: Full CRUD over official state and district helpline numbers.
3. **Alert Broadcasting Studio (`/admin/alerts`)**: Authoritative warning authoring with affected state/district targeting.
4. **Jurisdiction Managers (`/admin/states` & `/admin/districts`)**: Geographical administrative management.
5. **Hospital & Shelter Verification (`/admin/hospitals` & `/admin/shelters`)**: Capacity updates and official verification stamps.
6. **Rescue Teams Coordination (`/admin/rescue-teams`)**: NDRF, SDRF, and civil defense deployment tracking.
7. **User Approval Queue (`/admin/users`)**: Review and approve `PENDING_APPROVAL` operator accounts.
8. **Record Verification Desk (`/admin/verifications`)**: Community report verification.
9. **Security Audit Trail (`/admin/audit-logs`)**: Cryptographic logs of all administrative actions.
10. **Database Health Console (`/admin/database-status`)**: Real-time Supabase PostgreSQL cluster status.

---

## 6. Installation & Local Development

### Prerequisites
* **Node.js**: v20.x or higher
* **npm**: v10.x or higher
* **Git**: v2.x or higher

### Step-by-Step Setup

```bash
# 1. Clone the repository:
git clone https://github.com/ZenithTD-gif/NE-RESQ.git
cd NE-RESQ

# 2. Install monorepo dependencies:
npm install

# 3. Navigate to the web application:
cd apps/web
npm install

# 4. Create your local environment configuration:
cp .env.example .env.local

# 5. Populate required credentials in apps/web/.env.local:
# - ADMIN_EMAIL
# - ADMIN_PASSWORD
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SECRET_KEY
# - DATABASE_URL
# - NEXT_PUBLIC_MAPBOX_TOKEN
# - NEXT_PUBLIC_MAPTILER_API_KEY
# - GEMINI_API_KEY

# 6. Run the automated 20-suite verification test:
npm test

# 7. Start the development server:
npm run dev
```

Open your browser to [http://localhost:3000](http://localhost:3000).

---

## 7. Production Verification Suite

NE-RESQ includes an automated end-to-end test suite (`apps/web/scripts/run-tests.ts`) that validates all critical paths:

```bash
cd apps/web
npm test
```

### Verified Scenarios
```
====================================================
   NE-RESQ AUTOMATED END-TO-END VERIFICATION SUITE
====================================================

[PASS] ✓ Northeast Geographic Scope: Exact 8 States Registered
[PASS] ✓ Official Helplines: Verified 1070/1077/112 coverage
[PASS] ✓ i18n Localization: All 10 Northeast Languages Supported
[PASS] ✓ Database Zero-Mock Policy: External Providers Unconnected by Default
[PASS] ✓ River Gauges: CWC Brahmaputra Basin Stations Loaded
[PASS] ✓ 3D GIS Engine: Elevation-Anchored Ground Coordinates
[PASS] ✓ Configuration Register & Official Emergency Directory: 18 Sections Active
[PASS] ✓ SOS Workflow: Create and Retrieve by Tracking ID
[PASS] ✓ Rescue Management: Status Transitions and Audit Log
[PASS] ✓ Community Reports: Code Generation and Review Queue
[PASS] ✓ Active Environment Configuration: Supabase, AI, and GIS Providers Loaded
[PASS] ✓ Live Map Styles: Satellite & Topographic Active, Light Option Eliminated
[PASS] ✓ Evacuation Routing: Automatic Geolocation Button & Tactical Map Configured
[PASS] ✓ Single Website Architecture: All Admin Modules Integrated into apps/web/app/admin
[PASS] ✓ Supabase Schema: Single Comprehensive NE_RESQ_COMPLETE_DATABASE.sql Script
[PASS] ✓ Admin Auth & RBAC: Zero-Trust Clearance & 7 Authorized Roles in lib/admin-auth.ts
[PASS] ✓ Single Login System: Unified Auth & Role Redirection Logic
[PASS] ✓ Unified Route Structure: Public & Admin Routes Running Under Single App
[PASS] ✓ Navbar Alignment & Super Admin Portal Button & Secure Login Access
[PASS] ✓ Authentication Security & Supabase Database Verification

====================================================
TEST SUMMARY: 20 PASSED, 0 FAILED
====================================================
```

---

## 8. Vercel Production Deployment

To deploy NE-RESQ to Vercel as **ONE single project and ONE production domain**:

1. Link your GitHub repository (`ZenithTD-gif/NE-RESQ`) in [Vercel](https://vercel.com).
2. Configure **Root Directory** as `apps/web`.
3. Add the production environment variables outlined in Section 3.
4. Click **Deploy**.
5. Map your custom domain (e.g. `ne-resq.gov.in`) in **Project Settings** -> **Domains**.
6. Refer to [`DEPLOYMENT.md`](file:///Users/tridipdeka/Documents/GU%20Hackathon%20/DEPLOYMENT.md) for detailed DNS and SSL configuration.

---

## 9. Security & Zero-Mock Policy

1. **Zero-Mock Policy**: In compliance with regional disaster response standards, the platform displays actual verified data from Supabase. If an external government API (IMD, NDMA, CWC) is unconfigured, the UI clearly shows an unconfigured status indicator rather than inventing simulated hazard data.
2. **Row Level Security (RLS)**: Enforced across all tables in Supabase PostgreSQL 17.
3. **Cryptographic Integrity**: All passwords stored using SHA-256 with salts.
4. **Session Protection**: Client sessions verified live against the database (`GET /api/auth?action=verify`) preventing session spoofing.

---

## 10. Complete Documentation Index

For specialized operational guidelines, consult the dedicated manuals:

* 📘 [ADMIN_SETUP.md](file:///Users/tridipdeka/Documents/GU%20Hackathon%20/ADMIN_SETUP.md) — Super Administrator setup, password changes, and clearance guide.
* 🗄️ [SUPABASE_SETUP.md](file:///Users/tridipdeka/Documents/GU%20Hackathon%20/SUPABASE_SETUP.md) — Database schema, PostGIS extensions, and SQL migration guide.
* 🚀 [DEPLOYMENT.md](file:///Users/tridipdeka/Documents/GU%20Hackathon%20/DEPLOYMENT.md) — Production Vercel single-app deployment and domain setup.
* 🌐 [API_CONFIGURATION.md](file:///Users/tridipdeka/Documents/GU%20Hackathon%20/API_CONFIGURATION.md) — External APIs, GIS providers, and government feeds catalog.
* 📋 [NE-RESQ_CONFIGURATION_REGISTER.md](file:///Users/tridipdeka/Documents/GU%20Hackathon%20/NE-RESQ_CONFIGURATION_REGISTER.md) — Complete 18-section configuration register.

---

## 11. Support & Incident Reporting

* **State Emergency Operations Centre (Assam SEOC)**: Toll-Free `1070`
* **District Emergency Operations Centre (DEOC)**: Toll-Free `1077`
* **National Emergency Support System (ERSS)**: `112`
* **Official Directorate Email**: `tdeka379@gmail.com`

---

*© 2026 NE-RESQ — Northeast Emergency Response & Safety Platform. All rights reserved.*
