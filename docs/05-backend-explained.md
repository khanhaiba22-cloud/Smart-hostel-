# Backend Explained — server.cjs & models.cjs

## How the Backend Works

```
Frontend sends HTTP request
        ↓
server.cjs receives it
        ↓
Checks JWT token (auth middleware)
        ↓
Runs the route handler
        ↓
Queries MongoDB via models.cjs
        ↓
Returns JSON response
        ↓
Frontend displays the data
```

---

## server.cjs — Complete Route List

### AUTH Routes
```
POST /api/auth/login
  Body: { email, password }
  Checks: Admin → Warden → Student collections
  Returns: { token, user: { id, name, email, role } }

GET /api/auth/me
  Header: Authorization: Bearer <token>
  Returns: { user: { id, name, email, role } }
```

### STUDENT Routes
```
GET /api/students
  Query: page, limit, search, branch, feeStatus, roomNo
  Returns: { data: [...students], pagination: {...} }

GET /api/students/:id
  Returns: { student }

POST /api/students          (owner only)
  Body: { name, email, password, roomNo, branch, year, gender, phone }
  Returns: { student }

PUT /api/students/:id       (owner only)
  Body: any student fields to update
  Returns: { student }

DELETE /api/students/:id    (owner only)
  Also deletes: complaints + attendance for this student
  Returns: { success: true }
```

### ROOM Routes
```
GET /api/rooms
  Query: status, floor
  Returns: { data: [...rooms] }

POST /api/rooms             (owner only)
PUT /api/rooms/:id          (owner only)
DELETE /api/rooms/:id       (owner only)
```

### COMPLAINT Routes
```
GET /api/complaints
  Query: status, page, limit
  Returns: { data: [...complaints], pagination }

POST /api/complaints
  Body: { studentName, roomNo, complaint, title, studentId }
  Returns: { complaint }

PATCH /api/complaints/:id/status   (owner + rector only)
  Body: { status: "Pending" | "In Progress" | "Resolved" }
  Returns: { complaint }

DELETE /api/complaints/:id  (owner + rector only)
```

### NOTICE Routes
```
GET /api/notices
  Query: limit
  Returns: { notices: [...], count }

POST /api/notices           (owner + rector only)
  Body: { title, description, type, postedBy }

PUT /api/notices/:id        (owner + rector only)
DELETE /api/notices/:id     (owner + rector only)
```

### FEE STRUCTURE Routes
```
GET /api/fee-structure
  Returns: [{ course, year, amount }]

PUT /api/fee-structure      (owner only)
  Body: { course, year, amount }
```

### ATTENDANCE Routes
```
GET /api/attendance
  Query: date (YYYY-MM-DD)
  Returns: { date, students: [...with status], summary }

POST /api/attendance/bulk   (owner + rector only)
  Body: { date, records: [{ studentId, status, note }] }
  Returns: { summary }

GET /api/attendance/student/:id
  Returns: attendance history for one student
```

### PROFILE Routes (student self-update)
```
GET /api/profile
  Returns: own student data

PUT /api/profile
  Body: { roomNo, branch, year, phone }
  Returns: updated student

POST /api/profile/photo
  Body: multipart/form-data with 'photo' file
  Returns: { photoUrl }
```

### DASHBOARD Routes
```
GET /api/dashboard/owner    (owner only)
  Returns: totalStudents, pendingFees, activeComplaints,
           occupiedRooms, feeBreakdown, recentComplaints

GET /api/dashboard/warden   (owner + rector)
  Returns: totalStudents, presentStudents, absentStudents,
           lateStudents, attendanceMarked,
           pendingComplaints, recentComplaints, notices

GET /api/dashboard/student/:id
  Returns: student data, myComplaints, notices
```

### SEED Route (one-time use)
```
GET /api/seed?secret=seed_hostel_2024
  Creates: admin, rector, 35 students, 120 rooms, sample data
```

### HEALTH Route
```
GET /
  Returns: { status: "ok", mongo: "connected", env: {...} }
```

---

## models.cjs — Database Schemas

### Admin Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String
}
```
Stores owner login. Collection: `admins`

### Warden Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String
}
```
Stores rector login. Collection: `wardens`

### Student Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String,
  roomNo: String,
  branch: String,        // Engineering / Diploma
  year: String,          // 1st Year / 2nd Year / 3rd Year
  gender: String,        // Female
  phone: String,
  parentPhone: String,
  address: String,
  admissionYear: Number,
  feeStatus: String,     // paid / pending / partial
  feeAmount: Number,     // default 50000
  feePaid: Number,       // default 0
  photoUrl: String,      // path to uploaded photo
  createdAt, updatedAt   // auto timestamps
}
```

### Room Schema
```javascript
{
  roomNo: String (unique),  // A101, B205 etc
  floor: String,            // Ground/First/Second/Third/Fourth
  type: String,             // Single/Double/Triple
  capacity: Number,
  occupied: Number,
  status: String            // available / full / maintenance
}
```

### Complaint Schema
```javascript
{
  studentId: ObjectId,      // reference to Student
  studentName: String,
  roomNo: String,
  title: String,
  complaint: String,
  status: String,           // Pending / In Progress / Resolved
  resolvedAt: Date,
  createdAt, updatedAt
}
```

### Notice Schema
```javascript
{
  title: String,
  description: String,
  type: String,             // General/Announcement/Food Menu/Maintenance
  date: Date,
  postedBy: String,
  createdAt
}
```

### Attendance Schema
```javascript
{
  studentId: ObjectId,      // reference to Student
  date: String,             // YYYY-MM-DD format
  status: String,           // Present/Absent/Late/On Leave
  markedBy: String,         // rector's email
  note: String,
  createdAt
}
// Unique constraint: one record per student per date
```

### FeeStructure Schema
```javascript
{
  course: String,           // Engineering / Diploma
  year: String,             // 1st Year / 2nd Year / 3rd Year
  amount: Number,
  updatedAt
}
// Unique constraint: one record per course+year combination
```

---

## Middleware

### auth middleware
Runs before protected routes. Checks JWT token.
```javascript
function auth(req, res, next) {
  // Gets token from Authorization header
  // Verifies with JWT_SECRET
  // Adds req.user = { id, email, role }
  // If invalid → returns 401
}
```

### requireRole middleware
Checks if user has the right role.
```javascript
requireRole('owner')           // only owner
requireRole('owner', 'rector') // owner OR rector
```

### CORS middleware
Allows requests from:
- http://localhost:8080 (local dev)
- https://smart-hostel-htlh.vercel.app
- https://smarthostel.co.in
- https://www.smarthostel.co.in

---

## Environment Variables

### Local (backend/.env)
```
PORT=5000
JWT_SECRET=hostel_jwt_secret_2024
MONGO_URI=mongodb://127.0.0.1:27017/hostel_db
FRONTEND_URL=http://localhost:8080
```

### Production (set on Render dashboard)
```
PORT=10000
JWT_SECRET=hostel_jwt_secret_2024
MONGO_URI=mongodb+srv://khanhaiba22_db_user:...@cluster0.k8gatrp.mongodb.net/hostel_db
FRONTEND_URL=https://smart-hostel-htlh.vercel.app
NODE_ENV=production
```
