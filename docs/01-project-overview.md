# Smart Hostel — Project Overview

## What is this project?
A full-stack Hostel Management System for a girls hostel with 3 user roles.

## Live URLs
| What | URL |
|------|-----|
| Website (Custom Domain) | https://www.smarthostel.co.in |
| Website (Vercel) | https://smart-hostel-htlh.vercel.app |
| Backend API | https://smart-hostel-rhi5.onrender.com/api |
| GitHub Repo | https://github.com/khanhaiba22-cloud/Smart-hostel- |

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Node.js + Express 4 |
| Database | MongoDB Atlas (cloud) |
| Auth | JWT (JSON Web Tokens) |
| Frontend Host | Vercel |
| Backend Host | Render |
| Domain | GoDaddy (smarthostel.co.in) |

## 3 User Roles
| Role | Email | Password | Access |
|------|-------|----------|--------|
| Owner | ambar@gmail.com | 1234 | Full access — students, rooms, fees, complaints, notices |
| Rector | riya@gmail.com | 1234 | Attendance, complaints, notices |
| Student | aarti.sharma@hostel.com | pass123 | Own dashboard, profile, file complaints |

## Architecture
```
User Browser
    ↓
smarthostel.co.in  (React app on Vercel)
    ↓ HTTPS API calls
smart-hostel-rhi5.onrender.com  (Express API on Render)
    ↓ Mongoose queries
MongoDB Atlas  (Cloud Database)
```
