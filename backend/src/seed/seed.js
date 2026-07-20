/**
 * Database seeder. Wipes and repopulates all collections from the RAMP reference data.
 * Run with: npm run seed
 */
import mongoose from 'mongoose';
import config, { assertConfig } from '../config/index.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import logger from '../common/utils/logger.js';
import Counter from '../common/models/counter.model.js';

import Employee from '../modules/employee/employee.model.js';
import User from '../modules/user/user.model.js';
import Department from '../modules/department/department.model.js';
import Settings from '../modules/settings/settings.model.js';

import * as data from './data.js';

async function seedDepartments() {
  await Department.deleteMany({});
  await Department.insertMany(data.departments.map((d) => ({ ...d })));
  logger.info(`Seeded ${data.departments.length} departments`);
}

async function seedEmployeesAndUsers() {
  await Employee.deleteMany({});
  await User.deleteMany({});

  for (const e of data.employees) {
    const avatarSeed = data.employees.indexOf(e) % 6;
    const emp = await Employee.create({ ...e });
    const user = await User.create({
      empId: e.empId,
      name: e.name,
      email: e.email,
      password: config.seedDefaultPassword, // hashed by pre-save hook
      role: e.access,
      employee: emp._id,
      avatarSeed,
      isEmailVerified: true,
    });
    emp.user = user._id;
    await emp.save();
  }
  logger.info(`Seeded ${data.employees.length} employees + login accounts`);
}

async function seedSettings() {
  await Settings.deleteMany({});
  await Settings.create({ key: 'app', ...data.settings });
  logger.info('Seeded company settings');
}

async function seedCounters() {
  await Counter.deleteMany({});
  const docs = Object.entries(data.counters).map(([key, seq]) => ({ _id: key, seq: seq - 1 }));
  await Counter.insertMany(docs);
  logger.info('Seeded ID counters');
}

/** Optional collections — seeded only when their model file exists. */
async function seedOptional() {
  const optional = [
    ['../modules/leave/leave.model.js', 'leaves', (d) => d.leaves],
    ['../modules/attendance/attendance.model.js', 'attendance', null],
    ['../modules/payroll/payrollRun.model.js', 'payrollRuns', (d) => d.payrollRuns],
    ['../modules/recruitment/opening.model.js', 'openings', (d) => d.openings],
    ['../modules/recruitment/candidate.model.js', 'candidates', (d) => d.candidates],
    ['../modules/recruitment/salaryStructure.model.js', 'salaryStructures', (d) => d.salaryStructures],
    ['../modules/performance/goal.model.js', 'goals', (d) => d.goals],
    ['../modules/performance/review.model.js', 'reviews', (d) => d.reviews],
    ['../modules/asset/asset.model.js', 'assets', (d) => d.assets],
    ['../modules/expense/expense.model.js', 'expenses', (d) => d.expenses],
    ['../modules/document/document.model.js', 'documents', (d) => d.documents],
    ['../modules/announcement/announcement.model.js', 'announcements', (d) => d.announcements],
    ['../modules/holiday/holiday.model.js', 'holidays', (d) => d.holidays],
    ['../modules/exit/exit.model.js', 'exits', (d) => d.exits],
    ['../modules/notification/notification.model.js', 'notifications', null],
  ];

  for (const [path, label, pick] of optional) {
    try {
      const mod = await import(path);
      const Model = mod.default;
      if (!Model) continue;
      await Model.deleteMany({});
      if (pick) {
        const rows = pick(data);
        if (rows?.length) await Model.insertMany(rows.map((r) => ({ ...r })));
      }
      logger.info(`Seeded ${label}`);
    } catch (err) {
      if (err.code === 'ERR_MODULE_NOT_FOUND') continue; // module not built yet
      logger.warn(`Seed ${label} skipped: ${err.message}`);
    }
  }
}

async function seedAttendance() {
  try {
    const mod = await import('../modules/attendance/attendance.model.js');
    const Attendance = mod.default;
    await Attendance.deleteMany({});
    const rows = Object.entries(data.attendanceToday)
      .filter(([, v]) => v.st) // skip not-marked
      .map(([emp, v]) => ({ emp, date: '2026-07-12', st: v.st, in: v.in, out: v.out }));
    if (rows.length) await Attendance.insertMany(rows);
    logger.info(`Seeded ${rows.length} attendance records (2026-07-12)`);
  } catch (err) {
    if (err.code !== 'ERR_MODULE_NOT_FOUND') logger.warn(`Seed attendance skipped: ${err.message}`);
  }
}

async function seedNotifications() {
  try {
    const mod = await import('../modules/notification/notification.model.js');
    const Notification = mod.default;
    await Notification.deleteMany({});
    const rows = data.notifications.map((n) => ({ ...n, user: '', read: false }));
    await Notification.insertMany(rows);
    logger.info(`Seeded ${rows.length} broadcast notifications`);
  } catch (err) {
    if (err.code !== 'ERR_MODULE_NOT_FOUND') logger.warn(`Seed notifications skipped: ${err.message}`);
  }
}

async function seedExitDocs() {
  try {
    const mod = await import('../modules/exit/exitDoc.model.js');
    const ExitDoc = mod.default;
    await ExitDoc.deleteMany({});
  } catch (err) {
    if (err.code !== 'ERR_MODULE_NOT_FOUND') logger.warn(`Seed exitDocs skipped: ${err.message}`);
  }
}

async function run() {
  assertConfig();
  await connectDatabase();
  logger.info('--- Seeding RAMP HRMS database ---');

  await seedDepartments();
  await seedEmployeesAndUsers();
  await seedSettings();
  await seedCounters();
  await seedOptional();
  await seedAttendance();
  await seedNotifications();
  await seedExitDocs();

  logger.info('--- Seed complete ---');
  logger.info(`Login with any employee email and password: ${config.seedDefaultPassword}`);
  logger.info('e.g. pankaj@itsybizz.com (HR Admin), priya@itsybizz.com (Finance), rohit@itsybizz.com (Employee)');

  await disconnectDatabase();
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  logger.error('Seed failed', { message: err.message, stack: err.stack });
  process.exit(1);
});
