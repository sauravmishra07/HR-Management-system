import { z } from 'zod';
import { ASSET_STATUS } from '../../common/constants/index.js';

export const listSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().optional(),
    status: z.nativeEnum(ASSET_STATUS).optional(),
    type: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
};

export const idSchema = {
  params: z.object({ id: z.string().min(1) }),
};

export const createSchema = {
  body: z.object({
    name: z.string().min(1, 'Name is required').max(120),
    type: z.string().min(1, 'Type is required'),
    tag: z.string().optional(),
    emp: z.string().optional(),
    status: z.nativeEnum(ASSET_STATUS).optional(),
    since: z.string().optional(),
    src: z.enum(['api', 'manual']).optional(),
  }),
};

export const updateSchema = {
  params: idSchema.params,
  body: createSchema.body.partial(),
};

export const assignSchema = {
  params: idSchema.params,
  body: z.object({ empId: z.string().min(1, 'empId is required') }),
};
