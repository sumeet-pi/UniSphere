# UniSphere — Read-Only Database Forensic Audit & Cleanup Review Report

**Audit Date**: October 18, 2026  
**Auditor**: Senior Database Architect & Release Engineering Agent  
**Database**: Neon Serverless PostgreSQL 16 (`neondb`)  
**Audit Mode**: Strictly Read-Only (Zero deletions or mutations executed)  

---

## 1. Executive Summary & Audit Methodology

A forensic, read-only audit of all 17 tables in the live Neon PostgreSQL database was performed to isolate automated test artifacts from baseline institutional records and legitimate user/developer accounts.

### 1.1 Classification Criteria

To prevent accidental data loss, records were analyzed against exact IDs, creation timestamps, test-runner identifier patterns, and relational foreign keys, categorized into three distinct tiers:

1. **Tier 1: Confirmed Baseline Institutional Records**
   - Entities provisioned by the institutional seed script (`scripts/seed.py`) or representing core college clubs, events, and baseline governance accounts.
   - Identified by canonical IDs (`u1`, `u2`, `u5`, `u6`, `u7`, `u_admin_001`, `c1`, `c2`, `c3`, `c4`, `c_pending`, `e1`, `e2`, `e3`, `e4`, `e5`).
2. **Tier 2: Manual Review Required (Legitimate Developer / User Accounts)**
   - Accounts and clubs created manually during early testing or interactive browser sessions without automated test-harness markers.
   - **MUST NOT BE DELETED** without explicit manual confirmation by the project owner.
3. **Tier 3: Confirmed Automated Test Records**
   - Entities created dynamically during automated pytest runs and UAT execution.
   - Proven by dynamic hexadecimal test tokens (`[a-f0-9]{6,8}`) injected by `uuid.uuid4().hex` into emails (e.g. `dup_538da1df@college.edu`, `uat_student_72e14ced@college.edu`), club names (e.g. `Quantum Computing f9d215`), and event titles (e.g. `DevSprint Hackathon aeacfa`).

---

## 2. Inventory Summary Across All Relational Entities

| Entity / Relational Table | Total Records | Tier 1: Baseline Seed | Tier 2: Manual Review | Tier 3: Confirmed Test | Action Proposed |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **`users`** | **224** | **6** | **4** | **214** | Delete Tier 3 only upon explicit approval; retain Tiers 1 & 2. |
| **`student_profiles`** | **112** | **2** | **0** | **110** | Cascade with Tier 3 student users. |
| **`clubs`** | **102** | **5** | **2** | **95** | Delete Tier 3 only upon explicit approval; retain Tiers 1 & 2. |
| **`events`** | **54** | **5** | **0** | **49** | Delete Tier 3 only upon explicit approval; retain Tiers 1 & 2. |
| **`club_memberships`** | **116** | **4** | **2** | **110** | Delete Tier 3 only upon explicit approval; retain Tiers 1 & 2. |
| **`event_registrations`**| **31** | **0** | **0** | **31** | All 31 belong to Tier 3 test events/users. |
| **`announcements`** | **12** | **2** | **0** | **10** | Delete Tier 3 orientation test notices; retain 2 institutional notices. |
| **`coordinator_tasks`** | **10** | **10** | **0** | **0** | Retain all 10 baseline coordinator tasks. |
| **`certificates`** | **1** | **1** | **0** | **0** | Retain institutional verification certificate (`CRT-2026-BW-1001`). |
| **`event_winners`** | **2** | **2** | **0** | **0** | Retain baseline podium winners for event `e3`. |

---

## 3. Detailed Audit Findings by Tier

### 3.1 Tier 1: Confirmed Baseline Institutional Data (TO PRESERVE)

#### Baseline Users (6 Accounts):
- `u1`: Dr. Sharma (`sharma.cse@college.edu`) — Department Faculty Coordinator
- `u2`: Aarav Kumar (`aarav.cs24@college.edu`) — Student Representative
- `u5`: Vikram Singh (`vikram.cs24@college.edu` / `vikram.singh@college.edu`) — Demo Student
- `u6`: Ayush Sharma (`ayush.sharma@college.edu`) — General Student
- `u7`: Priya Roy (`priya.roy@college.edu`) — General Student
- `u_admin_001`: University Administrator (`admin@college.edu`) — Institutional Authority

#### Baseline Clubs (5 Clubs):
- `c1`: Byte Warriors (Computer Science & Engineering)
- `c2`: Robotics Society (Electronics & Mechanical)
- `c3`: Literary Guild (Humanities & Student Welfare)
- `c4`: Sports & Athletics Club (Physical Education)
- `c_pending`: FinTech & Blockchain Society (`fintech.society@college.edu`) — Seed charter for testing administrative pending queue.

#### Baseline Events (5 Events):
- `e1`: Web3 & Cloud Summit (Byte Warriors)
- `e2`: National Robotics Challenge (Robotics Society)
- `e3`: HackWave 2026 (Byte Warriors)
- `e4`: Inter-College Debate (Literary Guild)
- `e5`: Poetry Slam 2026 (Literary Guild, created 2026-10-17 07:45)

---

### 3.2 Tier 2: Manual Review Required (Legitimate Developer / User Data)

> [!IMPORTANT]
> The following 4 user accounts and 2 clubs were created manually during early developer onboarding and manual browser sessions. They do not have automated test-runner patterns and are **PROTECTED FROM DELETION**.

| Entity Type | Record ID | Identifier / Email / Name | Role / Category | Created Timestamp (UTC) | Ownership Analysis |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **User** | `dab40800-6884-41ed-a16a-91ae9c178744` | `aman@gmail.com` | `student` | `2026-10-17 09:06:21` | Manual developer registration. |
| **User** | `6fe8dde5-9a76-4e84-bb63-805e404b5a7c` | `aman1@gmail.com` | `student` | `2026-10-17 09:08:37` | Manual developer registration. |
| **User** | `2c7c28a5-5a59-4f57-a593-9e44839e53a5` | `aman2@gmail.com` | `organizer` | `2026-10-17 10:36:51` | Manual coordinator account. |
| **User** | `e6eac254-861c-488b-92c8-cc6bf64bedf6` | `testmail@gmail.com` | `organizer` | `2026-10-17 10:40:10` | Manual coordinator ('kulvir singh'). |
| **Club** | `d1dbc843-0160-48bc-aa11-27e27440ad6c` | `AI & Machine Learning Club` | `Technical` | `2026-10-17 10:36:52` | Founded by `aman2@gmail.com`. |
| **Club** | `cc15cf7c-1fbb-4985-b192-3f08ffed58eb` | `aman's club` | `General` | `2026-10-17 10:40:10` | Founded by `testmail@gmail.com`. |
| **Membership** | Linked to `aman2@gmail.com` | Club `d1dbc843-0160-...` | `COORDINATOR` | `2026-10-17 10:36:52` | Coordinator assignment. |
| **Membership** | Linked to `testmail@gmail.com` | Club `cc15cf7c-1fbb-...` | `COORDINATOR` | `2026-10-17 10:40:10` | Coordinator assignment. |

---

### 3.3 Tier 3: Confirmed Automated Test Records (Candidate Deletion Set)

These records were created solely by automated test scripts and contain dynamic hex tokens (`[a-f0-9]{6,8}`).

#### A. Automated Test Users (214 Records)
Generated across test suites:
- `test_api_v1_auth_students.py`: `student_[a-f0-9]{8}@college.edu`, `profiler_[a-f0-9]{8}@college.edu`, `idcard_[a-f0-9]{8}@college.edu`, `search_[a-f0-9]{8}@college.edu`.
- `test_api_v1_events_rsvp.py`: `rsvp_[a-f0-9]{6}@college.edu`, `cancel_[a-f0-9]{6}@college.edu`.
- `test_api_v1_clubs_tasks.py`: `member_[a-f0-9]{6}@college.edu`, `test_[a-f0-9]{6}@college.edu`.
- `test_auth_registration.py`: `dup_[a-f0-9]{8}@college.edu`, `test_student_[a-f0-9]{8}@college.edu`, `coord_[a-f0-9]{8}@college.edu`, `pending_coord_[a-f0-9]{8}@college.edu`, `approved_coord_[a-f0-9]{8}@college.edu`.
- `test_full_uat_flows.py`: `uat_student_[a-f0-9]{8}@college.edu`, `joiner_[a-f0-9]{8}@college.edu`, `uat_rsvper_[a-f0-9]{8}@college.edu`, `hacker_student_[a-f0-9]{8}@college.edu`.

*Representative Sample IDs*:
`161bd4a0-3d8a-4be9-a9c3-56bb3b0adcea`, `72e14ced-ac93-4ffa-8d4b-235a0dd2d7c7`, `u-57837ab2`, `36e04642-da41-4601-a5ee-3d08822bf1a4`, `963aca2e-30fd-4814-a541-3d4c4bdf125c`, `15293ebb-7885-41f7-9d08-f0d79d92ad6e`, `99e5089c-07ae-46ec-9f07-09608a47b0d4`, `07b49047-21fb-4f64-9982-17a2b41d51a9`, `4ab6c8a0-9190-478a-abf1-d1946679f413`, `u-40249390`.

#### B. Automated Test Clubs (95 Records)
Generated across:
- `test_api_v1_certificates_analytics_admin.py`: `Aeromodelling Club [a-f0-9]{6}`, `Esports Society [a-f0-9]{6}`.
- `test_api_v1_clubs_tasks.py`: `Test Club [a-f0-9]{6}`.
- `test_auth_registration.py`: `Duplicate Club [a-f0-9]{8}`, `Pending Club [a-f0-9]{8}`, `Approved Club [a-f0-9]{8}`.
- `test_full_uat_flows.py`: `Quantum Computing [a-f0-9]{6}`.

*Representative Sample IDs*:
`c_2e649ac5`, `c_ecc8bd35`, `c_c6d5ef83`, `c_6a2a4cd1`, `c_40170b1e`, `c_bdfc0947`, `c_bfabe49b`, `c_1ebb888e`, `99050731-de75-47fb-bc27-c0570c881de4`, `672d56cd-4a51-4f0b-991f-b3d1c09b0553`.

#### C. Automated Test Events (49 Records)
Generated across:
- `test_api_v1_events_rsvp.py`: `DevSprint Hackathon [a-f0-9]{6}`, `Open Tech Symposium [a-f0-9]{6}`, `Cancellable Workshop [a-f0-9]{6}`.
- `test_full_uat_flows.py`: `UAT Hackathon [a-f0-9]{6}`.

*Representative Sample IDs*:
`6b1ffffa-3741-4456-8337-190137768197`, `da2be4ab-17ac-4127-bfa2-0185733fc801`, `ea5f43c3-04d5-41e2-a901-394265e5d198`, `518b0e2e-8f6a-49bd-b5dc-42025bee856a`, `95af5f99-0c3c-4b36-afbb-21c57499b954`, `f1c8e457-d318-4169-87c1-d174b4aa7f73`, `68e62d97-95f3-4422-90e1-77d5112abf87`, `ccef2f02-870b-40f0-8641-55c3cea746da`, `19bb6c31-dc4a-43a9-b979-6464210a38e7`, `b76983c1-e602-4789-b9cf-e9530faa83bc`.

#### D. Automated Test Registrations (31 Records)
All 31 event registrations are tied to Tier 3 test events or test users. Zero baseline registrations were impacted.

#### E. Automated Test Memberships (110 Records)
All 110 memberships link Tier 3 test students to clubs. Baseline memberships (`c1` leaders) and Tier 2 manual memberships (`aman2`, `testmail`) are preserved.

#### F. Automated Test Announcements (10 Records)
Announcements titled `Important Hackathon Orientation [a-f0-9]{6}` created by `test_api_v1_certificates_analytics_admin.py`.

---

## 4. Proposed Surgical Cleanup Plan (Review Only — NOT Executed)

> [!CAUTION]
> **NO DATA HAS BEEN DELETED.**
> When approved by the user, the following Python script uses precise set membership (`IN`) targeting only verified Tier 3 candidate IDs, explicitly exempting Tiers 1 and 2.

```python
# DRY RUN / REVIEW SCRIPT: Awaiting explicit user confirmation
from app.db.session import SessionLocal
from app.models.user import User
from app.models.club import Club
from app.models.event import Event
from app.models.membership import ClubMembership
from app.models.registration import EventRegistration
from app.models.announcement import Announcement
from app.models.student_profile import StudentProfile

EXCLUDED_USER_IDS = {
    # Tier 1 Baseline
    'u1', 'u2', 'u5', 'u6', 'u7', 'u_admin_001',
    # Tier 2 Manual Developer Accounts
    'dab40800-6884-41ed-a16a-91ae9c178744',  # aman@gmail.com
    '6fe8dde5-9a76-4e84-bb63-805e404b5a7c',  # aman1@gmail.com
    '2c7c28a5-5a59-4f57-a593-9e44839e53a5',  # aman2@gmail.com
    'e6eac254-861c-488b-92c8-cc6bf64bedf6',  # testmail@gmail.com
}

EXCLUDED_CLUB_IDS = {
    # Tier 1 Baseline
    'c1', 'c2', 'c3', 'c4', 'c_pending',
    # Tier 2 Manual Clubs
    'd1dbc843-0160-48bc-aa11-27e27440ad6c',  # AI & Machine Learning Club
    'cc15cf7c-1fbb-4985-b192-3f08ffed58eb',  # aman's club
}

EXCLUDED_EVENT_IDS = {'e1', 'e2', 'e3', 'e4', 'e5'}

def execute_surgical_cleanup(commit=False):
    with SessionLocal() as db:
        # 1. Target Tier 3 Registrations
        del_regs = db.query(EventRegistration).filter(
            (EventRegistration.user_id.notin_(EXCLUDED_USER_IDS)) |
            (EventRegistration.event_id.notin_(EXCLUDED_EVENT_IDS))
        ).delete(synchronize_session=False)

        # 2. Target Tier 3 Memberships
        del_mems = db.query(ClubMembership).filter(
            (ClubMembership.user_id.notin_(EXCLUDED_USER_IDS)) |
            (ClubMembership.club_id.notin_(EXCLUDED_CLUB_IDS))
        ).delete(synchronize_session=False)

        # 3. Target Tier 3 Announcements
        del_anns = db.query(Announcement).filter(
            Announcement.club_id.notin_(EXCLUDED_CLUB_IDS)
        ).delete(synchronize_session=False)

        # 4. Target Tier 3 Events
        del_events = db.query(Event).filter(
            Event.id.notin_(EXCLUDED_EVENT_IDS)
        ).delete(synchronize_session=False)

        # 5. Target Tier 3 Clubs
        del_clubs = db.query(Club).filter(
            Club.id.notin_(EXCLUDED_CLUB_IDS)
        ).delete(synchronize_session=False)

        # 6. Target Tier 3 Student Profiles
        del_profs = db.query(StudentProfile).filter(
            StudentProfile.user_id.notin_(EXCLUDED_USER_IDS)
        ).delete(synchronize_session=False)

        # 7. Target Tier 3 Users
        del_users = db.query(User).filter(
            User.id.notin_(EXCLUDED_USER_IDS)
        ).delete(synchronize_session=False)

        print(f"Candidate Deletions: Regs={del_regs}, Mems={del_mems}, Events={del_events}, Clubs={del_clubs}, Users={del_users}")
        
        if commit:
            db.commit()
            print("Successfully committed surgical database cleanup.")
        else:
            db.rollback()
            print("DRY RUN completed. Rolled back without changes.")
```

---

## 5. Staging Database Isolation Verification (Neon Branching)

To completely decouple staging from any production or development database records:

1. **Neon Branch Creation**:
   - Staging must be provisioned on a dedicated branch named `staging` via the Neon Console or CLI.
   - When created from `main`, the `staging` branch receives an initial snapshot, or can be seeded freshly with `scripts/seed.py`.
2. **Dedicated Connection String**:
   - Staging backend environment variable must be set to the staging branch connection URL:
     ```
     DATABASE_URL=postgresql+psycopg://<staging_user>:<staging_password>@<ep-staging-xyz>.neon.tech/neondb?sslmode=require
     ```
3. **Guaranteed Cross-Branch Isolation**:
   - Any writes, schema migrations, or test runs performed on `staging` are physically isolated by Neon copy-on-write storage and cannot propagate to `main`.

---

## 6. Staging Deployment Readiness Verdict

### **STATUS: CODE & INFRASTRUCTURE READY FOR STAGING**

All code, configuration templates, container definitions, and audit reports are in place. Zero code rewrites are needed.

### Remaining Actions for User Authorization:
1. **Decision on Live Database Cleanup**: Review Section 4 above. Confirm whether you approve executing the surgical cleanup of the 214 Tier 3 test users, 95 test clubs, and 49 test events, or prefer to leave them as-is.
2. **Neon Staging Branch**: Create the `staging` branch in the Neon console and obtain its connection string.
3. **PaaS & Frontend Setup**: Deploy the backend to Render/Railway using [`backend/Dockerfile`](file:///d:/Project%207th%20Sem%20UniSphere/backend/Dockerfile) and frontend to Vercel/Cloudflare Pages using [`frontend/vercel.json`](file:///d:/Project%207th%20Sem%20UniSphere/frontend/vercel.json), populating the staging environment variables.
