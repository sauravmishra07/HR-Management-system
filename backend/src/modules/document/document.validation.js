import { z } from 'zod';
import { DOC_STATUS } from '../../common/constants/index.js';

export const listSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().optional(),
    emp: z.string().optional(),
    status: z.nativeEnum(DOC_STATUS).optional(),
    type: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
};

export const idSchema = {
  params: z.object({ id: z.string().min(1) }),
};

// Multipart request: validate the text fields only; the file arrives via multer.
export const createSchema = {
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.string().min(1, 'Type is required'),
    emp: z.string().optional(),
  }),
};
