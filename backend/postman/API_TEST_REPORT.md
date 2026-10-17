# UniSphere API — Test Report

**Generated:** 2026-10-17  
**Server:** `http://127.0.0.1:8000` (live, verified)  
**OpenAPI schema source:** `GET /api/openapi.json` (fetched live)  
**Collection file:** `UniSphere_API_Tests.postman_collection.json`  
**Environment file:** `UniSphere_Local.postman_environment.json`

---

## 1. Discovered Endpoints (5 total)

All 5 endpoints were confirmed from the live OpenAPI schema at `/api/openapi.json`.  
No endpoints were invented or assumed.

| # | Method | Path | Tag | Auth Required |
|---|--------|------|-----|---------------|
| 1 | POST | `/api/auth/signup` | Authentication | No |
| 2 | POST | `/api/auth/login` | Authentication | No |
| 3 | GET | `/api/auth/me` | Authentication | Yes — Bearer JWT |
| 4 | GET | `/api/health` | (default) | No |
| 5 | GET | `/api/health/db` | (default) | No |

> **Note on "default endpoints":** The two non-auth endpoints are `/api/health` and `/api/health/db` — not `/` or `/docs`. The root path `/` is not registered. The docs page is at `/api/docs` (Swagger UI). Both health endpoints were verified live and return `200 OK`.

---

## 2. Tests Created Per Endpoint

### `GET /api/health`
| Test | Assertion |
|------|-----------|
| Status code is 200 | `pm.response.to.have.status(200)` |
| Response has `status` field | `json.status` exists |
| `status` is `"healthy"` | `json.status === 'healthy'` |
| `service` is `"unisphere-api"` | `json.service === 'unisphere-api'` |
| Response time under 2000ms | `pm.response.responseTime < 2000` |

**Live verification:** ✅ `{"status":"healthy","service":"unisphere-api"}` — 200 OK

---

### `GET /api/health/db`
| Test | Assertion |
|------|-----------|
| Status code is 200 | `pm.response.to.have.status(200)` |
| Response has `status` field | `json.status` exists |
| `status` is `"healthy"` | `json.status === 'healthy'` |
| `database` is `"connected"` | `json.database === 'connected'` |
| Response time under 3000ms | `pm.response.responseTime < 3000` |

**Live verification:** ✅ `{"status":"healthy","database":"connected"}` — 200 OK

---

### `POST /api/auth/signup`

Three request variants are included:

#### Variant 1 — Successful Signup
| Test | Assertion |
|------|-----------|
| Status code is 201 Created | `pm.response.to.have.status(201)` |
| `access_token` present and non-empty | `json.access_token` is a non-empty string |
| `token_type` is `"bearer"` | `json.token_type === 'bearer'` |
| `user` object present | `json.user` is an object |
| User has `id`, `email`, `full_name`, `role`, `status` | All fields present |
| Role is `"General Student"` | Public signup always maps to student |
| Email matches signup email | `user.email === signupEmail` |
| Token stored in collection variable | `pm.collectionVariables.set('access_token', ...)` |

> Pre-request script generates a unique email (`testuser_<timestamp>@unisphere.test`) on every run to prevent duplicate conflicts.

#### Variant 2 — Duplicate Email (409)
| Test | Assertion |
|------|-----------|
| Status code is 409 Conflict | `pm.response.to.have.status(409)` |
| `detail.code` is `"EMAIL_EXISTS"` | Exact error code check |
| `detail.message` is non-empty | Error message present |

#### Variant 3 — Weak Password (400/422)
| Test | Assertion |
|------|-----------|
| Status code is 400 or 422 | Pydantic `min_length=8` triggers 422 before app logic |
| `detail` field present | Error detail exists |

#### Variant 4 — Missing Required Fields (422)
| Test | Assertion |
|------|-----------|
| Status code is 422 | `pm.response.to.have.status(422)` |
| `detail` is an array | Pydantic validation error array |

---

### `POST /api/auth/login`

Three request variants are included:

#### Variant 1 — Successful Login
| Test | Assertion |
|------|-----------|
| Status code is 200 OK | `pm.response.to.have.status(200)` |
| `access_token` present and non-empty | Non-empty string |
| `token_type` is `"bearer"` | Exact match |
| `user` has `id` and `email` | Fields present |
| Email matches signup email | Cross-request consistency check |
| Token stored in collection variable | Overwrites signup token with fresh login token |

#### Variant 2 — Invalid Credentials / Non-existent Email (401)
| Test | Assertion |
|------|-----------|
| Status code is 401 Unauthorized | `pm.response.to.have.status(401)` |
| `detail.code` is `"INVALID_CREDENTIALS"` | Exact error code |
| `detail.message` is non-empty | Error message present |

#### Variant 3 — Wrong Password (401)
| Test | Assertion |
|------|-----------|
| Status code is 401 Unauthorized | `pm.response.to.have.status(401)` |
| `detail.code` is `"INVALID_CREDENTIALS"` | Same error code as non-existent email (intentional — no user enumeration) |

#### Variant 4 — Missing Fields (422)
| Test | Assertion |
|------|-----------|
| Status code is 422 | `pm.response.to.have.status(422)` |
| `detail` is an array | Pydantic validation error array |

---

### `GET /api/auth/me`

Three request variants are included:

#### Variant 1 — Authenticated (valid token)
| Test | Assertion |
|------|-----------|
| Status code is 200 OK | `pm.response.to.have.status(200)` |
| `id`, `email`, `full_name`, `role`, `status` present | All required UserResponse fields |
| Email matches signed-up user | Cross-request consistency |
| Role is `"General Student"` | Mapped from backend `"student"` |

#### Variant 2 — No Token (401/403)
| Test | Assertion |
|------|-----------|
| Status code is 401 or 403 | HTTPBearer scheme rejects missing token |
| `detail` field present | Error detail exists |

#### Variant 3 — Invalid/Malformed Token (401/403)
| Test | Assertion |
|------|-----------|
| Status code is 401 or 403 | JWT decode failure |
| `detail` field present | Error detail exists |

---

## 3. Token Flow

```
Signup (POST /api/auth/signup)
  └─► stores access_token → collection variable: access_token
        │
Login (POST /api/auth/login)
  └─► overwrites access_token → collection variable: access_token
        │
GET /api/auth/me
  └─► reads Authorization: Bearer {{access_token}}
```

The collection uses `pm.collectionVariables` (not environment variables) for the token so it is scoped to the collection run and not persisted between sessions.

---

## 4. Live Verification Results

The following endpoints were called directly during collection generation:

| Endpoint | Status | Response |
|----------|--------|----------|
| `GET /api/openapi.json` | ✅ 200 OK | Full schema with 5 paths confirmed |
| `GET /api/health` | ✅ 200 OK | `{"status":"healthy","service":"unisphere-api"}` |
| `GET /api/health/db` | ✅ 200 OK | `{"status":"healthy","database":"connected"}` |

Auth endpoints (`/signup`, `/login`, `/me`) were **not** called during generation to avoid creating test data in the database. They will be exercised when you run the collection.

---

## 5. Prerequisites

Before running the collection:

1. **Start the FastAPI server:**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```
   Confirm it is running at `http://127.0.0.1:8000`.

2. **Database must be running and migrated:**
   ```bash
   alembic upgrade head
   ```

3. **No pre-existing test data required** — the signup test generates a unique email on every run.

---

## 6. How to Import and Run in Postman

### Import
1. Open Postman.
2. Click **Import** (top-left).
3. Import `UniSphere_API_Tests.postman_collection.json`.
4. Import `UniSphere_Local.postman_environment.json`.

### Select Environment
5. In the top-right environment dropdown, select **UniSphere_Local**.

### Run the Collection
6. Click the **UniSphere API Tests** collection in the sidebar.
7. Click **Run** → **Run collection**.
8. Keep the default order (Health → Authentication) — the signup test must run before login and /me.
9. Click **Run UniSphere API Tests**.

### Expected Results
- All 5 health tests should pass immediately if the server is running.
- Auth tests pass if the database is connected and migrations are applied.
- The duplicate-email test (409) depends on the successful-signup test running first in the same session.

---

## 7. Notes and Limitations

- **No real credentials** are stored in the collection or environment files.
- **No destructive operations** — the collection only creates one test user per run (via signup) and reads data.
- The `/api/docs` (Swagger UI) page is an HTML page served by FastAPI; it is not tested here as it is a framework-generated page, not an application endpoint.
- The root path `/` is **not registered** in `main.py` — there is no root endpoint to test.
- If the server is not running, all requests will fail with a connection error — this is expected.
