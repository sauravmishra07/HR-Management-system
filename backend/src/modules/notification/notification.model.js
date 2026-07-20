import mongoose from 'mongoose';

/**
 * In-app notification. `user` holds the target empId; '' means broadcast to all.
 * No human-readable code and not soft-deleted — these are transient.
 */
const notificationSchema = new mongoose.Schema(
  {
    t: { type: String, required: true }, // title
    s: { type: String }, // subtitle
    ico: { type: String, default: '' }, // icon key
    link: { type: String, default: '' }, // view name to navigate to
    user: { type: String, default: '', index: true }, // target empId, '' = broadcast
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
