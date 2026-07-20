import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/user/user.routes.js';
import employeeRoutes from '../modules/employee/employee.routes.js';
import departmentRoutes from '../modules/department/department.routes.js';
import attendanceRoutes from '../modules/attendance/attendance.routes.js';
import leaveRoutes from '../modules/leave/leave.routes.js';
import payrollRoutes from '../modules/payroll/payroll.routes.js';
import recruitmentRoutes from '../modules/recruitment/recruitment.routes.js';
import performanceRoutes from '../modules/performance/performance.routes.js';
import assetRoutes from '../modules/asset/asset.routes.js';
import expenseRoutes from '../modules/expense/expense.routes.js';
import documentRoutes from '../modules/document/document.routes.js';
import announcementRoutes from '../modules/announcement/announcement.routes.js';
import holidayRoutes from '../modules/holiday/holiday.routes.js';
import notificationRoutes from '../modules/notification/notification.routes.js';
import exitRoutes from '../modules/exit/exit.routes.js';
import reportRoutes from '../modules/report/report.routes.js';
import settingsRoutes from '../modules/settings/settings.routes.js';
import auditRoutes from '../modules/audit/audit.routes.js';

const router = Router();

/** Mount table — each module owns its own router. */
const modules = [
  ['/auth', authRoutes],
  ['/users', userRoutes],
  ['/employees', employeeRoutes],
  ['/departments', departmentRoutes],
  ['/attendance', attendanceRoutes],
  ['/leaves', leaveRoutes],
  ['/payroll', payrollRoutes],
  ['/recruitment', recruitmentRoutes],
  ['/performance', performanceRoutes],
  ['/assets', assetRoutes],
  ['/expenses', expenseRoutes],
  ['/documents', documentRoutes],
  ['/announcements', announcementRoutes],
  ['/holidays', holidayRoutes],
  ['/notifications', notificationRoutes],
  ['/exit', exitRoutes],
  ['/reports', reportRoutes],
  ['/settings', settingsRoutes],
  ['/audit', auditRoutes],
];

modules.forEach(([path, handler]) => router.use(path, handler));

router.get('/', (req, res) =>
  res.json({
    success: true,
    message: 'RAMP HRMS API',
    version: '1.0.0',
    modules: modules.map(([p]) => p),
  })
);

export default router;
