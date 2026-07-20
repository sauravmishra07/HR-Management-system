import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

export const idSchema = {
  params: z.object({ id: z.string().min(1) }),
};

export const listGoalsSchema = {
  query: z.object({
    emp: z.string().optional(),
    search: z.string().optional(),
  }),
};

export const createGoalSchema = {
  body: z.object({
    emp: z.string().min(1, 'Employee is required'),
    title: z.string().min(2, 'Title is required').max(200),
    due: isoDate.optional(),
    progress: z.coerce.number().min(0).max(100).optional(),
  }),
};

export const updateProgressSchema = {
  params: idSchema.params,
  body: z.object({
    progress: z.coerce.number().min(0).max(100).optional(),
  }),
};

export const listReviewsSchema = {
  query: z.object({
    emp: z.string().optional(),
  }),
};

export const createReviewSchema = {
  body: z.object({
    emp: z.string().min(1, 'Employee is required'),
    cycle: z.string().min(1, 'Cycle is required'),
    rating: z.coerce.number().int().min(1).max(5),
    note: z.string().max(500).optional(),
  }),
};
