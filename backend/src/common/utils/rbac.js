import { PERMISSIONS, ROLES } from '../constants/index.js';

/** Views each role may access — mirrors the RAMP reference VIEWS map. */
export const ROLE_VIEWS = Object.freeze({
  [ROLES.HR_ADMIN]: [
    'dashboard', 'employees', 'attendance', 'leaves', 'payroll', 'exit', 'recruitment',
    'performance', 'assets', 'expenses', 'documents', 'announcements', 'holidays',
    'departments', 'reports', 'settings',
  ],
  [ROLES.HR_REP]: [
    'dashboard', 'employees', 'attendance', 'leaves', 'exit', 'recruitment', 'performance',
    'assets', 'expenses', 'documents', 'announcements', 'holidays', 'departments', 'reports',
  ],
  [ROLES.FINANCE_REP]: ['dashboard', 'employees', 'payroll', 'exit', 'expenses', 'documents', 'reports'],
  [ROLES.EMPLOYEE]: ['dashboard', 'attendance', 'leaves', 'payroll', 'exit', 'expenses', 'documents', 'announcements', 'holidays'],
});

export function can(role, permission) {
  return (PERMISSIONS[permission] || []).includes(role);
}

export function allowedViews(role) {
  return ROLE_VIEWS[role] || ROLE_VIEWS[ROLES.EMPLOYEE];
}

export function canView(role, view) {
  return allowedViews(role).includes(view);
}
