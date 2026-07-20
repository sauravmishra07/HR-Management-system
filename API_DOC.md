# RAMP HRMS — REST API Reference

**RAMP** (*Recruitment And Management of People*) is the HRMS backend that powers this
project. It is a modular **Express + MongoDB (Mongoose)** API with JWT authentication,
role‑based access control, request validation (Zod), rate limiting and a consistent
JSON envelope on every response.

- **Base URL (dev):** `http://localhost:5000`
- **API prefix:** `/api/v1` — every endpoint below is relative to `http://localhost:5000/api/v1`
- **Content type:** `application/json` (except file uploads, which use `multipart/form-data`)
- **Auth scheme:** `Authorization: Bearer <accessToken>` (a refresh‑token cookie is also supported)

---

## Table of contents

1. [Conventions](#conventions)
   - [Response envelope](#response-envelope)
   - [Errors & status codes](#errors--status-codes)
   - [Authentication flow](#authentication-flow)
   - [Rate limiting](#rate-limiting)
   - [Pagination, search & sorting](#pagination-search--sorting)
   - [Roles & permissions](#roles--permissions)
2. [Endpoints](#endpoints)
   - [Auth](#auth) · [Users](#users) · [Employees](#employees) · [Departments](#departments)
   - [Attendance](#attendance) · [Leaves](#leaves) · [Payroll](#payroll)
   - [Recruitment](#recruitment) · [Performance](#performance) · [Assets](#assets)
   - [Expenses](#expenses) · [Documents](#documents) · [Announcements](#announcements)
   - [Holidays](#holidays) · [Notifications](#notifications) · [Exit](#exit)
   - [Reports](#reports) · [Settings](#settings) · [Audit](#audit)
3. [Enums appendix](#enums-appendix)

---

## Conventions

### Response envelope

Every successful response uses the same shape:

```json
{
  "success": true,
  "message": "Success",
  "data": { },
  "meta": { "page": 1, "limit": 20, "total": 42, "pages": 3 }
}
```

- `data` — the payload (object, array or `null`).
- `meta` — present only on paginated list endpoints.
- `2xx` responses always have `success: true`.

### Errors & status codes

Errors use a parallel envelope:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Invalid email" }]
}
```

In non‑production environments a `stack` field is added for debugging.

| Status | Meaning | Typical cause |
|-------:|---------|---------------|
| `200` | OK | Successful read / update / delete |
| `201` | Created | Resource created |
| `400` | Bad Request | Malformed input / invalid id cast |
| `401` | Unauthorized | Missing / invalid / expired access token |
| `403` | Forbidden | Authenticated but lacks the role/permission, or deactivated account |
| `404` | Not Found | Unknown route or resource |
| `409` | Conflict | Duplicate unique value (e.g. email already exists) |
| `422` | Unprocessable Entity | Zod / Mongoose validation failure (see `errors[]`) |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Server Error | Unexpected failure |

### Authentication flow

1. **`POST /auth/login`** with `{ email, password }` → returns `accessToken`, `refreshToken`
   and the `user` profile. The refresh token is also set as an `httpOnly` cookie.
2. Send the access token on every request: `Authorization: Bearer <accessToken>`.
   Access tokens are short‑lived (default **15m**).
3. When a request returns `401`, call **`POST /auth/refresh`** (the browser client does this
   transparently). A valid refresh token (body or cookie) returns a fresh access token.
   Refresh tokens rotate on use and are revoked on logout / password change.
4. **`POST /auth/logout`** revokes the presented refresh token.

**Login response `data`:**

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": {
    "id": "665...", "empId": "EMP001", "name": "Pankaj Shukla",
    "email": "pankaj@itsybizz.com", "role": "HR Admin",
    "avatarSeed": 0, "mustResetPassword": false,
    "views": ["dashboard", "employees", "..."],
    "employee": { }
  }
}
```

> **Seeded logins (after `npm run seed`):** every employee email works with the password in
> `SEED_DEFAULT_PASSWORD` (default `Password@123`). Examples —
> `pankaj@itsybizz.com` (HR Admin), `pooja@itsybizz.com` (HR Representative),
> `priya@itsybizz.com` (Finance Representative), `rohit@itsybizz.com` (Employee).

### Rate limiting

- **Global:** the whole `/api/v1` tree is limited to **`RATE_LIMIT_MAX`** requests per
  **`RATE_LIMIT_WINDOW_MS`** per IP (defaults: **300 / 15 min**).
- **Auth:** `POST /auth/login`, `/auth/forgot-password`, `/auth/reset-password` add a
  stricter limiter — **`AUTH_RATE_LIMIT_MAX`** requests per window (default **20**).

Exceeding a limit returns `429`.

### Pagination, search & sorting

List endpoints that support pagination accept these query params:

| Param | Type | Notes |
|-------|------|-------|
| `page` | integer > 0 | Default `1` |
| `limit` | integer > 0 | Default `20`, **max `100`** |
| `search` | string | Free‑text match (endpoint‑specific fields) |
| `sortBy` | string | Field name to sort by |
| `sortOrder` | `asc` \| `desc` | Sort direction |

Additional per‑module filters (e.g. `status`, `dept`, `type`) are noted on each endpoint.
Paginated responses include the `meta` block shown above.

### Roles & permissions

There are four roles. Endpoints are guarded either by **role** or by a named **permission**
(a permission maps to the set of roles allowed to use it).

| Role | Description |
|------|-------------|
| **HR Admin** | Full access to every module and setting |
| **HR Representative** | People/workspace operations; no payroll run, offers, salary structures or settings |
| **Finance Representative** | Payroll, expenses, exit clearance and finance‑oriented reads |
| **Employee** | Self‑service: own attendance, leave, payslips, expenses, documents |

**Permission → roles matrix**

| Permission | HR Admin | HR Rep | Finance Rep | Employee |
|------------|:--:|:--:|:--:|:--:|
| `manageEmployee` | ✅ | ✅ | | |
| `manageDepartment` | ✅ | ✅ | | |
| `approveLeave` | ✅ | ✅ | | |
| `runPayroll` | ✅ | | ✅ | |
| `recruit` | ✅ | ✅ | | |
| `offer` | ✅ | | | |
| `salaryStructure` | ✅ | | | |
| `approveExpense` | ✅ | | ✅ | |
| `clearExpense` | ✅ | | ✅ | |
| `assignAsset` | ✅ | ✅ | | |
| `verifyDoc` | ✅ | ✅ | | |
| `announce` | ✅ | ✅ | | |
| `manageGoals` | ✅ | ✅ | | |
| `manageExit` | ✅ | ✅ | | |
| `clearExit` | ✅ | ✅ | ✅ | |
| `manageHoliday` | ✅ | ✅ | | |
| `settings` | ✅ | | | |

In the tables below, **Auth = Yes** means a valid access token is required, and **Guard**
names the extra role/permission check (blank = any authenticated user).

---

## Endpoints

### Auth

Base path `/auth`. The first four routes are public; the rest require authentication.

| Method | Endpoint | Auth | Guard | Description |
|--------|----------|:----:|-------|-------------|
| POST | `/auth/login` | No | rate‑limited | Authenticate, issue access + refresh tokens |
| POST | `/auth/refresh` | No | — | Exchange a refresh token for a new access token |
| POST | `/auth/forgot-password` | No | rate‑limited | Email a password‑reset link |
| POST | `/auth/reset-password` | No | rate‑limited | Set a new password from a reset token |
| GET | `/auth/me` | Yes | — | Current user profile (`views`, `employee`, …) |
| POST | `/auth/logout` | Yes | — | Revoke the presented refresh token |
| POST | `/auth/change-password` | Yes | — | Change own password (revokes all sessions) |

**Request bodies**

- `login` — `email` (string, email, **required**), `password` (string, **required**)
- `refresh` — `refreshToken` (string, min 10, optional — falls back to cookie)
- `forgot-password` — `email` (string, email, **required**)
- `reset-password` — `token` (string, min 10, **required**), `password` (string, 8–72, **required**)
- `change-password` — `currentPassword` (**required**), `newPassword` (string, 8–72, **required**)

---

### Users

Base path `/users`. All routes require authentication.

| Method | Endpoint | Auth | Guard | Description |
|--------|----------|:----:|-------|-------------|
| GET | `/users` | Yes | `manageEmployee` | List login accounts (paginated) |
| GET | `/users/me` | Yes | — | Current user's own account record |
| PATCH | `/users/:id/role` | Yes | `settings` | Change a user's role |
| PATCH | `/users/:id/deactivate` | Yes | `manageEmployee` | Disable a login account |
| PATCH | `/users/:id/activate` | Yes | `manageEmployee` | Re‑enable a login account |

**Query / body**

- `GET /users` — query: `page`, `limit`, `search`, `role` (enum, see appendix), `sortBy`, `sortOrder`
- `PATCH /users/:id/role` — body: `role` (enum, **required**)

---

### Employees

Base path `/employees`. All routes require authentication; writes require `manageEmployee`.

| Method | Endpoint | Auth | Guard | Description |
|--------|----------|:----:|-------|-------------|
| GET | `/employees` | Yes | — | List employees (paginated, filterable) |
| GET | `/employees/directory` | Yes | — | Full lightweight directory (no pagination) |
| GET | `/employees/:id` | Yes | — | Single employee by id |
| POST | `/employees` | Yes | `manageEmployee` | Create an employee (+ login account) |
| PUT | `/employees/:id` | Yes | `manageEmployee` | Update an employee |
| PATCH | `/employees/:id/toggle-status` | Yes | `manageEmployee` | Toggle Active / Inactive |
| DELETE | `/employees/:id` | Yes | `manageEmployee` | Soft‑delete an employee |

**Query / body**

- `GET /employees` — query: `page`, `limit`, `search`, `dept` (string), `status` (`Active`\|`Inactive`\|`Exited`), `access` (role enum), `sortBy`, `sortOrder`
- `POST /employees` — body: `name` (2–80, **required**), `dept` (**required**), `role`/designation (**required**), `email` (email, **required**), `phone` (6–20, optional), `join` (`YYYY-MM-DD`, optional), `dob` (`YYYY-MM-DD`, optional), `salary` (number ≥ 0, optional), `gender` (`M`\|`F`\|`O`, optional), `access` (role enum, optional), `managerId` (string, optional)
- `PUT /employees/:id` — same fields as `POST`, all optional

---

### Departments

Base path `/departments`. All routes require authentication; writes require `manageDepartment`.

| Method | Endpoint | Auth | Guard | Description |
|--------|----------|:----:|-------|-------------|
| GET | `/departments` | Yes | — | List all departments |
| GET | `/departments/:id` | Yes | — | Single department |
| POST | `/departments` | Yes | `manageDepartment` | Create a department |
| PUT | `/departments/:id` | Yes | `manageDepartment` | Update a department |
| DELETE | `/departments/:id` | Yes | `manageDepartment` | Delete a department |

**Body** — `POST`/`PUT`: `name` (2–60, **required** on create), `head` (string, optional), `headEmpId` (string, optional), `description` (≤ 300, optional), `code` (string, optional)

---

### Attendance

Base path `/attendance`. All routes require authentication.

| Method | Endpoint | Auth | Guard | Description |
|--------|----------|:----:|-------|-------------|
| GET | `/attendance/today` | Yes | — | Today's records + summary (`present/absent/leave/total`) |
| GET | `/attendance/summary` | Yes | — | Aggregate attendance summary |
| GET | `/attendance/month` | Yes | — | One employee's month grid |
| POST | `/attendance/check-in` | Yes | — | Record own (or given) check‑in |
| POST | `/attendance/check-out` | Yes | — | Record own (or given) check‑out |
| POST | `/attendance/mark` | Yes | `manageEmployee` | Manually set an employee's day status |

**Query / body**

- `GET /attendance/month` — query: `empId` (optional, defaults to caller), `month` (`YYYY-MM`, **required**)
- `check-in` / `check-out` — body: `empId` (optional, defaults to caller)
- `mark` — body: `empId` (**required**), `status` (`P`\|`A`\|`L`\|`W`\|`H`\|`""`, **required**), `date` (`YYYY-MM-DD`, optional)

---

### Leaves

Base path `/leaves`. All routes require authentication; approve/reject require `approveLeave`.

| Method | Endpoint | Auth | Guard | Description |
|--------|----------|:----:|-------|-------------|
| GET | `/leaves` | Yes | — | List leave requests (employees see their own) |
| GET | `/leaves/balance` | Yes | — | Remaining leave balance |
| POST | `/leaves` | Yes | — | Apply for leave |
| PATCH | `/leaves/:id/approve` | Yes | `approveLeave` | Approve a pending request |
| PATCH | `/leaves/:id/reject` | Yes | `approveLeave` | Reject a pending request |
| DELETE | `/leaves/:id` | Yes | — | Withdraw own pending request |

**Query / body**

- `GET /leaves` — query: `page`, `limit`, `status` (`Pending`\|`Approved`\|`Rejected`), `type` (`Casual`\|`Sick`\|`Earned`), `emp`, `search`, `sortBy`, `sortOrder`
- `GET /leaves/balance` — query: `empId` (optional)
- `POST /leaves` — body: `type` (leave enum, **required**), `from` (`YYYY-MM-DD`, **required**), `to` (`YYYY-MM-DD`, **required**), `reason` (≤ 300, optional)

---

### Payroll

Base path `/payroll`. All routes require authentication; runs require `runPayroll`.

| Method | Endpoint | Auth | Guard | Description |
|--------|----------|:----:|-------|-------------|
| GET | `/payroll` | Yes | — | Payroll run for a month with computed rows & totals |
| GET | `/payroll/months` | Yes | — | Distinct months + run status |
| GET | `/payroll/payslip/:empId` | Yes | — | One employee's payslip for a month |
| POST | `/payroll/run` | Yes | `runPayroll` | Process payroll for a month |
| POST | `/payroll/pay` | Yes | `runPayroll` | Mark a single employee paid |

**Query / body**

- `GET /payroll` — query: `month` (`YYYY-MM`, optional → current)
- `GET /payroll/payslip/:empId` — query: `month` (`YYYY-MM`, optional)
- `POST /payroll/run` — body: `month` (`YYYY-MM`, **required**)
- `POST /payroll/pay` — body: `month` (**required**), `empId` (**required**)

---

### Recruitment

Base path `/recruitment`. All routes require authentication. Sub‑resources: **openings**,
**candidates**, **salary‑structures**, **offers**.

| Method | Endpoint | Auth | Guard | Description |
|--------|----------|:----:|-------|-------------|
| GET | `/recruitment/openings` | Yes | — | List job openings |
| POST | `/recruitment/openings` | Yes | `recruit` | Create an opening |
| PUT | `/recruitment/openings/:id` | Yes | `recruit` | Update an opening |
| PATCH | `/recruitment/openings/:id/toggle` | Yes | `recruit` | Toggle Open / Closed |
| DELETE | `/recruitment/openings/:id` | Yes | `recruit` | Delete an opening |
| GET | `/recruitment/candidates` | Yes | — | List candidates |
| POST | `/recruitment/candidates` | Yes | `recruit` | Add a candidate |
| PATCH | `/recruitment/candidates/:id/stage` | Yes | `recruit` | Move pipeline stage |
| DELETE | `/recruitment/candidates/:id` | Yes | `recruit` | Delete a candidate |
| GET | `/recruitment/salary-structures` | Yes | — | List salary structures |
| POST | `/recruitment/salary-structures` | Yes | `salaryStructure` | Create a structure |
| PUT | `/recruitment/salary-structures/:id` | Yes | `salaryStructure` | Update a structure |
| DELETE | `/recruitment/salary-structures/:id` | Yes | `salaryStructure` | Delete a structure |
| GET | `/recruitment/offers` | Yes | `offer` | List offers |
| POST | `/recruitment/offers` | Yes | `offer` | Create an offer |
| GET | `/recruitment/offers/:id` | Yes | `offer` | Single offer |

**Selected bodies**

- `POST openings` — `title` (2–120, **required**), `dept` (**required**), `positions` (int > 0), `exp` (string), `status` (`Open`\|`Closed`), `posted` (`YYYY-MM-DD`)
- `POST candidates` — `name` (2–80, **required**), `job` (**required**), `phone` (6–20), `exp` (string), `stage` (stage enum), `applied` (`YYYY-MM-DD`)
- `PATCH candidates/:id/stage` — `stage` (`Applied`\|`Screening`\|`Interview`\|`Offer`\|`Hired`\|`Rejected`, **required**)
- `POST salary-structures` — `name` (2–80, **required**), `basicPct` / `hraPct` / `specialPct` (number 0–100, **required**), `pf` (bool), `pt` (number ≥ 0), `gratuity` (bool)
- `POST offers` — `name` (2–80, **required**), `role` (**required**), `dept` (**required**), `ctc` (number ≥ 0, **required**), `candidateCode` (string), `joinDate` (`YYYY-MM-DD`), `structureCode` (string)

---

### Performance

Base path `/performance`. All routes require authentication; writes require `manageGoals`.

| Method | Endpoint | Auth | Guard | Description |
|--------|----------|:----:|-------|-------------|
| GET | `/performance/goals` | Yes | — | List goals (filter by `emp`/`search`) |
| POST | `/performance/goals` | Yes | `manageGoals` | Create a goal |
| PATCH | `/performance/goals/:id/progress` | Yes | `manageGoals` | Update progress % |
| DELETE | `/performance/goals/:id` | Yes | `manageGoals` | Delete a goal |
| GET | `/performance/reviews` | Yes | — | List reviews (filter by `emp`) |
| POST | `/performance/reviews` | Yes | `manageGoals` | Create a review |
| DELETE | `/performance/reviews/:id` | Yes | `manageGoals` | Delete a review |

**Body**

- `POST goals` — `emp` (**required**), `title` (2–200, **required**), `due` (`YYYY-MM-DD`), `progress` (0–100)
- `PATCH goals/:id/progress` — `progress` (0–100)
- `POST reviews` — `emp` (**required**), `cycle` (**required**), `rating` (int 1–5, **required**), `note` (≤ 500)

---

### Assets

Base path `/assets`. All routes require authentication; writes require `assignAsset`.

| Method | Endpoint | Auth | Guard | Description |
|--------|----------|:----:|-------|-------------|
| GET | `/assets` | Yes | — | List assets (paginated, filterable) |
| GET | `/assets/summary` | Yes | — | Counts by status |
| POST | `/assets` | Yes | `assignAsset` | Create an asset |
| POST | `/assets/sync` | Yes | `assignAsset` | Bulk‑sync from the external asset API |
| PUT | `/assets/:id` | Yes | `assignAsset` | Update an asset |
| PATCH | `/assets/:id/assign` | Yes | `assignAsset` | Assign to an employee |
| PATCH | `/assets/:id/return` | Yes | `assignAsset` | Mark returned (Available) |
| PATCH | `/assets/:id/repair-done` | Yes | `assignAsset` | Mark repair complete |
| DELETE | `/assets/:id` | Yes | `assignAsset` | Delete an asset |

**Query / body**

- `GET /assets` — query: `page`, `limit`, `search`, `status` (`Assigned`\|`Available`\|`In Repair`), `type`, `sortBy`, `sortOrder`
- `POST /assets` — `name` (≤ 120, **required**), `type` (**required**), `tag`, `emp`, `status` (asset enum), `since`, `src` (`api`\|`manual`)
- `PATCH /assets/:id/assign` — body: `empId` (**required**)

---

### Expenses

Base path `/expenses`. All routes require authentication.

| Method | Endpoint | Auth | Guard | Description |
|--------|----------|:----:|-------|-------------|
| GET | `/expenses` | Yes | — | List expense claims (paginated) |
| GET | `/expenses/summary` | Yes | — | Totals by status |
| POST | `/expenses` | Yes | — | Submit a claim |
| PATCH | `/expenses/:id/approve` | Yes | `approveExpense` | Approve a claim |
| PATCH | `/expenses/:id/reject` | Yes | `approveExpense` | Reject a claim |
| PATCH | `/expenses/:id/pay` | Yes | `clearExpense` | Mark a claim paid |
| DELETE | `/expenses/:id` | Yes | — | Delete own claim |

**Query / body**

- `GET /expenses` — query: `page`, `limit`, `status` (`Pending`\|`Approved`\|`Rejected`\|`Paid`), `cat`, `emp`, `search`, `sortBy`, `sortOrder`
- `POST /expenses` — `title` (2–120, **required**), `cat` (**required**), `amt` (number > 0, **required**), `date` (`YYYY-MM-DD`, optional)

---

### Documents

Base path `/documents`. All routes require authentication; verify/reject require `verifyDoc`.

| Method | Endpoint | Auth | Guard | Description |
|--------|----------|:----:|-------|-------------|
| GET | `/documents` | Yes | — | List documents (paginated) |
| GET | `/documents/:id` | Yes | — | Single document |
| POST | `/documents` | Yes | — | Upload a document (**multipart**) |
| PATCH | `/documents/:id/verify` | Yes | `verifyDoc` | Mark verified |
| PATCH | `/documents/:id/reject` | Yes | `verifyDoc` | Mark rejected |
| DELETE | `/documents/:id` | Yes | — | Delete a document |

**Upload** — `POST /documents` is `multipart/form-data`:

- file field **`file`** (single) — allowed: `pdf, png, jpg/jpeg, webp, doc, docx, xls, xlsx, csv`; max `MAX_FILE_SIZE_MB` MB (default 10).
- text fields: `name` (**required**), `type` (**required**), `emp` (optional).

`GET /documents` — query: `page`, `limit`, `search`, `emp`, `status` (`Pending`\|`Verified`\|`Rejected`), `type`, `sortBy`, `sortOrder`.

---

### Announcements

Base path `/announcements`. All routes require authentication; writes require `announce`.

| Method | Endpoint | Auth | Guard | Description |
|--------|----------|:----:|-------|-------------|
| GET | `/announcements` | Yes | — | List announcements (paginated) |
| POST | `/announcements` | Yes | `announce` | Create an announcement |
| PUT | `/announcements/:id` | Yes | `announce` | Update an announcement |
| PATCH | `/announcements/:id/pin` | Yes | `announce` | Toggle pinned |
| DELETE | `/announcements/:id` | Yes | `announce` | Delete an announcement |

**Body** — `POST`/`PUT`: `title` (2–160, **required**), `body` (**required**), `pin` (bool, optional)

---

### Holidays

Base path `/holidays`. All routes require authentication; writes require `manageHoliday`.

| Method | Endpoint | Auth | Guard | Description |
|--------|----------|:----:|-------|-------------|
| GET | `/holidays` | Yes | — | List holidays (optionally by `year`) |
| GET | `/holidays/upcoming` | Yes | — | Upcoming holidays |
| POST | `/holidays` | Yes | `manageHoliday` | Create a holiday |
| DELETE | `/holidays/:id` | Yes | `manageHoliday` | Delete a holiday |

**Query / body**

- `GET /holidays` — query: `year` (int 1970–9999, optional)
- `POST /holidays` — `date` (`YYYY-MM-DD`, **required**), `name` (2–120, **required**)

---

### Notifications

Base path `/notifications`. All routes require authentication.

| Method | Endpoint | Auth | Guard | Description |
|--------|----------|:----:|-------|-------------|
| GET | `/notifications` | Yes | — | Own notifications + `unreadCount` (in `meta`) |
| POST | `/notifications` | Yes | `announce` | Broadcast a notification |
| PATCH | `/notifications/read-all` | Yes | — | Mark all read |
| PATCH | `/notifications/:id/read` | Yes | — | Mark one read |
| DELETE | `/notifications` | Yes | — | Clear all own notifications |

**Body** — `POST /notifications`: `t` (title, **required**), `s` (subtitle), `ico` (icon), `link`, `user` (target empId; empty = broadcast)

---

### Exit

Base path `/exit`. All routes require authentication. Most writes require `manageExit`;
`clearance` requires `clearExit` (also open to Finance).

| Method | Endpoint | Auth | Guard | Description |
|--------|----------|:----:|-------|-------------|
| GET | `/exit` | Yes | — | List exit cases (paginated, filterable) |
| GET | `/exit/:id` | Yes | — | Single exit case |
| GET | `/exit/:id/documents` | Yes | — | Documents for a case |
| GET | `/exit/documents/:docId` | Yes | — | Single generated document |
| POST | `/exit` | Yes | `manageExit` | Initiate an exit case |
| POST | `/exit/:id/documents/generate` | Yes | `manageExit` | Generate a letter (relieving/experience/…) |
| PATCH | `/exit/:id/clearance` | Yes | `clearExit` | Toggle a departmental clearance flag |
| PATCH | `/exit/:id/interview` | Yes | `manageExit` | Set exit‑interview done |
| PATCH | `/exit/:id/fnf` | Yes | `manageExit` | Set full‑&‑final amount |
| PATCH | `/exit/:id/settle-fnf` | Yes | `manageExit` | Mark F&F settled |
| PATCH | `/exit/:id/withdraw` | Yes | `manageExit` | Withdraw the case |
| PATCH | `/exit/:id/complete` | Yes | `manageExit` | Complete the case |
| DELETE | `/exit/:id` | Yes | `manageExit` | Delete the case |

**Body**

- `POST /exit` — `emp` (**required**), `type` (`Resignation`\|`Termination`, **required**), `reason` (**required**), `lastDay` (`YYYY-MM-DD`, **required**)
- `POST /exit/:id/documents/generate` — `docType` (**required**)
- `PATCH /exit/:id/clearance` — `key` (`IT`\|`Finance`\|`Admin`\|`HR`\|`Reporting`, **required**), `value` (boolean, **required**)
- `PATCH /exit/:id/interview` — `done` (boolean, **required**)
- `PATCH /exit/:id/fnf` — `fnfAmount` (number ≥ 0, **required**)

---

### Reports

Base path `/reports`. All routes require authentication (no extra guard). These power the
dashboard and the Reports page.

| Method | Endpoint | Auth | Guard | Description |
|--------|----------|:----:|-------|-------------|
| GET | `/reports/overview` | Yes | — | KPI summary for the dashboard |
| GET | `/reports/headcount` | Yes | — | Active headcount grouped by department |
| GET | `/reports/salary-bands` | Yes | — | Active employees bucketed into 4 salary bands |
| GET | `/reports/attendance-trend` | Yes | — | Present/absent/leave for the last 7 days |

**Response shapes**

- `overview` →
  ```json
  {
    "headcount": 156, "deptCount": 7,
    "byDept": [{ "dept": "Engineering", "count": 48 }],
    "byGender": { "M": 92, "F": 58, "O": 6 },
    "avgSalary": 54200, "payrollMonthly": 7840000,
    "leavePending": 6, "expensePending": { "count": 3, "amount": 18400 }
  }
  ```
- `headcount` → `[{ "dept": "Engineering", "count": 48 }, …]` (sorted desc)
- `salary-bands` → fixed 4‑item array: `[{ "band": "<30k", "count": 5 }, { "band": "30-50k" }, { "band": "50-75k" }, { "band": "75k+" }]`
- `attendance-trend` → 7 items (oldest first): `[{ "date": "2026-07-14", "present": 138, "absent": 7, "leave": 11 }, …]` (empty `[]` if no attendance data)

---

### Settings

Base path `/settings`. All routes require authentication; writes require `settings`.

| Method | Endpoint | Auth | Guard | Description |
|--------|----------|:----:|-------|-------------|
| GET | `/settings` | Yes | — | Read company/brand/leave‑quota settings |
| PUT | `/settings` | Yes | `settings` | Update general/attendance settings |
| PUT | `/settings/offer-template` | Yes | `settings` | Update offer‑letter template |
| PUT | `/settings/exit-templates` | Yes | `settings` | Update exit‑document templates map |
| PUT | `/settings/asset-api` | Yes | `settings` | Update external asset‑API config |

**Selected body** — `PUT /settings`: `company`, `brand`, `tagline`, `address`, `email`,
`phone`, `cin` (strings), `cl` / `sl` / `el` (leave quotas, int ≥ 0), `weekOff` (string[]),
`inTime`, `lateAfter` (strings), `needApproval` / `selfCheckin` / `emailAlerts` (bool).

---

### Audit

Base path `/audit`. Requires authentication **and** `settings` permission (HR Admin only).

| Method | Endpoint | Auth | Guard | Description |
|--------|----------|:----:|-------|-------------|
| GET | `/audit` | Yes | `settings` | List audit‑log entries (paginated, filterable) |

**Query** — `page`, `limit`, `action` (audit enum), `entity`, `search`, `sortBy`, `sortOrder`

---

## Enums appendix

| Enum | Values |
|------|--------|
| **Roles** | `HR Admin`, `HR Representative`, `Finance Representative`, `Employee` |
| **Employee status** | `Active`, `Inactive`, `Exited` |
| **Attendance status** | `P` (present), `A` (absent), `L` (leave), `W` (week off), `H` (holiday), `""` (not marked) |
| **Leave type** | `Casual`, `Sick`, `Earned` |
| **Leave / Expense status** | `Pending`, `Approved`, `Rejected` (+ `Paid` for expenses) |
| **Payroll status** | `Pending`, `Processing`, `Paid` |
| **Job status** | `Open`, `Closed` |
| **Candidate stage** | `Applied`, `Screening`, `Interview`, `Offer`, `Hired`, `Rejected` |
| **Asset status** | `Assigned`, `Available`, `In Repair` |
| **Document status** | `Pending`, `Verified`, `Rejected` |
| **Exit type** | `Resignation`, `Termination` |
| **Exit status** | `In Progress`, `Clearance`, `Completed`, `Withdrawn` |
| **Clearance keys** | `IT`, `Finance`, `Admin`, `HR`, `Reporting` |
| **Audit actions** | `LOGIN`, `LOGOUT`, `CREATE`, `UPDATE`, `DELETE`, `APPROVE`, `REJECT`, `PAYROLL_RUN` |

---

*Generated for the RAMP HRMS backend (`/api/v1`). For feature‑level, how‑to documentation
see [`GUIDE.md`](./GUIDE.md).*
