# Local Development Guide

## Prerequisites
- Node.js installed
- MongoDB installed and running locally
- Git installed

## First Time Setup

### 1. Install dependencies
```bash
# Root (for concurrently)
npm install

# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

### 2. Seed local database
```bash
cd backend
node setup_mongo.cjs
```

Output should show:
```
✅ Connected to MongoDB
✅ Admin & Warden created
✅ Rooms seeded
✅ 35 students seeded
✅ Setup complete!
```

### 3. Start everything
```bash
# From project root
npm start
```

This runs both:
- Backend: http://localhost:5000/api
- Frontend: http://localhost:8080

## Environment Files

### backend/.env (local)
```
PORT=5000
JWT_SECRET=hostel_jwt_secret_2024
MONGO_URI=mongodb://127.0.0.1:27017/hostel_db
FRONTEND_URL=http://localhost:8080
```

### frontend/.env (local)
```
VITE_API_URL=http://localhost:5000/api
```

## Login Credentials (local)
| Role | Email | Password |
|------|-------|----------|
| Owner | ambar@gmail.com | 1234 |
| Rector | riya@gmail.com | 1234 |
| Student | aarti.sharma@hostel.com | pass123 |

## Useful Commands

```bash
# Run both frontend + backend
npm start

# Run only backend
node backend/server.cjs

# Run only frontend
npm run dev --prefix frontend

# Seed local database
cd backend && node setup_mongo.cjs

# Check backend syntax
node --check backend/server.cjs

# Push to GitHub
git add .
git commit -m "message"
git push origin main
```

## How Local and Production Differ

| Setting | Local | Production |
|---------|-------|-----------|
| Frontend URL | http://localhost:8080 | https://smarthostel.co.in |
| Backend URL | http://localhost:5000 | https://smart-hostel-rhi5.onrender.com |
| Database | Local MongoDB | MongoDB Atlas |
| VITE_API_URL | http://localhost:5000/api | https://render-url/api |
| MONGO_URI | mongodb://127.0.0.1:27017/hostel_db | mongodb+srv://...atlas... |
