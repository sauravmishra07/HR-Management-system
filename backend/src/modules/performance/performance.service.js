import Goal from './goal.model.js';
import Review from './review.model.js';
import ApiError from '../../common/utils/ApiError.js';
import { buildSearch } from '../../common/utils/query.js';
import { nextId } from '../../common/models/counter.model.js';
import { attachEmployees } from '../../common/utils/enrich.js';
import * as audit from '../audit/audit.service.js';
import { AUDIT_ACTIONS, ROLES } from '../../common/constants/index.js';

const clamp = (n) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));

/* ------------------------------------------------------------------ Goals */

export async function listGoals(query, actor) {
  const filter = { deletedAt: null };
  // Employees can only ever see their own goals.
  if (actor.role === ROLES.EMPLOYEE) filter.emp = actor.empId;
  else if (query.emp) filter.emp = query.emp;
  const search = buildSearch(query.search, ['code', 'title', 'emp']);
  const rows = await Goal.find({ ...filter, ...search }).sort({ createdAt: -1 }).lean();
  return attachEmployees(rows, 'emp');
}

export async function createGoal(data, actor) {
  const code = await nextId('goal', 'G', 1, '', 7);
  const goal = await Goal.create({
    code,
    emp: data.emp,
    title: data.title,
    due: data.due,
    progress: data.progress != null ? clamp(data.progress) : 0,
  });
  audit.record({
    action: AUDIT_ACTIONS.CREATE,
    entity: 'Goal',
    entityId: code,
    actor,
    description: `Created goal ${code} for ${data.emp}`,
  });
  const [enriched] = await attachEmployees([goal.toObject()], 'emp');
  return enriched;
}

export async function updateGoalProgress(id, data, actor) {
  const goal = await Goal.findOne({ _id: id, deletedAt: null });
  if (!goal) throw ApiError.notFound('Goal not found');

  // Explicit value clamps; otherwise bump +10 capped at 100 (mirrors bumpGoal).
  const progress = data.progress != null ? clamp(data.progress) : Math.min(100, goal.progress + 10);

  goal.progress = progress;
  await goal.save();
  audit.record({
    action: AUDIT_ACTIONS.UPDATE,
    entity: 'Goal',
    entityId: goal.code,
    actor,
    description: `Set goal ${goal.code} progress to ${progress}%`,
  });
  const [enriched] = await attachEmployees([goal.toObject()], 'emp');
  return enriched;
}

export async function removeGoal(id, actor) {
  const goal = await Goal.findOne({ _id: id, deletedAt: null });
  if (!goal) throw ApiError.notFound('Goal not found');
  await Goal.updateOne({ _id: id }, { deletedAt: new Date() });
  audit.record({
    action: AUDIT_ACTIONS.DELETE,
    entity: 'Goal',
    entityId: goal.code,
    actor,
    description: `Removed goal ${goal.code}`,
  });
  return { deleted: true };
}

/* ---------------------------------------------------------------- Reviews */

export async function listReviews(query, actor) {
  const filter = { deletedAt: null };
  // Employees can only ever see their own reviews.
  if (actor.role === ROLES.EMPLOYEE) filter.emp = actor.empId;
  else if (query.emp) filter.emp = query.emp;
  const rows = await Review.find(filter).sort({ createdAt: -1 }).lean();
  return attachEmployees(rows, 'emp');
}

export async function createReview(data, actor) {
  const code = await nextId('review', 'R', 1, '', 5);
  const review = await Review.create({
    code,
    emp: data.emp,
    cycle: data.cycle,
    rating: data.rating,
    note: data.note || '',
  });
  audit.record({
    action: AUDIT_ACTIONS.CREATE,
    entity: 'Review',
    entityId: code,
    actor,
    description: `Created review ${code} for ${data.emp} (${data.cycle})`,
  });
  const [enriched] = await attachEmployees([review.toObject()], 'emp');
  return enriched;
}

export async function removeReview(id, actor) {
  const review = await Review.findOne({ _id: id, deletedAt: null });
  if (!review) throw ApiError.notFound('Review not found');
  await Review.updateOne({ _id: id }, { deletedAt: new Date() });
  audit.record({
    action: AUDIT_ACTIONS.DELETE,
    entity: 'Review',
    entityId: review.code,
    actor,
    description: `Removed review ${review.code}`,
  });
  return { deleted: true };
}
