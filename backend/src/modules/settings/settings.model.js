import mongoose from 'mongoose';

/** Singleton company/HR settings document (key: 'app'). */
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'app', unique: true, index: true },
    company: String,
    brand: String,
    tagline: String,
    address: String,
    email: String,
    phone: String,
    cin: String,
    cl: { type: Number, default: 12 },
    sl: { type: Number, default: 10 },
    el: { type: Number, default: 18 },
    weekOff: { type: [String], default: ['Sun'] },
    inTime: { type: String, default: '09:30' },
    lateAfter: { type: String, default: '09:45' },
    needApproval: { type: Boolean, default: true },
    selfCheckin: { type: Boolean, default: true },
    emailAlerts: { type: Boolean, default: true },
    assetApi: {
      url: String,
      key: String,
      enabled: { type: Boolean, default: true },
      lastSync: String,
    },
    offerTemplate: String,
    exitTemplates: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false }
);

export default mongoose.model('Settings', settingsSchema);
