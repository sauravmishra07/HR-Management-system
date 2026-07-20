import { z } from 'zod';
import { ROLE_VALUES, EMPLOYEE_STATUS } from '../../common/constants/index.js';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

export const listSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().optional(),
    dept: z.string().optional(),
    status: z.nativeEnum(EMPLOYEE_STATUS).optional(),
    access: z.enum(ROLE_VALUES).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
};

export const idSchema = {
  params: z.object({ id: z.string().min(1) }),
};

export const createSchema = {
  body: z.object({
    name: z.string().min(2, 'Name is required').max(80),
    dept: z.string().min(1, 'Department is required'),
    role: z.string().min(1, 'Designation is required'),
    email: z.string().email('Valid email required'),
    phone: z.string().min(6).max(20).optional().or(z.literal('')),
    join: isoDate.optional(),
    dob: isoDate.optional(),
    salary: z.coerce.number().nonnegative().optional(),
    gender: z.enum(['M', 'F', 'O']).optional(),
    access: z.enum(ROLE_VALUES).optional(),
    managerId: z.string().optional(),
  }),
};

export const updateSchema = {
  params: idSchema.params,
  body: createSchema.body.partial(),
};
