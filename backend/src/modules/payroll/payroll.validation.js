import { z } from 'zod';

const month = z.string().regex(/^\d{4}-\d{2}$/, 'Use YYYY-MM');

export const monthSchema = {
  query: z.object({ month: month.optional() }),
};

export const runSchema = {
  body: z.object({ month }),
};

export const paySchema = {
  body: z.object({ month, empId: z.string().min(1, 'empId is required') }),
};

export const payslipSchema = {
  params: z.object({ empId: z.string().min(1) }),
  query: z.object({ month: month.optional() }),
};
