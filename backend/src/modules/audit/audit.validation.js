import { z } from 'zod';
import { AUDIT_ACTIONS } from '../../common/constants/index.js';

export const listSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    action: z.nativeEnum(AUDIT_ACTIONS).optional(),
    entity: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
};
