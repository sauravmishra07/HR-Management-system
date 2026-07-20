import { z } from 'zod';
import { EXIT_TYPE, EXIT_STATUS, CLEARANCE_KEYS } from '../../common/constants/index.js';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

/** Accept a real JSON boolean or the strings 'true'/'false'. */
const boolish = z.union([z.boolean(), z.enum(['true', 'false']).transform((v) => v === 'true')]);

export const listSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().optional(),
    status: z.nativeEnum(EXIT_STATUS).optional(),
    type: z.nativeEnum(EXIT_TYPE).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
};

export const idSchema = {
  params: z.object({ id: z.string().min(1) }),
};

export const docIdSchema = {
  params: z.object({ docId: z.string().min(1) }),
};

export const createSchema = {
  body: z.object({
    emp: z.string().min(1, 'Employee is required'),
    type: z.nativeEnum(EXIT_TYPE),
    reason: z.string().min(1, 'Reason is required'),
    lastDay: isoDate,
  }),
};

export const clearanceSchema = {
  params: idSchema.params,
  body: z.object({
    key: z.enum(CLEARANCE_KEYS),
    value: boolish,
  }),
};

export const interviewSchema = {
  params: idSchema.params,
  body: z.object({ done: boolish }),
};

export const fnfSchema = {
  params: idSchema.params,
  body: z.object({ fnfAmount: z.coerce.number().nonnegative() }),
};

export const generateSchema = {
  params: idSchema.params,
  body: z.object({ docType: z.string().min(1, 'docType is required') }),
};
