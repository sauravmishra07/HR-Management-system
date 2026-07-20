/** Application-wide enums and constants. Mirrors the RAMP reference data model. */

export const ROLES = Object.freeze({
  HR_ADMIN: 'HR Admin',
  HR_REP: 'HR Representative',
  FINANCE_REP: 'Finance Representative',
  EMPLOYEE: 'Employee',
});

export const ROLE_VALUES = Object.values(ROLES);

/** Fine-grained permissions mapped to the roles allowed to use them. */
export const PERMISSIONS = Object.freeze({
  manageEmployee: [ROLES.HR_ADMIN, ROLES.HR_REP],
  approveLeave: [ROLES.HR_ADMIN, ROLES.HR_REP],
  recruit: [ROLES.HR_ADMIN, ROLES.HR_REP],
  offer: [ROLES.HR_ADMIN],
  salaryStructure: [ROLES.HR_ADMIN],
  approveExpense: [ROLES.HR_ADMIN, ROLES.FINANCE_REP],
  clearExpense: [ROLES.HR_ADMIN, ROLES.FINANCE_REP],
  runPayroll: [ROLES.HR_ADMIN, ROLES.FINANCE_REP],
  assignAsset: [ROLES.HR_ADMIN, ROLES.HR_REP],
  verifyDoc: [ROLES.HR_ADMIN, ROLES.HR_REP],
  announce: [ROLES.HR_ADMIN, ROLES.HR_REP],
  manageGoals: [ROLES.HR_ADMIN, ROLES.HR_REP],
  manageExit: [ROLES.HR_ADMIN, ROLES.HR_REP],
  clearExit: [ROLES.HR_ADMIN, ROLES.HR_REP, ROLES.FINANCE_REP],
  manageDepartment: [ROLES.HR_ADMIN, ROLES.HR_REP],
  manageHoliday: [ROLES.HR_ADMIN, ROLES.HR_REP],
  settings: [ROLES.HR_ADMIN],
});

export const EMPLOYEE_STATUS = Object.freeze({ ACTIVE: 'Active', INACTIVE: 'Inactive', EXITED: 'Exited' });

export const ATTENDANCE_STATUS = Object.freeze({
  PRESENT: 'P',
  ABSENT: 'A',
  LEAVE: 'L',
  WEEK_OFF: 'W',
  HOLIDAY: 'H',
  NOT_MARKED: '',
});

export const LEAVE_TYPES = Object.freeze({ CASUAL: 'Casual', SICK: 'Sick', EARNED: 'Earned' });
export const LEAVE_STATUS = Object.freeze({ PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected' });

export const PAYROLL_STATUS = Object.freeze({ PENDING: 'Pending', PROCESSING: 'Processing', PAID: 'Paid' });

export const JOB_STATUS = Object.freeze({ OPEN: 'Open', CLOSED: 'Closed' });
export const CANDIDATE_STAGES = Object.freeze([
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Hired',
  'Rejected',
]);

export const ASSET_STATUS = Object.freeze({ ASSIGNED: 'Assigned', AVAILABLE: 'Available', IN_REPAIR: 'In Repair' });

export const EXPENSE_STATUS = Object.freeze({ PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected', PAID: 'Paid' });

export const DOC_STATUS = Object.freeze({ PENDING: 'Pending', VERIFIED: 'Verified', REJECTED: 'Rejected' });

export const EXIT_TYPE = Object.freeze({ RESIGNATION: 'Resignation', TERMINATION: 'Termination' });
export const EXIT_STATUS = Object.freeze({
  IN_PROGRESS: 'In Progress',
  CLEARANCE: 'Clearance',
  COMPLETED: 'Completed',
  WITHDRAWN: 'Withdrawn',
});
export const CLEARANCE_KEYS = Object.freeze(['IT', 'Finance', 'Admin', 'HR', 'Reporting']);
export const FNF_STATUS = Object.freeze({ PENDING: 'Pending', SETTLED: 'Settled' });

export const AUDIT_ACTIONS = Object.freeze({
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  PAYROLL_RUN: 'PAYROLL_RUN',
});

export const PAGINATION = Object.freeze({ DEFAULT_PAGE: 1, DEFAULT_LIMIT: 20, MAX_LIMIT: 100 });
