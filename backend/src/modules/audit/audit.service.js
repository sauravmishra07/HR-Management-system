import AuditLog from './audit.model.js';
import logger from '../../common/utils/logger.js';

/**
 * Record an audit entry. Fire-and-forget: failures are logged, never thrown,
 * so auditing can never break a business operation.
 */
export async function record({ action, entity, entityId, actor, description, meta, ip }) {
  try {
    await AuditLog.create({
      action,
      entity,
      entityId: entityId ? String(entityId) : undefined,
      actorId: actor?.id,
      actorName: actor?.name,
      actorRole: actor?.role,
      description,
      meta,
      ip,
    });
  } catch (err) {
    logger.warn('Audit record failed', { message: err.message, action, entity });
  }
}

export async function list({ skip = 0, limit = 20, sort = { createdAt: -1 }, filter = {} }) {
  const [items, total] = await Promise.all([
    AuditLog.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    AuditLog.countDocuments(filter),
  ]);
  return { items, total };
}
