# RAMP HRMS — Frontend

React 19 + Vite. Feature-based clean architecture, Tailwind design system ported from the RAMP reference.

## Scripts
```bash
npm run dev       # Vite dev server on :5173 (proxies /api + /uploads to :5000)
npm run build     # production build
npm run preview   # preview the build
```

## Stack
- **React 19** + **React Router 6** (protected + role-based routes, lazy-loaded pages)
- **Redux Toolkit** — auth + UI (toasts, sidebar) state, persisted access token
- **React Query** — all server state (queries, mutations, cache invalidation)
- **Axios** — instance with auth header injection + transparent 401 refresh
- **React Hook Form + Zod** — every form
- **Tailwind CSS** — utility layer over CSS design tokens (blue-only palette from the reference)
- **Framer Motion** — modal/toast/page transitions
- **React Icons** + a bundled inline icon set

## Structure
```
src/
├── main.jsx             Providers: Redux, React Query, Router
├── App.jsx              Route table (lazy pages, ProtectedRoute + RoleRoute)
├── index.css            Design tokens + ported component classes (.card/.btn/.chip/.stat/table…)
├── api/index.js         Typed API client (one object per resource)
├── lib/                 axios instance + interceptors, queryClient
├── store/               Redux store, authSlice, uiSlice
├── constants/nav.js     Navigation, role→views, permissions
├── hooks/               useAuth, useToast, useDebounce
├── utils/               format (dates/money/words), csv
├── components/ui/       Reusable design system (Button, Card, Modal, DataTable, Chip, Field,
│                        Avatar, StatCard, Pagination, Tabs, Icon, ConfirmProvider, ToastHost…)
├── layouts/             DashboardLayout, Sidebar, Topbar, NotificationBell
├── routes/              ProtectedRoute, RoleRoute
└── features/<module>/   <Module>Page.jsx + feature components/modals
    auth dashboard employees attendance leaves payroll exit recruitment performance
    assets expenses documents announcements holidays departments reports settings
```

## Conventions
- Pages fetch via React Query (`select: r => r.data`, read `r.meta` for pagination).
- Mutations `toast()` + `invalidateQueries` on success; `toast(apiError(e), 'error')` on failure.
- Destructive actions use the imperative `useConfirm()` dialog.
- Role/permission checks via `useAuth().can(perm)` / route `RoleRoute`.
- No business logic in components — it lives in the API layer and the backend.

## Configuration
The dev server proxies `/api` and `/uploads` to `http://localhost:5000`. To point at a different
API, set `VITE_API_URL` (e.g. in a `.env`).
