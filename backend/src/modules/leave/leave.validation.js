import { z } from 'zod';
import { LEAVE_TYPES, LEAVE_STATUS } from '../../common/constants/index.js';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

export const listSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    status: z.nativeEnum(LEAVE_STATUS).optional(),
    type: z.nativeEnum(LEAVE_TYPES).optional(),
    emp: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
};

export const balanceSchema = {
  query: z.object({ empId: z.string().min(1).optional() }),
};

export const idSchema = {
  params: z.object({ id: z.string().min(1) }),
};

export const createSchema = {
  body: z.object({
    type: z.nativeEnum(LEAVE_TYPES),
    from: isoDate,
    to: isoDate,
    reason: z.string().max(300).optional().or(z.literal('')),
  }),
};
