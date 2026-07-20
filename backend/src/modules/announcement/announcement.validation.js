import { z } from 'zod';

export const listSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
};

export const idSchema = { params: z.object({ id: z.string().min(1) }) };

export const createSchema = {
  body: z.object({
    title: z.string().min(2, 'Title is required').max(160),
    body: z.string().min(1, 'Body is required'),
    pin: z.boolean().optional(),
  }),
};

export const updateSchema = { params: idSchema.params, body: createSchema.body.partial() };
