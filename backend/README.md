# RAMP HRMS — Backend API

Node.js + Express + MongoDB (Mongoose) REST API. ESM, modular architecture.

## Scripts
```bash
npm run dev     # nodemon, hot reload
npm start       # production
npm run seed    # wipe + load the reference dataset
```

## Structure
```
src/
├── app.js               Express app (security, parsing, routes, error handling)
├── server.js            Bootstrap: config check → DB connect → listen → graceful shutdown
├── config/              Env config (validated) + Mongoose connection
├── common/
│   ├── constants/       Roles, permissions, enums
│   ├── middlewares/     auth (JWT+RBAC), validate (Zod), error, rateLimit, sanitize, upload (Multer)
│   ├── models/          Shared Counter model (human-readable ids: EMP001, LV-1044 …)
│   └── utils/           ApiError, ApiResponse, asyncHandler, jwt, password, logger, mailer, query,
│                        salary (breakup/inWords), rbac, enrich (employee lookups)
├── routes/index.js      Central mount table for all module routers
├── seed/                Reference data + seeder
└── modules/<name>/      Per feature: model · repository · service · controller · validation · routes
    auth user employee department attendance leave payroll recruitment performance
    asset expense document announcement holiday notification exit report settings audit
```

## Conventions
- **Layered**: controllers only validate + delegate + respond; services hold business logic; repositories/models do persistence.
- **Responses**: consistent `{ success, message, data, meta? }` via `ApiResponse`.
- **Errors**: throw `ApiError`; a global middleware normalizes Mongoose/JWT errors and formats output. No per-controller try/catch (`asyncHandler` wraps everything).
- **Validation**: Zod schemas (`{ body, params, query }`) applied by `validate()`.
- **Auth**: `authenticate` (Bearer/cookie) → `req.user`; `requirePermission('<perm>')` / `authorizeRoles(...)` gate routes.
- **Security**: Helmet, CORS (credentials), rate limiting (stricter on `/auth`), mongo-injection + XSS sanitization, bcrypt password hashing, httpOnly refresh cookie.
- **Soft delete** (`deletedAt`) + **audit log** on significant mutations.

## API surface
Base URL: `/api/v1`. All routes (except `/auth/login`, `/auth/refresh`, `/auth/forgot-password`,
`/auth/reset-password`) require a Bearer access token.

```
POST   /auth/login | /auth/refresh | /auth/logout | /auth/change-password
GET    /auth/me
GET    /employees | GET/PUT/POST/DELETE /employees/:id | PATCH /employees/:id/toggle-status
GET    /departments | POST | PUT/:id | DELETE/:id
GET    /attendance/today | /summary | /month  ·  POST /check-in | /check-out | /mark
GET    /leaves | /leaves/balance  ·  POST /leaves  ·  PATCH /leaves/:id/approve|reject
GET    /payroll | /payroll/months | /payroll/payslip/:empId  ·  POST /payroll/run | /pay
GET    /recruitment/openings|candidates|salary-structures|offers  (+ POST/PUT/PATCH/DELETE)
GET    /performance/goals | /reviews  (+ POST, PATCH progress, DELETE)
GET    /assets | /assets/summary  ·  PATCH assign|return|repair-done  ·  POST /assets/sync
GET    /expenses | /summary  ·  PATCH approve|reject|pay
GET    /documents  ·  POST (multipart)  ·  PATCH verify|reject
GET    /announcements  ·  POST/PUT/DELETE  ·  PATCH pin
GET    /holidays | /holidays/upcoming  ·  POST/DELETE
GET    /notifications  ·  PATCH read | read-all  ·  DELETE (clear)
GET    /exit | /exit/:id  ·  PATCH clearance|interview|fnf|settle-fnf|withdraw|complete  ·  POST documents/generate
GET    /reports/overview | /headcount | /salary-bands | /attendance-trend
GET    /settings  ·  PUT (+ offer-template, exit-templates, asset-api)
GET    /users | /users/me  ·  PATCH :id/role|activate|deactivate
GET    /audit
```

## Environment
See `.env.example`. Required: `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`.
