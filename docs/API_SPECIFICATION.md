# UniSphere REST API Specification 🌐
### Complete Backend Interface Documentation (Mapped to Frontend Interactions)

- **Base URL**: `http://localhost:8080/api/v1`
- **Transport**: HTTPS (HTTP in development)
- **Data Format**: `application/json`
- **Authentication**: JWT Bearer Token passed via HTTP Header (`Authorization: Bearer <token>`)
- **Accreditation Standard**: NAAC Criterion 5.3 (Student Support and Progression)

---

## 1. Global Architectural Conventions

### 1.1 Standard Unified Response Envelope

All API endpoints return JSON conforming to this unified structure:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-17T15:30:00Z",
    "version": "v1.0"
  }
}
```

### 1.2 Unified Error Response Envelope

When an error occurs (`4xx` or `5xx`), the server returns a detailed, predictable error object:

```json
{
  "success": false,
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "Validation failed on submitted fields",
  "path": "/api/v1/clubs/c1/events",
  "timestamp": "2026-10-17T15:30:00Z",
  "fieldErrors": [
    {
      "field": "capacity",
      "rejectedValue": -5,
      "message": "Capacity must be an integer greater than 0"
    }
  ]
}
```

### 1.3 HTTP Status Codes Standard

| Code | Meaning | Typical Usage |
| :--- | :--- | :--- |
| `200 OK` | Standard success | Resource fetched, updated, or action completed |
| `201 Created` | Resource created | Event created, RSVP confirmed, Task dispatched |
| `204 No Content`| Success without payload | Resource deleted or soft-cancelled |
| `400 Bad Request`| Client syntax or validation failure | Malformed payload, invalid stage transition |
| `401 Unauthorized` | Missing / expired token | Unauthenticated user accessing private route |
| `403 Forbidden` | Access denied for user role | General student attempting coordinator mutation |
| `404 Not Found` | Resource absent | Event ID, Club ID, or Credential ID does not exist |
| `409 Conflict` | Unique constraint violated | Duplicate RSVP pass, duplicate club code |
| `500 Server Error`| Internal unexpected exception | Database connectivity failure, unhandled crash |

---

## 2. Authentication & Authorization (`/api/v1/auth`)

### 2.1 User Login
* **Method & Path**: `POST /api/v1/auth/login`
* **Access**: Public
* **Consumed By**: [`Login.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/public/Login.jsx)
* **Description**: Authenticates a student or coordinator using email & password or pre-configured role shortcuts.
* **Request Body**:
```json
{
  "email": "vikram.singh@college.edu",
  "password": "Password@2026"
}
```
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Authentication successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpcy1pcy1hLXJlZnJlc2gtdG9rZW4...",
    "expiresIn": 86400,
    "user": {
      "id": "u5",
      "name": "Vikram Singh",
      "email": "vikram.singh@college.edu",
      "role": "GENERAL_STUDENT",
      "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      "registeredEventIds": ["e1", "e2"],
      "joinedClubIds": ["c1"]
    }
  }
}
```
* **Errors**: 
  * `400 Bad Request` — Missing or malformed credentials.
  * `401 Unauthorized` — Invalid email or password.
  * `403 Forbidden` (`error: "CLUB_NOT_YET_APPROVED"`) — Triggered when a coordinator attempts to sign in for a club whose `approval_status == 'requested'`. Returns message: `"Your club registration is not yet approved by university admin. Status: Requested."`
  * `403 Forbidden` (`error: "CLUB_REJECTED"`) — Triggered when a coordinator attempts to sign in for a club whose `approval_status == 'rejected'`. Returns message: `"Your club was rejected: [rejectionReason]"`

---

### 2.2 User Registration
* **Method & Path**: `POST /api/v1/auth/signup`
* **Access**: Public
* **Consumed By**: [`Signup.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/public/Signup.jsx)
* **Description**: Enrolls a student or coordinator into the university portal with verified credentials.
* **Request Body**:
```json
{
  "name": "Vikram Singh",
  "email": "vikram.singh@college.edu",
  "password": "Password@2026",
  "phone": "+91 98765 43210",
  "role": "GENERAL_STUDENT",
  "course": "B.Tech",
  "branch": "Computer Science & Engineering",
  "semester": "4th Sem",
  "classRollNo": "CS24089",
  "universityRollNo": "2400100345",
  "department": "Computer Science & Engineering"
}
```
* **Success Response (`201 Created`)**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Account created successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "u5",
      "name": "Vikram Singh",
      "email": "vikram.singh@college.edu",
      "role": "GENERAL_STUDENT"
    }
  }
}
```
* **Errors**: `400 Bad Request` (Validation errors), `409 Conflict` ("Roll number or email already registered").

---

### 2.3 Get Current Authenticated User Context
* **Method & Path**: `GET /api/v1/auth/me`
* **Access**: Authenticated (`GENERAL_STUDENT`, `CLUB_COORDINATOR`, `FACULTY_HEAD`, `ADMIN`)
* **Consumed By**: [`AuthContext.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/context/AuthContext.jsx)
* **Description**: Returns currently authenticated session data, role, joined club IDs, and active pass IDs.
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "u5",
    "name": "Vikram Singh",
    "email": "vikram.singh@college.edu",
    "role": "GENERAL_STUDENT",
    "registeredEventIds": ["e1", "e2"],
    "joinedClubIds": ["c1"]
  }
}
```

---

## 3. Student Profile & Identity (`/api/v1/students`)

### 3.1 Get Student Profile
* **Method & Path**: `GET /api/v1/students/me`
* **Access**: Authenticated Student / Coordinator
* **Consumed By**: [`StudentProfile.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/student/StudentProfile.jsx), [`StudentDashboard.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/student/StudentDashboard.jsx)
* **Description**: Retrieves full academic credentials, emergency info, skills, interests, and co-curricular hours.
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "u5",
    "name": "Vikram Singh",
    "email": "vikram.singh@college.edu",
    "phone": "+91 98765 43210",
    "course": "B.Tech",
    "branch": "Computer Science & Engineering",
    "sem": "4th Sem",
    "year": "2nd Year",
    "classRollNo": "CS24089",
    "universityRollNo": "2400100345",
    "department": "Computer Science & Engineering",
    "admissionYear": 2024,
    "graduatingYear": 2028,
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    "bio": "2nd Year Computer Science undergraduate passionate about full-stack engineering and competitive programming.",
    "bloodGroup": "B+",
    "emergencyContact": "+91 98111 22233",
    "github": "https://github.com/vikram-singh",
    "linkedin": "https://linkedin.com/in/vikram-singh-dev",
    "coCurricularHours": 16.0,
    "targetHours": 40.0,
    "skills": ["JavaScript", "React", "Node.js", "Python", "Tailwind CSS", "Git & GitHub", "Data Structures"],
    "interests": ["Hackathons", "Web Development", "Robotics", "Public Speaking", "System Design"]
  }
}
```

---

### 3.2 Update Student Profile
* **Method & Path**: `PUT /api/v1/students/me`
* **Access**: Authenticated Student
* **Consumed By**: [`StudentProfile.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/student/StudentProfile.jsx) (Edit Mode)
* **Description**: Modifies personal statement, contact telephone, avatar, blood group, emergency contact, and portfolio links.
* **Request Body**:
```json
{
  "name": "Vikram Singh",
  "phone": "+91 98765 43210",
  "bio": "Updated bio statement...",
  "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
  "bloodGroup": "B+",
  "emergencyContact": "+91 98111 22233",
  "github": "https://github.com/vikram-singh",
  "linkedin": "https://linkedin.com/in/vikram-singh-dev",
  "skills": ["React.js", "Python", "Docker"],
  "interests": ["Cloud Computing", "Hackathons"]
}
```
* **Success Response (`200 OK`)**: Returns updated student profile object.

---

### 3.3 Get Virtual Campus Identity Card Payload
* **Method & Path**: `GET /api/v1/students/me/id-card`
* **Access**: Authenticated Student
* **Consumed By**: Virtual Student ID Card Modal in [`StudentDashboard.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/student/StudentDashboard.jsx) and [`StudentProfile.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/student/StudentProfile.jsx)
* **Description**: Generates formatted digital identity pass with simulated barcode string, university seal, and session code.
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "institutionName": "UNISPHERE UNIVERSITY",
    "academicSession": "SESSION 2024-28",
    "name": "Vikram Singh",
    "course": "B.Tech in Computer Science & Engineering",
    "classRollNo": "CS24089",
    "universityRollNo": "2400100345",
    "semesterYear": "4th Sem (2nd Year)",
    "department": "Computer Science & Engineering",
    "bloodGroup": "B+",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    "barcodeString": "UNI-STUDENT-CS24089-2026",
    "barcodeVisual": "||| | |||| | |||||| || | |||| ||",
    "isValidated": true
  }
}
```

---

### 3.4 Search Campus Student Directory (Autocomplete) 🔍
* **Method & Path**: `GET /api/v1/students/search`
* **Access**: Authenticated (`GENERAL_STUDENT`, `CLUB_COORDINATOR`, `FACULTY_HEAD`)
* **Consumed By**:
  1. **Coordinator "Add Member" Modal** in [`ManageMembers.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/club/ManageMembers.jsx) (live search results appear directly beneath input field).
  2. **Student Team RSVP Modal** in [`EventDiscovery.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/public/EventDiscovery.jsx) and [`StudentDashboard.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/student/StudentDashboard.jsx) (search and select teammates for Hackathons/contests).
* **Query Parameters**:
  * `q` (*required*): Search query matching student full name, class roll number, university roll number, or college email.
  * `clubId` (*optional*): If provided, returns `isClubMember: true` if student already holds a membership tag in that club.
  * `eventId` (*optional*): If provided, returns `isAlreadyRegistered: true` if student already holds a pass for that event.
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "u6",
      "name": "Ayush Sharma",
      "classRollNo": "CS24012",
      "universityRollNo": "2400100112",
      "email": "ayush.sharma@college.edu",
      "phone": "+91 98111 22334",
      "course": "B.Tech",
      "branch": "Computer Science & Engineering",
      "year": "2nd Year",
      "department": "CSE",
      "avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6",
      "isClubMember": false,
      "isAlreadyRegistered": false
    },
    {
      "id": "u7",
      "name": "Priya Roy",
      "classRollNo": "CS25034",
      "universityRollNo": "2400100456",
      "email": "priya.roy@college.edu",
      "phone": "+91 98222 33445",
      "course": "B.Tech",
      "branch": "Computer Science & Engineering",
      "year": "3rd Year",
      "department": "CSE",
      "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      "isClubMember": true,
      "isAlreadyRegistered": false
    }
  ]
}
```

---

## 4. Clubs & Public Profiles (`/api/v1/clubs`)

### 4.1 List Clubs (Catalog & Search)
* **Method & Path**: `GET /api/v1/clubs`
* **Access**: Public / Student
* **Consumed By**: [`ExploreClubs.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/public/ExploreClubs.jsx), [`StudentDashboard.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/student/StudentDashboard.jsx)
* **Query Parameters**:
  * `category` (*optional*): `Computer Science`, `Engineering`, `Arts & Culture`, `Entrepreneurship`, `All`
  * `search` (*optional*): Matches name, description, advisor, or department.
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "c1",
      "clubCode": "BW-CSE-2026",
      "name": "Byte Warriors",
      "category": "Computer Science",
      "department": "Computer Science & Engineering",
      "facultyAdvisor": "Dr. Sharma",
      "hod": "Dr. V. K. Mathur",
      "memberCount": 128,
      "upcomingEventsCount": 6,
      "description": "The official coding and technology club of the CSE Department.",
      "logo": "https://api.dicebear.com/7.x/shapes/svg?seed=ByteWarriors",
      "banner": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97"
    }
  ]
}
```

---

### 4.2 Get Detailed Club Profile
* **Method & Path**: `GET /api/v1/clubs/:clubId`
* **Access**: Public
* **Consumed By**: [`ClubProfile.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/public/ClubProfile.jsx)
* **Description**: Fetches multi-tab public profile content including governance, leadership roster, upcoming/past events, notices, and gallery.
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "c1",
    "clubCode": "BW-CSE-2026",
    "name": "Byte Warriors",
    "category": "Computer Science",
    "department": "Computer Science & Engineering",
    "facultyAdvisor": "Dr. Sharma",
    "hod": "Dr. V. K. Mathur",
    "about": "Byte Warriors is dedicated to fostering coding culture...",
    "email": "bytewarriors@college.edu",
    "phone": "+91 98765 00001",
    "memberCount": 128,
    "coreTeam": [
      {
        "id": "u2",
        "name": "Aarav Kumar",
        "role": "Student Coordinator",
        "year": "3rd Year",
        "department": "CSE"
      }
    ],
    "socials": {
      "instagram": "https://instagram.com/bytewarriors",
      "linkedin": "https://linkedin.com/company/bytewarriors",
      "github": "https://github.com/bytewarriors"
    },
    "gallery": [
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97"
    ]
  }
}
```

---

### 4.3 Update Club Profile & Governance Settings
* **Method & Path**: `PUT /api/v1/clubs/:clubId`
* **Access**: Club Coordinator / Admin
* **Consumed By**: [`ManageClub.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/club/ManageClub.jsx)
* **Request Body**:
```json
{
  "clubCode": "BW-CSE-2026",
  "name": "Byte Warriors",
  "description": "Updated description...",
  "about": "Comprehensive mission mandate...",
  "facultyAdvisor": "Dr. Sharma",
  "hod": "Dr. V. K. Mathur",
  "email": "bytewarriors@college.edu",
  "phone": "+91 98765 00001",
  "banner": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
  "logo": "https://api.dicebear.com/7.x/shapes/svg?seed=ByteWarriors"
}
```
* **Success Response (`200 OK`)**: Updated club entity.

---

### 4.4 Register New Campus Club (Lodges Request)
* **Method & Path**: `POST /api/v1/clubs`
* **Access**: Faculty Coordinator / Student Lead
* **Consumed By**: [`Signup.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/public/Signup.jsx) (Register Club tab)
* **Description**: Submits an application to establish a new student club. Automatically sets `approval_status = 'requested'`. The club remains locked until a university administrator reviews and approves it.
* **Request Body**:
```json
{
  "name": "FinTech & Blockchain Society",
  "category": "Finance & Technology",
  "department": "Management & Computer Applications",
  "coordinatorTeacher": "Dr. Neha Verma",
  "hod": "Dr. V. K. Mathur",
  "email": "fintech.society@college.edu",
  "phone": "+91 98101 23456",
  "password": "Password@2026",
  "description": "Pioneering student financial literacy, blockchain architectures, and quantitative trading."
}
```
* **Success Response (`201 Created`)**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Club registration request submitted successfully. Pending administrative approval.",
  "data": {
    "id": "c_pending",
    "referenceId": "REQ-2026-MGT-4821",
    "name": "FinTech & Blockchain Society",
    "approvalStatus": "requested",
    "status": "Requested",
    "submittedAt": "2026-10-17T17:30:00Z"
  }
}
```
* **Errors**: `400 Bad Request` (Missing required department or advisor), `409 Conflict` ("Club name or code already exists").

---

## 5. Zero-Code Open Admissions & Membership (`/api/v1/clubs/:clubId/members`)

### 5.1 List Club Members (Core Team & General Members)
* **Method & Path**: `GET /api/v1/clubs/:clubId/members`
* **Access**: Coordinator / Student
* **Consumed By**: [`ManageMembers.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/club/ManageMembers.jsx), [`ClubDashboard.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/club/ClubDashboard.jsx)
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "totalMembers": 128,
    "coreTeamCount": 8,
    "generalMemberCount": 120,
    "members": [
      {
        "id": "u5",
        "name": "Vikram Singh",
        "email": "vikram.singh@college.edu",
        "phone": "+91 98765 43210",
        "course": "B.Tech",
        "branch": "CSE",
        "semester": "4th Sem",
        "classRollNo": "CS24089",
        "role": "General Member",
        "designation": "General Member",
        "status": "Active",
        "joinedDate": "2025-08-15"
      }
    ]
  }
}
```

---

### 5.2 Join Club (Zero-Code Open Enrollment)
* **Method & Path**: `POST /api/v1/clubs/:clubId/join`
* **Access**: Authenticated Student
* **Consumed By**: "Join Club" action in [`ClubProfile.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/public/ClubProfile.jsx) and [`AuthContext.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/context/AuthContext.jsx)
* **Description**: Frictionless admission — automatically joins the student with verified academic credentials without requiring an invite code.
* **Success Response (`201 Created`)**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Enrolled in Byte Warriors successfully under zero-code open admissions",
  "data": {
    "clubId": "c1",
    "clubName": "Byte Warriors",
    "role": "General Member",
    "status": "Active"
  }
}
```

---

### 5.3 Leave Club
* **Method & Path**: `DELETE /api/v1/clubs/:clubId/leave`
* **Access**: Authenticated Student
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "You have left the club"
}
```

---

### 5.4 Update Member Role / Designation (Promote / Demote)
* **Method & Path**: `PATCH /api/v1/clubs/:clubId/members/:userId/role`
* **Access**: Club Coordinator / Faculty Head
* **Consumed By**: Role change modal in [`ManageMembers.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/club/ManageMembers.jsx)
* **Request Body**:
```json
{
  "role": "CORE_TEAM",
  "designation": "Technical Event Lead"
}
```
* **Success Response (`200 OK`)**: Updated membership record.

---

## 6. Events & 4-Stage Lifecycle (`/api/v1/events`)

### 6.1 List Events (With Lifecycle Stage Filters)
* **Method & Path**: `GET /api/v1/events`
* **Access**: Public / Student
* **Consumed By**: [`EventDiscovery.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/public/EventDiscovery.jsx), [`StudentDashboard.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/student/StudentDashboard.jsx)
* **Query Parameters**:
  * `stage`: `all`, `open`, `upcoming`, `past`
  * `category`: `All`, `Technical`, `Workshop`, `Hackathon`, `Cultural`, `Competitions`
  * `search`: string
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "e1",
      "clubId": "c1",
      "clubName": "Byte Warriors",
      "title": "Campus Hackathon 2026",
      "category": "Hackathon",
      "stage": "open",
      "status": "Open",
      "date": "2026-10-24",
      "time": "09:00 AM - 05:00 PM",
      "venue": "Main Auditorium & CS Labs",
      "capacity": 200,
      "registeredCount": 180,
      "description": "Annual 24-hour hackathon with AI, Web3, and HealthTech tracks.",
      "image": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
      "restrictClubMembers": true,
      "isTeamEvent": true,
      "minTeamSize": 2,
      "maxTeamSize": 4,
      "isRegistered": false,
      "isClubMember": false,
      "canRegister": true,
      "restrictionReason": null
    }
  ]
}
```

---

### 6.2 Get Single Event Console Details
* **Method & Path**: `GET /api/v1/events/:eventId`
* **Access**: Public / Student
* **Consumed By**: [`EventDetails.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/public/EventDetails.jsx)
* **Success Response (`200 OK`)**: Returns complete event metadata, venue, rules array, eligibility, team constraints (`isTeamEvent`, `minTeamSize`, `maxTeamSize`), and membership restriction indicators (`isClubMember`, `canRegister`).

---

### 6.3 Create Event
* **Method & Path**: `POST /api/v1/clubs/:clubId/events`
* **Access**: Club Coordinator / Faculty Head
* **Consumed By**: [`CreateEvent.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/club/CreateEvent.jsx)
* **Request Body**:
```json
{
  "title": "Algorithmic Arena 2026",
  "category": "Technical",
  "stage": "open",
  "restrictClubMembers": true,
  "isTeamEvent": false,
  "date": "2026-11-15",
  "time": "02:00 PM - 06:00 PM",
  "venue": "Seminar Hall A",
  "capacity": 100,
  "description": "Dynamic programming and graph algorithms championship.",
  "eligibility": "B.Tech & BCA students",
  "image": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
  "rules": ["Strict time limit", "No external libraries"]
}
```
* **Success Response (`201 Created`)**: Created event payload.

---

### 6.4 Transition Event Lifecycle Stage
* **Method & Path**: `PATCH /api/v1/events/:eventId/stage`
* **Access**: Club Coordinator / Faculty Head
* **Consumed By**: In-place stage transition dropdowns on [`ClubDashboard.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/club/ClubDashboard.jsx) and [`ManageEvents.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/club/ManageEvents.jsx)
* **Request Body**:
```json
{
  "stage": "past",
  "status": "Past"
}
```
* **Valid Transitions**:
  * `upcoming` &rarr; `open` (Opens RSVPs)
  * `open` &rarr; `closed` (Halts RSVPs)
  * `closed` &rarr; `past` (Marks completed & enables certificate/winner workflows)
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Event lifecycle stage transitioned to 'past'",
  "data": {
    "eventId": "e1",
    "stage": "past",
    "status": "Past"
  }
}
```

---

## 7. Event Registrations & Digital Passes (`/api/v1/registrations`)

### 7.1 Individual Quick RSVP / Reserve Pass
* **Method & Path**: `POST /api/v1/events/:eventId/rsvp`
* **Access**: Authenticated Student
* **Consumed By**: Quick RSVP Modal in [`EventDiscovery.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/public/EventDiscovery.jsx) and [`StudentDashboard.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/student/StudentDashboard.jsx)
* **Description**: Pre-fills student credentials and issues verified digital admission pass.
* **Membership Tag Restriction Validation**:
  * If the authenticated student has an active membership tag in the event's organizing club (`joinedClubIds.includes(event.clubId)`) AND `event.restrictClubMembers == true`, registration is **blocked**.
* **Success Response (`201 Created`)**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Seat confirmed! Digital Hall Ticket issued.",
  "data": {
    "registrationId": "r101",
    "eventId": "e1",
    "eventTitle": "Campus Hackathon 2026",
    "passCode": "PASS-E1-2026-CS24089",
    "attendeeName": "Vikram Singh",
    "classRollNo": "CS24089",
    "status": "CONFIRMED",
    "reportingTime": "09:00 AM",
    "venue": "Main Auditorium & CS Labs"
  }
}
```
* **Error Responses**:
  * `403 Forbidden` (`CLUB_MEMBER_CANNOT_REGISTER`):
    ```json
    {
      "success": false,
      "statusCode": 403,
      "error": "CLUB_MEMBER_CANNOT_REGISTER",
      "message": "You are a member of Byte Warriors. Organizing club members cannot register as participants for their own club's events."
    }
    ```
  * `400 Bad Request` ("Event capacity reached").
  * `409 Conflict` ("Already registered for this event").

---

### 7.2 Team RSVP / Reserve Team Passes (Hackathons & Competitions) 👥
* **Method & Path**: `POST /api/v1/events/:eventId/team-rsvp`
* **Access**: Authenticated Student (Team Lead)
* **Consumed By**: Team Registration in Quick RSVP Modal with **Student Search** autocomplete.
* **Description**: Registers an entire student team. Teammates are selected using the `GET /api/v1/students/search` autocomplete endpoint.
* **Request Body**:
```json
{
  "teamName": "CodeCrafters",
  "teammateUserIds": ["u6", "u7"]
}
```
* **Validations**:
  * Neither team lead nor any teammate can hold a membership tag in the organizing club.
  * Total team members (lead + teammates) must be between `minTeamSize` and `maxTeamSize`.
  * None of the selected teammates may already be registered for the event.
* **Success Response (`201 Created`)**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Team RSVP confirmed! Team Hall Tickets issued.",
  "data": {
    "teamId": "team_101",
    "teamName": "CodeCrafters",
    "teamPassCode": "TEAM-E1-CODECRAFTERS-2026",
    "eventTitle": "Campus Hackathon 2026",
    "teamLead": {
      "id": "u5",
      "name": "Vikram Singh",
      "classRollNo": "CS24089"
    },
    "members": [
      {
        "id": "u6",
        "name": "Ayush Sharma",
        "classRollNo": "CS24012",
        "passCode": "PASS-E1-2026-CS24012"
      },
      {
        "id": "u7",
        "name": "Priya Roy",
        "classRollNo": "CS25034",
        "passCode": "PASS-E1-2026-CS25034"
      }
    ]
  }
}
```
* **Error Responses**:
  * `403 Forbidden` (`TEAMMATE_IS_CLUB_MEMBER`): *"Teammate Ayush Sharma is a member of the organizing club and cannot participate."*
  * `400 Bad Request` (`INVALID_TEAM_SIZE`): *"Team size must be between 2 and 4 members."*
  * `409 Conflict` (`TEAMMATE_ALREADY_REGISTERED`): *"Teammate Priya Roy is already registered in another team."*

---

### 7.2 Cancel RSVP (Safe Seat Forfeiture)
* **Method & Path**: `DELETE /api/v1/events/:eventId/rsvp`
* **Access**: Authenticated Student
* **Consumed By**: Safe Cancellation modal in [`MyRegistrations.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/student/MyRegistrations.jsx) and [`StudentDashboard.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/student/StudentDashboard.jsx)
* **Description**: Cancels registration and instantly releases capacity back to the event pool.
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Registration cancelled. Your seat pass has been released."
}
```

---

### 7.3 Get Student's Registrations & Passes
* **Method & Path**: `GET /api/v1/student/registrations`
* **Access**: Authenticated Student
* **Consumed By**: [`MyRegistrations.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/student/MyRegistrations.jsx)
* **Query Parameters**: `tab`: `upcoming` | `past`
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "activePassesCount": 2,
    "completedEventsCount": 1,
    "certificatesReadyCount": 1,
    "coCurricularHours": 16.0,
    "registrations": [
      {
        "id": "r101",
        "eventId": "e1",
        "passCode": "PASS-E1-2026",
        "eventTitle": "Campus Hackathon 2026",
        "clubId": "c1",
        "clubName": "Byte Warriors",
        "date": "2026-10-24",
        "time": "09:00 AM - 05:00 PM",
        "venue": "Main Auditorium & CS Labs",
        "status": "CONFIRMED"
      }
    ]
  }
}
```

---

### 7.4 Gate Scanner Attendance Check-In
* **Method & Path**: `PATCH /api/v1/events/:eventId/registrations/:passCode/check-in`
* **Access**: Coordinator / Security Gate
* **Description**: Verifies digital barcode pass and marks physical attendance.
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Verified! Student checked in.",
  "data": {
    "studentName": "Vikram Singh",
    "classRollNo": "CS24089",
    "checkInTime": "2026-10-24T08:52:10Z"
  }
}
```

---

## 8. Champions & Winners Podium (`/api/v1/events/:eventId/winners`)

### 8.1 Get Event Winners Podium
* **Method & Path**: `GET /api/v1/events/:eventId/winners`
* **Access**: Public
* **Consumed By**: Winners Podium Modal in [`EventDiscovery.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/public/EventDiscovery.jsx) and [`StudentDashboard.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/student/StudentDashboard.jsx)
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "rankPosition": 1,
      "rank": "1st Place",
      "name": "Siddharth Varma",
      "branch": "CSE 4th Year",
      "prize": "₹12,000 + Merit Medal",
      "projectTitle": "AI Healthcare Diagnostics Engine"
    },
    {
      "rankPosition": 2,
      "rank": "2nd Place",
      "name": "Megha Roy",
      "branch": "CSE 3rd Year",
      "prize": "₹8,000 + Merit Medal",
      "projectTitle": "Decentralized Micro-Grid"
    },
    {
      "rankPosition": 3,
      "rank": "3rd Place",
      "name": "Arjun Nair",
      "branch": "ECE 3rd Year",
      "prize": "₹4,000 + Merit Medal",
      "projectTitle": "IoT Autonomous Drone Patrol"
    }
  ]
}
```

---

### 8.2 Declare / Update Winners Podium
* **Method & Path**: `POST /api/v1/events/:eventId/winners`
* **Access**: Club Coordinator / Faculty Head
* **Consumed By**: Champions Declaration in [`ManageEvents.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/club/ManageEvents.jsx)
* **Request Body**:
```json
{
  "winners": [
    {
      "rank": "1st Place",
      "name": "Siddharth Varma",
      "branch": "CSE 4th Year",
      "prize": "₹12,000 + Merit Medal",
      "projectTitle": "AI Diagnostics"
    }
  ]
}
```
* **Success Response (`200 OK`)**: Declared podium list.

---

## 9. Certificates & NAAC Criterion 5.3 (`/api/v1/certificates`)

### 9.1 Get Institutional Certificate Verification Data
* **Method & Path**: `GET /api/v1/certificates/:credentialId`
* **Access**: Public Verification
* **Consumed By**: Certificate Modal in [`MyRegistrations.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/student/MyRegistrations.jsx) and [`StudentDashboard.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/student/StudentDashboard.jsx)
* **Description**: Retrieves accredited certificate details with endorsing signatures for display and printing.
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "credentialId": "UNIS-CERT-E2-2025-CS24089",
    "eventTitle": "Algorithm Arena 2025",
    "clubName": "Byte Warriors",
    "studentName": "Vikram Singh",
    "classRollNo": "CS24089",
    "courseBranch": "B.Tech in Computer Science & Engineering",
    "date": "2025-11-20",
    "facultyAdvisor": "Dr. Sharma",
    "hod": "Dr. V. K. Mathur",
    "naacCriterion": "5.3",
    "status": "ISSUED",
    "verificationUrl": "https://unisphere.college.edu/verify/UNIS-CERT-E2-2025-CS24089"
  }
}
```

---

## 10. Operational Task Checklist (`/api/v1/clubs/:clubId/tasks`)

### 10.1 List Club Tasks
* **Method & Path**: `GET /api/v1/clubs/:clubId/tasks`
* **Access**: Coordinator / Faculty Head
* **Consumed By**: [`Tasks.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/club/Tasks.jsx), [`ClubDashboard.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/club/ClubDashboard.jsx)
* **Query Parameters**: `status` (`all`, `pending`, `completed`), `priority`, `category`
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "t1",
      "clubId": "c1",
      "title": "Finalize Guest Speaker & Keynote Schedule",
      "description": "Confirm accommodation with campus hospitality lounge.",
      "category": "Technical",
      "priority": "High",
      "assignee": "Aarav Patel (Technical Lead)",
      "dueDate": "2026-10-24",
      "status": "in_progress"
    }
  ]
}
```

---

### 10.2 Create Task
* **Method & Path**: `POST /api/v1/clubs/:clubId/tasks`
* **Access**: Coordinator
* **Consumed By**: Add Task Modal in [`Tasks.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/club/Tasks.jsx)
* **Request Body**:
```json
{
  "title": "Arrange Refreshments for Judges",
  "description": "Finalize canteen meal coupons.",
  "category": "Logistics",
  "priority": "Low",
  "assignee": "Neha Gupta (Event Manager)",
  "dueDate": "2026-10-28"
}
```
* **Success Response (`201 Created`)**: Created task object.

---

### 10.3 Toggle Task Completion Status
* **Method & Path**: `PATCH /api/v1/clubs/:clubId/tasks/:taskId/status`
* **Access**: Coordinator
* **Consumed By**: Interactive checkboxes in [`Tasks.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/club/Tasks.jsx) and [`ClubDashboard.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/club/ClubDashboard.jsx)
* **Request Body**:
```json
{
  "status": "completed"
}
```
* **Success Response (`200 OK`)**: Updated task record.

---

## 11. Campus Bulletins & Announcements (`/api/v1/announcements`)

### 11.1 List Announcements Feed
* **Method & Path**: `GET /api/v1/announcements`
* **Access**: Public / Student
* **Consumed By**: Live feed on [`StudentDashboard.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/student/StudentDashboard.jsx) and [`ClubProfile.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/public/ClubProfile.jsx)
* **Query Parameters**: `clubId` (*optional*), `priority` (*optional*), `search` (*optional*)
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "a1",
      "clubId": "c1",
      "clubName": "Byte Warriors",
      "title": "Flagship Campus Hackathon 2026 Tracks Announced",
      "category": "Event Alert",
      "priority": "High",
      "audience": "All Campus Students",
      "author": "Dr. Sharma (Faculty Advisor)",
      "date": "2026-10-15",
      "content": "The organizing committee has finalized the 4 tracks: AI & HealthTech..."
    }
  ]
}
```

---

### 11.2 Broadcast Campus Announcement
* **Method & Path**: `POST /api/v1/clubs/:clubId/announcements`
* **Access**: Club Coordinator / Faculty Head
* **Consumed By**: Broadcast modal in [`Announcements.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/club/Announcements.jsx) and [`ClubDashboard.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/club/ClubDashboard.jsx)
* **Request Body**:
```json
{
  "title": "Core Student Leadership Applications Open",
  "category": "Recruitment",
  "priority": "Normal",
  "audience": "Club Members Only",
  "author": "Manav Sharma (Student Coordinator)",
  "content": "Byte Warriors is expanding its core execution committee..."
}
```
* **Success Response (`201 Created`)**: Broadcasted notice record.

---

## 12. Club Analytics & NAAC Accreditation Intelligence (`/api/v1/clubs/:clubId/analytics`)

### 12.1 Get Executive KPI Intelligence
* **Method & Path**: `GET /api/v1/clubs/:clubId/analytics/summary`
* **Access**: Club Coordinator / Faculty Head / Admin
* **Consumed By**: [`Analytics.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/club/Analytics.jsx)
* **Query Parameters**: `horizon` (`spring2026`, `autumn2025`, `academicYear`, `allTime`)
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "horizon": "spring2026",
    "kpis": {
      "intranetReach": 1450,
      "enrolledMembers": 128,
      "totalRegistrations": 295,
      "turnoutRate": 92.0,
      "certificatesIssued": 115,
      "satisfactionRating": 4.92
    },
    "attendanceFunnel": {
      "impressions": 1450,
      "rsvps": 295,
      "gateTurnout": 272,
      "certified": 115
    },
    "branchDiversity": [
      { "branch": "Computer Science (CSE)", "percentage": 52 },
      { "branch": "Information Technology (IT)", "percentage": 24 },
      { "branch": "Electronics (ECE)", "percentage": 14 },
      { "branch": "Mechanical & Management", "percentage": 10 }
    ],
    "cohortDistribution": [
      { "cohort": "1st Year", "percentage": 18 },
      { "cohort": "2nd Year", "percentage": 42 },
      { "cohort": "3rd Year", "percentage": 28 },
      { "cohort": "4th Year", "percentage": 12 }
    ]
  }
}
```

---

### 12.2 Get Departmental NAAC Criterion 5.3 Audit Report
* **Method & Path**: `GET /api/v1/clubs/:clubId/analytics/naac-audit`
* **Access**: Club Coordinator / Faculty Head / IQAC Auditor
* **Consumed By**: Official NAAC / IQAC Audit Table in [`Analytics.jsx`](file:///Users/prashivgoyal/Desktop/club_mgmt/frontend/src/pages/club/Analytics.jsx)
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "academicYear": "2025-2026",
    "naacCriterion": "Criterion 5.3 - Student Participation & Activities",
    "department": "Computer Science & Engineering",
    "facultyAdvisor": "Dr. Sharma",
    "hod": "Dr. V. K. Mathur",
    "totalEventsAudited": 3,
    "auditTable": [
      {
        "eventId": "e2",
        "title": "Algorithm Arena 2025",
        "category": "Technical Contest",
        "date": "2025-11-20",
        "venue": "Seminar Hall A",
        "capacity": 120,
        "registrations": 115,
        "turnout": 110,
        "turnoutPercentage": 91.7,
        "winnersDeclared": true,
        "facultyClearance": "Verified & Approved"
      }
    ]
  }
}
```

---

### 12.3 Export NAAC Audit Report
* **Method & Path**: `GET /api/v1/clubs/:clubId/analytics/naac-audit/export`
* **Access**: Coordinator / Faculty Head
* **Query Parameters**: `format` (`csv` | `pdf`)
* **Success Response (`200 OK`)**:
  * Content-Type: `text/csv` or `application/pdf`
  * Content-Disposition: `attachment; filename="NAAC_Audit_ByteWarriors_2026.csv"`

---

## 13. University Administration & Governance (`/api/v1/admin`)

> [!NOTE]
> University Administrator role is assumed in backend institutional services. The following administrative endpoints manage the institutional vetting workflow for student club establishment requests.

### 13.1 List All Pending Clubs Awaiting Review
* **Method & Path**: `GET /api/v1/admin/clubs/pending`
* **Access**: University Administrator (`ADMIN`)
* **Description**: Returns all campus club applications whose status is currently `requested`.
* **Query Parameters**: `department` (*optional*), `category` (*optional*), `page` (*optional*), `limit` (*optional*)
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "c_pending",
      "referenceId": "REQ-2026-MGT-4821",
      "name": "FinTech & Blockchain Society",
      "category": "Finance & Technology",
      "department": "Management & Computer Applications",
      "facultyAdvisor": "Dr. Neha Verma",
      "hod": "Dr. V. K. Mathur",
      "email": "fintech.society@college.edu",
      "phone": "+91 98101 23456",
      "clubCode": "FINTECH-2026",
      "approvalStatus": "requested",
      "status": "Requested",
      "submittedAt": "2026-10-16T14:30:00Z"
    }
  ],
  "meta": {
    "totalPending": 1
  }
}
```

---

### 13.2 Approve Club Application
* **Method & Path**: `PATCH /api/v1/admin/clubs/:clubId/approve`
* **Access**: University Administrator (`ADMIN`)
* **Description**: Admin approves a requested club. Transitions `approval_status` from `requested` -> `approved`. This unlocks the club coordinator dashboard (`/club-dashboard`), allows event creation, enables member management, and exposes the club in the public student discovery catalog.
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Club approved successfully. Coordinator dashboard unlocked.",
  "data": {
    "id": "c_pending",
    "name": "FinTech & Blockchain Society",
    "approvalStatus": "approved",
    "status": "ACTIVE",
    "approvedAt": "2026-10-17T17:15:00Z",
    "approvedBy": "u_admin_001"
  }
}
```
* **Errors**: `404 Not Found` (Club ID does not exist), `409 Conflict` (Club is already approved).

---

### 13.3 Reject Club Application
* **Method & Path**: `PATCH /api/v1/admin/clubs/:clubId/reject`
* **Access**: University Administrator (`ADMIN`)
* **Description**: Admin rejects a requested club with an explanatory justification. Transitions `approval_status` from `requested` -> `rejected`. When the coordinator attempts to log in, the system alerts them with `"your club was rejected: [rejectionReason]"`.
* **Request Body**:
```json
{
  "rejectionReason": "Faculty advisor endorsement letter is missing, and campus policy restricts unaccredited video game societies."
}
```
* **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Club application rejected.",
  "data": {
    "id": "c_rejected",
    "name": "Campus Gaming & Esports Union",
    "approvalStatus": "rejected",
    "rejectionReason": "Faculty advisor endorsement letter is missing, and campus policy restricts unaccredited video game societies.",
    "reviewedAt": "2026-10-17T17:15:00Z",
    "reviewedBy": "u_admin_001"
  }
}
```
* **Errors**: `400 Bad Request` (Missing `rejectionReason`), `404 Not Found` (Club ID does not exist).
