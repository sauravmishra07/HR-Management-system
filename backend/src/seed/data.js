/**
 * Reference dataset lifted from the RAMP HTML preview (DB object).
 * Used by the seed script to bootstrap a fresh database.
 */

export const settings = {
  company: 'ITSYBIZZ AI Private Limited',
  brand: 'RAMP',
  tagline: 'Recruitment And Management of People',
  address: '121-B, 2nd Floor, HSIIDC Industrial Area, Sector 31, Faridabad, Haryana 121003',
  email: 'hr@itsybizz.com',
  phone: '+91 98110 00000',
  cin: 'U72900HR2021PTC000000',
  cl: 12,
  sl: 10,
  el: 18,
  weekOff: ['Sun'],
  inTime: '09:30',
  needApproval: true,
  selfCheckin: true,
  emailAlerts: true,
  lateAfter: '09:45',
  assetApi: {
    url: 'https://assetsapi.itsybizz.com/api/v1/assets',
    key: '',
    enabled: true,
    lastSync: '2026-07-11 18:40',
  },
  offerTemplate: `{{DATE}}

Dear {{NAME}},

We are pleased to offer you the position of {{ROLE}} in the {{DEPT}} department at {{COMPANY}}. Your employment will be based at our office located at {{ADDRESS}}.

Your annual Cost to Company (CTC) will be {{CTC_WORDS}} ({{CTC}}) per annum, structured as detailed in the enclosed salary annexure. Your tentative date of joining will be {{JOIN}}.

This offer is subject to verification of your documents and satisfactory completion of background checks. Please sign and return a copy of this letter as a token of your acceptance.

We look forward to welcoming you to the team.

Warm regards,
{{HR_NAME}}
{{HR_ROLE}}
{{COMPANY}}`,
  exitTemplates: {
    'Relieving Letter': `{{DATE}}

TO WHOMSOEVER IT MAY CONCERN

This is to certify that {{NAME}} (Employee ID: {{EMPID}}) was employed with {{COMPANY}} as {{ROLE}} in the {{DEPT}} department from {{JOIN}} to {{LASTDAY}}.

{{NAME}} has been relieved from all duties and responsibilities with effect from the close of business on {{LASTDAY}}, and has completed all exit formalities including handover and no-dues clearance.

We thank {{NAME}} for the contributions made during the tenure and wish them the very best for future endeavours.

For {{COMPANY}}
{{HR_NAME}}
{{HR_ROLE}}`,
    'Experience Letter': `{{DATE}}

EXPERIENCE CERTIFICATE

This is to certify that {{NAME}} (Employee ID: {{EMPID}}) served {{COMPANY}} as {{ROLE}} in the {{DEPT}} department from {{JOIN}} to {{LASTDAY}}.

During this period, {{NAME}} was found to be sincere, hardworking and professional in conduct. Their performance and contribution to the organisation were satisfactory throughout the tenure.

We wish {{NAME}} continued success in all future assignments.

For {{COMPANY}}
{{HR_NAME}}
{{HR_ROLE}}`,
    'Full & Final Statement': `{{DATE}}

FULL & FINAL SETTLEMENT STATEMENT

Employee : {{NAME}} ({{EMPID}})
Designation : {{ROLE}}, {{DEPT}}
Date of Joining : {{JOIN}}
Last Working Day : {{LASTDAY}}

The full and final settlement has been computed as per company policy, covering salary payable up to the last working day, leave encashment and applicable statutory dues, net of recoveries and notice adjustments.

Net amount payable: {{FNF_WORDS}} ({{FNF}}).

This settlement is final and no further dues are payable by either party.

For {{COMPANY}}
{{HR_NAME}}
{{HR_ROLE}}`,
    'No-Dues Clearance': `{{DATE}}

NO-DUES CLEARANCE CERTIFICATE

Employee : {{NAME}} ({{EMPID}})
Designation : {{ROLE}}, {{DEPT}}
Last Working Day : {{LASTDAY}}

This is to confirm that {{NAME}} has cleared all dues and returned all company assets. Clearance has been obtained from IT, Finance, Admin, HR and the Reporting Manager. No dues are pending against the employee.

For {{COMPANY}}
{{HR_NAME}}
{{HR_ROLE}}`,
  },
};

export const departments = [
  { code: 'D1', name: 'Engineering', head: 'Rohit Verma' },
  { code: 'D2', name: 'Production & IoT', head: 'Amit Kumar' },
  { code: 'D3', name: 'Sales & Marketing', head: 'Vikas Malik' },
  { code: 'D4', name: 'HR & Admin', head: 'Aarti Sharma' },
  { code: 'D5', name: 'Accounts', head: 'Nitin Saini' },
  { code: 'D6', name: 'Support', head: 'Manish Rawat' },
];

export const employees = [
  { empId: 'EMP001', name: 'Pankaj Shukla', dept: 'Engineering', role: 'Co-founder & CTO', email: 'pankaj@itsybizz.com', phone: '98110 11001', join: '2021-03-12', dob: '1992-07-18', salary: 150000, status: 'Active', access: 'HR Admin', gender: 'M' },
  { empId: 'EMP002', name: 'Aarti Sharma', dept: 'HR & Admin', role: 'HR Manager', email: 'aarti@itsybizz.com', phone: '98110 11002', join: '2022-01-10', dob: '1994-07-21', salary: 60000, status: 'Active', access: 'HR Admin', gender: 'F' },
  { empId: 'EMP003', name: 'Rohit Verma', dept: 'Engineering', role: 'Sr. MERN Developer', email: 'rohit@itsybizz.com', phone: '98110 11003', join: '2022-06-01', dob: '1995-01-11', salary: 85000, status: 'Active', access: 'Employee', gender: 'M' },
  { empId: 'EMP004', name: 'Neha Gupta', dept: 'Engineering', role: 'Frontend Developer', email: 'neha@itsybizz.com', phone: '98110 11004', join: '2023-02-15', dob: '1997-08-02', salary: 55000, status: 'Active', access: 'Employee', gender: 'F' },
  { empId: 'EMP005', name: 'Amit Kumar', dept: 'Production & IoT', role: 'IoT Engineer', email: 'amit@itsybizz.com', phone: '98110 11005', join: '2022-09-05', dob: '1993-11-30', salary: 65000, status: 'Active', access: 'Employee', gender: 'M' },
  { empId: 'EMP006', name: 'Sunil Yadav', dept: 'Production & IoT', role: 'PLC Technician', email: 'sunil@itsybizz.com', phone: '98110 11006', join: '2023-04-18', dob: '1990-05-25', salary: 38000, status: 'Active', access: 'Employee', gender: 'M' },
  { empId: 'EMP007', name: 'Priya Singh', dept: 'Accounts', role: 'Accounts Executive', email: 'priya@itsybizz.com', phone: '98110 11007', join: '2023-01-09', dob: '1996-02-14', salary: 42000, status: 'Active', access: 'Finance Representative', gender: 'F' },
  { empId: 'EMP008', name: 'Vikas Malik', dept: 'Sales & Marketing', role: 'Sales Manager', email: 'vikas@itsybizz.com', phone: '98110 11008', join: '2021-11-22', dob: '1989-09-09', salary: 70000, status: 'Active', access: 'Employee', gender: 'M' },
  { empId: 'EMP009', name: 'Kirti Chauhan', dept: 'Sales & Marketing', role: 'Sales Executive', email: 'kirti@itsybizz.com', phone: '98110 11009', join: '2024-03-04', dob: '1998-12-01', salary: 35000, status: 'Active', access: 'Employee', gender: 'F' },
  { empId: 'EMP010', name: 'Deepak Joshi', dept: 'Engineering', role: 'Backend Developer', email: 'deepak@itsybizz.com', phone: '98110 11010', join: '2023-08-21', dob: '1996-06-17', salary: 72000, status: 'Active', access: 'Employee', gender: 'M' },
  { empId: 'EMP011', name: 'Manish Rawat', dept: 'Support', role: 'Support Engineer', email: 'manish@itsybizz.com', phone: '98110 11011', join: '2024-01-15', dob: '1997-03-08', salary: 32000, status: 'Active', access: 'Employee', gender: 'M' },
  { empId: 'EMP012', name: 'Pooja Bansal', dept: 'HR & Admin', role: 'HR Executive', email: 'pooja@itsybizz.com', phone: '98110 11012', join: '2024-06-10', dob: '1999-10-19', salary: 30000, status: 'Active', access: 'HR Representative', gender: 'F' },
  { empId: 'EMP013', name: 'Arjun Mehta', dept: 'Engineering', role: 'QA Engineer', email: 'arjun@itsybizz.com', phone: '98110 11013', join: '2023-10-02', dob: '1995-04-27', salary: 48000, status: 'Active', access: 'Employee', gender: 'M' },
  { empId: 'EMP014', name: 'Sanya Kapoor', dept: 'Engineering', role: 'UI/UX Designer', email: 'sanya@itsybizz.com', phone: '98110 11014', join: '2024-02-19', dob: '1998-01-23', salary: 52000, status: 'Active', access: 'Employee', gender: 'F' },
  { empId: 'EMP015', name: 'Ravi Prakash', dept: 'Production & IoT', role: 'Field Engineer', email: 'ravi@itsybizz.com', phone: '98110 11015', join: '2023-12-01', dob: '1994-08-14', salary: 36000, status: 'Active', access: 'Employee', gender: 'M' },
  { empId: 'EMP016', name: 'Nitin Saini', dept: 'Accounts', role: 'Accountant', email: 'nitin@itsybizz.com', phone: '98110 11016', join: '2022-04-11', dob: '1991-12-05', salary: 45000, status: 'Active', access: 'Finance Representative', gender: 'M' },
  { empId: 'EMP017', name: 'Shreya Iyer', dept: 'Sales & Marketing', role: 'Content & Marketing', email: 'shreya@itsybizz.com', phone: '98110 11017', join: '2024-08-05', dob: '1999-07-28', salary: 40000, status: 'Active', access: 'Employee', gender: 'F' },
  { empId: 'EMP018', name: 'Harsh Vardhan', dept: 'Engineering', role: 'DevOps Engineer', email: 'harsh@itsybizz.com', phone: '98110 11018', join: '2024-05-20', dob: '1996-11-11', salary: 78000, status: 'Active', access: 'Employee', gender: 'M' },
];

export const attendanceToday = {
  EMP001: { st: 'P', in: '09:12', out: '' }, EMP002: { st: 'P', in: '09:25', out: '' }, EMP003: { st: 'P', in: '09:31', out: '' },
  EMP004: { st: 'P', in: '09:05', out: '' }, EMP005: { st: 'P', in: '08:58', out: '' }, EMP006: { st: 'A', in: '', out: '' },
  EMP007: { st: 'P', in: '09:40', out: '' }, EMP008: { st: 'P', in: '09:15', out: '' }, EMP009: { st: 'L', in: '', out: '' },
  EMP010: { st: 'P', in: '09:22', out: '' }, EMP011: { st: '', in: '', out: '' }, EMP012: { st: '', in: '', out: '' },
  EMP013: { st: 'P', in: '09:36', out: '' }, EMP014: { st: 'P', in: '09:08', out: '' }, EMP015: { st: 'L', in: '', out: '' },
  EMP016: { st: 'P', in: '09:29', out: '' }, EMP017: { st: 'P', in: '09:44', out: '' }, EMP018: { st: 'P', in: '09:02', out: '' },
};

export const leaves = [
  { code: 'LV-1043', emp: 'EMP004', type: 'Casual', from: '2026-07-15', to: '2026-07-16', days: 2, reason: 'Family function at home', status: 'Pending', applied: '2026-07-10' },
  { code: 'LV-1042', emp: 'EMP010', type: 'Sick', from: '2026-07-14', to: '2026-07-14', days: 1, reason: 'Fever, doctor advised rest', status: 'Pending', applied: '2026-07-11' },
  { code: 'LV-1041', emp: 'EMP013', type: 'Earned', from: '2026-07-20', to: '2026-07-24', days: 5, reason: 'Family trip to Nainital', status: 'Pending', applied: '2026-07-08' },
  { code: 'LV-1040', emp: 'EMP009', type: 'Casual', from: '2026-07-10', to: '2026-07-13', days: 4, reason: "Sister's wedding", status: 'Approved', applied: '2026-07-02' },
  { code: 'LV-1039', emp: 'EMP015', type: 'Sick', from: '2026-07-12', to: '2026-07-12', days: 1, reason: 'Back pain', status: 'Approved', applied: '2026-07-11' },
  { code: 'LV-1038', emp: 'EMP003', type: 'Earned', from: '2026-06-22', to: '2026-06-24', days: 3, reason: 'Personal work', status: 'Approved', applied: '2026-06-15' },
  { code: 'LV-1037', emp: 'EMP017', type: 'Casual', from: '2026-06-19', to: '2026-06-19', days: 1, reason: 'Bank & documentation work', status: 'Rejected', applied: '2026-06-17' },
  { code: 'LV-1036', emp: 'EMP001', type: 'Casual', from: '2026-06-05', to: '2026-06-05', days: 1, reason: 'Client visit — personal vehicle', status: 'Approved', applied: '2026-06-03' },
];

export const payrollRuns = [
  { month: '2026-06', status: 'Paid', paidOn: '2026-07-01' },
  { month: '2026-07', status: 'Pending', paidOn: '' },
];

export const openings = [
  { code: 'JOB-07', title: 'MERN Stack Developer', dept: 'Engineering', positions: 2, exp: '2–4 yrs', status: 'Open', posted: '2026-06-20' },
  { code: 'JOB-08', title: 'IoT Field Engineer', dept: 'Production & IoT', positions: 1, exp: '1–3 yrs', status: 'Open', posted: '2026-06-28' },
  { code: 'JOB-06', title: 'HR Executive', dept: 'HR & Admin', positions: 1, exp: '0–2 yrs', status: 'Closed', posted: '2026-05-02' },
  { code: 'JOB-09', title: 'Sales Executive', dept: 'Sales & Marketing', positions: 2, exp: '1–2 yrs', status: 'Open', posted: '2026-07-04' },
];

export const candidates = [
  { code: 'CND-31', name: 'Aman Tyagi', job: 'MERN Stack Developer', phone: '99530 44121', exp: '3 yrs', stage: 'Interview', applied: '2026-07-01' },
  { code: 'CND-32', name: 'Ritu Saxena', job: 'Sales Executive', phone: '88264 90112', exp: '2 yrs', stage: 'Screening', applied: '2026-07-06' },
  { code: 'CND-33', name: 'Kunal Bose', job: 'IoT Field Engineer', phone: '70113 55890', exp: '1.5 yrs', stage: 'Applied', applied: '2026-07-09' },
  { code: 'CND-30', name: 'Megha Jain', job: 'MERN Stack Developer', phone: '98991 23405', exp: '4 yrs', stage: 'Offer', applied: '2026-06-25' },
  { code: 'CND-34', name: 'Tarun Khanna', job: 'Sales Executive', phone: '96540 78123', exp: '1 yr', stage: 'Applied', applied: '2026-07-10' },
  { code: 'CND-29', name: 'Divya Nair', job: 'IoT Field Engineer', phone: '95822 66710', exp: '2 yrs', stage: 'Interview', applied: '2026-06-30' },
  { code: 'CND-28', name: 'Sahil Anand', job: 'MERN Stack Developer', phone: '93125 40098', exp: '2 yrs', stage: 'Rejected', applied: '2026-06-22' },
  { code: 'CND-25', name: 'Isha Rana', job: 'HR Executive', phone: '98730 12764', exp: '1 yr', stage: 'Hired', applied: '2026-05-10' },
];

export const salaryStructures = [
  { code: 'SS1', name: 'Standard (Engineering)', basicPct: 50, hraPct: 20, specialPct: 30, pf: true, pt: 200, gratuity: true },
  { code: 'SS2', name: 'Sales (with variable)', basicPct: 45, hraPct: 18, specialPct: 37, pf: true, pt: 200, gratuity: true },
  { code: 'SS3', name: 'Intern / Contract', basicPct: 60, hraPct: 15, specialPct: 25, pf: false, pt: 0, gratuity: false },
];

export const goals = [
  { code: 'G1', emp: 'EMP003', title: 'Ship JCWMS v2 with OPC-UA live sync', due: '2026-09-30', progress: 70 },
  { code: 'G2', emp: 'EMP005', title: 'Sanmati machine agents uptime ≥ 99%', due: '2026-08-31', progress: 85 },
  { code: 'G3', emp: 'EMP008', title: 'Close ₹40L sales pipeline for Q3', due: '2026-09-30', progress: 55 },
  { code: 'G4', emp: 'EMP011', title: 'Bring avg. ticket resolution under 4 hrs', due: '2026-08-15', progress: 40 },
  { code: 'G5', emp: 'EMP002', title: 'Hire 3 engineers + 1 sales executive', due: '2026-08-31', progress: 66 },
  { code: 'G6', emp: 'EMP007', title: 'Move payroll & PF filings fully online', due: '2026-10-31', progress: 30 },
];

export const reviews = [
  { code: 'R1', emp: 'EMP003', cycle: 'Q2 2026', rating: 5, note: 'Delivered JFCL digitization milestones ahead of plan.' },
  { code: 'R2', emp: 'EMP005', cycle: 'Q2 2026', rating: 4, note: 'Strong ownership of EKC machine integrations.' },
  { code: 'R3', emp: 'EMP009', cycle: 'Q2 2026', rating: 3, note: 'Meeting targets; needs better follow-up discipline.' },
  { code: 'R4', emp: 'EMP014', cycle: 'Q2 2026', rating: 4, note: 'Dashboard redesign well received by clients.' },
];

export const assets = [
  { code: 'AST-014', name: 'Dell Latitude 5430', type: 'Laptop', tag: 'LPT-014', emp: 'EMP003', status: 'Assigned', since: '2023-06-05', src: 'api' },
  { code: 'AST-021', name: 'MacBook Air M2', type: 'Laptop', tag: 'LPT-021', emp: 'EMP001', status: 'Assigned', since: '2023-01-12', src: 'api' },
  { code: 'AST-007', name: 'LG 24" Monitor', type: 'Monitor', tag: 'MON-007', emp: 'EMP004', status: 'Assigned', since: '2023-03-02', src: 'api' },
  { code: 'AST-002', name: 'TSC TE244 Label Printer', type: 'Printer', tag: 'PRN-002', emp: '', status: 'Available', since: '', src: 'api' },
  { code: 'AST-033', name: 'Kontrolix Dev Kit KX-1', type: 'IoT Kit', tag: 'KIT-KX1', emp: 'EMP005', status: 'Assigned', since: '2024-04-20', src: 'api' },
  { code: 'AST-009', name: 'HP ProBook 440', type: 'Laptop', tag: 'LPT-009', emp: '', status: 'Available', since: '', src: 'api' },
  { code: 'AST-012', name: 'Samsung 27" Monitor', type: 'Monitor', tag: 'MON-012', emp: '', status: 'In Repair', since: '', src: 'api' },
  { code: 'AST-041', name: 'Jio 4G SIM (Field)', type: 'SIM', tag: 'SIM-J11', emp: 'EMP015', status: 'Assigned', since: '2024-01-08', src: 'manual' },
];

export const expenses = [
  { code: 'EXP-118', emp: 'EMP005', title: 'Site travel — JFCL Faridabad', cat: 'Travel', amt: 2450, date: '2026-07-09', status: 'Pending' },
  { code: 'EXP-117', emp: 'EMP008', title: 'Client dinner — EKC team', cat: 'Client Meeting', amt: 8900, date: '2026-07-06', status: 'Approved' },
  { code: 'EXP-116', emp: 'EMP015', title: 'Cab — Sanmati plant visit', cat: 'Travel', amt: 1200, date: '2026-07-03', status: 'Paid' },
  { code: 'EXP-115', emp: 'EMP006', title: 'Wiring & connectors (PKG-03 panel)', cat: 'Hardware', amt: 640, date: '2026-07-02', status: 'Pending' },
  { code: 'EXP-114', emp: 'EMP017', title: 'Social media ad boost', cat: 'Marketing', amt: 3500, date: '2026-06-28', status: 'Rejected' },
];

export const documents = [
  { code: 'DOC-201', emp: 'EMP003', name: 'Aadhaar Card', type: 'Identity', date: '2022-06-01', status: 'Verified' },
  { code: 'DOC-202', emp: 'EMP003', name: 'PAN Card', type: 'Identity', date: '2022-06-01', status: 'Verified' },
  { code: 'DOC-203', emp: 'EMP003', name: 'Offer Letter (signed)', type: 'Employment', date: '2022-06-01', status: 'Verified' },
  { code: 'DOC-204', emp: 'EMP004', name: 'Aadhaar Card', type: 'Identity', date: '2023-02-15', status: 'Verified' },
  { code: 'DOC-205', emp: 'EMP004', name: 'B.Tech Degree', type: 'Education', date: '2023-02-15', status: 'Pending' },
  { code: 'DOC-206', emp: 'EMP012', name: 'PAN Card', type: 'Identity', date: '2024-06-10', status: 'Pending' },
  { code: 'DOC-207', emp: 'EMP018', name: 'Relieving Letter (prev. co.)', type: 'Employment', date: '2024-05-20', status: 'Verified' },
  { code: 'DOC-208', emp: 'EMP001', name: 'PAN Card', type: 'Identity', date: '2021-03-12', status: 'Verified' },
];

export const announcements = [
  { code: 'AN-12', title: 'Independence Day holiday — 15 August', body: 'Office will remain closed on Saturday, 15 August for Independence Day. Field visits scheduled that day stand cancelled.', by: 'Aarti Sharma', date: '2026-07-10', pin: true },
  { code: 'AN-11', title: 'New health insurance active from 1 August', body: 'Group health cover (₹3L per employee) goes live on 1 Aug. Check your email for the enrolment form and add family members before 25 July.', by: 'Aarti Sharma', date: '2026-07-08', pin: false },
  { code: 'AN-10', title: 'Quarterly townhall — 25 July, 4 PM', body: 'All-hands townhall in the conference room. Q2 results, JCI & JFCL project updates, and Q3 plan. Chai-samosa after. 🙂', by: 'Pankaj Shukla', date: '2026-07-05', pin: false },
  { code: 'AN-09', title: 'June payroll credited', body: 'Salary for June 2026 has been credited to all bank accounts. Payslips are available in the Payroll section.', by: 'Priya Singh', date: '2026-07-01', pin: false },
];

export const holidays = [
  { date: '2026-01-26', name: 'Republic Day' },
  { date: '2026-03-04', name: 'Holi' },
  { date: '2026-04-03', name: 'Good Friday' },
  { date: '2026-08-15', name: 'Independence Day' },
  { date: '2026-08-28', name: 'Raksha Bandhan' },
  { date: '2026-09-04', name: 'Janmashtami' },
  { date: '2026-10-02', name: 'Gandhi Jayanti' },
  { date: '2026-10-20', name: 'Dussehra' },
  { date: '2026-11-08', name: 'Diwali' },
  { date: '2026-11-09', name: 'Govardhan Puja' },
  { date: '2026-12-25', name: 'Christmas Day' },
];

export const exits = [
  { code: 'EX-001', emp: 'EMP015', type: 'Resignation', reason: 'Relocating to home town', applied: '2026-06-18', lastDay: '2026-07-18', status: 'In Progress', clearance: { IT: true, Finance: false, Admin: false, HR: true, Reporting: true }, interviewDone: false, fnfAmount: 0, fnfStatus: 'Pending' },
  { code: 'EX-002', emp: 'EMP009', type: 'Resignation', reason: 'Better opportunity', applied: '2026-05-28', lastDay: '2026-06-30', status: 'Clearance', clearance: { IT: true, Finance: true, Admin: true, HR: true, Reporting: false }, interviewDone: true, fnfAmount: 58200, fnfStatus: 'Pending' },
  { code: 'EX-003', emp: 'EMP011', type: 'Resignation', reason: 'Higher studies', applied: '2026-04-10', lastDay: '2026-05-10', status: 'Completed', clearance: { IT: true, Finance: true, Admin: true, HR: true, Reporting: true }, interviewDone: true, fnfAmount: 41500, fnfStatus: 'Settled' },
  { code: 'EX-004', emp: 'EMP016', type: 'Termination', reason: 'Performance', applied: '2026-06-25', lastDay: '2026-07-25', status: 'In Progress', clearance: { IT: false, Finance: false, Admin: false, HR: true, Reporting: true }, interviewDone: false, fnfAmount: 0, fnfStatus: 'Pending' },
];

export const notifications = [
  { t: 'Leave request from Neha Gupta', s: 'Casual leave · 15–16 Jul · awaiting approval', ico: 'cal', link: 'leaves' },
  { t: 'Reimbursement claim from Amit Kumar', s: '₹2,450 · Site travel JFCL · pending', ico: 'receipt', link: 'expenses' },
  { t: 'July payroll not processed yet', s: '18 employees · due before 1 Aug', ico: 'banknote', link: 'payroll' },
  { t: 'Interview today — Aman Tyagi', s: 'MERN Stack Developer · 3:00 PM', ico: 'briefcase', link: 'recruitment' },
];

/** Starting values for the human-readable ID counters (next value to assign). */
export const counters = {
  emp: 19, leave: 1044, expense: 119, doc: 209, announcement: 13,
  candidate: 35, job: 10, asset: 42, goal: 7, review: 5, ss: 4, offer: 1, exit: 5, exitDoc: 107, dept: 7,
};
