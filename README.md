# UniSphere 🎓
### Next-Generation College Club Management & Co-Curricular Engagement Portal

[![React 19](https://img.shields.io/badge/React-19.1.0-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.0.4-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3.3-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React Router 7](https://img.shields.io/badge/React_Router-7.18.3-ca4245?logo=react-router&logoColor=white)](https://reactrouter.com/)
[![NAAC Accreditation](https://img.shields.io/badge/NAAC_Criterion-5.3_Compliant-059669)](https://www.naac.gov.in/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**UniSphere** (formerly *CampusSphere*) is a comprehensive, institutional-grade **College Club & Campus Engagement Portal** engineered to modernize student life, streamline student organization governance, automate event lifecycle administration, and track verified co-curricular learning hours for institutional accreditations (such as **NAAC Criterion 5.3**).

The platform bridges **General Students**, **Club Student Coordinators**, and **Faculty Advisors** into a single cohesive campus intranet ecosystem.

---

## 🌟 Architecture & Key Modules

```
                           ┌─────────────────────────────────────────┐
                           │            UNISPHERE PORTAL             │
                           └────────────────────┬────────────────────┘
                                                │
         ┌──────────────────────────────────────┼──────────────────────────────────────┐
         ▼                                      ▼                                      ▼
┌───────────────────┐                ┌───────────────────┐                ┌───────────────────┐
│  PUBLIC DISCOVERY │                │  STUDENT PORTAL   │                │   CLUB CONSOLE    │
├───────────────────┤                ├───────────────────┤                ├───────────────────┤
│ • Landing Page    │                │ • Executive Hero  │                │ • Command Hub     │
│ • Club Profiles   │                │ • Virtual ID Card │                │ • Lifecycle Mgmt  │
│ • Event Catalog   │                │ • 3-Stage Activity│                │ • Open Admissions │
│ • Quick RSVP      │                │ • Digital Passes  │                │ • Tasks Checklist │
│ • Demo Auth Suite │                │ • NAAC Certs      │                │ • NAAC Analytics  │
└───────────────────┘                └───────────────────┘                └───────────────────┘
```

---

### 1. 🎓 Student Experience & Co-Curricular Portal

* **Synchronized Academic Identity & Virtual Student ID Card**:
  * Displays verified academic records: **Class Roll No** (`CS24089`), **University Registration No** (`2400100345`), Degree Program (`B.Tech CSE`), Semester (`4th Sem • 2nd Year`), Academic Department, and **Blood Group** (`B+`).
  * **1-Click Virtual Campus Identity Card**: Interactive modal featuring the official **UniSphere University seal**, academic session, verified portrait, barcode simulator, and **"Print ID Card"** / **"Save Digital ID"** actions.
  * **Interactive Profile Manager**: Real-time View vs. Edit mode with bio statement, skills & interest tag manager, and developer links (GitHub, LinkedIn) backed by `localStorage` persistence.

* **Dynamic 4-Metric Co-Curricular Strip & Progress Bar**:
  * **Reserved Passes**: Real-time count of confirmed upcoming sessions with direct tab switching.
  * **Clubs Joined**: Active memberships under frictionless zero-code admissions.
  * **Accredited Certificates**: Ready institutional completion certificates.
  * **Co-Curricular Learning Hours**: Tracks hours against graduation credit requirements (e.g. *16 / 40 Target Hours logged • 40% complete*) with an integrated progress bar toward the **Dean's Co-Curricular Honor Roll**.

* **3-Stage Campus Activity Hub on the Main Dashboard**:
  * **My Passes Tab**: Confirmed tickets with seat pass IDs (`PASS-E1-2026`), organizing club links, reporting times, and venue rooms.
  * **Open for RSVP (Trending) Tab**: Live campus events with real-time seat capacity fill meters and an in-place **"Quick RSVP"** modal for 1-click seat reservations.
  * **Winners Podium Tab**: Concluded hackathons, competitions, and technical showcases spotlighting 1st, 2nd, and 3rd place champions with awards and project details.

* **Digital Hall Tickets & Accredited Certificates (`/student/registrations`)**:
  * **Verified Hall Ticket Modal**: Simulated QR/barcode scanner block, attendee identification, venue guidelines, and print/download options.
  * **Institutional Certificate of Completion**: **NAAC Criterion 5.3 compliant** completion credential featuring verified student details, event title, Faculty Advisor & HOD signature endorsements, unique credential ID, and instant PDF download.
  * **Safe Cancellation Workflow**: Confirmation prompt preventing accidental seat forfeiture with instantaneous capacity release back to the event pool.

* **Explore Campus Clubs Catalog (`/student/explore`)**:
  * Dedicated showcase with live search and category filtering (*Computer Science*, *Engineering*, *Arts & Culture*, *Entrepreneurship*).
  * Every club card across the catalog and dashboard links directly to that club's rich public profile (`/student/explore/${club.id}`).

---

### 2. ⚡ Club Coordinator Operations & Command Hub

* **Unified Executive Command Dashboard (`/club/dashboard`)**:
  * **Verified Faculty Advisor & Unique Club Code Banner**: Highlights Faculty Head (`Dr. Sharma`), Academic Department, HOD (`Dr. V. K. Mathur`), and **Unique Club Code (`BW-CSE-2026`)** with 1-click clipboard copy.
  * **Live Executive KPI Strip**: Dynamically aggregates enrolled members, scheduled activities, student RSVPs, and operational tasks.
  * **In-Place Modals**: Create operational tasks or broadcast campus bulletins directly from the main command dashboard.

* **4-Stage Event Lifecycle Architecture (`/club/events`)**:
  * Complete lifecycle state machine:
    $$\text{Announced (Upcoming)} \longrightarrow \text{Open for Registration} \longrightarrow \text{Registration Closed} \longrightarrow \text{Event Completed / Past}$$
  * Transition events between stages directly on the dashboard or inside the event management console.
  * Dynamic event creation & editing with banners, eligibility, capacity limits, rules, and venue details.
  * Concluded events feature an interactive **Champions & Winners Podium** declaration (1st, 2nd, and 3rd place with medals, cash prizes, and project titles).

* **Zero-Code Open Admissions Roster (`/club/members`)**:
  * Frictionless student enrollment — eliminates cumbersome invitation codes and allows students to join directly by submitting verified academic credentials.
  * Clear hierarchy between **Core Executive Leadership** (Coordinators, Technical Leads, Event Managers) and **General Members**.
  * Dynamic role promotion/demotion and 1-click member removal.

* **Operational Task Checklist (`/club/tasks`)**:
  * Categorized task tracker: *Technical*, *Publicity*, *Logistics*, *Permissions*, and *General*.
  * Priority filter pills (*High*, *Medium*, *Low*) and interactive completion toggles.
  * In-place **Add Task** and **Edit Task** modals with assignee attribution and target due dates.

* **Campus Bulletins & Announcement Dispatch (`/club/announcements`)**:
  * Dispatches official bulletins with operational tags: *🔥 Event Alert*, *👥 Leadership Call*, *⚡ Workshop & Tech*, and *📌 General Notice*.
  * Priority flags (*Standard* vs *🔴 Urgent Notice*) and target audience selectors (*All Campus Students*, *Club Members Only*, *Event Attendees*).
  * Synchronizes dynamically with the public club profile's Notices tab and features 1-click clipboard copy.

* **Performance Intelligence & NAAC Accreditation Analytics (`/club/analytics`)**:
  * Dynamic KPIs: **Intranet Reach (1,450+)**, **Club Members**, **Total Signups**, **Capacity Turnout Rate (92%)**, **Certificates Issued**, and **Satisfaction Rating (4.92/5.0)**.
  * Time Horizon Selector: *Current Term (Spring 2026)*, *Autumn 2025*, *Academic Year 2025-26*, and *All-Time Record*.
  * Visual capacity vs turnout fill meters and inter-disciplinary branch diversity breakdowns (CSE, IT, ECE, ME).
  * **Official Departmental NAAC Criterion 5 Accreditation Audit Table**: Ready for IQAC inspections with 1-click report export/print action.

* **Club Profile & Leadership Management (`/club/manage`)**:
  * Customizable banner, emblem logo, about mission statement, faculty advisor endorsement, parent department, social links, and club code.

---

### 3. 🌐 Public Discovery & Presentation Layer

* **Rich Public Club Profiles (`/clubs/:id` & `/student/explore/:id`)**:
  * Multi-tab navigation: **Overview**, **Events** (with lifecycle stage filters), **Notices & Announcements**, **Core Leadership Team**, and **Photo Gallery**.
  * Context-aware actions: General students see registration buttons; club coordinators viewing public pages see an inspection overview.
* **Campus Event Discovery (`/events`)**:
  * 4-Stage lifecycle filter pills (*All Events*, *Open for RSVP*, *Opening Soon*, *Past & Winners*).
  * Interactive **Quick RSVP Modal**, **Winners Podium Modal**, and **Ticket Pass Modal**.
* **Modern Authentication Console (`/login` & `/signup`)**:
  * 1-Click demo role switcher between Student and Club Coordinator.
  * Form validation, phone number verification, and show/hide password toggles.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) (`19.1.0`) with Modern Functional Components & Hooks |
| **Build Tool & Bundler** | [Vite 7](https://vitejs.dev/) (`7.0.4`) with `@vitejs/plugin-react` |
| **Styling & Design System** | [Tailwind CSS v4](https://tailwindcss.com/) (`4.3.3`) with `@tailwindcss/vite` & Custom Gradients |
| **Routing** | [React Router DOM](https://reactrouter.com/) (`7.18.3`) with Nested Layouts & Protected Routes |
| **Iconography** | [Lucide React](https://lucide.dev/) (`1.45.0`) + Responsive SVG Brand Icons |
| **State & Persistence** | React Context API (`AuthContext`), Storage Event Listeners & `localStorage` Helpers |
| **Institutional Standards** | **NAAC Criterion 5.3** (Student Support & Progression / Co-Curricular Metrics) |

---

## 📂 Project Directory Structure

```
club_mgmt/
├── README.md
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx                     # Route declarations & role authorization
        ├── main.jsx                    # Application root mount
        ├── index.css                   # Global styles & Tailwind imports
        ├── context/
        │   └── AuthContext.jsx         # Global authentication, memberships & event RSVPs
        ├── data/
        │   └── mockData.js             # Stored datasets & localStorage reactivity helpers
        ├── components/
        │   ├── Button.jsx              # Reusable button with variants & sizes
        │   ├── Card.jsx                # Modular card, header, and content containers
        │   └── Badge.jsx               # Color-coded badge pills
        ├── layouts/
        │   ├── DashboardLayout.jsx     # Executive dashboard shell with sidebar & user profile
        │   └── PublicLayout.jsx        # Navigation header & footer for public pages
        └── pages/
            ├── public/                 # Public & Unauthenticated Surfaces
            │   ├── LandingPage.jsx     # High-impact campus welcome portal
            │   ├── ExploreClubs.jsx    # Campus club catalog with live search
            │   ├── ClubProfile.jsx     # Multi-tab official public club profile
            │   ├── EventDiscovery.jsx  # Multi-stage event discovery & Quick RSVP
            │   ├── EventDetails.jsx    # Detailed event console with ticket access
            │   ├── Login.jsx           # Sign in with 1-click role switcher
            │   └── Signup.jsx          # Student & coordinator enrollment
            ├── student/                # Student Experience Portal
            │   ├── StudentDashboard.jsx# Main command hub, ID card, 3-stage activity hub
            │   ├── StudentProfile.jsx  # Academic records, edit mode & Virtual ID card
            │   └── MyRegistrations.jsx # Digital hall tickets & NAAC certificates
            └── club/                   # Coordinator Operations Hub
                ├── ClubDashboard.jsx   # Command center, KPI strip & lifecycle switcher
                ├── ManageEvents.jsx    # 4-stage event manager & winners podium
                ├── ManageMembers.jsx   # Zero-code open admissions member roster
                ├── Tasks.jsx           # Categorized operational to-do checklist
                ├── Announcements.jsx   # Campus bulletin dispatcher & 1-click copy
                ├── Analytics.jsx       # KPI intelligence & NAAC audit table export
                ├── ManageClub.jsx      # Club branding, governance & club code settings
                └── CreateEvent.jsx     # New event registration workflow
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Installation & Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sumeet-pi/campusphere.git
   cd campusphere/frontend
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```
   Generates an optimized production bundle inside `dist/`.

---

## 🔑 Pre-Configured Demo Credentials

Use the pre-configured credentials below or switch roles instantly using the 1-click role buttons on the [`/login`](http://localhost:5173/login) screen:

| Role | Email | Password | Pre-loaded Data & Context |
| :--- | :--- | :--- | :--- |
| **General Student** | `vikram.singh@college.edu` | `Password@2026` | Vikram Singh • B.Tech CSE 4th Sem • Roll `CS24089` • Reserved Passes • Enrolled Clubs |
| **Club Coordinator** | `coordinator@college.edu` | `ClubAdmin#2026` | Maan Saab • Lead Coordinator (`Byte Warriors`) • Full Administrative Access |

---

## 🏛️ NAAC & Institutional Accreditation Compliance

UniSphere has been architected from the ground up to support higher education accreditation bodies (such as **NAAC**, **NBA**, and **NIRF**):

* **Criterion 5.3 (Student Participation & Activities)**:
  * Automatic logging of student attendance and co-curricular learning hours.
  * Digitally verified, tamper-evident **Certificates of Completion** with unique institutional credential IDs.
  * Verified signatures of the **Faculty Advisor** and **Head of Department (HOD)**.
* **Criterion 5.3.3 (Sports & Cultural Competitions Organized)**:
  * Official event lifecycle records with turnouts, budget utilization, and winner podium declarations.
  * **1-Click Exportable NAAC Audit Table** inside Club Analytics for IQAC committee reviews.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.