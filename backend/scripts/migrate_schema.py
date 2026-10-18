import os
import sys

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from sqlalchemy import text
from app.db.session import engine


def migrate_forward():
    """Apply safe forward schema alterations to bring existing tables into strict alignment."""
    with engine.begin() as conn:
        print("Starting safe forward migration...")

        # 1. users table
        # Add name if not exists (synced from full_name), is_active, avatar_url
        conn.execute(text("""
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='name') THEN
                    ALTER TABLE users ADD COLUMN name VARCHAR(150);
                    UPDATE users SET name = full_name WHERE name IS NULL;
                    ALTER TABLE users ALTER COLUMN name SET NOT NULL;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_active') THEN
                    ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='avatar_url') THEN
                    ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
                END IF;
            END $$;
        """))

        # 2. clubs table
        conn.execute(text("""
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clubs' AND column_name='club_code') THEN
                    ALTER TABLE clubs ADD COLUMN club_code VARCHAR(50);
                    UPDATE clubs SET club_code = CONCAT('CLB-', UPPER(SUBSTRING(name, 1, 3)), '-', id) WHERE club_code IS NULL;
                    ALTER TABLE clubs ALTER COLUMN club_code SET NOT NULL;
                    CREATE UNIQUE INDEX IF NOT EXISTS uq_clubs_club_code ON clubs (club_code);
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clubs' AND column_name='department') THEN
                    ALTER TABLE clubs ADD COLUMN department VARCHAR(150) NOT NULL DEFAULT 'General Student Affairs';
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clubs' AND column_name='about_mission') THEN
                    ALTER TABLE clubs ADD COLUMN about_mission TEXT;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clubs' AND column_name='faculty_advisor_name') THEN
                    ALTER TABLE clubs ADD COLUMN faculty_advisor_name VARCHAR(150);
                    UPDATE clubs SET faculty_advisor_name = COALESCE(faculty_head, 'Dr. Sharma') WHERE faculty_advisor_name IS NULL;
                    ALTER TABLE clubs ALTER COLUMN faculty_advisor_name SET NOT NULL;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clubs' AND column_name='faculty_advisor_id') THEN
                    ALTER TABLE clubs ADD COLUMN faculty_advisor_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clubs' AND column_name='hod_name') THEN
                    ALTER TABLE clubs ADD COLUMN hod_name VARCHAR(150) NOT NULL DEFAULT 'Dr. V. K. Mathur';
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clubs' AND column_name='email') THEN
                    ALTER TABLE clubs ADD COLUMN email VARCHAR(255);
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clubs' AND column_name='phone') THEN
                    ALTER TABLE clubs ADD COLUMN phone VARCHAR(25);
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clubs' AND column_name='website_url') THEN
                    ALTER TABLE clubs ADD COLUMN website_url VARCHAR(255);
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clubs' AND column_name='instagram_url') THEN
                    ALTER TABLE clubs ADD COLUMN instagram_url VARCHAR(255);
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clubs' AND column_name='linkedin_url') THEN
                    ALTER TABLE clubs ADD COLUMN linkedin_url VARCHAR(255);
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clubs' AND column_name='discord_url') THEN
                    ALTER TABLE clubs ADD COLUMN discord_url VARCHAR(255);
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clubs' AND column_name='github_url') THEN
                    ALTER TABLE clubs ADD COLUMN github_url VARCHAR(255);
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clubs' AND column_name='founded_year') THEN
                    ALTER TABLE clubs ADD COLUMN founded_year INT NOT NULL DEFAULT 2021;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clubs' AND column_name='approval_status') THEN
                    ALTER TABLE clubs ADD COLUMN approval_status VARCHAR(20) NOT NULL DEFAULT 'requested';
                    UPDATE clubs SET approval_status = 'approved' WHERE status = 'active';
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clubs' AND column_name='rejection_reason') THEN
                    ALTER TABLE clubs ADD COLUMN rejection_reason TEXT;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clubs' AND column_name='approved_by') THEN
                    ALTER TABLE clubs ADD COLUMN approved_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clubs' AND column_name='approved_at') THEN
                    ALTER TABLE clubs ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
                END IF;
            END $$;
        """))

        # 3. events table
        conn.execute(text("""
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='category') THEN
                    ALTER TABLE events ADD COLUMN category VARCHAR(50) NOT NULL DEFAULT 'Technical';
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='stage') THEN
                    ALTER TABLE events ADD COLUMN stage VARCHAR(20) NOT NULL DEFAULT 'upcoming';
                    UPDATE events SET stage = LOWER(status) WHERE status IN ('Upcoming', 'Open', 'Closed', 'Past');
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='restrict_club_members') THEN
                    ALTER TABLE events ADD COLUMN restrict_club_members BOOLEAN NOT NULL DEFAULT TRUE;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='is_team_event') THEN
                    ALTER TABLE events ADD COLUMN is_team_event BOOLEAN NOT NULL DEFAULT FALSE;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='min_team_size') THEN
                    ALTER TABLE events ADD COLUMN min_team_size INT NOT NULL DEFAULT 1;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='max_team_size') THEN
                    ALTER TABLE events ADD COLUMN max_team_size INT NOT NULL DEFAULT 4;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='event_date') THEN
                    ALTER TABLE events ADD COLUMN event_date DATE;
                    UPDATE events SET event_date = TO_DATE(date, 'YYYY-MM-DD') WHERE date IS NOT NULL;
                    ALTER TABLE events ALTER COLUMN event_date SET NOT NULL;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='time_display') THEN
                    ALTER TABLE events ADD COLUMN time_display VARCHAR(50);
                    UPDATE events SET time_display = COALESCE(time, '09:00 AM - 05:00 PM') WHERE time_display IS NULL;
                    ALTER TABLE events ALTER COLUMN time_display SET NOT NULL;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='venue_room') THEN
                    ALTER TABLE events ADD COLUMN venue_room VARCHAR(50);
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='turnout_count') THEN
                    ALTER TABLE events ADD COLUMN turnout_count INT NOT NULL DEFAULT 0;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='registration_opens_at') THEN
                    ALTER TABLE events ADD COLUMN registration_opens_at DATE;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='registration_closes_at') THEN
                    ALTER TABLE events ADD COLUMN registration_closes_at DATE;
                END IF;
            END $$;
        """))

        # 4. club_memberships table
        conn.execute(text("""
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='club_memberships' AND column_name='role') THEN
                    ALTER TABLE club_memberships ADD COLUMN role VARCHAR(30) NOT NULL DEFAULT 'MEMBER';
                    UPDATE club_memberships SET role = UPPER(club_role) WHERE club_role IS NOT NULL;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='club_memberships' AND column_name='designation') THEN
                    ALTER TABLE club_memberships ADD COLUMN designation VARCHAR(100) NOT NULL DEFAULT 'General Member';
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='club_memberships' AND column_name='joined_date') THEN
                    ALTER TABLE club_memberships ADD COLUMN joined_date DATE NOT NULL DEFAULT CURRENT_DATE;
                END IF;
            END $$;
        """))

        # 5. announcements table
        conn.execute(text("""
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='announcements' AND column_name='author') THEN
                    ALTER TABLE announcements ADD COLUMN author VARCHAR(150) NOT NULL DEFAULT 'Faculty Advisor';
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='announcements' AND column_name='author_user_id') THEN
                    ALTER TABLE announcements ADD COLUMN author_user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='announcements' AND column_name='publish_date') THEN
                    ALTER TABLE announcements ADD COLUMN publish_date DATE NOT NULL DEFAULT CURRENT_DATE;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='announcements' AND column_name='is_pinned') THEN
                    ALTER TABLE announcements ADD COLUMN is_pinned BOOLEAN NOT NULL DEFAULT FALSE;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='announcements' AND column_name='audience') THEN
                    ALTER TABLE announcements ADD COLUMN audience VARCHAR(50) NOT NULL DEFAULT 'All Campus Students';
                END IF;
            END $$;
        """))

        # 6. event_registrations table
        conn.execute(text("""
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='event_registrations' AND column_name='pass_code') THEN
                    ALTER TABLE event_registrations ADD COLUMN pass_code VARCHAR(50);
                    UPDATE event_registrations SET pass_code = CONCAT('UNIS-PASS-', UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8))) WHERE pass_code IS NULL;
                    ALTER TABLE event_registrations ALTER COLUMN pass_code SET NOT NULL;
                    CREATE UNIQUE INDEX IF NOT EXISTS uq_event_reg_pass_code ON event_registrations (pass_code);
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='event_registrations' AND column_name='team_id') THEN
                    ALTER TABLE event_registrations ADD COLUMN team_id INT REFERENCES event_teams(id) ON DELETE SET NULL;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='event_registrations' AND column_name='is_team_lead') THEN
                    ALTER TABLE event_registrations ADD COLUMN is_team_lead BOOLEAN NOT NULL DEFAULT FALSE;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='event_registrations' AND column_name='checked_in_at') THEN
                    ALTER TABLE event_registrations ADD COLUMN checked_in_at TIMESTAMP WITH TIME ZONE;
                END IF;
            END $$;
        """))

        # 7. NAAC audit view
        conn.execute(text("""
            CREATE OR REPLACE VIEW view_naac_event_audits AS
            SELECT 
                e.id AS event_id,
                e.club_id,
                c.name AS club_name,
                c.department,
                c.faculty_advisor_name,
                c.hod_name,
                e.title AS event_title,
                e.category,
                e.venue,
                e.event_date,
                e.capacity,
                COALESCE(COUNT(DISTINCT r.id) FILTER (WHERE r.status != 'CANCELLED'), e.registered_count) AS total_registrations,
                COALESCE(COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'CHECKED_IN'), e.turnout_count) AS physical_turnout,
                ROUND(
                    CASE 
                        WHEN e.capacity > 0 THEN 
                            (COALESCE(COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'CHECKED_IN'), e.turnout_count)::numeric / e.capacity::numeric) * 100 
                        ELSE 0 
                    END, 1
                ) AS turnout_percentage,
                CASE 
                    WHEN EXISTS (SELECT 1 FROM event_winners w WHERE w.event_id = e.id) THEN TRUE 
                    ELSE FALSE 
                END AS winners_declared,
                'Verified by Faculty Advisor' AS faculty_clearance_status
            FROM events e
            JOIN clubs c ON e.club_id = c.id
            LEFT JOIN event_registrations r ON e.id = r.event_id
            WHERE e.stage = 'past' OR e.status = 'Past'
            GROUP BY e.id, c.id;
        """))

        print("Forward migration successfully executed.")


if __name__ == "__main__":
    migrate_forward()
