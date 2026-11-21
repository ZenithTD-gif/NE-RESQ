# NE-RESQ — Complete API Integration & Institutional Feeds Guide

This document catalogs all third-party APIs, GIS spatial engines, AI reasoning providers, and government institutional feeds integrated into the **NE-RESQ** disaster management platform.

---

## 1. API Integration Status Matrix

| Service Provider | Functional Purpose | Environment Variable(s) | Production Status | Fallback Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **Supabase PostgreSQL** | Primary datastore, PostGIS spatial queries, RLS security | `NEXT_PUBLIC_SUPABASE_URL`<br>`SUPABASE_SECRET_KEY`<br>`DATABASE_URL` | **CONNECTED & VERIFIED** | None (Core Service) |
| **Mapbox GL** | 3D Interactive Vector GIS & Evacuation Routing | `NEXT_PUBLIC_MAPBOX_TOKEN` | **CONNECTED & VERIFIED** | OpenStreetMap / Leaflet raster fallback |
| **MapTiler** | High-resolution satellite basemaps & elevation relief | `NEXT_PUBLIC_MAPTILER_API_KEY` | **CONNECTED & VERIFIED** | CartoDB Dark Matter basemap |
| **Google Gemini AI** | Primary AI emergency triage, multilingual assistance | `GEMINI_API_KEY` | **CONNECTED & VERIFIED** | Secondary OpenAI provider |
| **OpenAI Engine** | Secondary AI assistant engine for high-load failover | `OPENAI_API_KEY` | **CONNECTED & VERIFIED** | Static verified NDMA guidelines |
| **IMD (MoES)** | Live meteorological heavy rain & cyclone alerts | `IMD_API_BASE_URL`<br>`IMD_API_KEY` | **CONFIGURABLE (Zero-Mock)** | Shows: *"Service not connected — configuration required."* |
| **NDMA Sachet** | National Common Alerting Protocol (CAP) feed | `NDMA_SACHET_FEED_URL`<br>`NDMA_SACHET_TOKEN` | **CONFIGURABLE (Zero-Mock)** | Shows: *"Service not connected — configuration required."* |
| **CWC Basin Gauges** | Real-time Brahmaputra/Barak river water levels | `CWC_API_BASE_URL`<br>`CWC_API_KEY` | **CONFIGURABLE (Zero-Mock)** | Displays verified static danger benchmarks |
| **ISRO Bhuvan** | Satellite flood inundation & landslide hazard layers | `ISRO_BHUVAN_API_URL`<br>`ISRO_BHUVAN_API_KEY` | **CONFIGURABLE (Zero-Mock)** | Topographic elevation relief engine |
| **Resend** | Transactional emergency alerts & token dispatch | `RESEND_API_KEY`<br>`EMAIL_FROM_ADDRESS` | **OPTIONAL** | In-app notification center |
| **SMS Gateway** | Trai DLT Principal Entity SMS broadcast | `SMS_PROVIDER_API_KEY`<br>`SMS_SENDER_ID` | **OPTIONAL** | Citizen tracking screen |
| **Firebase (FCM)** | Critical push notifications to mobile clients | `NEXT_PUBLIC_FIREBASE_API_KEY`<br>`FIREBASE_PRIVATE_KEY` | **OPTIONAL** | Web alert banner ticker |

---

## 2. API Key Security & Zero-Mock Policy

### The Zero-Mock Policy
Under the NE-RESQ Production Engineering Specification:
1. **No Simulated or Hardcoded Government Data**: If institutional credentials for IMD, NDMA, CWC, or ISRO are unconfigured, the system never displays simulated flood warnings or fabricated water levels.
2. **Explicit Connection Indicators**: Modules requiring external institutional credentials explicitly state:
   > *"Service not connected — configuration required."*
3. **Client vs. Server Separation**:
   - Variables prefixed with `NEXT_PUBLIC_` are bundled into browser JavaScript (public API keys, Mapbox tokens, Supabase publishable keys).
   - Secret keys (`SUPABASE_SECRET_KEY`, `ADMIN_PASSWORD`, `DATABASE_URL`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `CRON_SECRET`) are strictly kept on the server and never sent to the browser.

---

## 3. Obtaining Institutional Credentials

### 1. Supabase API Credentials
- Register at [supabase.com](https://supabase.com).
- Copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from **Project Settings** -> **API**.
- Copy `service_role` secret and configure as `SUPABASE_SECRET_KEY`.

### 2. Mapbox & MapTiler Tokens
- **Mapbox**: Register at [mapbox.com](https://mapbox.com) and create a public access token with `styles:tiles` and `styles:read` scopes.
- **MapTiler**: Register at [maptiler.com](https://maptiler.com) and copy the API key from Account Settings.

### 3. AI Safety Assistant (Gemini & OpenAI)
- **Google Gemini**: Obtain a developer API key at [Google AI Studio](https://aistudio.google.com/).
- **OpenAI**: Create an API secret key at [platform.openai.com](https://platform.openai.com/api-keys).

### 4. Government Institutional APIs
- **IMD Guwahati**: Requires formal institutional approval from Regional Meteorological Centre (RMC) Guwahati / IMD New Delhi.
- **NDMA Sachet**: Requires authorized State Disaster Management Authority (SDMA) API partner onboarding.
- **CWC Hydrology**: Apply via Ministry of Jal Shakti Flood Forecast portal (`ffs.india-water.gov.in`).
- **ISRO Bhuvan**: Apply via National Remote Sensing Centre (NRSC) Bhuvan Enterprise Gateway.
