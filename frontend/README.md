# IBKDMS — Ifa Bula Kebele Data Management System

A modern, role-based government data management frontend built with React + Vite + Tailwind CSS.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## Security & Setup

⚠️ **IMPORTANT**: Before running locally, set up your environment variables.

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Then edit `.env` with your actual values:
- `VITE_API_URL` - Backend API endpoint (default: http://localhost:5000/api)

### Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*)

---

## Demo Credentials

⚠️ **IMPORTANT**: These are for development/testing ONLY. Change all passwords immediately in production!

After seeding the backend (`npm run seed`), use:

| Role     | Email                        | Password        |
|----------|------------------------------|-----------------|
| SuperAdmin | superadmin@ibkdms.gov.et  | SuperAdmin@2024 |
| Admin    | admin@ibkdms.gov.et          | AdminUser@2024  |
| Clerk    | clerk@ibkdms.gov.et          | ClerkUser@2024  |
| Resident | resident@ibkdms.gov.et       | Resident@2024   |

---

## Project Structure

```
src/
├── components/
│   ├── Modal.jsx           # Reusable modal
│   ├── Navbar.jsx          # Top navbar with dark mode toggle
│   ├── ProtectedRoute.jsx  # Auth + role guard
│   ├── Sidebar.jsx         # Role-based sidebar navigation
│   ├── StatCard.jsx        # Dashboard stat cards
│   └── Table.jsx           # Searchable, paginated table
│
├── context/
│   ├── AuthContext.jsx     # Auth state + JWT token management
│   ├── DataContext.jsx     # App data (residents, requests, etc.)
│   └── ThemeContext.jsx    # Dark/light mode
│
├── hooks/
│   └── useFormValidation.js # Form validation hook with Zod
│
├── lib/
│   ├── api.js              # API client with JWT refresh
│   ├── validation.js       # Zod validation schemas
│   └── security.js         # XSS protection utilities
│
├── data/
│   └── mockData.js         # Seed data
│
├── layouts/
│   └── DashboardLayout.jsx # Sidebar + Navbar shell
│
├── pages/
│   ├── admin/              # Admin pages
│   ├── clerk/              # Clerk pages
│   ├── resident/           # Resident pages
│   ├── superadmin/         # Super admin pages
│   ├── public/             # Public pages (login, register)
│   └── shared/             # Shared pages
│
├── App.jsx
├── main.jsx
└── index.css
```

## Features

- ✅ Role-based routing (Admin / Clerk / Resident / SuperAdmin)
- ✅ Secure JWT authentication with token refresh
- ✅ Protected routes with localStorage auth persistence
- ✅ Dark / Light mode (persisted in localStorage)
- ✅ Responsive sidebar + navbar layout
- ✅ Searchable + paginated data tables
- ✅ Modals for all CRUD operations
- ✅ Certificate request workflow (submit → review → approve/reject)
- ✅ Vital events (birth/death recording)
- ✅ Download certificate UI (ready for backend PDF integration)
- ✅ Form validation with Zod + React Hook Form
- ✅ XSS protection with DOMPurify
- ✅ Ethiopian context: Kebele, House No., Amharic-friendly field names

## Tech Stack

- React 18 + Vite
- React Router v6
- React Hook Form + Zod (form validation)
- Tailwind CSS v3 (dark mode via `class`)
- Context API (no Redux needed)
- Lucide React icons
- Google Fonts: Outfit + Sora
- DOMPurify (XSS protection)

## Security Notes

- Tokens are stored in localStorage (consider httpOnly cookies for production)
- Automatic token refresh on 401 responses
- Form validation on both client and server
- XSS protection on user-generated content
- All API errors handled gracefully without exposing system details
