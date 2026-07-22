import { z } from 'zod';
import { EVENING_REPORT_STATUS } from '../eveningReport/eveningReport.model.js';

/** POST /integration/evening-reports/:code/response */
export const eveningReportResponseSchema = {
  params: z.object({ code: z.string().min(1) }),
  body: z.object({
    decision: z.enum([EVENING_REPORT_STATUS.APPROVED, EVENING_REPORT_STATUS.REJECTED]),
    reason: z.string().max(500).optional(),
    by: z.string().max(100).optional(),
  }),
};
