"""Script to create or update an Admin account in the database without seeding mock data."""

import argparse
import os
import sys
import uuid

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.db.session import SessionLocal, engine
from app.db.base import Base
import app.models  # Ensure models are loaded
from app.models.user import User
from app.core.security import hash_password


def create_or_update_admin(email: str, password: str, name: str, phone: str = "+91 98100 00000"):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email).first()
        if user:
            print(f"[*] User with email '{email}' already exists. Updating credentials and role...")
            user.password_hash = hash_password(password)
            user.role = "ADMIN"
            user.name = name
            user.is_active = True
            user.status = "active"
            db.commit()
            print(f"[+] Successfully updated Admin account: {email}")
        else:
            print(f"[*] Creating new Admin account for '{email}'...")
            admin_user = User(
                id=f"admin_{uuid.uuid4().hex[:8]}",
                email=email,
                password_hash=hash_password(password),
                name=name,
                phone=phone,
                role="ADMIN",
                is_active=True,
                status="active",
            )
            db.add(admin_user)
            db.commit()
            print(f"[+] Successfully created Admin account: {email}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Add an Admin account to the database")
    parser.add_argument("--email", default="admin@college.edu", help="Admin email (default: admin@college.edu)")
    parser.add_argument("--password", default="Admin@2026", help="Admin password (default: Admin@2026)")
    parser.add_argument("--name", default="University Administrator", help="Admin display name (default: University Administrator)")
    parser.add_argument("--phone", default="+91 98100 00000", help="Admin phone")

    args = parser.parse_args()
    create_or_update_admin(email=args.email, password=args.password, name=args.name, phone=args.phone)
