import mongoose from 'mongoose';

/** Company announcement / notice-board post. Pinned items float to the top. */
const announcementSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true }, // AN-13
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    by: { type: String }, // author display name
    date: { type: String }, // ISO date string (YYYY-MM-DD) to mirror reference
    pin: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Announcement', announcementSchema);
