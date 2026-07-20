# RAMP HRMS — Feature Guide

**RAMP** (*Recruitment And Management of People*) is a full‑stack HR Management System:
a MERN application with an **Express + MongoDB** API and a **React 19 + Vite + Tailwind**
front‑end. This guide explains how to set the project up and how to use every feature,
role by role.

> Looking for endpoint‑level details (methods, payloads, status codes)? See
> [`API_DOC.md`](./API_DOC.md).

---

## Contents

- [1. What you get](#1-what-you-get)
- [2. Tech stack](#2-tech-stack)
- [3. Project layout](#3-project-layout)
- [4. Getting started](#4-getting-started)
- [5. Roles at a glance](#5-roles-at-a-glance)
- [6. Everyday concepts](#6-everyday-concepts)
- [7. Feature guides](#7-feature-guides)
  - [Dashboard](#dashboard) · [Employees](#employees) · [Attendance](#attendance)
  - [Leave](#leave) · [Payroll](#payroll) · [Exit & Offboarding](#exit--offboarding)
  - [Recruitment](#recruitment) · [Performance](#performance) · [Assets](#assets)
  - [Reimbursements](#reimbursements) · [Documents](#documents)
  - [Announcements](#announcements) · [Holidays](#holidays) · [Departments](#departments)
  - [Reports](#reports) · [Settings](#settings)
- [8. Theme & personalisation](#8-theme--personalisation)
- [9. Troubleshooting](#9-troubleshooting)

---

## 1. What you get

A complete HR back‑office covering the full employee life‑cycle:

- **People** — employee master records, departments, attendance, leave, payroll, offboarding.
- **Workspace** — recruitment pipeline, performance goals & reviews, asset tracking,
  reimbursements, document vault.
- **Organisation** — announcements, holiday calendar, analytics reports, company settings.
- **Security** — JWT auth with silent refresh, four‑tier role‑based access control, audit log.
- **Self‑service** — every employee can mark attendance, apply for leave, view payslips,
  claim expenses and upload documents from their own login.

---

## 2. Tech stack

| Layer | Technology |
|-------|-----------|
| Front‑end | React 19, Vite, React Router, Redux Toolkit, TanStack Query, Tailwind CSS, **Chart.js** |
| Back‑end | Node.js, Express, Mongoose (MongoDB), Zod, JWT, Helmet, Multer, Nodemailer, Winston |
| Auth | Access + rotating refresh JWTs, bcrypt password hashing |

---

## 3. Project layout

```
Hra-management/
├─ backend/                 # Express + MongoDB API
│  └─ src/
│     ├─ modules/           # one folder per feature (routes/controller/service/model/validation)
│     ├─ common/            # middlewares, utils, constants, RBAC
│     ├─ config/            # env config + DB connection
│     ├─ routes/index.js    # mounts every module under /api/v1
│     └─ seed/              # demo data + `npm run seed`
├─ frontend/                # React 19 + Vite client
│  └─ src/
│     ├─ features/          # one folder per page (dashboard, employees, …)
│     ├─ components/ui/     # shared UI kit (Card, Button, Chart, StatCard, …)
│     ├─ api/index.js       # typed API client for every endpoint
│     ├─ lib/               # axios instance, Chart.js setup + brand palette
│     └─ constants/nav.js   # navigation, role → views, permissions
├─ API_DOC.md               # REST API reference
└─ GUIDE.md                 # this file
```

---

## 4. Getting started

### Prerequisites

- **Node.js 18+** and **npm**
- A **MongoDB** database (local `mongod` or a MongoDB Atlas connection string)

### 4.1 Back‑end

```bash
cd backend
npm install
cp .env.example .env      # then edit .env — see below
npm run seed              # wipes & loads demo data (departments, employees, logins, …)
npm run dev               # starts the API on http://localhost:5000 (nodemon)
```

**Configure `.env`** (the important ones):

| Variable | What to set |
|----------|-------------|
| `MONGODB_URI` | Your own MongoDB connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` / `JWT_RESET_SECRET` | Long random secrets (change from the defaults!) |
| `CLIENT_URL` | Front‑end origin, e.g. `http://localhost:5173` (comma‑separate for multiple) |
| `SEED_DEFAULT_PASSWORD` | Password every seeded login gets (default `Password@123`) |
| `SMTP_*` | Optional — only needed for password‑reset emails |

> ⚠️ Replace the sample `MONGODB_URI` and all JWT secrets in `.env.example` before deploying —
> never ship the example values.

Check it's alive: open `http://localhost:5000/health` → `{ "success": true, "status": "ok" }`.

### 4.2 Front‑end

```bash
cd frontend
npm install
npm run dev               # starts Vite on http://localhost:5173
```

The dev server proxies `/api` and `/uploads` to the backend on port 5000, so no CORS setup
is needed locally. To point at a different API, set `VITE_API_URL`.

### 4.3 First login

After seeding, sign in at `http://localhost:5173` with any seeded email and the seed password:

| Email | Role |
|-------|------|
| `pankaj@itsybizz.com` | HR Admin (full access) |
| `pooja@itsybizz.com` | HR Representative |
| `priya@itsybizz.com` | Finance Representative |
| `rohit@itsybizz.com` | Employee |

Password for all: whatever you set in `SEED_DEFAULT_PASSWORD` (default `Password@123`).

---

## 5. Roles at a glance

The sidebar and every action adapt to your role — you only ever see what you're allowed to do.

| | HR Admin | HR Representative | Finance Representative | Employee |
|--|:--:|:--:|:--:|:--:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Employees | ✅ manage | ✅ manage | 👁 view | — |
| Attendance | ✅ | ✅ | — | ✅ own |
| Leave | ✅ approve | ✅ approve | — | ✅ apply |
| Payroll | ✅ run | — | ✅ run | 👁 own payslip |
| Exit & Offboarding | ✅ | ✅ | ✅ clearance | 👁 own |
| Recruitment | ✅ + offers | ✅ (no offers) | — | — |
| Performance | ✅ | ✅ | — | — |
| Assets | ✅ | ✅ | — | — |
| Reimbursements | ✅ approve/pay | — | ✅ approve/pay | ✅ claim |
| Documents | ✅ verify | ✅ verify | 👁 | ✅ upload |
| Announcements | ✅ post | ✅ post | — | 👁 |
| Holidays | ✅ manage | ✅ manage | — | 👁 |
| Departments | ✅ manage | ✅ manage | — | — |
| Reports | ✅ | ✅ | ✅ | — |
| Settings | ✅ | — | — | — |

✅ = full use · 👁 = read/own only · — = hidden

---

## 6. Everyday concepts

- **Navigation** — the left sidebar is grouped into **Overview**, **People**, **Workspace**
  and **Organisation**. Your role decides which items appear.
- **Self‑service vs. management** — employees act on *their own* records; HR/Finance act on
  *everyone's*. The same page shows different controls depending on who's logged in.
- **Everything is live** — data is fetched with TanStack Query and refreshes automatically
  after you make a change (mark attendance, approve leave, etc.).
- **Toasts** confirm every action; validation errors appear inline on forms.
- **Search & filters** — list pages have a search box plus status/type filters and pagination.

---

## 7. Feature guides

### Dashboard

**What it is:** your daily home screen — a live pulse of the organisation.

**Highlights**
- **Today strip** — the date, a live clock, the company "attendance pulse" bar, and quick
  actions to **Mark my attendance** / **Apply for leave**.
- **Stat cards** — total employees, present today, pending approvals, monthly payroll.
- **Analytics (Chart.js):**
  - **Attendance trend** — a 7‑day line chart of *Present* vs *On leave*. Use the
    **Line / Bar** toggle in the card header to switch chart style.
  - **Workforce split** — a doughnut of the gender mix with the headcount in the centre.
  - **Headcount by department** — a bar chart of active employees per department.
- **Leave requests waiting for you** — approvers can approve/reject inline.
- **Announcements** and **Upcoming holidays** feeds.

**How to use:** just log in. Click **Mark my attendance** to check in; click again later to
check out. Approvers can clear leave requests without leaving the page.

---

### Employees

**Who:** HR Admin & HR Representative manage; Finance can view.

**What you can do**
- Browse the workforce with search, department/status filters and pagination.
- **Add an employee:** click **Add employee**, fill name, department, designation, email
  (required) plus optional phone, join date, DOB, salary, gender, access role and manager.
  Creating an employee also provisions their **login account**.
- **Edit** any field, **toggle Active/Inactive**, or **delete** (soft‑delete) a record.
- Open a profile to see their details and linked data.

> The `access` field sets the person's RBAC role — choose carefully, it controls what they
> can see and do.

---

### Attendance

**Who:** everyone marks their own; HR can mark anyone.

**Legend:** Present · On leave · Absent · Week off · Holiday.

**How to use**
- **Check in / out:** from the Dashboard today‑strip or the Attendance page, tap
  **Check in** (and **Check out** later). Times are recorded automatically.
- **HR override:** HR can **mark** any employee's day as Present/Absent/Leave/Week‑off/Holiday,
  or view a single employee's **monthly grid** (`month` = `YYYY-MM`).
- The daily view shows a summary (present/absent/leave/total) that also feeds the dashboard.

---

### Leave

**Who:** employees apply; HR Admin/Rep approve.

**How to apply**
1. Click **Apply for leave**.
2. Pick a **type** (Casual / Sick / Earned), the **from**–**to** dates, and an optional reason.
3. Submit — the request enters the **Pending** queue and its days are computed automatically.

**How to approve:** on the Leave page (or right on the Dashboard), approvers see pending
requests and **Approve** or **Reject** each with one tap. Employees can **withdraw** their own
request while it's still pending. Check remaining balance anytime via **balance**.

---

### Payroll

**Who:** HR Admin & Finance run it; employees see their own payslip.

**How to run**
1. Pick the **month**.
2. Click **Run payroll · <month>** and confirm. Active employees are processed and marked paid;
   totals (gross, deductions, net) are computed from each employee's salary and structure.
3. Use **Pay** to settle a single employee, or open a **payslip** for any month.

`months` lists every processed month with its run status.

---

### Exit & Offboarding

**Who:** HR Admin/Rep manage; Finance handles clearance.

**Workflow**
1. **Initiate** an exit: choose the employee, **type** (Resignation / Termination), reason and
   **last working day**.
2. **Clearances** — toggle each departmental sign‑off: `IT`, `Finance`, `Admin`, `HR`, `Reporting`.
3. **Exit interview** — mark done when completed.
4. **Full & Final (F&F)** — set the settlement amount, then **Settle F&F**.
5. **Generate documents** — produce a relieving/experience letter (templates come from Settings).
6. **Complete** the case (or **Withdraw** if the exit is cancelled).

---

### Recruitment

**Who:** HR Admin & HR Rep (offers and salary structures are HR Admin‑only).

**Four areas**
- **Openings** — create job posts (title, department, positions, experience, status),
  toggle Open/Closed, edit or delete.
- **Candidates** — add applicants and move them through the pipeline:
  `Applied → Screening → Interview → Offer → Hired` (or `Rejected`).
- **Salary structures** *(HR Admin)* — define reusable pay templates with basic/HRA/special
  percentages plus PF, PT and gratuity flags.
- **Offers** *(HR Admin)* — generate an offer for a candidate (name, role, department, CTC,
  join date) using the offer template from Settings.

---

### Performance

**Who:** HR Admin & HR Rep.

- **Goals** — create a goal for an employee (title + due date), then update its **progress %**
  as work advances.
- **Reviews** — record a review with a **cycle**, a **rating (1–5)** and notes.
- Filter both by employee.

---

### Assets

**Who:** HR Admin & HR Rep.

- Track company assets (laptops, monitors, etc.) with type, tag and status
  (**Assigned / Available / In Repair**).
- **Assign** an asset to an employee, mark it **Returned**, or **Repair done** after service.
- **Sync** pulls the master list from an external Asset app (configure the endpoint & token in
  **Settings → Asset Management API**).
- The **summary** shows counts per status.

---

### Reimbursements

**Who:** employees claim; HR Admin/Finance approve and pay.

**How to use**
1. **Submit a claim:** title, category, amount (and optional date).
2. Approvers **Approve** or **Reject** the claim.
3. Finance/HR then **Pay** approved claims (status → Paid).

Filter by status/category; the **summary** tallies amounts by status.

---

### Documents

**Who:** employees upload; HR verifies.

- **Upload** a file (PDF, image, Word, Excel or CSV — up to the configured size limit) with a
  name and type, optionally tied to an employee.
- HR **verifies** or **rejects** each document (status: Pending → Verified/Rejected).
- Files are served from `/uploads`.

---

### Announcements

**Who:** HR Admin & HR Rep post; everyone reads.

- **Create** an announcement (title + body), optionally **pin** it to the top.
- Pinned items surface on the Dashboard feed. Edit, unpin or delete anytime.

---

### Holidays

**Who:** HR Admin & HR Rep manage; everyone views.

- **Add** a holiday (date + name); browse by **year** or see **upcoming** holidays.
- Upcoming holidays appear on the Dashboard.

---

### Departments

**Who:** HR Admin & HR Rep.

- **Create** departments (name, head, code, description) and **edit/delete** them.
- Department names drive the employee directory filters and the **Headcount by department**
  chart on the Dashboard.

---

### Reports

**Who:** HR Admin, HR Rep and Finance.

Analytics for the whole organisation, powered by the `/reports` endpoints:
- **Overview** KPIs (headcount, payroll, pending approvals, gender & department breakdown).
- **Headcount** by department.
- **Salary bands** (`<30k`, `30–50k`, `50–75k`, `75k+`).
- **Attendance trend** for the last 7 days.

These are the same data sources the Dashboard charts use.

---

### Settings

**Who:** HR Admin only.

- **Company profile** — name, brand, tagline, address, contact, CIN.
- **Leave policy & attendance** — annual Casual/Sick/Earned quotas, week‑offs, in‑time,
  late‑after threshold, and toggles for *require approval*, *self check‑in* and *email alerts*.
- **Offer letter format** — edit once; every generated offer uses it.
- **Exit document templates** — templates for relieving/experience letters.
- **Asset Management API** — endpoint URL + bearer token for the asset **Sync**.

Everyone can *read* settings (so pages know the rules); only HR Admin can *change* them.

---

## 8. Theme & personalisation

- **Light / dark mode** — toggle from the top bar; your choice is saved to `localStorage`.
- **Brand palette** — the UI uses a cohesive blue system:
  **`#293681`** (navy) · **`#4274D9`** (blue) · **`#95CCDD`** (cyan) · **`#D0E7E6`** (mint).
  These are defined once as CSS variables in `frontend/src/index.css` and as the Chart.js
  palette in `frontend/src/lib/charts.js`, so changing them re‑themes the whole app and all
  charts together.

---

## 9. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Missing required environment variables` on boot | Set `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` in `backend/.env`. |
| Can't log in after fresh clone | Run `npm run seed` in `backend/`, then use a seeded email + `SEED_DEFAULT_PASSWORD`. |
| Front‑end calls fail with CORS/404 | Ensure the backend is on `:5000` and `CLIENT_URL` includes your front‑end origin. |
| `401` then auto‑logout | Access token expired and refresh failed — log in again; check the JWT secrets match between runs. |
| `429 Too Many Requests` | Rate limit hit — wait for the window, or raise `RATE_LIMIT_MAX` / `AUTH_RATE_LIMIT_MAX` in `.env`. |
| Password‑reset email not sent | Configure the `SMTP_*` variables (or reset the password by re‑seeding in dev). |
| A sidebar item is missing | Expected — it's hidden for your role. Log in as HR Admin to see everything. |

---

*For endpoint‑level documentation (paths, payloads, responses, status codes) see
[`API_DOC.md`](./API_DOC.md).*
