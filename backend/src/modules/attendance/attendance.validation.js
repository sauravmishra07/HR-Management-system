import { z } from 'zod';
import { ATTENDANCE_STATUS } from '../../common/constants/index.js';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');
const isoMonth = z.string().regex(/^\d{4}-\d{2}$/, 'Use YYYY-MM');

export const checkInSchema = {
  body: z.object({ empId: z.string().min(1).optional() }),
};

export const checkOutSchema = {
  body: z.object({ empId: z.string().min(1).optional() }),
};

export const markSchema = {
  body: z.object({
    empId: z.string().min(1),
    status: z.nativeEnum(ATTENDANCE_STATUS),
    date: isoDate.optional(),
  }),
};

export const monthSchema = {
  query: z.object({
    empId: z.string().min(1).optional(),
    month: isoMonth,
  }),
};
