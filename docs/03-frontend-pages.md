# Frontend Pages — What Each File Does

## index.html
The ONLY real HTML file. Contains just:
```html
<div id="root"></div>
```
React fills this div with all pages. No page reloads — React swaps content instantly.

---

## main.tsx
Entry point. Mounts React into index.html:
```tsx
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
```

---

## App.tsx — The Router
Maps URLs to pages. Also has ProtectedRoute — redirects to /login if not logged in.
```
/           → Index.tsx (landing page)
/login      → Login.tsx
/owner      → OwnerDashboard.tsx    (owner only)
/rector     → WardenDashboard.tsx   (rector only)
/student    → StudentDashboard.tsx  (student only)
/students   → StudentsPage.tsx      (owner only)
/rooms      → RoomsPage.tsx         (owner only)
/fees       → FeesPage.tsx          (owner only)
/complaints → ComplaintsPage.tsx    (owner + rector)
/notices    → NoticesPage.tsx       (owner + rector)
/attendance → AttendancePage.tsx    (owner + rector)
/profile    → StudentProfile.tsx    (student only)
*           → NotFound.tsx
```

---

## Login.tsx — /login
**What user sees:** Split screen login page

LEFT PANEL (dark):
- Animated morphing blobs in background
- Floating Smart Hostel logo
- Stats: 100+ Students, 120 Rooms, 24/7 Support
- Role pills at bottom

RIGHT PANEL (white):
- "Welcome back 👋" heading
- 3 role buttons (Owner/Rector/Student) — auto-fills credentials on click
- Email input field
- Password input with show/hide eye button
- Sign In button (gradient color matches selected role)

**What happens:**
1. User clicks role → credentials auto-fill
2. User clicks Sign In → calls POST /api/auth/login
3. Gets JWT token back → saves to localStorage
4. Redirects to role dashboard

---

## OwnerDashboard.tsx — /owner
**What user sees:** Stats + Charts + Data panels

TOP ROW (4 clickable stat cards):
- Total Students (violet) → clicks to /students
- Pending Fees (orange) → clicks to /fees
- Active Complaints (red) → clicks to /complaints
- Occupied Rooms (teal) → clicks to /rooms

MIDDLE ROW (2 charts):
- Bar chart: Fee Status Breakdown (Paid/Pending/Partial)
- Pie/Donut chart: Complaint Status

BOTTOM ROW (2 panels):
- Students with Pending Fees: name, room, amount due, status badge
- Active Complaints: title, student name, room, status badge

**API called:** GET /api/dashboard/owner

---

## WardenDashboard.tsx — /rector
**What user sees:** Attendance stats + Complaints + Notices

TOP ROW (4 cards):
- Present Today (green)
- Absent Today (red)
- Late Today (orange)
- Attendance card with "Mark Now" button → /attendance

COMPLAINTS TABLE:
- All active complaints
- Columns: Student, Room, Complaint, Status, Action
- Start button → Pending to In Progress
- Resolve button → In Progress to Resolved

NOTICES LIST:
- Recent 5 notices with title, type, description, date

**API called:** GET /api/dashboard/warden

---

## StudentDashboard.tsx — /student
**What user sees:** Personal info + complaints + notices

WELCOME BANNER: "Welcome back, [Name] 👋"

3 INFO CARDS:
1. Room Details: room no, branch, year, admission year, phone
2. Fee Status: total fee, paid, pending, status badge
3. My Complaints: count by status + New button

COMPLAINT HISTORY:
- List of student's own complaints
- Title, description, date, status badge
- "Raise Complaint" button → opens dialog

NOTICE BOARD:
- All hostel notices
- Title, description, date, type badge

**API called:** GET /api/students (finds by email) + GET /api/complaints + GET /api/notices

---

## StudentsPage.tsx — /students
**What user sees:** Student management table

HEADER: Search bar + Add Student button (shows total count)

TABLE COLUMNS: Name, Email, Room, Branch, Year, Fee Status, Actions

ACTIONS per row:
- Pencil icon → Edit dialog
- Trash icon → Delete confirm dialog

ADD/EDIT DIALOG FIELDS:
- Full Name*, Email*, Room No, Branch*, Year*, Phone, Gender, Password

**APIs called:** GET/POST/PUT/DELETE /api/students

---

## RoomsPage.tsx — /rooms
**What user sees:** All 120 rooms in a table

TABLE COLUMNS: Room No, Floor, Type, Capacity, Occupied, Status

STATUS BADGES:
- Green = Available
- Red = Full
- Yellow = Maintenance

**API called:** GET /api/rooms

---

## FeesPage.tsx — /fees
**What user sees:** 3 tabs

TAB 1 — All Fees:
- Summary: Total Fees, Collected, Outstanding
- Table: Name, Room, Total, Paid, Due, Status, Edit button
- Edit dialog: update fee amount, paid amount, status

TAB 2 — Pending Fees:
- Only students with pending/partial fees
- Shows count + total outstanding

TAB 3 — Fee Structure:
- Grid: Course × Year with fee amounts
- Edit/Set button per row → dialog to set amount

**APIs called:** GET /api/students + GET/PUT /api/fee-structure

---

## ComplaintsPage.tsx — /complaints
**What user sees:** All complaints table

TABLE COLUMNS: Student, Room, Title, Complaint, Status, Action

ACTION BUTTONS:
- "Start" → changes Pending → In Progress
- "Resolve" → changes In Progress → Resolved

STATUS BADGES:
- Yellow = Pending
- Blue = In Progress
- Green = Resolved

**APIs called:** GET /api/complaints + PATCH /api/complaints/:id/status

---

## NoticesPage.tsx — /notices
**What user sees:** Notice list + Post button

EACH NOTICE: Title, type badge, description, date, posted by, delete button

POST NOTICE DIALOG:
- Title (required)
- Type: General / Announcement / Food Menu / Maintenance
- Description (required)

**APIs called:** GET/POST/DELETE /api/notices

---

## AttendancePage.tsx — /attendance
**What user sees:** Date picker + summary + student list

DATE PICKER: Select date (max = today)

SUMMARY CARDS (4): Present, Absent, Late, On Leave with percentages

HEADER BUTTONS (today only):
- All Present — marks everyone present
- All Absent — marks everyone absent
- Save Attendance — saves to database

STUDENT LIST (today):
- Each student: avatar, name, room, branch, year
- 4 status buttons: Present / Absent / Late / On Leave
- Selected status highlights in color

STUDENT LIST (past dates): Read-only with status badges

STICKY SAVE BAR: Appears at bottom when unsaved changes exist

**APIs called:** GET /api/attendance?date=X + POST /api/attendance/bulk

---

## StudentProfile.tsx — /profile
**What user sees:** Profile card + edit form + fee summary

PROFILE CARD:
- Gradient banner (emerald/teal)
- Avatar: shows initials OR uploaded photo
- Hover avatar → camera icon → click to upload photo
- Name, branch, year
- Email (read-only), Gender: Female (read-only)

EDIT FORM (student can change):
- Room Number
- Phone Number
- Department (dropdown: Engineering/Diploma/Science/Commerce/Arts)
- Year (dropdown: 1st/2nd/3rd/4th Year)
- Save button → shows "Saved!" with checkmark

FEE SUMMARY (read-only):
- Total Fee, Paid, Pending amounts
- Status badge (paid/pending/partial)

**APIs called:** GET/PUT /api/profile + POST /api/profile/photo

---

## NotFound.tsx — any wrong URL
Shows 404 page with "Go Home" button
