# ClimateShield — Render Backend Cloud Deployment Guide

This guide details the exact steps and configuration required to deploy the **ClimateShield Express & Prisma API Backend** as a standalone Web Service on [Render](https://render.com).

---

## 1. Deployment Specification Summary

| Configuration Parameter | Render Setting | Notes |
|---|---|---|
| **Service Type** | **Web Service** | Managed Node.js runtime with automatic TLS/HTTPS. |
| **Environment** | **Node** | Node.js 20+ LTS runtime. |
| **Root Directory** | `backend` | Isolates backend build from frontend workspace. |
| **Branch** | `main` | Production branch. |
| **Build Command** | `npm install && npm run build` | Compiles TypeScript (`tsc`) and generates Prisma Client (`prisma generate`). |
| **Start Command** | `npm run start` | Executes compiled production server (`node dist/server.js`). |
| **Node Version Requirement** | `>= 20.0.0` | Specified in `backend/package.json` under `engines`. |
| **Health Check Path** | `/api/health` | Returns HTTP `200 OK` with JSON `{ "status": "healthy", ... }`. |
| **Auto-Deploy** | **Yes** (Recommended) | Triggers zero-downtime deployment on git push to `main`. |

---

## 2. Environment Variables Configuration

Configure the following environment variables in the **Environment** tab of the Render Web Service dashboard.

> [!IMPORTANT]
> Never hardcode or commit database passwords or secret keys to source control. Set these exclusively in Render's dashboard.

| Variable Name | Required? | Example / Value Description | Purpose |
|---|:---:|---|---|
| `PORT` | **Auto** | Render sets this automatically (e.g. `10000`). | Express automatically binds to `process.env.PORT \|\| 5000`. |
| `NODE_ENV` | **Required** | `production` | Optimizes Express performance and error masking. |
| `DATABASE_URL` | **Required** | `postgresql://postgres.[REF]:[PASS]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` | Supabase Transaction Pooler (port 6543) for application queries. |
| `DIRECT_URL` | **Required** | `postgresql://postgres.[REF]:[PASS]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres` | Supabase Session Pooler (port 5432) for direct connection & schema introspection. |
| `SUPABASE_URL` | **Required** | `https://[PROJECT-REF].supabase.co` | Base URL of your Supabase Cloud project. |
| `SUPABASE_SECRET_KEY` | **Required** | `sb_secret_...` (or service role key) | Elevated key for backend admin operations and JWT validation. |
| `SUPABASE_PUBLISHABLE_KEY` | **Required** | `sb_publishable_...` (or anon key) | Standard client-compatible publishable API key. |
| `SUPABASE_JWKS_URL` | **Required** | `https://[PROJECT-REF].supabase.co/auth/v1/.well-known/jwks.json` | JWKS endpoint for cryptographic JWT token verification. |
| `CORS_ORIGIN` | **Optional** | `*` (or `https://your-frontend.vercel.app`) | Whitelist of allowed origins for browser CORS headers. Default `*` permits testing. |

> [!NOTE]
> `GEMINI_API_KEY` is **not required** for the current deployment because Phase 4 (AI Decision Support) has not been implemented.

---

## 3. Prisma Client & Database Configuration

- **Client Generation**: The build command `npm run build` runs:
  ```bash
  tsc && prisma generate
  ```
  `prisma generate` creates `@prisma/client` inside the deployment container's `node_modules/@prisma/client`.
- **Zero Destructive Commands**: The schema is already fully provisioned and seeded in Supabase PostgreSQL Tokyo (`ap-northeast-1`).
  - **DO NOT run** `prisma migrate reset` in Render build commands.
  - **DO NOT run** `prisma db push` against the live production database during build.
  - Doing so would drop or corrupt production tables and data.

---

## 4. Step-by-Step Render Deployment Instructions

### Step 1: Create a New Web Service
1. Log in to [dashboard.render.com](https://dashboard.render.com/).
2. Click **New +** in the upper right corner and select **Web Service**.
3. Choose **Build and deploy from a Git repository**.
4. Connect your GitHub repository (`weather` / `ClimateShield`) and select the `main` branch.

### Step 2: Configure Service Details
Fill in the deployment form with the following values:
- **Name**: `climateshield-backend` (or your preferred name)
- **Region**: Choose the region closest to your Supabase PostgreSQL database (e.g. `Singapore` or `Frankfurt` / `Oregon`). *Note: Supabase project is in `ap-northeast-1` (Tokyo), so `Singapore` offers the lowest latency on Render.*
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Instance Type**: `Free` (or `Starter` for persistent background jobs / no spin-down)

### Step 3: Add Environment Variables
Under the **Environment Variables** section, click **Add Environment Variable** for each of:
- `NODE_ENV` = `production`
- `DATABASE_URL` = *(paste your Supabase transaction pooler URI)*
- `DIRECT_URL` = *(paste your Supabase direct session URI)*
- `SUPABASE_URL` = *(paste your Supabase project URL)*
- `SUPABASE_SECRET_KEY` = *(paste your Supabase secret key)*
- `SUPABASE_PUBLISHABLE_KEY` = *(paste your Supabase publishable key)*
- `SUPABASE_JWKS_URL` = *(paste your Supabase JWKS endpoint URL)*
- `CORS_ORIGIN` = `*`

### Step 4: Configure Health Check Path
1. Scroll down and expand **Advanced**.
2. Locate **Health Check Path**.
3. Enter:
   ```text
   /api/health
   ```
4. Render will periodically send HTTP GET requests to this path. When the response returns HTTP 200, Render marks the deployment healthy and routes incoming production traffic to it.

### Step 5: Deploy
Click **Create Web Service**.

---

## 5. Post-Deployment Verification Checklist

Once the Render build completes and transitions to **Live**:

1. **Verify Health Endpoint**:
   ```bash
   curl -I https://<your-render-subdomain>.onrender.com/api/health
   ```
   Should return `HTTP/2 200` with:
   ```json
   {
     "status": "healthy",
     "platform": "ClimateShield - Urban Climate Risk & Resilience Platform",
     "timestamp": "..."
   }
   ```

2. **Verify Locations & Hydrology Telemetry**:
   ```bash
   curl https://<your-render-subdomain>.onrender.com/api/locations
   ```
   Should return HTTP 200 with 4 active locations and live hydrological readings.

3. **Verify Incident Response**:
   ```bash
   curl https://<your-render-subdomain>.onrender.com/api/incidents
   ```
   Should return HTTP 200 with active incidents.

4. **Verify Weather Sync Ingestion**:
   ```bash
   curl https://<your-render-subdomain>.onrender.com/api/weather/sync
   ```
   Should return HTTP 200 confirming successful synchronization with Open-Meteo API.

---

## 6. Connecting the Frontend

After the backend is live on Render:
1. Copy the backend service URL (e.g. `https://climateshield-backend.onrender.com`).
2. In your frontend deployment (e.g. Vercel, Netlify):
   Set:
   ```env
   VITE_API_BASE_URL="https://climateshield-backend.onrender.com/api"
   ```
3. Once the frontend domain is finalized (e.g. `https://climateshield.vercel.app`), update `CORS_ORIGIN` in Render to:
   ```env
   CORS_ORIGIN="https://climateshield.vercel.app"
   ```
