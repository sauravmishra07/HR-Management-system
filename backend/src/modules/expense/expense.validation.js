import { z } from 'zod';
import { EXPENSE_STATUS } from '../../common/constants/index.js';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

export const listSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    status: z.nativeEnum(EXPENSE_STATUS).optional(),
    cat: z.string().optional(),
    emp: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
};

export const idSchema = {
  params: z.object({ id: z.string().min(1) }),
};

export const createSchema = {
  body: z.object({
    title: z.string().min(2, 'Title is required').max(120),
    cat: z.string().min(1, 'Category is required'),
    amt: z.coerce.number().positive('Amount must be greater than zero'),
    date: isoDate.optional(),
  }),
};
