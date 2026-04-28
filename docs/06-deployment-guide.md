# Complete Deployment Guide

## Overview
```
GitHub (code) → Render (backend) → MongoDB Atlas (database)
             → Vercel (frontend)
             → GoDaddy (custom domain)
```

---

## Step 1 — MongoDB Atlas Setup

1. Go to https://mongodb.com/atlas → Sign up free
2. Create cluster → choose M0 Free → any region
3. Create database user:
   - Username: khanhaiba22_db_user
   - Password: Haiba@2003
4. Network Access → Add IP → 0.0.0.0/0 (allow all)
5. Connect → Drivers → copy connection string
6. Replace <password> with Haiba%402003 (@ encoded as %40)
7. Add /hostel_db before the ?

Final URI:
```
mongodb+srv://khanhaiba22_db_user:Haiba%402003@cluster0.k8gatrp.mongodb.net/hostel_db?retryWrites=true&w=majority
```

---

## Step 2 — Push to GitHub

```bash
git init
git add .
git commit -m "Smart Hostel Management System"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

For subsequent changes:
```bash
git add .
git commit -m "description of change"
git push origin main
```

---

## Step 3 — Deploy Backend on Render

1. Go to https://render.com → Sign up with GitHub
2. New + → Web Service → Connect GitHub repo
3. Settings:
   - Name: smart-hostel-backend
   - Root Directory: backend
   - Runtime: Node
   - Build Command: npm install
   - Start Command: node server.cjs
   - Instance Type: Free
4. Environment Variables (add all):
   | Key | Value |
   |-----|-------|
   | MONGO_URI | mongodb+srv://...atlas URI... |
   | JWT_SECRET | hostel_jwt_secret_2024 |
   | PORT | 10000 |
   | FRONTEND_URL | https://your-vercel-url.vercel.app |
   | NODE_ENV | production |
5. Create Web Service → wait 3-5 mins
6. Copy your backend URL: https://xxx.onrender.com

---

## Step 4 — Seed Production Database

After backend deploys, open this URL in browser ONCE:
```
https://your-render-url.onrender.com/api/seed?secret=seed_hostel_2024
```

Should return:
```json
{"success": true, "message": "Seeded: 35 students, 120 rooms, admin+rector created"}
```

---

## Step 5 — Deploy Frontend on Vercel

1. Go to https://vercel.com → Sign up with GitHub
2. Add New Project → Import your GitHub repo
3. Configure:
   - Root Directory: frontend
   - Framework: Vite (auto-detected)
   - Build Command: npm run build
   - Output Directory: dist
4. Environment Variables:
   | Key | Value |
   |-----|-------|
   | VITE_API_URL | https://your-render-url.onrender.com/api |
5. Deploy → wait 2 mins
6. Your site is live at https://xxx.vercel.app

---

## Step 6 — Custom Domain (GoDaddy)

### On Vercel:
1. Settings → Domains → Add smarthostel.co.in
2. Also add www.smarthostel.co.in
3. Click Edit on smarthostel.co.in → note the required DNS records

### On GoDaddy:
1. Domain → DNS tab → Add New Record
2. Add A record: @ → 216.198.79.1 (or whatever Vercel shows)
3. For www: Edit existing www CNAME → change to cname.vercel-dns.com

### Back on Vercel:
1. Click Refresh on both domains
2. Wait 5-30 mins for green checkmarks

---

## Step 7 — Update CORS for Custom Domain

In backend/server.cjs, add your domain to allowedOrigins:
```javascript
const allowedOrigins = [
  'http://localhost:8080',
  'https://your-vercel-url.vercel.app',
  'https://smarthostel.co.in',
  'https://www.smarthostel.co.in',
];
```

Then push to GitHub → Render auto-redeploys.

---

## How to Redeploy After Code Changes

### Backend changes:
1. Push to GitHub
2. Render auto-deploys (or Manual Deploy on Render dashboard)

### Frontend changes:
1. Push to GitHub
2. Vercel auto-deploys

### Both:
```bash
git add .
git commit -m "your change description"
git push origin main
```
Both Render and Vercel watch GitHub and auto-deploy on push.

---

## Troubleshooting

### Backend 502 Bad Gateway
- Check Render logs for errors
- Verify MONGO_URI is set in Render environment
- Verify MongoDB Atlas IP whitelist has 0.0.0.0/0
- Check Atlas database user password is correct

### Login fails on production
- Clear browser localStorage (F12 → Application → Local Storage → delete hostel_token)
- Hard refresh: Ctrl+Shift+R
- Check VITE_API_URL is set correctly on Vercel

### CORS errors in browser console
- Add your frontend URL to allowedOrigins in server.cjs
- Push and redeploy backend

### Domain not working
- DNS propagation takes up to 48 hours
- Use https://dnschecker.org to check propagation
- Try with Google DNS: 8.8.8.8

### Database empty after deployment
- Call seed endpoint: /api/seed?secret=seed_hostel_2024
- Or run locally: node backend/seed_atlas.cjs (with Atlas URI in .env)
