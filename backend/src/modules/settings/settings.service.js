import Settings from './settings.model.js';
import * as audit from '../audit/audit.service.js';
import { AUDIT_ACTIONS } from '../../common/constants/index.js';

const KEY = 'app';

/** Fields a settings PUT is allowed to touch (whitelist). */
const ALLOWED = [
  'company', 'brand', 'tagline', 'address', 'email', 'phone', 'cin',
  'cl', 'sl', 'el', 'weekOff', 'inTime', 'lateAfter',
  'needApproval', 'selfCheckin', 'emailAlerts',
];

/** Fetch the singleton settings doc, creating it from schema defaults if absent. */
export async function get() {
  let doc = await Settings.findOne({ key: KEY });
  if (!doc) doc = await Settings.create({ key: KEY });
  return doc;
}

export async function update(data, actor) {
  const patch = {};
  for (const field of ALLOWED) {
    if (data[field] !== undefined) patch[field] = data[field];
  }
  const doc = await Settings.findOneAndUpdate(
    { key: KEY },
    { $set: patch },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  audit.record({ action: AUDIT_ACTIONS.UPDATE, entity: 'Settings', entityId: KEY, actor, description: 'Updated company settings' });
  return doc;
}

export async function updateOfferTemplate(offerTemplate, actor) {
  const doc = await Settings.findOneAndUpdate(
    { key: KEY },
    { $set: { offerTemplate } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  audit.record({ action: AUDIT_ACTIONS.UPDATE, entity: 'Settings', entityId: KEY, actor, description: 'Updated offer template' });
  return doc;
}

export async function updateExitTemplates(exitTemplates, actor) {
  const doc = await Settings.findOneAndUpdate(
    { key: KEY },
    { $set: { exitTemplates } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  audit.record({ action: AUDIT_ACTIONS.UPDATE, entity: 'Settings', entityId: KEY, actor, description: 'Updated exit templates' });
  return doc;
}

export async function updateAssetApi(data, actor) {
  const patch = {};
  if (data.url !== undefined) patch['assetApi.url'] = data.url;
  if (data.key !== undefined) patch['assetApi.key'] = data.key;
  if (data.enabled !== undefined) patch['assetApi.enabled'] = data.enabled;
  const doc = await Settings.findOneAndUpdate(
    { key: KEY },
    { $set: patch },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  audit.record({ action: AUDIT_ACTIONS.UPDATE, entity: 'Settings', entityId: KEY, actor, description: 'Updated asset API config' });
  return doc;
}
