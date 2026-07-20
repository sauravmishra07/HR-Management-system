import { z } from 'zod';

export const idSchema = { params: z.object({ id: z.string().min(1) }) };

export const createSchema = {
  body: z.object({
    t: z.string().min(1, 'Title is required'),
    s: z.string().optional().or(z.literal('')),
    ico: z.string().optional().or(z.literal('')),
    link: z.string().optional().or(z.literal('')),
    user: z.string().optional().or(z.literal('')),
  }),
};
