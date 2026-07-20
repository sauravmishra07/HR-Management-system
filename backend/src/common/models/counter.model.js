import mongoose from 'mongoose';

/** Atomic sequence store for human-readable IDs (EMP001, LV-1043, JOB-07 ...). */
const counterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // key, e.g. "emp", "leave"
    seq: { type: Number, default: 0 },
  },
  { versionKey: false }
);

const Counter = mongoose.model('Counter', counterSchema);

/**
 * Atomically increment and return the next value for a key.
 * @param {string} key   sequence key
 * @param {number} start value to seed the counter with on first use
 */
export async function nextSeq(key, start = 0) {
  const doc = await Counter.findByIdAndUpdate(
    key,
    { $inc: { seq: 1 }, $setOnInsert: {} },
    { new: true, upsert: true }
  );
  // If the counter was just created, honour the requested start offset.
  if (doc.seq === 1 && start > 1) {
    doc.seq = start;
    await doc.save();
  }
  return doc.seq;
}

/** Format helpers for prefixed, zero-padded IDs. */
export async function nextId(key, prefix, pad = 3, sep = '', start = 1) {
  const seq = await nextSeq(key, start);
  return `${prefix}${sep}${String(seq).padStart(pad, '0')}`;
}

export default Counter;
