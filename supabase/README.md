# NE-RESQ Centralized Supabase Database Documentation

This directory contains the complete production-grade database schema, relational models, RLS security policies, and administrative bootstrap scripts for the **NE-RESQ** Northeast Emergency Response & Safety Platform.

Both the **User Website** (`user-web/` or `apps/web/`) and the **Admin Command Portal** (`admin-portal/`) connect to this exact single Supabase project.

---

## Files in this Directory

* **`NE_RESQ_COMPLETE_DATABASE.sql`**: The single, comprehensive, idempotent SQL file containing all 15 sections: extensions, states, districts, admin roles, admin users, emergency contacts, disaster alerts, hospitals, shelters, rescue units, website content, audit logs, RLS policies, triggers, and the Super Admin bootstrap function.
* **`DATABASE_SCHEMA.md`**: Complete dictionary of all tables, fields, data types, constraints, and defaults.
* **`TABLE_RELATIONSHIPS.md`**: Entity-relationship diagrams and foreign key dependency hierarchies.
* **`SECURITY_AND_RLS.md`**: Detailed security model, Row Level Security (RLS) enforcement rules, and role privilege matrix.

---

## How to Set Up & Deploy on Supabase

### 1. Retrieve Project Credentials
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project (or create a new project in region `ap-south-1` Mumbai).
3. Navigate to **Project Settings -> API**:
   * **Project URL**: `https://<project-ref>.supabase.co`
   * **Publishable / Anon Key**: `sb_publishable_...` (or `eyJ...`)
   * **Service Role Secret**: `sb_secret_...` (Keep strictly server-side)
4. Navigate to **Project Settings -> Database**:
   * **Connection String (URI)**: `postgresql://postgres.<project-ref>:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`

### 2. Execute the Single SQL Script
1. In your Supabase Dashboard, click on **SQL Editor** in the left navigation sidebar.
2. Click **New query**.
3. Open [`NE_RESQ_COMPLETE_DATABASE.sql`](./NE_RESQ_COMPLETE_DATABASE.sql), copy its entire contents, and paste it into the editor.
4. Click **Run** (or press `Cmd + Enter` / `Ctrl + Enter`).
5. Verify the execution output: All tables, triggers, indexes, and initial seed records for all 8 Northeast states and national helplines will be created with zero errors.

### 3. Bootstrap the Initial Super Administrator
To initialize your primary Root Administrator securely, run this SQL statement in the Supabase SQL Editor:

```sql
SELECT bootstrap_super_admin(
    'admin@neresq.gov.in',        -- Administrator Email
    'ChangeThisPassword2026!#',    -- Secure Password
    'State Incident Commander',   -- Full Name
    '+91 9435000000'              -- Official Mobile
);
```

This procedure hashes the password with bcrypt, grants the `SUPER_ADMIN` role, marks the account as `APPROVED`, and writes an immutable record into `admin_audit_logs`.

### 4. Configure Application Environment Variables

In both `apps/web/.env.local` (User Website) and `admin-portal/.env.local` (Admin Portal), configure:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
SUPABASE_SECRET_KEY=your-supabase-secret-key
DATABASE_URL=postgresql://postgres.your-project:your-password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

Both applications will immediately synchronize over the same verified database.
