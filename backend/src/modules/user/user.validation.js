import { z } from 'zod';
import { ROLE_VALUES } from '../../common/constants/index.js';

export const idSchema = {
  params: z.object({ id: z.string().min(1) }),
};

export const listSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().optional(),
    role: z.enum(ROLE_VALUES).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
};

export const roleSchema = {
  params: idSchema.params,
  body: z.object({
    role: z.enum(ROLE_VALUES),
  }),
};
