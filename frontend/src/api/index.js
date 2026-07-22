import api from '@/lib/axios';

const unwrap = (p) => p.then((r) => r.data);
const qs = (params) => {
  const clean = Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v !== '' && v != null));
  const s = new URLSearchParams(clean).toString();
  return s ? `?${s}` : '';
};

/* -------------------- Auth -------------------- */
export const authApi = {
  login: (body) => unwrap(api.post('/auth/login', body)),
  logout: () => unwrap(api.post('/auth/logout')),
  me: () => unwrap(api.get('/auth/me')),
  changePassword: (body) => unwrap(api.post('/auth/change-password', body)),
  forgotPassword: (body) => unwrap(api.post('/auth/forgot-password', body)),
  resetPassword: (body) => unwrap(api.post('/auth/reset-password', body)),
};

/* -------------------- Employees -------------------- */
export const employeeApi = {
  list: (params) => unwrap(api.get(`/employees${qs(params)}`)),
  directory: () => unwrap(api.get('/employees/directory')),
  get: (id) => unwrap(api.get(`/employees/${id}`)),
  create: (body) => unwrap(api.post('/employees', body)),
  update: (id, body) => unwrap(api.put(`/employees/${id}`, body)),
  toggleStatus: (id) => unwrap(api.patch(`/employees/${id}/toggle-status`)),
  remove: (id) => unwrap(api.delete(`/employees/${id}`)),
};

/* -------------------- Departments -------------------- */
export const departmentApi = {
  list: () => unwrap(api.get('/departments')),
  create: (body) => unwrap(api.post('/departments', body)),
  update: (id, body) => unwrap(api.put(`/departments/${id}`, body)),
  remove: (id) => unwrap(api.delete(`/departments/${id}`)),
};

/* -------------------- Attendance -------------------- */
export const attendanceApi = {
  today: () => unwrap(api.get('/attendance/today')),
  summary: () => unwrap(api.get('/attendance/summary')),
  month: (params) => unwrap(api.get(`/attendance/month${qs(params)}`)),
  checkIn: (body) => unwrap(api.post('/attendance/check-in', body)),
  checkOut: (body) => unwrap(api.post('/attendance/check-out', body)),
  mark: (body) => unwrap(api.post('/attendance/mark', body)),
};

/* -------------------- Leaves -------------------- */
export const leaveApi = {
  list: (params) => unwrap(api.get(`/leaves${qs(params)}`)),
  balance: (params) => unwrap(api.get(`/leaves/balance${qs(params)}`)),
  apply: (body) => unwrap(api.post('/leaves', body)),
  approve: (id) => unwrap(api.patch(`/leaves/${id}/approve`)),
  reject: (id) => unwrap(api.patch(`/leaves/${id}/reject`)),
  remove: (id) => unwrap(api.delete(`/leaves/${id}`)),
};

/* -------------------- Evening Reports -------------------- */
export const eveningReportApi = {
  list: (params) => unwrap(api.get(`/evening-reports${qs(params)}`)),
  submit: (body) => unwrap(api.post('/evening-reports', body)),
};

/* -------------------- Payroll -------------------- */
export const payrollApi = {
  get: (params) => unwrap(api.get(`/payroll${qs(params)}`)),
  months: () => unwrap(api.get('/payroll/months')),
  run: (body) => unwrap(api.post('/payroll/run', body)),
  pay: (body) => unwrap(api.post('/payroll/pay', body)),
  payslip: (empId, params) => unwrap(api.get(`/payroll/payslip/${empId}${qs(params)}`)),
};

/* -------------------- Recruitment -------------------- */
export const recruitmentApi = {
  openings: (params) => unwrap(api.get(`/recruitment/openings${qs(params)}`)),
  createOpening: (body) => unwrap(api.post('/recruitment/openings', body)),
  updateOpening: (id, body) => unwrap(api.put(`/recruitment/openings/${id}`, body)),
  toggleOpening: (id) => unwrap(api.patch(`/recruitment/openings/${id}/toggle`)),
  removeOpening: (id) => unwrap(api.delete(`/recruitment/openings/${id}`)),
  candidates: (params) => unwrap(api.get(`/recruitment/candidates${qs(params)}`)),
  createCandidate: (body) => unwrap(api.post('/recruitment/candidates', body)),
  moveStage: (id, stage) => unwrap(api.patch(`/recruitment/candidates/${id}/stage`, { stage })),
  removeCandidate: (id) => unwrap(api.delete(`/recruitment/candidates/${id}`)),
  structures: () => unwrap(api.get('/recruitment/salary-structures')),
  createStructure: (body) => unwrap(api.post('/recruitment/salary-structures', body)),
  updateStructure: (id, body) => unwrap(api.put(`/recruitment/salary-structures/${id}`, body)),
  removeStructure: (id) => unwrap(api.delete(`/recruitment/salary-structures/${id}`)),
  offers: () => unwrap(api.get('/recruitment/offers')),
  createOffer: (body) => unwrap(api.post('/recruitment/offers', body)),
  getOffer: (id) => unwrap(api.get(`/recruitment/offers/${id}`)),
};

/* -------------------- Performance -------------------- */
export const performanceApi = {
  goals: (params) => unwrap(api.get(`/performance/goals${qs(params)}`)),
  createGoal: (body) => unwrap(api.post('/performance/goals', body)),
  bumpGoal: (id, body) => unwrap(api.patch(`/performance/goals/${id}/progress`, body || {})),
  removeGoal: (id) => unwrap(api.delete(`/performance/goals/${id}`)),
  reviews: (params) => unwrap(api.get(`/performance/reviews${qs(params)}`)),
  createReview: (body) => unwrap(api.post('/performance/reviews', body)),
  removeReview: (id) => unwrap(api.delete(`/performance/reviews/${id}`)),
};

/* -------------------- Assets -------------------- */
export const assetApi = {
  list: (params) => unwrap(api.get(`/assets${qs(params)}`)),
  summary: () => unwrap(api.get('/assets/summary')),
  create: (body) => unwrap(api.post('/assets', body)),
  update: (id, body) => unwrap(api.put(`/assets/${id}`, body)),
  assign: (id, empId) => unwrap(api.patch(`/assets/${id}/assign`, { empId })),
  returnAsset: (id) => unwrap(api.patch(`/assets/${id}/return`)),
  repairDone: (id) => unwrap(api.patch(`/assets/${id}/repair-done`)),
  sync: () => unwrap(api.post('/assets/sync')),
  remove: (id) => unwrap(api.delete(`/assets/${id}`)),
};

/* -------------------- Expenses -------------------- */
export const expenseApi = {
  list: (params) => unwrap(api.get(`/expenses${qs(params)}`)),
  summary: () => unwrap(api.get('/expenses/summary')),
  create: (body) => unwrap(api.post('/expenses', body)),
  approve: (id) => unwrap(api.patch(`/expenses/${id}/approve`)),
  reject: (id) => unwrap(api.patch(`/expenses/${id}/reject`)),
  pay: (id) => unwrap(api.patch(`/expenses/${id}/pay`)),
  remove: (id) => unwrap(api.delete(`/expenses/${id}`)),
};

/* -------------------- Documents -------------------- */
export const documentApi = {
  list: (params) => unwrap(api.get(`/documents${qs(params)}`)),
  create: (formData) =>
    unwrap(api.post('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } })),
  verify: (id) => unwrap(api.patch(`/documents/${id}/verify`)),
  reject: (id) => unwrap(api.patch(`/documents/${id}/reject`)),
  remove: (id) => unwrap(api.delete(`/documents/${id}`)),
};

/* -------------------- Announcements -------------------- */
export const announcementApi = {
  list: (params) => unwrap(api.get(`/announcements${qs(params)}`)),
  create: (body) => unwrap(api.post('/announcements', body)),
  update: (id, body) => unwrap(api.put(`/announcements/${id}`, body)),
  togglePin: (id) => unwrap(api.patch(`/announcements/${id}/pin`)),
  remove: (id) => unwrap(api.delete(`/announcements/${id}`)),
};

/* -------------------- Holidays -------------------- */
export const holidayApi = {
  list: (params) => unwrap(api.get(`/holidays${qs(params)}`)),
  upcoming: () => unwrap(api.get('/holidays/upcoming')),
  create: (body) => unwrap(api.post('/holidays', body)),
  remove: (id) => unwrap(api.delete(`/holidays/${id}`)),
};

/* -------------------- Notifications -------------------- */
export const notificationApi = {
  list: () => unwrap(api.get('/notifications')),
  markRead: (id) => unwrap(api.patch(`/notifications/${id}/read`)),
  markAllRead: () => unwrap(api.patch('/notifications/read-all')),
  clear: () => unwrap(api.delete('/notifications')),
};

/* -------------------- Exit -------------------- */
export const exitApi = {
  list: (params) => unwrap(api.get(`/exit${qs(params)}`)),
  get: (id) => unwrap(api.get(`/exit/${id}`)),
  create: (body) => unwrap(api.post('/exit', body)),
  clearance: (id, body) => unwrap(api.patch(`/exit/${id}/clearance`, body)),
  interview: (id, done) => unwrap(api.patch(`/exit/${id}/interview`, { done })),
  fnf: (id, fnfAmount) => unwrap(api.patch(`/exit/${id}/fnf`, { fnfAmount })),
  settleFnf: (id) => unwrap(api.patch(`/exit/${id}/settle-fnf`)),
  withdraw: (id) => unwrap(api.patch(`/exit/${id}/withdraw`)),
  complete: (id) => unwrap(api.patch(`/exit/${id}/complete`)),
  generateDoc: (id, docType) => unwrap(api.post(`/exit/${id}/documents/generate`, { docType })),
  getDoc: (docId) => unwrap(api.get(`/exit/documents/${docId}`)),
  docs: (id) => unwrap(api.get(`/exit/${id}/documents`)),
  remove: (id) => unwrap(api.delete(`/exit/${id}`)),
};

/* -------------------- Reports -------------------- */
export const reportApi = {
  overview: () => unwrap(api.get('/reports/overview')),
  headcount: () => unwrap(api.get('/reports/headcount')),
  salaryBands: () => unwrap(api.get('/reports/salary-bands')),
  attendanceTrend: () => unwrap(api.get('/reports/attendance-trend')),
};

/* -------------------- Settings -------------------- */
export const settingsApi = {
  get: () => unwrap(api.get('/settings')),
  update: (body) => unwrap(api.put('/settings', body)),
  updateOfferTemplate: (offerTemplate) => unwrap(api.put('/settings/offer-template', { offerTemplate })),
  updateExitTemplates: (exitTemplates) => unwrap(api.put('/settings/exit-templates', { exitTemplates })),
  updateAssetApi: (body) => unwrap(api.put('/settings/asset-api', body)),
};

/* -------------------- Users & Audit -------------------- */
export const userApi = {
  list: (params) => unwrap(api.get(`/users${qs(params)}`)),
  me: () => unwrap(api.get('/users/me')),
  setRole: (id, role) => unwrap(api.patch(`/users/${id}/role`, { role })),
  deactivate: (id) => unwrap(api.patch(`/users/${id}/deactivate`)),
  activate: (id) => unwrap(api.patch(`/users/${id}/activate`)),
};

export const auditApi = {
  list: (params) => unwrap(api.get(`/audit${qs(params)}`)),
};
