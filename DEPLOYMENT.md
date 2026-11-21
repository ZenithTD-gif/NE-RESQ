# NE-RESQ — Complete Vercel Production Deployment Guide

This guide details the single-repository, single-project, and single-domain deployment procedure for **NE-RESQ** on **Vercel**.

---

## 1. Single Architecture Deployment Model

NE-RESQ unites both the **User Portal** and the **Admin Command Directorate** into **ONE Next.js application**:

* **One Repository**: `https://github.com/ZenithTD-gif/NE-RESQ.git`
* **One Vercel Project**: `ne-resq-web` (Root directory: `apps/web`)
* **One Production Domain**: `ne-resq.gov.in` (or Vercel default domain)
* **One Database**: Centralized Supabase PostgreSQL 17 cluster
* **Unified Routing**: Public routes (`/`, `/alerts`, `/live-map`, `/login`) and admin routes (`/admin/login`, `/admin/dashboard`) reside on the same host without requiring reverse proxies or multiple deployments.

---

## 2. Step-by-Step Vercel Deployment

### Step 1: Connect GitHub Repository
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository: `ZenithTD-gif/NE-RESQ`.

### Step 2: Configure Project Settings
In the Vercel project configuration screen:

* **Framework Preset**: `Next.js`
* **Root Directory**: `apps/web` *(Click "Edit" and select `apps/web`)*
* **Build Command**: `next build` *(or leave default)*
* **Output Directory**: `.next` *(default)*
* **Install Command**: `npm install` *(default)*

### Step 3: Configure Environment Variables
Add all required environment variables in **Project Settings** -> **Environment Variables**:

| Variable Name | Environment | Value Description |
| :--- | :--- | :--- |
| **`NEXT_PUBLIC_APP_URL`** | Production / Preview | `https://your-domain.vercel.app` |
| **`ADMIN_EMAIL`** | Production / Preview | `tdeka379@gmail.com` |
| **`ADMIN_PASSWORD`** | Production / Preview | Super Administrator Passphrase |
| **`NEXT_PUBLIC_SUPABASE_URL`** | Production / Preview | `https://iygprrxtlrvbdweydswh.supabase.co` |
| **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** | Production / Preview | Supabase Publishable / Anon Key |
| **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`** | Production / Preview | Supabase Publishable / Anon Key |
| **`SUPABASE_SECRET_KEY`** | Production / Preview | Supabase Service Role Secret Key |
| **`SUPABASE_SERVICE_ROLE_KEY`** | Production / Preview | Supabase Service Role Secret Key |
| **`DATABASE_URL`** | Production / Preview | `postgresql://postgres:[password]@db.iygprrxtlrvbdweydswh.supabase.co:5432/postgres` |
| **`NEXT_PUBLIC_MAPTILER_API_KEY`** | Production / Preview | MapTiler Key for Satellite basemaps |
| **`NEXT_PUBLIC_MAPBOX_TOKEN`** | Production / Preview | Mapbox Token for GIS vector layers |
| **`GEMINI_API_KEY`** | Production / Preview | Google Gemini API key for AI assistant |
| **`OPENAI_API_KEY`** | Production / Preview | OpenAI API key for AI assistant fallback |
| **`CRON_SECRET`** | Production / Preview | High-entropy secret for scheduled tasks |

> [!CAUTION]
> Never check "Automatically expose to Client" for secret variables (`ADMIN_PASSWORD`, `SUPABASE_SECRET_KEY`, `DATABASE_URL`, `GEMINI_API_KEY`, `OPENAI_API_KEY`). Only variables prefixed with `NEXT_PUBLIC_` should be client-accessible.

### Step 4: Deploy & Verify
1. Click **Deploy**.
2. Once the build finishes, verify the deployment:
   - **Public Homepage**: `https://your-domain.vercel.app/`
   - **Citizen Registration**: `https://your-domain.vercel.app/register`
   - **Super Admin Portal**: `https://your-domain.vercel.app/admin/login`

---

## 3. Custom Domain Configuration

To map a government or custom production domain:

1. In Vercel, open your project -> **Settings** -> **Domains**.
2. Enter your production domain (e.g. `ne-resq.gov.in` or `ne-resq.in`).
3. Add the required DNS records at your domain registrar:
   - **Type**: `A` | **Name**: `@` | **Value**: `76.76.21.21`
   - **Type**: `CNAME` | **Name**: `www` | **Value**: `cname.vercel-dns.com`
4. Vercel automatically provisions and renews SSL/TLS certificates via Let's Encrypt.

---

## 4. Deployment Troubleshooting

### 1. Build Failure: `Cannot find module '@shared/northeast-data'`
- **Fix**: Ensure the Root Directory in Vercel is set to `apps/web`. The `tsconfig.json` paths in `apps/web` are pre-configured to resolve `../../../packages/shared` transparently.

### 2. 500 Server Error on Registration / Login
- **Fix**: Check Vercel **Runtime Logs**. Ensure `SUPABASE_SECRET_KEY` and `NEXT_PUBLIC_SUPABASE_URL` are configured properly in the Vercel Environment Variables dashboard.

### 3. Maps Blank or White Screen
- **Fix**: Verify `NEXT_PUBLIC_MAPBOX_TOKEN` or `NEXT_PUBLIC_MAPTILER_API_KEY` is present in Vercel settings and redeploy.
