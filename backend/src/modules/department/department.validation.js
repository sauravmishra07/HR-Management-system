import { z } from 'zod';

export const idSchema = { params: z.object({ id: z.string().min(1) }) };

export const createSchema = {
  body: z.object({
    name: z.string().min(2, 'Name is required').max(60),
    head: z.string().optional().or(z.literal('')),
    headEmpId: z.string().optional(),
    description: z.string().max(300).optional().or(z.literal('')),
    code: z.string().optional(),
  }),
};

export const updateSchema = { params: idSchema.params, body: createSchema.body.partial() };
