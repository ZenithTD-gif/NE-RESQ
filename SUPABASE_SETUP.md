# NE-RESQ — Supabase Database Architecture & SQL Migration Guide

This technical documentation specifies the setup, schema structure, PostGIS spatial extensions, Row Level Security (RLS) policies, and verification steps for the **NE-RESQ Centralized Supabase Database Cluster**.

---

## 1. Supabase Cluster Overview

| Parameter | Configuration Detail |
| :--- | :--- |
| **Engine** | PostgreSQL 17 with PostGIS 3.4 Spatial Extensions |
| **Cluster Host** | `db.iygprrxtlrvbdweydswh.supabase.co` |
| **Project URL** | `https://iygprrxtlrvbdweydswh.supabase.co` |
| **Cloud Region** | AWS Asia Pacific (Mumbai) — `ap-south-1` |
| **Direct Port** | `5432` (Direct PostgreSQL protocol) |
| **Pooler Port** | `6543` (PgBouncer Transaction Pooler) |
| **Unified Access** | Both User Portal and Admin Portal connect to this single database |

---

## 2. Locating API Keys & Connection Strings

1. Navigate to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your NE-RESQ project (`iygprrxtlrvbdweydswh`).
3. Go to **Project Settings** -> **API**:
   - **Project URL**: Copy and set as `NEXT_PUBLIC_SUPABASE_URL`.
   - **anon / public key**: Copy and set as `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
   - **service_role key**: Copy and set as `SUPABASE_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` *(Never expose client-side)*.
4. Go to **Project Settings** -> **Database**:
   - Copy **Direct Connection** (Port 5432) or **Transaction Pooler** (Port 6543) and set as `DATABASE_URL`.

---

## 3. SQL Migration Files & Execution Sequence

The repository contains idempotent database scripts designed for clean execution in the Supabase SQL Editor:

```
NE-RESQ/
├── supabase/
│   ├── NE_RESQ_COMPLETE_DATABASE.sql   <-- [PRIMARY] Master Idempotent Migration
│   ├── README.md                       <-- Schema Overview & Architecture
│   ├── DATABASE_SCHEMA.md              <-- Full Table Reference
│   ├── TABLE_RELATIONSHIPS.md          <-- Entity-Relationship Guide
│   └── SECURITY_AND_RLS.md             <-- Security Policies & Roles
└── database/
    └── migrations/
        └── 001_initial_schema.sql      <-- Baseline Schema Definition
```

### Recommended Execution Order
To deploy the database from scratch:

1. Open **Supabase Dashboard** -> **SQL Editor**.
2. Create a **New Query**.
3. Copy the entire contents of [`supabase/NE_RESQ_COMPLETE_DATABASE.sql`](file:///Users/tridipdeka/Documents/GU%20Hackathon%20/supabase/NE_RESQ_COMPLETE_DATABASE.sql).
4. Click **Run**.

This script handles:
- Required PostgreSQL extensions: `uuid-ossp`, `postgis`, `pgcrypto`.
- Geographic foundations: `states` and `districts` with Northeast boundary coordinates.
- Administrative RBAC: `admin_roles`, `admin_users`, `admin_registration_requests`, `admin_audit_logs`.
- Citizen Accounts: `user_profiles` with encrypted password hashes.
- Emergency Facilities: `emergency_contacts`, `official_alerts`, `healthcare_facilities`, `shelters`, `rescue_facilities`, `website_content`.
- Row Level Security (RLS) enforcement on all 12 core tables.
- Automatic timestamp triggers (`update_updated_at_column()`).

---

## 4. Database Table Reference

| Table Name | Entity Purpose | RLS Policy |
| :--- | :--- | :--- |
| **`states`** | 8 Northeast States (AS, AR, ML, MN, MZ, NL, TR, SK) | Public read active; admin write. |
| **`districts`** | Northeast district jurisdictions with DEOC numbers | Public read active; admin write. |
| **`user_profiles`** | Citizen user accounts, phone, state, district | Authenticated self-read; service_role write. |
| **`admin_roles`** | RBAC definitions (`SUPER_ADMIN`, `STATE_ADMIN`, etc.) | Read-only system catalog. |
| **`admin_users`** | Official administrator accounts and status | Protected; self or Super Admin. |
| **`emergency_contacts`**| Official State and District disaster helplines (1070/1077/112) | Public read published & verified. |
| **`official_alerts`** | Authoritative meteorological & disaster warnings | Public read published & active. |
| **`healthcare_facilities`**| Verified emergency hospitals with ICU, oxygen & trauma beds | Public read verified & active. |
| **`shelters`** | Official relief camps with capacity and supply status | Public read verified & active. |
| **`rescue_facilities`**| NDRF, SDRF, and civil defense rescue assets | Public read published; admin write. |
| **`admin_audit_logs`** | Cryptographic audit trail of all administrative actions | Super Admin & Auditor read-only. |
| **`website_content`** | Dynamic disaster bulletins and announcement tickers | Public read published; admin write. |

---

## 5. Row Level Security (RLS) Architecture

Row Level Security is enabled across all production tables:

```sql
-- Example: Citizen Profiles Access Isolation
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service_role full access" 
ON public.user_profiles FOR ALL 
TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon and authenticated read" 
ON public.user_profiles FOR SELECT 
TO anon, authenticated USING (true);

-- Example: Emergency Contacts Public Protection
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Published Emergency Contacts" 
ON emergency_contacts FOR SELECT 
USING (publication_status = 'PUBLISHED' AND verification_status = 'VERIFIED_OFFICIAL');
```

---

## 6. Verifying Database Connectivity

To test live database connectivity from your terminal, execute:

```bash
cd apps/web
node -e '
const { Client } = require("pg");
const client = new Client({
  connectionString: "postgresql://postgres:@Tridipmac07@db.iygprrxtlrvbdweydswh.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function check() {
  await client.connect();
  const res = await client.query("SELECT count(*) FROM information_schema.tables WHERE table_schema = '\''public'\''");
  console.log("✓ Connected to Supabase! Public tables count:", res.rows[0].count);
  await client.end();
}
check().catch(console.error);
'
```

Alternatively, visit the internal health monitor at **`/admin/database-status`** to view real-time latency, table metrics, and PostGIS cluster status.
