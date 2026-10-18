import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from fastapi.testclient import TestClient
from app.main import app
from app.core.security import verify_password
from app.db.session import engine, SessionLocal
engine.echo = False
from app.models.user import User

client = TestClient(app)
db = SessionLocal()

print("=" * 60)
print("DEMO DATA AUTHENTICATION & API VERIFICATION")
print("=" * 60)

# 1. Direct password verification
test_accounts = [
    ("admin@demo.unisphere.edu", "Admin@2026", "ADMIN"),
    ("arjunmehta@demo.unisphere.edu", "Coordinator@2026", "CLUB_COORDINATOR"),
    ("nehakapoor@demo.unisphere.edu", "Coordinator@2026", "CLUB_COORDINATOR"),
    ("kunalverma@demo.unisphere.edu", "Coordinator@2026", "CLUB_COORDINATOR"),
    ("demo_s001@demo.unisphere.edu", "Student@2026", "GENERAL_STUDENT"),
]

print("\n--- 1. Testing Password Hashes in Database ---")
for email, raw_pwd, expected_role in test_accounts:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        print(f"  [FAIL] {email} not found in database!")
        continue
    valid = verify_password(raw_pwd, user.password_hash)
    status_str = "PASS" if valid and user.role == expected_role else "FAIL"
    print(f"  [{status_str}] {email:<32} | Role: {user.role:<16} | Password Match: {valid}")

# 2. Test Login API endpoint
print("\n--- 2. Testing /api/v1/auth/login Endpoint ---")
tokens = {}
for email, raw_pwd, expected_role in test_accounts:
    # Try JSON login first or form data
    res = client.post("/api/v1/auth/login", json={"email": email, "password": raw_pwd})
    if res.status_code != 200:
        # Try OAuth2 form
        res = client.post("/api/v1/auth/login", data={"username": email, "password": raw_pwd})
    
    if res.status_code == 200:
        body = res.json()
        payload = body.get("data") if isinstance(body, dict) and "data" in body else body
        token = payload.get("token") or payload.get("access_token")
        tokens[expected_role] = token
        user_info = payload.get("user", {})
        print(f"  [PASS] Logged in: {email:<32} -> Token: {token[:15]}... | Name: {user_info.get('name')} | Managed Club: {user_info.get('clubName')}")
    else:
        print(f"  [WARN] /api/v1/auth/login returned {res.status_code} for {email}: {res.text[:100]}")

# 3. Test Public Clubs API
print("\n--- 3. Testing /api/v1/clubs Endpoint ---")
res_clubs = client.get("/api/v1/clubs")
if res_clubs.status_code == 200:
    clubs_data = res_clubs.json()
    items = clubs_data.get("data") if isinstance(clubs_data, dict) and "data" in clubs_data else clubs_data
    print(f"  [PASS] /api/v1/clubs returned {len(items)} clubs")
else:
    print(f"  [STATUS {res_clubs.status_code}] /api/v1/clubs: {res_clubs.text[:100]}")

# 4. Test Public Events API
print("\n--- 4. Testing /api/v1/events Endpoint ---")
res_events = client.get("/api/v1/events")
if res_events.status_code == 200:
    events_data = res_events.json()
    items = events_data.get("data") if isinstance(events_data, dict) and "data" in events_data else events_data
    print(f"  [PASS] /api/v1/events returned {len(items)} events")
else:
    print(f"  [STATUS {res_events.status_code}] /api/v1/events: {res_events.text[:100]}")

# 5. Test Pending Approvals for Admin
print("\n--- 5. Testing Admin Club Approvals API ---")
admin_token = tokens.get("ADMIN")
if admin_token:
    headers = {"Authorization": f"Bearer {admin_token}"}
    res_admin = client.get("/api/v1/clubs?approval_status=requested", headers=headers)
    if res_admin.status_code == 200:
        data = res_admin.json()
        p_items = data.get("data") if isinstance(data, dict) and "data" in data else data
        print(f"  [PASS] Clubs with requested approval: {len(p_items)}")
        for p in p_items:
            print(f"         - [{p.get('club_code')}] {p.get('name')} (Approval Status: {p.get('approval_status')})")
    else:
        print(f"  [STATUS {res_admin.status_code}] /api/v1/clubs?approval_status=requested: {res_admin.text[:100]}")
else:
    print("  [SKIP] Admin token not available")

db.close()
print("\n" + "=" * 60)
print("API VERIFICATION COMPLETE")
print("=" * 60)
