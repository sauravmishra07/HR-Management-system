/** Navigation, role views and permissions — mirrors the RAMP reference. */

export const NAV = [
  { group: 'Overview', items: [['dashboard', 'Dashboard', 'grid']] },
  {
    group: 'People',
    items: [
      ['employees', 'Employees', 'users'],
      ['attendance', 'Attendance', 'clock'],
      ['leaves', 'Leave', 'cal'],
      ['payroll', 'Payroll', 'banknote'],
      ['idcard', 'Issued ID Card', 'user-check'],
      ['exit', 'Exit Process', 'logout'],
    ],
  },
  {
    group: 'Workspace',
    items: [
      ['recruitment', 'Recruitment', 'briefcase'],
      ['performance', 'Performance', 'target'],
      ['assets', 'Assets', 'monitor'],
      ['expenses', 'Reimbursements', 'receipt'],
      ['documents', 'Documents', 'file'],
    ],
  },
  {
    group: 'Organisation',
    items: [
      ['announcements', 'Announcements', 'mega'],
      ['holidays', 'Holidays', 'sun'],
      ['departments', 'Departments', 'building'],
      ['reports', 'Reports', 'chart'],
      ['settings', 'Settings', 'gear'],
    ],
  },
];

export const TITLES = {
  dashboard: 'Dashboard',
  employees: 'Employees',
  attendance: 'Attendance',
  leaves: 'Leave Management',
  payroll: 'Payroll',
  exit: 'Exit & Offboarding',
  recruitment: 'Recruitment',
  performance: 'Performance',
  assets: 'Assets',
  expenses: 'Reimbursements',
  documents: 'Documents',
  announcements: 'Announcements',
  holidays: 'Holidays',
  departments: 'Departments',
  reports: 'Reports',
  settings: 'Settings',
  idcard: 'Issued ID Card',
};

export const ROLES = ['HR Admin', 'HR Representative', 'Finance Representative', 'Employee'];

export const ROLE_VIEWS = {
  'HR Admin': NAV.flatMap((g) => g.items.map((i) => i[0])),
  'HR Representative': [
    'dashboard', 'employees', 'attendance', 'leaves', 'payroll', 'idcard', 'exit', 'recruitment', 'performance',
    'assets', 'expenses', 'documents', 'announcements', 'holidays', 'departments', 'reports',
  ],
  'Finance Representative': ['dashboard', 'employees', 'payroll', 'idcard', 'exit', 'expenses', 'documents', 'reports'],
  Employee: ['dashboard', 'attendance', 'leaves', 'payroll', 'idcard', 'exit', 'expenses', 'documents', 'announcements', 'holidays'],
};

export const PERMS = {
  manageEmployee: ['HR Admin', 'HR Representative'],
  approveLeave: ['HR Admin', 'HR Representative'],
  recruit: ['HR Admin', 'HR Representative'],
  offer: ['HR Admin'],
  salaryStructure: ['HR Admin'],
  approveExpense: ['HR Admin', 'Finance Representative'],
  clearExpense: ['HR Admin', 'Finance Representative'],
  runPayroll: ['HR Admin', 'Finance Representative'],
  assignAsset: ['HR Admin', 'HR Representative'],
  verifyDoc: ['HR Admin', 'HR Representative'],
  announce: ['HR Admin', 'HR Representative'],
  manageGoals: ['HR Admin', 'HR Representative'],
  manageExit: ['HR Admin', 'HR Representative'],
  clearExit: ['HR Admin', 'HR Representative', 'Finance Representative'],
  manageDepartment: ['HR Admin', 'HR Representative'],
  manageHoliday: ['HR Admin', 'HR Representative'],
  settings: ['HR Admin'],
};

export const canView = (role, view) => (ROLE_VIEWS[role] || ROLE_VIEWS.Employee).includes(view);
export const can = (role, perm) => (PERMS[perm] || []).includes(role);
