import Notification from './notification.model.js';

/** Notifications visible to a given employee: their own plus broadcasts. */
const audienceFilter = (empId) => ({ $or: [{ user: empId }, { user: '' }] });

export function create(data) {
  return Notification.create(data);
}

export function findForUser(empId) {
  return Notification.find(audienceFilter(empId)).sort({ createdAt: -1 }).lean();
}

export function unreadCount(empId) {
  return Notification.countDocuments({ ...audienceFilter(empId), read: false });
}

// Mark a single notification read, but only if it belongs to (or is broadcast to) the caller.
export function markRead(id, empId) {
  return Notification.findOneAndUpdate({ _id: id, ...audienceFilter(empId) }, { read: true }, { new: true });
}

export function markAllRead(empId) {
  return Notification.updateMany({ ...audienceFilter(empId), read: false }, { read: true });
}

// "Clear all": hard-delete the caller's own (non-broadcast) notifications.
export function clearForUser(empId) {
  return Notification.deleteMany({ user: empId });
}
