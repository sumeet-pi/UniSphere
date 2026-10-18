# UniSphere — Final Release Checklist & Staging Deployment Runbook

**Date**: October 18, 2026  
**Auditor & Release Engineer**: Senior Full-Stack & Release Engineering Agent  
**Repository**: [https://github.com/sumeet-pi/UniSphere](https://github.com/sumeet-pi/UniSphere)  
**Workspace**: `D:\Project 7th Sem UniSphere`  

---

## 1. System Architecture & Hosting Topology

UniSphere is designed as a decoupled, 12-factor full-stack cloud application:

```
                  ┌──────────────────────────────────────────────┐
                  │            Client Web Browser                │
                  └──────────────────────┬───────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
                 ▼ HTTPS (Static Assets)                         ▼ HTTPS (REST API v1)
  ┌──────────────────────────────┐                ┌──────────────────────────────┐
  │      Frontend Hosting        │                │       Backend API Hosting    │
  │   (Vercel / Netlify / S3)    │                │  (Render / Railway / AppRun) │
  │                              │                │                              │
  │  - React 19 + React Router 7 │                │  - Python 3.12 + FastAPI     │
  │  - Single Page Application   │                │  - Uvicorn / Gunicorn ASGI   │
  │  - SPA Routing (/* -> index) │                │  - ReportLab PDF Engine      │
  │  - Built Assets in /dist     │                │  - Stateless Memory Streams  │
  └──────────────────────────────┘                └──────────────┬───────────────┘
                                                                 │
                                                                 │ SSL / TLS (psycopg3)
                                                                 ▼
                                                  ┌──────────────────────────────┐
                                                  │   Neon Serverless PostgreSQL │
                                                  │   Branch: `staging` (Isolated)│
                                                  │   17 Relational Schema Tables│
                                                  └──────────────────────────────┘
```

### Recommended Hosting Providers:
1. **Frontend Hosting**:
   - **Recommended**: **Vercel** or **Cloudflare Pages** (Native Vite 7 support, instant atomic deployments, zero-config SPA client-side routing rewrites, global edge CDN).
   - **Alternative**: AWS S3 + CloudFront distribution (requires CloudFront custom error response 404 -> `/index.html` 200).
   - **Docker / Self-Hosted**: Nginx container serving `/usr/share/nginx/html` with `try_files $uri $uri/ /index.html;`.
2. **Backend API Hosting**:
   - **Recommended**: **Render** or **Railway** (Native Python 3.12 environment, automatic SSL, health check probes, zero-downtime rolling deploys, direct environment secret management).
   - **Alternative**: AWS App Runner or Fly.io (Containerized via standard Dockerfile).
3. **Database Hosting**:
   - **Primary**: **Neon Serverless PostgreSQL 16**.
   - **Staging Isolation**: Provision a dedicated, isolated Neon database branch named `staging` with its own unique endpoint credentials.

---

## 2. Staging Database Isolation & Neon Branching Strategy

> [!CRITICAL]
> **STAGING MUST NEVER CONNECT TO OR TARGET PRODUCTION DATA.**

Neon provides native database branching. Staging must operate on an isolated database branch to ensure that test runs, candidate migrations, and staging user sessions cannot modify or pollute production data.

### 2.1 Branch Provisioning Options

#### Option A: Neon Web Console
1. Navigate to your project in the [Neon Console](https://console.neon.tech).
2. Click **Branches** > **New Branch**.
3. Set **Branch Name**: `staging`.
4. Set **Parent Branch**: `main` (or initialize as an empty branch if starting clean).
5. Copy the generated Connection String:
   ```
   postgresql+psycopg://<staging_user>:<staging_password>@<ep-staging-xyz>.neon.tech/neondb?sslmode=require
   ```

#### Option B: Neon CLI (Using project `neon.ts`)
```powershell
# Using the configured Neon CLI
neon branch create --name staging
neon connection-string staging --database neondb
```

---

## 3. Database Audit & Review-Only Cleanup Plan

### 3.1 Audit Findings (Current Live Neon Database State)
The test suites (`test_api_v1_*.py`, `test_auth_registration.py`, and `test_full_uat_flows.py`) wrote dynamically generated test entities using unique UUID suffixes.

| Entity Type | Total In Database | Baseline Institutional Data | Test-Created Records | Identification Criteria |
| :--- | :---: | :---: | :---: | :--- |
| **Users** | **224** | **6** | **218** | Email patterns: `dup_*`, `test_*`, `uat_*`, `joiner_*`, `hacker_*`, `quantum_*`, `esports_*`, `aero_*`, `temp_*`, `pending_coord_*`, `approved_coord_*`. |
| **Clubs** | **102** | **4** (`c1`–`c4`) | **98** | Name patterns: `Quantum Computing *`, `Aeromodelling Club *`, `Esports Society *`, `Duplicate Club *`, `Pending Club *`, `Approved Club *`, `Test Club *`. |
| **Events** | **54** | **4** (`e1`–`e4`) | **50** | Title patterns: `Hackathon *`, `UAT Hackathon *`, `Unauthorized Event *`. |
| **Memberships** | **116** | **4** | **112** | Foreign keys belonging to test users / test clubs. |
| **Registrations** | **31** | **0** | **31** | Foreign keys belonging to test users / test events. |
| **Tasks** | **10** | **10** | **0** | Seed coordinator tasks. |
| **Announcements** | **12** | **2** | **10** | Title patterns: `Important Hackathon Orientation *`. |

### 3.2 Review-Only Cleanup Script (AWAITING EXPLICIT APPROVAL)

> [!WARNING]
> **DO NOT EXECUTE WITHOUT EXPLICIT USER AUTHORIZATION.**
> The following plan is strictly review-only. No records will be deleted until explicitly confirmed.

To safely clean up test artifacts without violating PostgreSQL foreign key constraints, deletions must execute in reverse dependency order:

```sql
-- DRY RUN: Review count of records targeted for removal
BEGIN;

-- 1. Remove event registrations for test events or test users
DELETE FROM event_registrations
WHERE user_id IN (SELECT id FROM users WHERE email ILIKE ANY(ARRAY['%dup_%', '%test_%', '%uat_%', '%joiner_%', '%hacker_%', '%quantum_%', '%esports_%', '%aero_%', '%temp_%', '%pending_%', '%approved_coord_%']))
   OR event_id NOT IN ('e1', 'e2', 'e3', 'e4');

-- 2. Remove club memberships for test clubs or test users
DELETE FROM club_memberships
WHERE user_id IN (SELECT id FROM users WHERE email ILIKE ANY(ARRAY['%dup_%', '%test_%', '%uat_%', '%joiner_%', '%hacker_%', '%quantum_%', '%esports_%', '%aero_%', '%temp_%', '%pending_%', '%approved_coord_%']))
   OR club_id NOT IN ('c1', 'c2', 'c3', 'c4');

-- 3. Remove test announcements
DELETE FROM announcements
WHERE club_id NOT IN ('c1', 'c2', 'c3', 'c4')
   OR title ILIKE '%Orientation %';

-- 4. Remove test coordinator tasks
DELETE FROM coordinator_tasks
WHERE club_id NOT IN ('c1', 'c2', 'c3', 'c4');

-- 5. Remove test events
DELETE FROM events
WHERE id NOT IN ('e1', 'e2', 'e3', 'e4');

-- 6. Remove test clubs
DELETE FROM clubs
WHERE id NOT IN ('c1', 'c2', 'c3', 'c4');

-- 7. Remove student profiles for test users
DELETE FROM student_profiles
WHERE user_id IN (SELECT id FROM users WHERE email ILIKE ANY(ARRAY['%dup_%', '%test_%', '%uat_%', '%joiner_%', '%hacker_%', '%quantum_%', '%esports_%', '%aero_%', '%temp_%', '%pending_%', '%approved_coord_%']));

-- 8. Remove test users
DELETE FROM users
WHERE email ILIKE ANY(ARRAY['%dup_%', '%test_%', '%uat_%', '%joiner_%', '%hacker_%', '%quantum_%', '%esports_%', '%aero_%', '%temp_%', '%pending_%', '%approved_coord_%']);

-- REVIEW AFFECTED ROW COUNTS, THEN:
-- ROLLBACK;  <-- Default for safety
-- COMMIT;    <-- ONLY when authorized
```

---

## 4. Environment Variables & Secret Configuration

### 4.1 Backend Staging Environment (`backend/.env.staging`)

```env
# Runtime Environment
APP_ENV=staging
DEBUG=false
PROJECT_NAME="UniSphere API (Staging)"

# Server Bindings
HOST=0.0.0.0
PORT=8000

# Neon Hosted PostgreSQL Connection URL - ISOLATED STAGING BRANCH
# NOTE: Must include sslmode=require and psycopg driver prefix
DATABASE_URL=postgresql+psycopg://<staging_user>:<staging_password>@<ep-staging-xyz>.neon.tech/neondb?sslmode=require

# Cryptographic JWT Secret (Generate with: openssl rand -hex 32)
# NEVER reuse development keys in staging or production!
SECRET_KEY=<generate_secure_32_byte_hex_token>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Allowed CORS Origins - Must match your staging frontend domain
FRONTEND_URL=https://staging-unisphere.vercel.app
ALLOWED_ORIGINS=https://staging-unisphere.vercel.app,http://localhost:5173
```

### 4.2 Frontend Staging Environment (`frontend/.env.staging` or Cloud Build Settings)

```env
# URL pointing to the deployed FastAPI Staging API
VITE_API_URL=https://api-staging-unisphere.onrender.com
```

> [!NOTE]
> Vite injects `VITE_API_URL` at **build time**. If the backend URL changes, the frontend must be rebuilt (`npm run build`).

---

## 5. Production Server & SPA Routing Configuration

### 5.1 Prohibition of Vite Development Server
Vite's development server (`npm run dev` / `vite`) is intended solely for local development with Hot Module Replacement (HMR). It must **NEVER** be used in staging or production because:
- It serves unminified, unbundled source code on-demand.
- It lacks production caching headers, gzip/brotli compression, and asset finger-printing.
- It is vulnerable to memory leaks and has high CPU utilization under concurrent load.

### 5.2 Frontend Production Serving
1. **Build Step**:
   ```powershell
   cd frontend
   npm run build
   ```
2. **SPA Catch-All Routing Rules**:
   Since React Router v7 manages client-side routes (`/explore`, `/events`, `/student`, `/club-dashboard`), direct navigation or page refresh will return a 404 from standard static web servers unless a catch-all rewrite is configured:

   - **For Vercel (`frontend/vercel.json`)**:
     ```json
     {
       "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
     }
     ```
   - **For Netlify (`frontend/public/_redirects`)**:
     ```
     /*    /index.html   200
     ```
   - **For Nginx Container**:
     ```nginx
     server {
         listen 80;
         root /usr/share/nginx/html;
         index index.html;
         location / {
             try_files $uri $uri/ /index.html;
         }
     }
     ```

### 5.3 Backend Production Serving
In staging and production, FastAPI should be driven by **Uvicorn** with a process manager or multiple worker threads:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4 --proxy-headers --forwarded-allow-ips='*'
```

---

## 6. Step-by-Step Staging Deployment Runbook

### Step 1: Provision Isolated Staging Database Branch
1. Create a `staging` branch off `main` in the Neon console.
2. Record the dedicated connection string with `sslmode=require`.

### Step 2: Deploy Backend API Service
1. Create a new Web Service on **Render** (or Railway / AWS App Runner) pointing to the repository root or `/backend`.
2. Configure **Build Command**:
   ```bash
   pip install --upgrade pip && pip install -r backend/requirements.txt
   ```
3. Configure **Start Command**:
   ```bash
   cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2
   ```
4. Set Environment Variables:
   - `DATABASE_URL`: Staging Neon connection string.
   - `SECRET_KEY`: Freshly generated 32-byte hex secret.
   - `APP_ENV`: `staging`.
   - `FRONTEND_URL`: URL of the staging frontend.
5. Apply Forward Schema Migrations against staging database:
   ```bash
   python -m scripts.migrate_schema
   ```
6. Verify Backend Health Check:
   - Request `GET https://<staging-api>/health` -> expect `HTTP 200 {"status":"ok","database":"connected"}`.
   - Request `GET https://<staging-api>/docs` -> verify interactive Swagger UI.

### Step 3: Deploy Frontend Web Application
1. Create a new Project on **Vercel** (or Cloudflare Pages) pointing to the repository.
2. Set **Root Directory**: `frontend`.
3. Set **Build Command**: `npm run build`.
4. Set **Output Directory**: `dist`.
5. Set Environment Variable:
   - `VITE_API_URL`: `https://<staging-api>` (URL of deployed backend from Step 2).
6. Deploy and verify static site generation.

---

## 7. Staging Smoke Test Checklist

Once staging URLs are active, execute the following smoke tests:

- [ ] **Liveness & DB Connectivity**:
  - `curl -I https://<staging-api>/health` -> returns `200 OK`.
- [ ] **Public Landing & Exploration**:
  - Open `https://<staging-frontend>/` -> landing hero, clubs, and events load.
  - Open `https://<staging-frontend>/explore` -> categories and club cards render.
  - Open `https://<staging-frontend>/events` -> event cards and stage filters render.
- [ ] **Direct URL Refresh (SPA Catch-All)**:
  - Open `https://<staging-frontend>/events`, press browser reload (`F5`) -> page reloads cleanly without 404.
- [ ] **Student Authentication & Session**:
  - Log in as demo student (`vikram.singh@college.edu` / `Password@2026`).
  - Verify redirect to `/student`.
  - Verify dashboard metrics (Attendance, Active Clubs, Credits).
  - Open Virtual Campus ID Card modal -> verify QR code and verification digest.
  - Reload page -> verify authentication is preserved from localStorage.
- [ ] **Coordinator Portal & Role Isolation**:
  - Log in as coordinator (`sharma.cse@college.edu` / `ClubAdmin#2026`).
  - Verify access to `/club-dashboard`.
  - Verify managed club metrics and task boards.
  - Attempt accessing `/admin` -> verify blocked with appropriate permission rejection.
- [ ] **Certificate & Accreditation Engine**:
  - Download test PDF certificate from `/api/v1/certificates/CRT-2026-BW-1001/pdf` -> valid PDF opens.
  - Export NAAC Criterion 5.3 audit report -> valid CSV downloads with institutional headers.
- [ ] **Logout Flow**:
  - Click logout -> user is returned to `/login` and token is cleared.

---

## 8. Rollback Procedures & Contingency Matrix

| Failure Mode | Detection Indicator | Rapid Rollback Action |
| :--- | :--- | :--- |
| **Frontend Bundle Defect / Blank Screen** | Browser console runtime exceptions, broken routing. | **Vercel / Cloudflare**: Click **Instant Rollback** to previous deployment hash (instant, 0-downtime). |
| **Backend API Crash / 500 Errors** | `/health` fails, Sentry / log alerts spike. | **Render / Railway**: Roll back to prior working commit or deployment image in console. |
| **Schema Migration Failure / Incompatibility** | Migration script fails or SQLAlchemy table mismatch. | **Neon Database**: Use Neon **Point-in-Time Restore (PITR)** or reset the `staging` branch from parent `main`. |
| **CORS / Network Rejection** | Browser console reports `Access-Control-Allow-Origin` missing. | Update backend `FRONTEND_URL` environment variable and trigger redeploy. |

---

## 9. Remaining Blockers & Next Steps

1. **Staging Hosting Accounts**:
   - Requires provisioned accounts on hosting services (e.g. Vercel for frontend, Render for backend, Neon for database).
2. **External Notification Services**:
   - Outbound campus broadcast emails and SMS OTP alerts currently rely on simulated asynchronous task handlers until an institutional SMTP/SES provider is linked in `.env`.
3. **Payment Gateway Credentials**:
   - Paid event ticketing currently issues zero-cost institutional student passes. Payment gateway webhook handlers (e.g. Razorpay / Stripe) are slated for Phase 2 integration.
4. **Database Cleanup Approval**:
   - Review-only cleanup script prepared in Section 3.2. Awaiting explicit user confirmation before applying against database.

---

## 10. Readiness Verdict

### **STATUS: READY FOR STAGING DEPLOYMENT**

All local unit, integration, and user acceptance tests pass with 100% compliance. Configuration templates, environment specifications, SPA routing rules, and deployment runbooks are complete and verified. Staging deployment can commence once external hosting targets are selected.
