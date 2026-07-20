import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

export const listSchema = {
  query: z.object({
    year: z.coerce.number().int().min(1970).max(9999).optional(),
  }),
};

export const idSchema = { params: z.object({ id: z.string().min(1) }) };

export const createSchema = {
  body: z.object({
    date: isoDate,
    name: z.string().min(2, 'Name is required').max(120),
  }),
};
