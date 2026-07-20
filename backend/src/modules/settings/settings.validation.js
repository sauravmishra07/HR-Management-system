import { z } from 'zod';

export const updateSchema = {
  body: z.object({
    company: z.string().optional(),
    brand: z.string().optional(),
    tagline: z.string().optional(),
    address: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    cin: z.string().optional(),
    cl: z.coerce.number().int().min(0).optional(),
    sl: z.coerce.number().int().min(0).optional(),
    el: z.coerce.number().int().min(0).optional(),
    weekOff: z.array(z.string()).optional(),
    inTime: z.string().optional(),
    lateAfter: z.string().optional(),
    needApproval: z.coerce.boolean().optional(),
    selfCheckin: z.coerce.boolean().optional(),
    emailAlerts: z.coerce.boolean().optional(),
  }),
};

export const offerTemplateSchema = {
  body: z.object({
    offerTemplate: z.string(),
  }),
};

export const exitTemplatesSchema = {
  body: z.object({
    exitTemplates: z.record(z.string(), z.string()),
  }),
};

export const assetApiSchema = {
  body: z.object({
    url: z.string().optional(),
    key: z.string().optional(),
    enabled: z.coerce.boolean().optional(),
  }),
};
