# Smart Hostel — Deployment Guide

## Architecture
- **Frontend**: Vercel (https://smart-hostel-htlh.vercel.app)
- **Backend**: Render (https://smart-hostel-rhi5.onrender.com)
- **Database**: MongoDB Atlas

---

## Render (Backend) — Environment Variables

Go to Render → your service → **Environment** tab → add these:

| Key | Value |
|-----|-------|
| `MONGO_URI` | `mongodb+srv://khanhaiba22_db_user:Haiba%402003@cluster0.k8gatrp.mongodb.net/hostel_db?retryWrites=true&w=majority` |
| `JWT_SECRET` | `hostel_jwt_secret_2024` |
| `PORT` | `10000` |
| `FRONTEND_URL` | `https://smart-hostel-htlh.vercel.app` |

**Settings:**
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `node server.cjs`

---

## Vercel (Frontend) — Environment Variables

Go to Vercel → your project → **Settings** → **Environment Variables** → add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://smart-hostel-rhi5.onrender.com/api` |

**Settings:**
- Root Directory: `frontend`
- Framework: Vite (auto-detected)
- Build Command: `npm run build`
- Output Directory: `dist`

---

## MongoDB Atlas — Required Setup

1. **Network Access** → Add IP `0.0.0.0/0` (allow all)
2. **Database Access** → User: `khanhaiba22_db_user`, Password: `Haiba@2003`
3. **Connection String**: 
   ```
   mongodb+srv://khanhaiba22_db_user:Haiba%402003@cluster0.k8gatrp.mongodb.net/hostel_db?retryWrites=true&w=majority
   ```

---

## Seed Database (Run Once)

After backend is deployed, run locally:

```bash
cd backend
# Update .env temporarily with Atlas URI
MONGO_URI=mongodb+srv://... node setup_mongo.cjs
```

---

## Local Development

```bash
npm start
```

- Frontend: http://localhost:8080
- Backend: http://localhost:5000/api

---

## Troubleshooting

**502 Bad Gateway on Render:**
- Check Render logs for MongoDB connection errors
- Verify `MONGO_URI` is set correctly with URL-encoded password (`@` → `%40`)
- Verify Atlas IP whitelist includes `0.0.0.0/0`

**CORS errors:**
- Verify `FRONTEND_URL` is set on Render
- Check backend logs for "CORS blocked" messages

**Login fails:**
- Clear browser localStorage
- Hard refresh (Ctrl+Shift+R)
