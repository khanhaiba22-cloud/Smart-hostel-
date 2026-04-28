# Frontend Components — Shared UI Pieces

## AppSidebar.tsx
Left navigation bar used on every dashboard page.

STRUCTURE:
```
┌─────────────────┐
│ Logo + Role     │  ← Sparkles icon + "Smart Hostel" + role name
├─────────────────┤
│ Navigation      │  ← Menu items with icons
│  • Dashboard    │
│  • Students     │
│  • Rooms        │
│  • ...          │
├─────────────────┤
│ User Info       │  ← Name + email
│ Logout          │  ← Red logout button
└─────────────────┘
```

ROLE-BASED MENUS:
- Owner: Dashboard, Students, Rooms, Fees, Complaints, Notices
- Rector: Dashboard, Attendance, Complaints, Notices
- Student: Dashboard, My Profile

VISUAL FEATURES:
- Dark purple/navy background
- Active item has gradient glow effect
- Animated blobs in background
- Pulsing dot next to role name
- Collapses to icons only (sidebar toggle)
- Staggered slide-in animation on load

---

## TopNavbar.tsx
Top header bar on every dashboard page.

LEFT SIDE:
- Sidebar toggle button (hamburger)
- Divider line
- Current page title

RIGHT SIDE:
- Bell icon with pulsing notification dot
- User avatar (gradient, shows initials)
- User name
- Dropdown arrow → opens menu

DROPDOWN MENU:
- User avatar + name + role
- Profile option
- Sign Out option (red)

---

## StatCard.tsx
Colorful gradient cards used on dashboards.

STRUCTURE:
```
┌─────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  ← gradient top bar
│                         │
│  [Icon]    TITLE        │
│  VALUE                  │
│  description            │
│                         │
└─────────────────────────┘
```

PROPS:
- title: label shown in small caps
- value: big number/text
- description: small text below
- icon: Lucide icon
- gradient: CSS gradient class (e.g. "from-violet-500 to-purple-600")
- onClick: makes card clickable with hover lift

ANIMATIONS:
- Fade up on load with stagger delay
- Hover lifts card up
- Active scale on click

---

## DashboardLayout.tsx
Wrapper used by EVERY page after login.

```tsx
<DashboardLayout title="Owner Dashboard">
  {/* page content goes here */}
</DashboardLayout>
```

RENDERS:
```
┌──────────────────────────────────────┐
│ AppSidebar │ TopNavbar (title)        │
│            ├──────────────────────── │
│            │                         │
│            │   {children}            │
│            │   (page content)        │
│            │                         │
└──────────────────────────────────────┘
```

Also adds:
- `bg-mesh` background (subtle gradient blobs)
- `page-enter` animation (fade up on load)
- SidebarProvider (manages collapse state)

---

## AuthContext.tsx
Global state for who is logged in.

PROVIDES to all components:
- `user` — { id, name, email, role }
- `token` — JWT string
- `isAuthenticated` — true/false
- `isLoading` — true while logging in
- `login(email, password)` — calls API, saves token
- `logout()` — clears token, goes to /login

HOW IT WORKS:
1. On app start → checks localStorage for saved token
2. If token exists → calls GET /api/auth/me to verify
3. If valid → sets user state
4. If invalid → clears token, redirects to /login

USAGE in any component:
```tsx
const { user, logout } = useAuth();
console.log(user.name); // "Ambar Jain"
console.log(user.role); // "owner"
```

---

## api.ts — All API Calls

The single file that handles ALL communication with the backend.

BASE URL:
```typescript
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
// Local:      http://localhost:5000/api
// Production: https://smart-hostel-rhi5.onrender.com/api
```

EVERY request automatically:
- Adds `Content-Type: application/json` header
- Adds `Authorization: Bearer <token>` header
- Throws error if response is not OK

API GROUPS:
```typescript
authApi.login()           // POST /auth/login
authApi.getMe()           // GET  /auth/me

studentsApi.getAll()      // GET  /students
studentsApi.create()      // POST /students
studentsApi.update()      // PUT  /students/:id
studentsApi.delete()      // DELETE /students/:id

complaintsApi.getAll()    // GET  /complaints
complaintsApi.create()    // POST /complaints
complaintsApi.updateStatus() // PATCH /complaints/:id/status

noticesApi.getAll()       // GET  /notices
noticesApi.create()       // POST /notices
noticesApi.delete()       // DELETE /notices/:id

feeStructureApi.getAll()  // GET  /fee-structure
feeStructureApi.update()  // PUT  /fee-structure

attendanceApi.getByDate() // GET  /attendance?date=X
attendanceApi.saveBulk()  // POST /attendance/bulk

profileApi.get()          // GET  /profile
profileApi.update()       // PUT  /profile
profileApi.uploadPhoto()  // POST /profile/photo

dashboardApi.getOwnerStats()  // GET /dashboard/owner
dashboardApi.getWardenStats() // GET /dashboard/warden
```

---

## index.css — Global Styles

FONT: Plus Jakarta Sans (modern rounded font from Google Fonts)

COLOR THEME:
- Primary: Violet/Purple (#6366f1 range)
- Accent: Hot Pink
- Sidebar: Deep purple-black
- Background: Light with subtle gradient mesh

ANIMATIONS DEFINED:
- `animate-fade-up` — slides up from below (used on page load)
- `animate-fade-in` — fades in
- `animate-scale-in` — scales from 0.92 to 1
- `animate-slide-left` — slides in from left (sidebar nav items)
- `animate-float` — gentle up/down float (login logo)
- `animate-spin-slow` — slow rotation (decorative rings)
- `animate-blob` — morphing shape animation (background blobs)

UTILITY CLASSES:
- `.bg-mesh` — multi-point radial gradient background
- `.text-gradient` — violet to pink gradient text
- `.nav-active` — sidebar active item glow
- `.card-elevated` — card with inner highlight shadow
- `.glass` — frosted glass effect
- `.pulse-dot` — pulsing notification dot

---

## tailwind.config.ts — Design Tokens

CUSTOM COLORS:
- `primary` — violet/indigo
- `accent` — hot pink
- `sidebar.*` — all sidebar colors
- `status.pending` — amber/yellow
- `status.progress` — blue
- `status.resolved` — emerald/green

CUSTOM SHADOWS:
- `shadow-card` — subtle card shadow
- `shadow-card-hover` — deeper hover shadow
- `shadow-glow-primary` — purple glow
- `shadow-glow-accent` — pink glow

FONT: Plus Jakarta Sans
