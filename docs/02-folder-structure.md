# Project Folder Structure

```
campus-nest-dash-main/
│
├── frontend/                          ← React app (Vercel)
│   ├── src/
│   │   ├── App.tsx                    ← Router — maps URLs to pages
│   │   ├── main.tsx                   ← Entry point — mounts React
│   │   ├── index.css                  ← Global styles + animations
│   │   │
│   │   ├── pages/                     ← One file = one screen
│   │   │   ├── Login.tsx              ← /login
│   │   │   ├── Index.tsx              ← / (landing page)
│   │   │   ├── OwnerDashboard.tsx     ← /owner
│   │   │   ├── WardenDashboard.tsx    ← /rector
│   │   │   ├── StudentDashboard.tsx   ← /student
│   │   │   ├── StudentsPage.tsx       ← /students
│   │   │   ├── RoomsPage.tsx          ← /rooms
│   │   │   ├── FeesPage.tsx           ← /fees
│   │   │   ├── ComplaintsPage.tsx     ← /complaints
│   │   │   ├── NoticesPage.tsx        ← /notices
│   │   │   ├── AttendancePage.tsx     ← /attendance
│   │   │   ├── StudentProfile.tsx     ← /profile
│   │   │   └── NotFound.tsx           ← any wrong URL
│   │   │
│   │   ├── components/
│   │   │   ├── AppSidebar.tsx         ← Left navigation bar
│   │   │   ├── TopNavbar.tsx          ← Top header bar
│   │   │   ├── StatCard.tsx           ← Colorful stat cards
│   │   │   └── ui/                    ← shadcn components (buttons, dialogs etc)
│   │   │
│   │   ├── layouts/
│   │   │   └── DashboardLayout.tsx    ← Sidebar + Navbar wrapper
│   │   │
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx        ← Login state (who is logged in)
│   │   │
│   │   ├── lib/
│   │   │   └── api.ts                 ← ALL backend API calls
│   │   │
│   │   └── hooks/
│   │       └── use-toast.ts           ← Toast notifications
│   │
│   ├── index.html                     ← Only HTML file (has <div id="root">)
│   ├── .env                           ← Local: VITE_API_URL=http://localhost:5000/api
│   ├── .env.production                ← Prod: VITE_API_URL=https://render-url/api
│   ├── vite.config.ts                 ← Vite build config
│   ├── tailwind.config.ts             ← Tailwind colors/shadows
│   ├── tsconfig.json                  ← TypeScript config
│   ├── vercel.json                    ← Vercel deployment config
│   └── package.json                   ← Frontend dependencies
│
├── backend/                           ← Node.js API (Render)
│   ├── server.cjs                     ← Main server — all API routes
│   ├── models.cjs                     ← MongoDB schemas
│   ├── setup_mongo.cjs                ← Seed LOCAL database
│   ├── seed_atlas.cjs                 ← Seed PRODUCTION database
│   ├── fix_attendance.cjs             ← One-time DB fix script
│   ├── .env                           ← Local config (not pushed to git)
│   ├── .env.example                   ← Template showing required vars
│   ├── render.yaml                    ← Render deployment config
│   └── package.json                   ← Backend dependencies
│
├── docs/                              ← This documentation folder
├── package.json                       ← Root: npm start runs both
├── .gitignore                         ← Files not pushed to GitHub
├── DEPLOYMENT.md                      ← Deployment guide
└── render.yaml                        ← Root render config
```
