# UniSphere Backend (Production Readiness)

UniSphere is a centralized college club management, co-curricular engagement, and NAAC Criterion 5.3 compliance tracking platform.

## 1. Technology Stack
- **Framework**: Python 3.12+, FastAPI
- **Database**: Neon Serverless PostgreSQL with SSL (`psycopg` / `asyncpg` drivers)
- **ORM & Migrations**: SQLAlchemy 2.0, Alembic
- **Validation & Schemas**: Pydantic v2
- **Authentication**: JWT (`HS256`), Argon2 / PBKDF2 password hashing
- **PDF Generation**: ReportLab
- **Testing**: Pytest, HTTPX

---

## 2. Quickstart & Setup (Windows PowerShell)

### Step 1: Create and Activate Virtual Environment
```powershell
cd "d:\Project 7th Sem UniSphere\backend"
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### Step 2: Install Dependencies
```powershell
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables
Copy the template and configure your Neon connection string:
```powershell
Copy-Item .env.example .env
```
Ensure your `DATABASE_URL` is set:
```env
DATABASE_URL=postgresql+psycopg://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require
SECRET_KEY=your-32-byte-secret-key-here
ENVIRONMENT=development
PORT=8000
```

### Step 4: Run Migrations
```powershell
alembic upgrade head
```

### Step 5: Start Uvicorn Server
```powershell
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive OpenAPI documentation is live at `http://localhost:8000/docs`.

---

## 3. Running the Automated Test Suite

UniSphere comes with an exhaustive test suite covering unit validation, institutional authorization, race conditions, and complete workflows.

### Run All 28 Automated Tests:
```powershell
python -m pytest tests/ -v
```

### Test Breakdown:
- `tests/test_auth_registration.py` (10 tests): Student registration, coordinator application, duplicate validations, pending approval quarantine.
- `tests/test_api_v1_auth_students.py` (6 tests): Token restoration, profile updates, virtual ID card, student directory search.
- `tests/test_api_v1_clubs_tasks.py` (4 tests): Public club catalog, category filtering, zero-code join/leave, coordinator Kanban tasks.
- `tests/test_api_v1_events_rsvp.py` (4 tests): Event lifecycle state machine (`upcoming -> open -> closed -> past`), individual RSVP, gate scanner check-in, ticket cancellation.
- `tests/test_api_v1_certificates_analytics_admin.py` (4 tests): Announcements bulletin, executive analytics KPIs, NAAC Criterion 5.3 report, CSV/PDF export, winners declaration, admin approval/rejection queue.

---

## 4. Standard Response Contracts

### Unified Success Envelope:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully.",
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-18T01:30:00Z",
    "version": "v1.0"
  }
}
```

### Unified Error Envelope:
```json
{
  "success": false,
  "statusCode": 403,
  "error": "FORBIDDEN",
  "message": "Access forbidden: you are not authorized to perform this operation.",
  "path": "/api/v1/clubs/c1/announcements",
  "timestamp": "2026-10-18T01:30:00Z"
}
```

---

## 5. Endpoints Reference (`/api/v1`)

| Module | Method | Path | Description | Access |
|---|---|---|---|---|
| **Health** | `GET` | `/health` | Server process liveness | Public |
| | `GET` | `/health/ready` | Database connection readiness | Public |
| **Auth** | `POST` | `/api/v1/auth/signup` | Student registration | Public |
| | `POST` | `/api/v1/auth/login` | Authenticate and issue JWT | Public |
| | `GET` | `/api/v1/auth/me` | Hydrate current user context | Authenticated |
| **Students** | `GET` | `/api/v1/students/me` | Get student profile | Student |
| | `PUT` | `/api/v1/students/me` | Update student profile | Student |
| | `GET` | `/api/v1/students/me/id-card` | Digital ID card snapshot | Student |
| | `GET` | `/api/v1/students/search` | Search students for team RSVP | Authenticated |
| **Clubs** | `GET` | `/api/v1/clubs` | Public club catalog | Public |
| | `GET` | `/api/v1/clubs/{clubId}` | Public club profile | Public |
| | `POST` | `/api/v1/clubs` | Apply for new club registration | Coordinator |
| | `PUT` | `/api/v1/clubs/{clubId}` | Update club metadata | Authorized Coordinator / Admin |
| | `GET` | `/api/v1/clubs/{clubId}/members` | Club roster & core team | Authenticated |
| | `POST` | `/api/v1/clubs/{clubId}/join` | Zero-code membership enrollment | Student |
| | `DELETE` | `/api/v1/clubs/{clubId}/leave` | Voluntary membership cancellation | Student |
| | `GET` | `/api/v1/clubs/{clubId}/tasks` | Kanban operational tasks | Coordinator |
| | `POST` | `/api/v1/clubs/{clubId}/tasks` | Create coordinator task | Coordinator |
| | `PATCH` | `/api/v1/clubs/{clubId}/tasks/{taskId}/status` | Update task status | Coordinator |
| **Events** | `GET` | `/api/v1/events` | Event catalog with status filters | Public |
| | `GET` | `/api/v1/events/{eventId}` | Event details & eligibility check | Public / Optional Auth |
| | `POST` | `/api/v1/clubs/{clubId}/events` | Create new club event | Coordinator |
| | `PATCH` | `/api/v1/events/{eventId}/stage` | Lifecycle stage transition | Coordinator |
| | `GET` | `/api/v1/events/{eventId}/winners` | Podium winners | Public |
| | `POST` | `/api/v1/events/{eventId}/winners` | Declare champions podium | Coordinator / Faculty |
| **RSVP & Passes** | `POST` | `/api/v1/events/{eventId}/rsvp` | Individual seat RSVP | Student |
| | `POST` | `/api/v1/events/{eventId}/team-rsvp` | Team RSVP for hackathons | Student (Lead) |
| | `DELETE` | `/api/v1/events/{eventId}/rsvp` | Cancel seat registration | Student (Owner) |
| | `GET` | `/api/v1/student/registrations` | Student pass roster | Student |
| | `PATCH` | `/api/v1/events/{eventId}/registrations/{passCode}/check-in` | Gate scanner attendance check-in | Coordinator |
| **Announcements** | `GET` | `/api/v1/announcements` | Campus bulletin feed | Public / Filtered |
| | `POST` | `/api/v1/clubs/{clubId}/announcements` | Broadcast club announcement | Coordinator |
| **Certificates** | `GET` | `/api/v1/certificates/{credentialId}` | Public credential verification | Public |
| | `GET` | `/api/v1/certificates/{credentialId}/pdf` | Stream verified PDF certificate | Public |
| **Analytics & NAAC** | `GET` | `/api/v1/clubs/{clubId}/analytics/summary` | Executive KPIs & attendance funnel | Coordinator / Admin |
| | `GET` | `/api/v1/clubs/{clubId}/analytics/naac-audit` | Departmental NAAC Criterion 5.3 report | Coordinator / Faculty / Admin |
| | `GET` | `/api/v1/clubs/{clubId}/analytics/naac-audit/export` | Download audit report as CSV/PDF | Coordinator / Faculty / Admin |
| **Admin Governance** | `GET` | `/api/v1/admin/clubs/pending` | Applications pending queue | Admin |
| | `PATCH` | `/api/v1/admin/clubs/{clubId}/approve` | Approve club application | Admin |
| | `PATCH` | `/api/v1/admin/clubs/{clubId}/reject` | Reject club application with reason | Admin |

---

## 6. Frontend Integration
The frontend client in `frontend/src/services/api.js` connects to `http://localhost:8000/api/v1` (configurable via `VITE_API_BASE_URL`).
Build and test the React frontend bundle:
```powershell
cd "d:\Project 7th Sem UniSphere\frontend"
npm run build
```
The production bundle builds cleanly with zero errors.
