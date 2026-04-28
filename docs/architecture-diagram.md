# Smart Hostel — Architecture Diagram

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                              │
│                                                                     │
│   Opens: smarthostel.co.in  or  smart-hostel-htlh.vercel.app       │
└─────────────────────┬───────────────────────────────────────────────┘
                      │ HTTPS Request
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend Host)                           │
│                                                                     │
│   Serves static files: HTML + CSS + JavaScript                     │
│   URL: smart-hostel-htlh.vercel.app                                │
│   Domain: smarthostel.co.in (via GoDaddy DNS)                      │
└─────────────────────┬───────────────────────────────────────────────┘
                      │ API calls (HTTPS)
                      │ e.g. POST /api/auth/login
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    RENDER (Backend Host)                            │
│                                                                     │
│   Node.js + Express server                                         │
│   URL: smart-hostel-rhi5.onrender.com                              │
│   File: backend/server.cjs                                         │
└─────────────────────┬───────────────────────────────────────────────┘
                      │ Mongoose queries
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  MONGODB ATLAS (Database)                           │
│                                                                     │
│   Cloud database — cluster0.k8gatrp.mongodb.net                   │
│   Database: hostel_db                                              │
│   Collections: admins, wardens, students, rooms,                   │
│                complaints, notices, attendance, fee_structure       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. What Happens When You Open the Website

```
Step 1: You type smarthostel.co.in in browser
        │
        ▼
Step 2: GoDaddy DNS resolves domain
        smarthostel.co.in → 216.198.79.1 (Vercel IP)
        │
        ▼
Step 3: Vercel serves index.html + React bundle
        (just HTML/CSS/JS files — no data yet)
        │
        ▼
Step 4: React app loads in browser
        Checks localStorage for saved token
        │
        ├── Token found → calls GET /api/auth/me on Render
        │                 Valid? → go to dashboard
        │                 Invalid? → go to /login
        │
        └── No token → show /login page
```

---

## 3. Login Flow

```
User fills email + password → clicks Sign In
        │
        ▼
React calls: POST https://smart-hostel-rhi5.onrender.com/api/auth/login
        │
        ▼
Render server receives request
        │
        ├── Checks admins collection  → found? role = "owner"
        ├── Checks wardens collection → found? role = "rector"
        └── Checks students collection → found? role = "student"
        │
        ▼
MongoDB Atlas returns user document
        │
        ▼
Server creates JWT token (expires in 7 days)
JWT contains: { id, email, role }
Signed with: JWT_SECRET
        │
        ▼
Returns: { token, user: { id, name, email, role } }
        │
        ▼
React saves to localStorage:
  hostel_token = "eyJhbGci..."
  hostel_user  = { id, name, email, role }
        │
        ▼
React redirects based on role:
  owner   → /owner   (OwnerDashboard)
  rector  → /rector  (WardenDashboard)
  student → /student (StudentDashboard)
```

---

## 4. Every API Request Flow

```
React page needs data (e.g. list of students)
        │
        ▼
api.ts calls: GET /api/students
  Headers: {
    Content-Type: application/json,
    Authorization: Bearer eyJhbGci...  ← JWT token
  }
        │
        ▼
Render server receives request
        │
        ▼
auth middleware runs:
  Extracts token from Authorization header
  Verifies with JWT_SECRET
  Decodes: { id, email, role }
  Adds to req.user
        │
        ├── Token invalid → returns 401 Unauthorized
        │
        ▼
requireRole middleware (if needed):
  Checks req.user.role
  Not allowed? → returns 403 Forbidden
        │
        ▼
Route handler runs:
  Queries MongoDB Atlas
  e.g. Student.find({ filter }).lean()
        │
        ▼
MongoDB returns data
        │
        ▼
Server sends JSON response:
  { success: true, data: [...students], pagination: {...} }
        │
        ▼
React receives data → updates UI
```

---

## 5. Database Structure

```
MongoDB Atlas — hostel_db
│
├── admins
│   └── { name, email, password }
│       e.g. Ambar Jain / ambar@gmail.com / 1234
│
├── wardens
│   └── { name, email, password }
│       e.g. Riya Jain / riya@gmail.com / 1234
│
├── students
│   └── { name, email, password, roomNo, branch, year,
│          gender, phone, feeStatus, feeAmount, feePaid,
│          photoUrl, admissionYear, ... }
│
├── rooms
│   └── { roomNo, floor, type, capacity, occupied, status }
│       120 rooms: A101-A120, B101-B120, ... F101-F120
│
├── complaints
│   └── { studentId→Student, studentName, roomNo,
│          title, complaint, status, resolvedAt }
│
├── notices
│   └── { title, description, type, date, postedBy }
│
├── attendance
│   └── { studentId→Student, date, status, markedBy, note }
│       Unique: one record per student per date
│
└── fee_structure
    └── { course, year, amount }
        Unique: one record per course+year
```

---

## 6. Frontend Component Tree

```
index.html
└── main.tsx
    └── App.tsx (QueryClient + Router + AuthProvider)
        │
        ├── /login → Login.tsx
        │
        ├── /owner → DashboardLayout
        │              ├── AppSidebar
        │              ├── TopNavbar
        │              └── OwnerDashboard
        │                   ├── StatCard × 4
        │                   ├── FeeChart (bar)
        │                   ├── ComplaintPieChart (donut)
        │                   ├── Pending Fees list
        │                   └── Active Complaints list
        │
        ├── /rector → DashboardLayout
        │              └── WardenDashboard
        │                   ├── StatCard × 4
        │                   ├── Complaints table
        │                   └── Notices list
        │
        ├── /student → DashboardLayout
        │               └── StudentDashboard
        │                    ├── Welcome banner
        │                    ├── Room Details card
        │                    ├── Fee Status card
        │                    ├── My Complaints card
        │                    ├── Complaint History
        │                    └── Notice Board
        │
        ├── /students → StudentsPage (table + CRUD dialogs)
        ├── /rooms    → RoomsPage (table)
        ├── /fees     → FeesPage (3 tabs)
        ├── /complaints → ComplaintsPage (table)
        ├── /notices  → NoticesPage (list)
        ├── /attendance → AttendancePage (date + student list)
        └── /profile  → StudentProfile (edit form + photo)
```

---

## 7. Authentication & Authorization

```
3 Collections in DB:
  admins   → role: "owner"
  wardens  → role: "rector"
  students → role: "student"

JWT Token contains:
  { id, email, role, iat, exp }

Route Protection:
  auth middleware      → all protected routes
  requireRole('owner') → owner only
  requireRole('owner','rector') → owner or rector
  No requireRole → any logged-in user

Frontend Protection:
  ProtectedRoute component in App.tsx
  Checks: isAuthenticated + user.role
  Wrong role → redirects to own dashboard
  Not logged in → redirects to /login
```

---

## 8. File Upload Flow (Profile Photo)

```
Student clicks "Change Photo"
        │
        ▼
Browser opens file picker
Student selects image file
        │
        ▼
React sends: POST /api/profile/photo
  Content-Type: multipart/form-data
  Body: photo file (max 5MB)
        │
        ▼
Render server receives file
Multer middleware saves to: backend/uploads/photo_1234567890.jpg
        │
        ▼
Server updates student.photoUrl = "/uploads/photo_1234567890.jpg"
        │
        ▼
Returns: { photoUrl: "/uploads/photo_1234567890.jpg" }
        │
        ▼
React shows image from:
  https://smart-hostel-rhi5.onrender.com/uploads/photo_1234567890.jpg
```

---

## 9. Deployment Pipeline

```
Developer writes code
        │
        ▼
git push origin main
        │
        ├──────────────────────────────────────┐
        ▼                                      ▼
   RENDER watches GitHub              VERCEL watches GitHub
   Detects new commit                 Detects new commit
        │                                      │
        ▼                                      ▼
   Pulls backend/ folder             Pulls frontend/ folder
   Runs: npm install                 Runs: npm run build
   Runs: node server.cjs             Outputs: dist/ folder
        │                                      │
        ▼                                      ▼
   Backend live at                   Frontend live at
   onrender.com/api                  vercel.app
        │                                      │
        └──────────────┬───────────────────────┘
                       ▼
              smarthostel.co.in
              (GoDaddy DNS → Vercel)
```

---

## 10. Summary — One Line Each

| Layer | Technology | Purpose |
|-------|-----------|---------|
| DNS | GoDaddy | smarthostel.co.in → Vercel IP |
| Frontend Host | Vercel | Serves React app files |
| UI Framework | React + TypeScript | Interactive user interface |
| Styling | Tailwind CSS | Colors, layout, animations |
| State | AuthContext | Who is logged in |
| API Client | api.ts | All HTTP calls to backend |
| Backend Host | Render | Runs Node.js server |
| API Server | Express 4 | Handles all API routes |
| Auth | JWT | Secure token-based login |
| File Upload | Multer | Profile photo storage |
| Database Driver | Mongoose | Talks to MongoDB |
| Database | MongoDB Atlas | Stores all data in cloud |
