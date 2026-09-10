# ClimateShield — Architecture Migration Plan
## Evolving from Demo Frontend to Real Full-Stack Urban Climate Resilience Platform

**Project:** ClimateShield (Urban Climate Risk and Decision Platform)  
**Target:** 24-Hour Production-Grade MVP  
**Database:** Supabase PostgreSQL  
**Backend:** Node.js + Express + Prisma ORM + Existing Services  
**Frontend:** React 18 + Vite + Tailwind CSS + Leaflet (Preserving Existing UI & Stitch Aesthetics)  
**Document Status:** Pending User Review & Approval  

---

## Executive Summary & Architecture Philosophy

ClimateShield is an operational decision platform for municipal authorities, disaster-management teams, infrastructure operators, and field response teams. Its core operational workflow is:

$$\text{Environmental Data} \longrightarrow \text{Data Ingestion} \longrightarrow \text{Risk Engine (Deterministic)} \longrightarrow \text{Vulnerable Assets} \longrightarrow \text{Geospatial Risk Map} \longrightarrow \text{Action Recommendations (AI-Assisted)} \longrightarrow \text{Incident Response Dispatch} \longrightarrow \text{Resolution & Historical Intelligence}$$

This migration plan outlines how to evolve our existing working codebase into a live full-stack system connected to Supabase PostgreSQL, Supabase Auth, Supabase Realtime, live weather APIs, and an AI decision-support copilot **without breaking existing screens, without redesigning the UI, without deleting mock fallback resilience, and without creating a second backend.**

---

## A. Existing Database Models That Directly Migrate to Supabase PostgreSQL

The following existing Prisma models in `backend/prisma/schema.prisma` have well-defined relational schemas and can directly migrate to Supabase PostgreSQL with zero structural redesign:

1. **`Asset`**
   - **Fields:** `id` (String/UUID), `locationId` (FK), `name`, `type`, `criticality`, `impactNotice`, `createdAt`, `updatedAt`.
   - **Role:** Tracks critical infrastructure (Transit routes, hospitals, schools, power substations, commercial hubs) tied to vulnerable locations.
   - **Migration Action:** Directly migrates. Add `onDelete: Cascade` constraint to `locationId`.

2. **`ResponseAction`**
   - **Fields:** `id` (String/UUID), `incidentId` (FK), `title`, `description`, `priority`, `order`, `isCompleted`, `completedAt`, `createdAt`, `updatedAt`.
   - **Role:** Specific field response checklist tasks for an active incident.
   - **Migration Action:** Directly migrates. Can be subscribed to via Supabase Realtime for live checkbox syncing.

3. **`IncidentNote`**
   - **Fields:** `id` (String/UUID), `incidentId` (FK), `author`, `role`, `message`, `createdAt`.
   - **Role:** Operational dispatch communication stream and radio log entries.
   - **Migration Action:** Directly migrates. Optionally add `authorId` (FK -> `User.id`) to track authenticated user identity.

4. **`EnvironmentalReading`**
   - **Fields:** `id` (String/UUID), `locationId` (FK), `rainfallMm`, `waterLevelCm`, `drainageFlowPct`, `waterLevelTrend`, `riseRate`, `timestamp`.
   - **Role:** Time-series telemetry records for rainfall intensity, water levels, and culvert throughput.
   - **Migration Action:** Directly migrates. Can serve as the historical time-series ledger in PostgreSQL.

---

## B. Existing Models That Need Modification

The following existing models require targeted modifications to support multi-jurisdictional tenancy, Supabase Auth integration, and PostgreSQL-native capabilities:

1. **`User` (Migrate to `Profile` linked to Supabase Auth)**
   - *Current:* Contains plain-text `password String @default("demo123")` and local ID.
   - *Modifications:*
     - Remove plain-text `password` (passwords managed securely by Supabase Auth with Argon2/bcrypt).
     - Link `id` (UUID) directly to `auth.users.id`.
     - Add `organizationId` (UUID FK -> `Organization.id`).
     - Add `primaryJurisdictionId` (UUID FK -> `Jurisdiction.id`).
     - Standardize role enum: `ADMIN`, `DISPATCHER`, `OPERATOR`, `FIELD_OFFICER`.

2. **`Location`**
   - *Current:* Flat strings `district: "Metro District North"` and `sector: "Sector 7"`.
   - *Modifications:*
     - Add `jurisdictionId` (UUID FK -> `Jurisdiction.id`) to partition locations by municipal authority.
     - Add `zoneId` (UUID FK -> `Zone.id`, optional) for structured ward/sector grouping.
     - Maintain existing fields: `elevationMeters`, `catchmentAreaKm2`, `drainageCondition`, `historicalIncidents`, `latitude`, `longitude`, `assetType`.

3. **`Incident`**
   - *Current:* Lacks jurisdictional partitioning and audit metadata.
   - *Modifications:*
     - Add `jurisdictionId` (UUID FK -> `Jurisdiction.id`) to enable Row Level Security and scoped queries.
     - Add `declaredById` (UUID FK -> `User.id`, nullable).
     - Standardize status enum: `RISK_DETECTED`, `ALERT_SENT`, `TEAM_ASSIGNED`, `RESPONSE_IN_PROGRESS`, `RESOLVED`.

4. **`ResponseTeam`**
   - *Current:* Stores `equipment` as a stringified JSON string (`String`).
   - *Modifications:*
     - Change `equipment` to PostgreSQL native `Json` / `JSONB` or `String[]`.
     - Add `jurisdictionId` (UUID FK -> `Jurisdiction.id`) so response units belong to local municipal emergency departments.

5. **`RiskAssessment`**
   - *Current:* Stores `contributingFactors` and `recommendedActions` as serialized strings.
   - *Modifications:*
     - Convert `contributingFactors` and `recommendedActions` to PostgreSQL native `Json` (`JSONB`).
     - Add `aiExplanation` (`String?` / `TEXT`) to persist synthesized decision summaries.
     - Add `aiTacticalAdvice` (`String?` / `TEXT`) for generated operational response advice.

---

## C. New Models / Tables Required

To support centralized multi-organization and multi-jurisdiction governance without creating separate websites per city, the following new tables are required:

1. **`Organization`**
   - Represents a municipal or regional entity (e.g., *Amalapuram Municipal Corporation*, *Greater Visakhapatnam Municipal Corporation*).
   - **Fields:** `id` (UUID PK), `name` (TEXT), `code` (TEXT UNIQUE), `createdAt`, `updatedAt`.

2. **`Jurisdiction`**
   - Represents the geographic operational command boundary (e.g., *Amalapuram Region*, *Metro District North*).
   - **Fields:**
     - `id` (UUID PK)
     - `organizationId` (UUID FK -> `Organization.id`)
     - `name` (TEXT, e.g., "Amalapuram Region")
     - `code` (TEXT)
     - `centerLat` (FLOAT, e.g., 16.5787)
     - `centerLng` (FLOAT, e.g., 82.0061)
     - `boundaryGeoJson` (Json / JSONB, optional polygon coordinates)
     - `createdAt`, `updatedAt`

3. **`UserJurisdiction` (Join Table)**
   - Allows senior supervisors or district commissioners to switch between authorized jurisdictions.
   - **Fields:** `userId` (UUID FK -> `User.id`), `jurisdictionId` (UUID FK -> `Jurisdiction.id`), `isDefault` (BOOLEAN).
   - **Primary Key:** (`userId`, `jurisdictionId`).

4. **`HistoricalRiskData`**
   - Replaces the hardcoded JSON in `historyController.ts` with database-backed historical intelligence.
   - **Fields:**
     - `id` (UUID PK)
     - `jurisdictionId` (UUID FK -> `Jurisdiction.id`)
     - `year` (INT)
     - `monthlyTrends` (Json / JSONB)
     - `recurringHotspots` (Json / JSONB)
     - `capitalDirective` (Json / JSONB)
     - `summaryMetrics` (Json / JSONB)
     - `createdAt`, `updatedAt`

5. **`Zone` (Ward / Sector Grouping)**
   - Formalizes catchment areas (e.g., *Sector 4B*, *Sector 7 Central*).
   - **Fields:** `id` (UUID PK), `jurisdictionId` (UUID FK), `name`, `code`, `drainageRating`.

---

## D. Existing REST Endpoints That Can Remain Unchanged

The following endpoints already adhere to the frontend contract and will remain completely identical in path, parameters, and response structure:

- `GET /api/health` — Platform health check, operational status, timestamp.
- `GET /api/locations/:id` — Location details with assets, latest readings, and risk assessment.
- `GET /api/risk/:locationId` — Dynamic flood risk calculation for a location.
- `POST /api/risk/calculate` — Ad-hoc simulation calculation given rainfall, water level, drainage, and history.
- `GET /api/incidents/:id` — Single incident with response team, task checklist, and dispatch notes.
- `PATCH /api/incidents/any/actions/:actionId` — Check/uncheck response action task.
- `POST /api/incidents/:id/notes` — Append operational radio note to incident stream.
- `GET /api/teams` — List of response teams with current deployment status.

---

## E. Endpoints That Need Modification & New Endpoints

### Modified Endpoints:
1. **`POST /api/auth/login`**
   - *Current:* Compares raw passwords against `demo123` and returns a hardcoded mock token.
   - *Updated:* Authenticates via Supabase Auth client or validates credentials, returning a real Supabase JWT session with user profile and authorized jurisdiction IDs.
2. **`GET /api/locations`**
   - *Current:* Returns all locations globally.
   - *Updated:* Supports `?jurisdictionId=...`. Defaults to user's assigned jurisdiction.
3. **`GET /api/incidents`**
   - *Current:* Returns all incidents globally.
   - *Updated:* Scoped by `?jurisdictionId=...` and optional `?status=...`.
4. **`POST /api/incidents`**
   - *Current:* Lacks jurisdiction association.
   - *Updated:* Automatically associates the incident with the location's `jurisdictionId` and broadcasts a Supabase Realtime notification.
5. **`GET /api/history`**
   - *Current:* Hardcoded monthly JSON payload in controller.
   - *Updated:* Queries `HistoricalRiskData` by `jurisdictionId`, falling back to live aggregation of resolved incidents.

### New Endpoints to Add:
1. **`GET /api/jurisdictions`** — Lists jurisdictions accessible to the authenticated user.
2. **`POST /api/ai/explain`** — Takes computed physical risk metrics and produces natural language operational explanations and tactical recommendations.
3. **`GET /api/weather/sync`** — Triggers backend weather ingestion from Open-Meteo for the active jurisdiction coordinates.
4. **`POST /api/telemetry/ingest`** — Ingests live or simulated rainfall/water-depth sensor readings.

---

## F. Frontend Components Currently Dependent on Mock Data

| Frontend File | Component / Section | Mock Data Dependency | Current Behavior |
|---|---|---|---|
| `frontend/src/pages/Dashboard.tsx` | Locations & Critical Zones | `locationService.getLocations()` | Falls back to `MOCK_LOCATIONS` if backend is unreachable. |
| `frontend/src/pages/Dashboard.tsx` | Operational Ribbon | Hardcoded strings | Displays static `"Amalapuram Region Operations Command"`. |
| `frontend/src/pages/Dashboard.tsx` | Priority Actions | Local React state timer | Simulates task execution with a 3.5s timeout. |
| `frontend/src/pages/RiskMap.tsx` | Map Markers & Overlays | `locationService.getLocations()` | Falls back to `MOCK_LOCATIONS`; static center `[16.5787, 82.0061]`. |
| `frontend/src/pages/IncidentResponse.tsx` | Active Incident & Team | `incidentService.getIncidentById()` | Defaults to fallback ID `'inc-railway-001'` and `MOCK_INCIDENTS`. |
| `frontend/src/pages/IncidentResponse.tsx` | Actions & Radio Notes | In-memory `_mockIncidents` | Checkbox toggles and notes append to local memory array. |
| `frontend/src/pages/RiskHistory.tsx` | 12-Month Trends & Directives | `apiRequest('/history')` | Falls back to `MOCK_HISTORY`. |
| `frontend/src/pages/RiskDetails.tsx` | Location Gauges & Actions | `locationService.getLocationById()` | Defaults to `'loc-railway-underpass'` and `MOCK_LOCATIONS`. |
| `frontend/src/pages/Login.tsx` | Authentication Form | `checkDemoCredentials` | Validates against `admin@climateshield.demo` / `demo123` in memory. |
| `frontend/src/components/layout/Header.tsx` | User & Region Profile | Hardcoded JSX strings | Static `"Elena Vance - Lead Operations Officer"`, `"Amalapuram Region"`. |
| `frontend/src/components/layout/Sidebar.tsx` | Active Incident Badge | Hardcoded JSX string | Static `"1 Active"`. |

---

## G. How Each Mock Data Dependency Will Be Replaced with API Data

1. **Retain Offline Fallback Resilience:**
   - `mockData.ts` will **NOT be deleted**. It serves as a zero-crash safety net if the internet connection drops during a live demonstration.
   - In `services/api.ts`, requests attempt the live backend/Supabase first. If an unrecoverable network failure occurs, the fallback gracefully preserves UI functionality.
2. **Dynamic Context Providers:**
   - **`AuthContext.tsx`**: Supplies authenticated user data (`name`, `role`, `email`, `token`, `organizationName`).
   - **`JurisdictionContext.tsx`**: Supplies the currently active jurisdiction (`id`, `name`, `centerLat`, `centerLng`, `availableJurisdictions`), allowing users with administrative permissions to switch regions.
3. **Data Service Migration:**
   - `locationService.ts`: Requests `/locations?jurisdictionId=${currentJurisdiction.id}`.
   - `incidentService.ts`: Sends live REST/Supabase queries for incident details, task toggling, and note additions.
   - `riskService.ts`: Fetches dynamic calculation and AI explanation endpoints.
4. **Header & Layout Updates:**
   - `Header.tsx`: Renders dynamic jurisdiction title and an interactive `JurisdictionSelector` dropdown for authorized managers.
   - `Sidebar.tsx`: Replaces the static badge with `activeIncidentCount` derived from live incident queries.

---

## H. External APIs Required

1. **Open-Meteo Flood & Weather API (or OpenWeatherMap)**
   - **Purpose:** Fetches real-time precipitation rates ($mm/h$), current weather conditions, and precipitation forecasts.
   - **Key Advantage:** Free, high-accuracy European ECMWF/NOAA models, requires no API key for standard municipal volume, zero secret exposure risk.
2. **OpenStreetMap Tile Provider**
   - **Purpose:** High-resolution map tiles for Leaflet geospatial display (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).
   - **Authentication:** None required (free public tile service).
3. **Google Gemini API (or OpenAI API)**
   - **Purpose:** Generates natural language risk explanations, root-cause syntheses, and prioritized tactical guidance based on physical metrics.
   - **Authentication:** Server-side API key stored securely in `backend/.env`.

---

## I. Where Each External API Should Be Called

- **Open-Meteo Weather API:** Called **strictly from the backend** via `backend/src/services/weather/weatherService.ts`.
  - *Rationale:* Centralizes weather polling for all connected users, eliminates duplicate client requests, prevents client IP rate limiting, and allows the backend to write readings directly into `environmental_readings` and trigger `RiskEngine`.
- **OpenStreetMap Tile API:** Called **directly by the browser** inside `RiskMapView.tsx` (Leaflet standard behavior).
- **Google Gemini API:** Called **strictly from the backend** via `backend/src/services/ai/aiService.ts`.
  - *Rationale:* API secrets (`GEMINI_API_KEY`) must never be leaked to the client bundle. The frontend calls our internal endpoint `POST /api/ai/explain`.

---

## J. Supabase Realtime Architecture

Supabase Realtime will be hooked into four high-value operational surfaces using Postgres Change Data Capture (CDC):

1. **`incidents` Table (`INSERT`, `UPDATE`)**
   - *Target Views:* `Dashboard.tsx` (Active Incidents card, live KPI counter) and `IncidentResponse.tsx` (Lifecycle status stepper).
   - *Behavior:* When a new incident is declared or an existing incident moves from `TEAM_ASSIGNED` to `RESPONSE_IN_PROGRESS` or `RESOLVED`, the UI updates instantly across all connected screens without requiring a manual refresh.
2. **`incident_tasks` Table (`UPDATE`)**
   - *Target Views:* `IncidentResponse.tsx` (Protocol checklist).
   - *Behavior:* When a field operator or command dispatcher checks off "Inspect storm drain intake for blockages", the checkbox and completion timestamp sync immediately on all devices.
3. **`incident_notes` Table (`INSERT`)**
   - *Target Views:* `IncidentResponse.tsx` (Operational dispatch log).
   - *Behavior:* New radio transmissions and field updates appear in the feed in real time.
4. **`environmental_readings` Table (`INSERT`)**
   - *Target Views:* `RiskMap.tsx` and `RiskDetails.tsx` (Sensor depth gauges).
   - *Behavior:* Real-time water depth and rainfall rate updates trigger gauge needle and trend badge animations.

---

## K. Supabase Auth Integration with Existing Authentication

1. **Authentication Engine:**
   - Supabase Auth manages user credentials, secure password hashing, and cryptographic JWT issuance.
   - The user profile table (`User` / `Profile`) stores application-specific metadata (`name`, `role`, `organizationId`, `primaryJurisdictionId`).
2. **Frontend Flow:**
   - In `Login.tsx`, `supabase.auth.signInWithPassword({ email, password })` is called.
   - On success, the Supabase session token is stored and passed in the `Authorization: Bearer <token>` header for all API requests.
   - If offline mode is detected, the existing fallback mechanism (`checkDemoCredentials`) grants immediate demo access.
3. **Backend Flow:**
   - An Express middleware `authMiddleware.ts` verifies incoming JWTs using the Supabase JWT secret or Supabase Admin client:
     ```ts
     const token = req.headers.authorization?.split(' ')[1];
     const { data: { user }, error } = await supabase.auth.getUser(token);
     req.user = user;
     ```
   - Unauthenticated requests to protected endpoints return `401 Unauthorized`.

---

## L. Row Level Security (RLS) for Organizations & Jurisdictions

Row Level Security policies in Supabase PostgreSQL ensure strict data containment:

1. **Organization Scoping:**
   - Users belong to an organization (`organization_id`). They can only query records tagged with their organization or assigned jurisdictions.
2. **Jurisdiction Scoping Policies:**
   ```sql
   -- Enable RLS
   ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
   ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
   ALTER TABLE incident_tasks ENABLE ROW LEVEL SECURITY;

   -- Policy: Users can view locations within their authorized jurisdictions
   CREATE POLICY "View locations in permitted jurisdictions"
   ON locations FOR SELECT
   USING (
     jurisdiction_id IN (
       SELECT jurisdiction_id FROM user_jurisdictions WHERE user_id = auth.uid()
     )
   );

   -- Policy: Operators can update incidents in their jurisdiction
   CREATE POLICY "Manage incidents in permitted jurisdictions"
   ON incidents FOR ALL
   USING (
     jurisdiction_id IN (
       SELECT jurisdiction_id FROM user_jurisdictions WHERE user_id = auth.uid()
     )
   );
   ```
3. **Backend Service Role:**
   - Automated ingestion scripts (weather sync, sensor ingest) use the `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS when performing global system updates.

---

## M. How the Existing RiskEngine Receives Environmental Data

### Core Principle:
The system **never** relies on an LLM to calculate basic physical risk. The existing `RiskEngine` class in `backend/src/services/risk/riskEngine.ts` is mathematically sound and transparent:
- Rainfall (30% weight, 0–100 mm/h normalization)
- Water Level (30% weight, 0–48 cm curb/stall normalization)
- Drainage Condition (20% weight: Critical=20, Poor=17, Moderate=14, Good=4)
- Historical Incidents (20% weight, 0–13 event normalization)

### Live Data Flow:
```
[External Weather API / Sensor Telemetry]
                 │
                 ▼
[POST /api/telemetry/ingest] or [Weather Background Poller]
                 │
                 ▼
Writes new record to 'environmental_readings' table in Supabase
                 │
                 ▼
Backend invokes RiskEngine.calculateFloodRisk({
  rainfallMm: reading.rainfallMm,
  waterLevelCm: reading.waterLevelCm,
  drainageCondition: location.drainageCondition,
  historicalIncidents: location.historicalIncidents
})
                 │
                 ▼
RiskEngine outputs: { riskScore, riskLevel, components, factors, recommendedActions }
                 │
                 ▼
Stores output in 'risk_assessments' table
                 │
                 ▼
If riskScore >= 76 (CRITICAL) and no active incident exists:
Backend triggers IncidentService.createIncident() & broadcasts alert via Supabase Realtime
```

---

## N. Where AI Should Be Integrated

AI operates as an **Operational Decision Support Copilot**, engaged only *after* the physical risk engine has calculated the scores:

1. **Operational Risk Synthesis (`RiskDetails.tsx`):**
   - *Trigger:* Operator opens a location in Critical or High status.
   - *Prompt Input:* Physical score, rainfall rate, water depth, drainage condition, elevation, low-lying topography, and list of vulnerable assets.
   - *AI Output:* A 3-bullet executive briefing:
     - Root hydrologic cause (e.g., *Runoff volume exceeds 10-year culvert capacity by 180%*).
     - Infrastructure impact (e.g., *Primary ambulance transit to Metro General Hospital at risk within 25 minutes*).
     - Immediate containment directive.
2. **Tactical Action Recommendation Engine (`IncidentResponse.tsx`):**
   - *Trigger:* Incident declaration or team assignment.
   - *Prompt Input:* Severity, flooded water depth, assigned team equipment (e.g., *2x 4-inch submersible pumps, flood barriers*).
   - *AI Output:* Tailored, sequence-prioritized response instructions for the field team.
3. **Resilience Planning & Capital Directives (`RiskHistory.tsx`):**
   - *Trigger:* Long-term historical audit view.
   - *Prompt Input:* 24-month recurrence history, localized damage costs, flood frequency.
   - *AI Output:* Capital expenditure justification (e.g., *Dual Sluice Retrofit cost avoidance analysis*).

*Fail-Safe:* If the AI service is unavailable or no API key is set, the system seamlessly displays the deterministic factors and recommended actions generated by `RiskEngine`.

---

## O. What Needs to Change for Production Deployment

1. **Database & ORM Configuration:**
   - Update `backend/prisma/schema.prisma` datasource:
     ```prisma
     datasource db {
       provider  = "postgresql"
       url       = env("DATABASE_URL")
       directUrl = env("DIRECT_URL")
     }
     ```
   - Point `DATABASE_URL` to Supabase connection pooling (port 6543) and `DIRECT_URL` to direct PostgreSQL (port 5432) for migrations.
   - Run `npx prisma db push` to synchronize schema with Supabase PostgreSQL.
2. **Environment Variables:**
   - **`backend/.env`**:
     - `PORT=5000`
     - `DATABASE_URL=postgresql://...`
     - `DIRECT_URL=postgresql://...`
     - `SUPABASE_URL=https://<project-ref>.supabase.co`
     - `SUPABASE_SERVICE_ROLE_KEY=...`
     - `GEMINI_API_KEY=...`
   - **`frontend/.env`**:
     - `VITE_API_BASE_URL=/api` (or `http://localhost:5000/api`)
     - `VITE_SUPABASE_URL=https://<project-ref>.supabase.co`
     - `VITE_SUPABASE_ANON_KEY=...`
3. **Security & Production Hardening:**
   - Restrict CORS from `origin: '*'` to specific frontend deployment domains in production.
   - Add rate limiting on public routes.
   - Serve compiled frontend static assets via Express `app.use(express.static(FRONTEND_DIST))` with SPA fallback.

---

## Step-by-Step Implementation Sequence

Once approved, implementation will proceed in the following ordered phases:

```
Phase 1: Supabase Database Setup & Schema Push
  └── Update schema.prisma for PostgreSQL, add Organization/Jurisdiction models, push to Supabase, run seed script.

Phase 2: Backend Supabase & Auth Middleware
  └── Configure Supabase Client in backend, implement authMiddleware.ts, update authController.ts.

Phase 3: Real Weather API & Ingestion Service
  └── Implement weatherService.ts (Open-Meteo) and wire into RiskEngine.

Phase 4: AI Decision Copilot Integration
  └── Implement aiService.ts (Gemini) and add POST /api/ai/explain.

Phase 5: Frontend Supabase Client & Context Providers
  └── Add @supabase/supabase-js, AuthContext.tsx, JurisdictionContext.tsx, and JurisdictionSelector in Header.

Phase 6: Supabase Realtime Wiring
  └── Connect Realtime channels in Dashboard.tsx and IncidentResponse.tsx.

Phase 7: End-to-End Validation & Production Build
  └── Test full operational cycle, verify offline fallback resilience, and compile production artifacts.
```

---
*End of Architecture Migration Plan. Awaiting user review and authorization.*
