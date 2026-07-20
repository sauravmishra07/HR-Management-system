import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/routes/ProtectedRoute';
import RoleRoute from '@/routes/RoleRoute';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoginPage from '@/features/auth/LoginPage';
import { ConfirmProvider, ToastHost } from '@/components/ui';
import { PageLoader } from '@/components/ui/Spinner';
import { useApplyTheme } from '@/hooks/useTheme';

const pages = {
  dashboard: lazy(() => import('@/features/dashboard/DashboardPage')),
  employees: lazy(() => import('@/features/employees/EmployeesPage')),
  attendance: lazy(() => import('@/features/attendance/AttendancePage')),
  leaves: lazy(() => import('@/features/leaves/LeavesPage')),
  payroll: lazy(() => import('@/features/payroll/PayrollPage')),
  exit: lazy(() => import('@/features/exit/ExitPage')),
  recruitment: lazy(() => import('@/features/recruitment/RecruitmentPage')),
  performance: lazy(() => import('@/features/performance/PerformancePage')),
  assets: lazy(() => import('@/features/assets/AssetsPage')),
  expenses: lazy(() => import('@/features/expenses/ExpensesPage')),
  documents: lazy(() => import('@/features/documents/DocumentsPage')),
  announcements: lazy(() => import('@/features/announcements/AnnouncementsPage')),
  holidays: lazy(() => import('@/features/holidays/HolidaysPage')),
  departments: lazy(() => import('@/features/departments/DepartmentsPage')),
  reports: lazy(() => import('@/features/reports/ReportsPage')),
  settings: lazy(() => import('@/features/settings/SettingsPage')),
};

export default function App() {
  useApplyTheme();
  return (
    <ConfirmProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {Object.entries(pages).map(([view, Page]) => (
              <Route key={view} element={<RoleRoute view={view} />}>
                <Route
                  path={`/${view}`}
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <Page />
                    </Suspense>
                  }
                />
              </Route>
            ))}
            <Route index element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <ToastHost />
    </ConfirmProvider>
  );
}
