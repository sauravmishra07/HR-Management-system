import { z } from 'zod';
import { EVENING_REPORT_STATUS } from './eveningReport.model.js';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

export const listSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    status: z.nativeEnum(EVENING_REPORT_STATUS).optional(),
    date: isoDate.optional(),
    emp: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
};

export const submitSchema = {
  body: z.object({
    date: isoDate.optional(),
    work: z.string().min(1, 'work is required').max(2000),
    plan: z.string().max(2000).optional().or(z.literal('')),
    blockers: z.string().max(2000).optional().or(z.literal('')),
    hours: z.coerce.number().min(0).max(24).optional(),
  }),
};
