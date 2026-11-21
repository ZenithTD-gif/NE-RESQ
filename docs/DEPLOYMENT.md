# Deployment & Infrastructure Guide

## 1. Hosting Architecture

- **Frontend & Serverless API Routes**: Vercel (Next.js 14 App Router)
- **Database & Object Storage**: Supabase (PostgreSQL 15+ with PostGIS 3.3+)
- **Repository & CI/CD**: GitHub with GitHub Actions

## 2. Vercel Deployment Instructions

1. Link your GitHub repository to Vercel.
2. In Project Settings, set Root Directory to `apps/web`.
3. Configure the build settings:
   - Framework Preset: `Next.js`
   - Build Command: `next build`
   - Install Command: `npm install`
4. Populate Environment Variables from `.env.example`:
   - `NEXT_PUBLIC_APP_URL`
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
5. Deploy the application.

## 3. Database Migration Instructions

To run migrations against Supabase or PostgreSQL:
```bash
# Using psql
psql "$DATABASE_URL" -f database/migrations/001_initial_schema.sql
psql "$DATABASE_URL" -f database/seeds/001_northeast_geography.sql
```
