import * as repo from './recruitment.repository.js';
import ApiError from '../../common/utils/ApiError.js';
import { parsePagination, buildMeta, buildSearch } from '../../common/utils/query.js';
import { nextId } from '../../common/models/counter.model.js';
import { JOB_STATUS, CANDIDATE_STAGES, AUDIT_ACTIONS } from '../../common/constants/index.js';
import { inWords, money } from '../../common/utils/salary.js';
import Settings from '../../modules/settings/settings.model.js';
import * as audit from '../audit/audit.service.js';
import logger from '../../common/utils/logger.js';
import { emitToDDD } from '../../common/integration/ddd.client.js';
import { broadcastChange } from '../../realtime/index.js';

/* ============================ Helpers ============================ */

/** Plain-object form of a doc for integration event payloads. */
const plain = (doc) => (doc && typeof doc.toObject === 'function' ? doc.toObject() : doc);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Format a date (Date or YYYY-MM-DD string) as 'DD Mon YYYY', e.g. '18 Jul 2026'. */
function formatDate(input) {
  const d = input ? new Date(input) : new Date();
  if (Number.isNaN(d.getTime())) return String(input || '');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Replace {{PLACEHOLDER}} tokens in a template from a map. Unknown tokens are left blank. */
export function fillTemplate(tpl, map) {
  return String(tpl || '').replace(/\{\{(\w+)\}\}/g, (_, key) => (map[key] != null ? String(map[key]) : ''));
}

/** Read the singleton app settings, falling back to sane defaults if absent. */
async function getSettings() {
  const s = await Settings.findOne({ key: 'app' }).lean();
  return {
    company: s?.company || 'The Company',
    address: s?.address || '',
    offerTemplate:
      s?.offerTemplate ||
      `{{DATE}}\n\nDear {{NAME}},\n\nWe are pleased to offer you the position of {{ROLE}} in the {{DEPT}} department at {{COMPANY}}. Your annual CTC will be {{CTC_WORDS}} ({{CTC}}). Your tentative date of joining will be {{JOIN}}.\n\nWarm regards,\n{{HR_NAME}}\n{{HR_ROLE}}\n{{COMPANY}}`,
  };
}

/* ============================ Openings ============================ */

function buildOpeningFilter(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.dept) filter.dept = query.dept;
  const search = buildSearch(query.search, ['code', 'title', 'dept']);
  return { ...filter, ...search };
}

export async function listOpenings(query) {
  const { page, limit, skip, sort } = parsePagination(query);
  const filter = buildOpeningFilter(query);
  const { items, total } = await repo.openings.paginate({ filter, sort, skip, limit });
  return { items, meta: buildMeta({ page, limit, total }) };
}

export async function createOpening(data, actor) {
  const code = await nextId('job', 'JOB-', 2, '', 10);
  const opening = await repo.openings.create({ ...data, code });
  logger.info(`Opening created: ${code} (${data.title})`);
  audit.record({ action: AUDIT_ACTIONS.CREATE, entity: 'Opening', entityId: code, actor, description: `Created opening ${data.title}` });
  emitToDDD('recruitment.opening.changed', plain(opening)).catch(() => {});
  broadcastChange('recruitment', plain(opening));
  return opening;
}

export async function updateOpening(id, data, actor) {
  const opening = await repo.openings.findById(id);
  if (!opening) throw ApiError.notFound('Opening not found');
  const updated = await repo.openings.updateById(id, data);
  audit.record({ action: AUDIT_ACTIONS.UPDATE, entity: 'Opening', entityId: opening.code, actor, description: `Updated opening ${opening.title}` });
  emitToDDD('recruitment.opening.changed', plain(updated)).catch(() => {});
  broadcastChange('recruitment', plain(updated));
  return updated;
}

export async function toggleOpening(id, actor) {
  const opening = await repo.openings.findById(id);
  if (!opening) throw ApiError.notFound('Opening not found');
  const status = opening.status === JOB_STATUS.OPEN ? JOB_STATUS.CLOSED : JOB_STATUS.OPEN;
  const updated = await repo.openings.updateById(id, { status });
  audit.record({ action: AUDIT_ACTIONS.UPDATE, entity: 'Opening', entityId: opening.code, actor, description: `Set opening ${opening.code} to ${status}` });
  emitToDDD('recruitment.opening.changed', plain(updated)).catch(() => {});
  broadcastChange('recruitment', plain(updated));
  return updated;
}

export async function removeOpening(id, actor) {
  const opening = await repo.openings.findById(id);
  if (!opening) throw ApiError.notFound('Opening not found');
  await repo.openings.softDelete(id);
  audit.record({ action: AUDIT_ACTIONS.DELETE, entity: 'Opening', entityId: opening.code, actor, description: `Removed opening ${opening.title}` });
  emitToDDD('recruitment.opening.deleted', plain(opening)).catch(() => {});
  broadcastChange('recruitment', plain(opening));
  return { deleted: true };
}

/* =========================== Candidates =========================== */

function buildCandidateFilter(query) {
  const filter = {};
  if (query.stage) filter.stage = query.stage;
  if (query.job) filter.job = query.job;
  const search = buildSearch(query.search, ['code', 'name', 'job', 'phone']);
  return { ...filter, ...search };
}

export async function listCandidates(query) {
  const { page, limit, skip, sort } = parsePagination(query);
  const filter = buildCandidateFilter(query);
  const { items, total } = await repo.candidates.paginate({ filter, sort, skip, limit });
  return { items, meta: buildMeta({ page, limit, total }) };
}

export async function createCandidate(data, actor) {
  const code = await nextId('candidate', 'CND-', 2, '', 35);
  const candidate = await repo.candidates.create({ ...data, code });
  logger.info(`Candidate created: ${code} (${data.name})`);
  audit.record({ action: AUDIT_ACTIONS.CREATE, entity: 'Candidate', entityId: code, actor, description: `Added candidate ${data.name}` });
  emitToDDD('recruitment.candidate.changed', plain(candidate)).catch(() => {});
  broadcastChange('recruitment', plain(candidate));
  return candidate;
}

export async function updateCandidateStage(id, stage, actor) {
  if (!CANDIDATE_STAGES.includes(stage)) throw ApiError.badRequest('Invalid candidate stage');
  const candidate = await repo.candidates.findById(id);
  if (!candidate) throw ApiError.notFound('Candidate not found');
  const updated = await repo.candidates.updateById(id, { stage });
  audit.record({ action: AUDIT_ACTIONS.UPDATE, entity: 'Candidate', entityId: candidate.code, actor, description: `Moved ${candidate.name} to ${stage}` });
  emitToDDD('recruitment.candidate.changed', plain(updated)).catch(() => {});
  broadcastChange('recruitment', plain(updated));
  return updated;
}

export async function removeCandidate(id, actor) {
  const candidate = await repo.candidates.findById(id);
  if (!candidate) throw ApiError.notFound('Candidate not found');
  await repo.candidates.softDelete(id);
  audit.record({ action: AUDIT_ACTIONS.DELETE, entity: 'Candidate', entityId: candidate.code, actor, description: `Removed candidate ${candidate.name}` });
  emitToDDD('recruitment.candidate.deleted', plain(candidate)).catch(() => {});
  broadcastChange('recruitment', plain(candidate));
  return { deleted: true };
}

/* ======================= Salary structures ======================= */

function assertPctSum({ basicPct, hraPct, specialPct }) {
  const sum = Number(basicPct || 0) + Number(hraPct || 0) + Number(specialPct || 0);
  if (sum !== 100) throw ApiError.badRequest('basicPct, hraPct and specialPct must sum to 100');
}

export async function listSalaryStructures(query) {
  const { page, limit, skip, sort } = parsePagination(query);
  const search = buildSearch(query.search, ['code', 'name']);
  const { items, total } = await repo.salaryStructures.paginate({ filter: search, sort, skip, limit });
  return { items, meta: buildMeta({ page, limit, total }) };
}

export async function createSalaryStructure(data, actor) {
  assertPctSum(data);
  const code = await nextId('ss', 'SS', 1, '', 4);
  const structure = await repo.salaryStructures.create({ ...data, code });
  logger.info(`Salary structure created: ${code} (${data.name})`);
  audit.record({ action: AUDIT_ACTIONS.CREATE, entity: 'SalaryStructure', entityId: code, actor, description: `Created salary structure ${data.name}` });
  return structure;
}

export async function updateSalaryStructure(id, data, actor) {
  const structure = await repo.salaryStructures.findById(id);
  if (!structure) throw ApiError.notFound('Salary structure not found');
  // If any percentage is being changed, validate the merged result still sums to 100.
  if (data.basicPct != null || data.hraPct != null || data.specialPct != null) {
    assertPctSum({
      basicPct: data.basicPct != null ? data.basicPct : structure.basicPct,
      hraPct: data.hraPct != null ? data.hraPct : structure.hraPct,
      specialPct: data.specialPct != null ? data.specialPct : structure.specialPct,
    });
  }
  const updated = await repo.salaryStructures.updateById(id, data);
  audit.record({ action: AUDIT_ACTIONS.UPDATE, entity: 'SalaryStructure', entityId: structure.code, actor, description: `Updated salary structure ${structure.name}` });
  return updated;
}

export async function removeSalaryStructure(id, actor) {
  const structure = await repo.salaryStructures.findById(id);
  if (!structure) throw ApiError.notFound('Salary structure not found');
  await repo.salaryStructures.softDelete(id);
  audit.record({ action: AUDIT_ACTIONS.DELETE, entity: 'SalaryStructure', entityId: structure.code, actor, description: `Removed salary structure ${structure.name}` });
  return { deleted: true };
}

/* ============================= Offers ============================= */

export async function listOffers(query) {
  const { page, limit, skip, sort } = parsePagination(query);
  const search = buildSearch(query.search, ['code', 'name', 'role', 'dept', 'candidate']);
  const { items, total } = await repo.offers.paginate({ filter: search, sort, skip, limit });
  return { items, meta: buildMeta({ page, limit, total }) };
}

export async function getOffer(id) {
  const offer = await repo.offers.findById(id);
  if (!offer) throw ApiError.notFound('Offer not found');
  return offer;
}

export async function createOffer(data, actor) {
  const { candidateCode, name, role, dept, ctc, joinDate, structureCode } = data;
  const settings = await getSettings();

  const map = {
    DATE: formatDate(),
    NAME: name,
    ROLE: role,
    DEPT: dept,
    COMPANY: settings.company,
    ADDRESS: settings.address,
    CTC: money(ctc),
    CTC_WORDS: `${inWords(ctc)} Rupees`,
    JOIN: formatDate(joinDate),
    HR_NAME: actor?.name || '',
    HR_ROLE: actor?.role || '',
  };
  const letter = fillTemplate(settings.offerTemplate, map);

  const code = await nextId('offer', 'OFR-', 2, '', 1);
  const offer = await repo.offers.create({
    code,
    candidate: candidateCode || name,
    name,
    role,
    dept,
    ctc,
    joinDate,
    structureCode,
    letter,
    createdBy: actor?.name,
  });

  logger.info(`Offer created: ${code} (${name})`);
  audit.record({ action: AUDIT_ACTIONS.CREATE, entity: 'Offer', entityId: code, actor, description: `Issued offer to ${name} for ${role}` });
  emitToDDD('recruitment.offer.created', plain(offer)).catch(() => {});
  broadcastChange('recruitment', plain(offer));
  return offer;
}
