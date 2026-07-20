# RAMP — HR Management System (HRMS)

**RAMP** (Recruitment And Management of People) is a production-grade, full-stack HRMS built with the
MERN stack. It covers the complete employee lifecycle — from recruitment and onboarding through
attendance, leave, payroll, performance, assets, documents and offboarding.

```
Hra-management/
├── backend/     Node.js + Express + MongoDB (Mongoose) REST API
└── frontend/    React 19 + Vite + Redux Toolkit + React Query + Tailwind
```

## ✨ Features

| Module | Highlights |
| --- | --- |
| **Auth** | JWT access + refresh tokens (rotation), forgot/reset password, change password, RBAC |
| **Employees** | CRUD, auto-created login accounts, department directory, CSV export, soft delete |
| **Departments** | CRUD with live headcount |
| **Attendance** | Daily check-in/out, mark present/absent/leave, monthly calendar grid, weekly pulse |
| **Leave** | Apply / approve / reject, live balances (CL/SL/EL) computed from approved leaves |
| **Payroll** | Monthly runs, statutory breakup (Basic/HRA/PF/PT/TDS), payslips with amount-in-words |
| **Recruitment** | Job openings, candidate pipeline (stages), salary structures, offer-letter generation |
| **Performance** | Goals with progress tracking, performance reviews with ratings |
| **Assets** | Assign / return / repair, external asset-API sync, status tracking |
| **Reimbursements** | Claim → approve → pay flow with categories |
| **Documents** | Upload (Multer), verify / reject, employee document vault |
| **Announcements** | Company posts with pinning |
| **Holidays** | Holiday calendar with upcoming view |
| **Exit** | Resignation/termination, 5-point clearance, exit interview, F&F, letter generation |
| **Reports** | Headcount, salary bands, attendance trend, gender diversity, payroll totals |
| **Settings** | Company profile, leave policy, offer/exit templates, asset-API config |
| **Audit** | Immutable audit log of every significant action |

## 🔐 Roles (RBAC)

`HR Admin` · `HR Representative` · `Finance Representative` · `Employee` — each role sees a filtered
navigation and is gated at both the API (permission middleware) and UI (route guards) layers.

## 🚀 Quick start

### Prerequisites
- Node.js 18+
- A MongoDB connection string (Atlas or local)

### 1. Backend
```bash
cd backend
cp .env.example .env         # then edit MONGODB_URI + JWT secrets
npm install
npm run seed                 # loads the RAMP reference dataset (18 employees, etc.)
npm run dev                  # API on http://localhost:5000/api/v1
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev                  # app on http://localhost:5173 (proxies /api to :5000)
```

### 3. Log in
Every seeded employee has the password **`Password@123`**:

| Role | Email |
| --- | --- |
| HR Admin | `pankaj@itsybizz.com` |
| HR Representative | `pooja@itsybizz.com` |
| Finance Representative | `priya@itsybizz.com` |
| Employee | `rohit@itsybizz.com` |

## 🧱 Architecture

- **Backend** — modular (NestJS-style) layers per feature: `controller → service → repository/model`,
  Zod validation middleware, centralized error handling, Winston logging, Helmet/CORS/rate-limit/sanitization,
  soft deletes and audit logging. See [`backend/README.md`](backend/README.md).
- **Frontend** — feature-based clean architecture: `features/<module>/{Page,components,modals}`,
  a shared `components/ui` design system ported 1:1 from the reference design, Redux Toolkit for auth/UI
  state, React Query for server state, protected + role-based routes. See [`frontend/README.md`](frontend/README.md).

## 📜 License
© 2026 ITSYBIZZ AI Private Limited.
