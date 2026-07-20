import { z } from 'zod';
import { JOB_STATUS, CANDIDATE_STAGES } from '../../common/constants/index.js';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

export const idSchema = {
  params: z.object({ id: z.string().min(1) }),
};

/* ============================ Openings ============================ */

export const listOpeningsSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().optional(),
    status: z.nativeEnum(JOB_STATUS).optional(),
    dept: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
};

export const createOpeningSchema = {
  body: z.object({
    title: z.string().min(2, 'Title is required').max(120),
    dept: z.string().min(1, 'Department is required'),
    positions: z.coerce.number().int().positive().optional(),
    exp: z.string().optional(),
    status: z.nativeEnum(JOB_STATUS).optional(),
    posted: isoDate.optional(),
  }),
};

export const updateOpeningSchema = {
  params: idSchema.params,
  body: createOpeningSchema.body.partial(),
};

/* =========================== Candidates =========================== */

export const listCandidatesSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().optional(),
    stage: z.enum(CANDIDATE_STAGES).optional(),
    job: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
};

export const createCandidateSchema = {
  body: z.object({
    name: z.string().min(2, 'Name is required').max(80),
    job: z.string().min(1, 'Job is required'),
    phone: z.string().min(6).max(20).optional().or(z.literal('')),
    exp: z.string().optional(),
    stage: z.enum(CANDIDATE_STAGES).optional(),
    applied: isoDate.optional(),
  }),
};

export const candidateStageSchema = {
  params: idSchema.params,
  body: z.object({ stage: z.enum(CANDIDATE_STAGES) }),
};

/* ======================= Salary structures ======================= */

export const listSalaryStructuresSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
};

export const createSalaryStructureSchema = {
  body: z.object({
    name: z.string().min(2, 'Name is required').max(80),
    basicPct: z.coerce.number().min(0).max(100),
    hraPct: z.coerce.number().min(0).max(100),
    specialPct: z.coerce.number().min(0).max(100),
    pf: z.boolean().optional(),
    pt: z.coerce.number().min(0).optional(),
    gratuity: z.boolean().optional(),
  }),
};

export const updateSalaryStructureSchema = {
  params: idSchema.params,
  body: createSalaryStructureSchema.body.partial(),
};

/* ============================= Offers ============================= */

export const listOffersSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
};

export const createOfferSchema = {
  body: z.object({
    candidateCode: z.string().optional(),
    name: z.string().min(2, 'Name is required').max(80),
    role: z.string().min(1, 'Role is required'),
    dept: z.string().min(1, 'Department is required'),
    ctc: z.coerce.number().nonnegative(),
    joinDate: isoDate.optional(),
    structureCode: z.string().optional(),
  }),
};
