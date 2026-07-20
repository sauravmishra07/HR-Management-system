import mongoose from 'mongoose';
import { AUDIT_ACTIONS } from '../../common/constants/index.js';

const auditSchema = new mongoose.Schema(
  {
    action: { type: String, enum: Object.values(AUDIT_ACTIONS), required: true },
    entity: { type: String, required: true }, // e.g. "Employee", "Leave"
    entityId: { type: String },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorName: { type: String },
    actorRole: { type: String },
    description: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed },
    ip: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditSchema.index({ createdAt: -1 });
auditSchema.index({ entity: 1, entityId: 1 });

export default mongoose.model('AuditLog', auditSchema);
