import { z } from 'zod';

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password is too long');

export const loginSchema = {
  body: z.object({
    email: z.string().email('Valid email required'),
    password: z.string().min(1, 'Password is required'),
  }),
};

export const refreshSchema = {
  body: z.object({
    refreshToken: z.string().min(10).optional(),
  }),
};

export const forgotSchema = {
  body: z.object({
    email: z.string().email('Valid email required'),
  }),
};

export const resetSchema = {
  body: z.object({
    token: z.string().min(10, 'Reset token is required'),
    password,
  }),
};

export const changePasswordSchema = {
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: password,
  }),
};
