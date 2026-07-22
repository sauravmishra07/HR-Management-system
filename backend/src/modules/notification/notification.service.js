import * as repo from './notification.repository.js';
import ApiError from '../../common/utils/ApiError.js';
import { notifyUser, notifyAll } from '../../realtime/index.js';

export async function list(empId) {
  const [items, unreadCount] = await Promise.all([
    repo.findForUser(empId),
    repo.unreadCount(empId),
  ]);
  return { items, unreadCount };
}

export async function create(data) {
  const notification = await repo.create({
    t: data.t,
    s: data.s,
    ico: data.ico || '',
    link: data.link || '',
    user: data.user || '',
    read: false,
  });
  // Real-time bell push: targeted when the notification has an owner, broadcast otherwise.
  if (notification.user) notifyUser(notification.user, 'notification:new', { notification });
  else notifyAll('notification:new', { notification });
  return notification;
}

export async function markRead(id, empId) {
  const notification = await repo.markRead(id, empId);
  if (!notification) throw ApiError.notFound('Notification not found');
  return notification;
}

export async function markAllRead(empId) {
  const result = await repo.markAllRead(empId);
  return { updated: result.modifiedCount ?? 0 };
}

export async function clearAll(empId) {
  await repo.clearForUser(empId);
  return { cleared: true };
}
