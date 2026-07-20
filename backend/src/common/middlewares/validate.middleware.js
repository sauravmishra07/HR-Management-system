import { ZodError } from 'zod';
import ApiError from '../utils/ApiError.js';

/**
 * Reusable Zod validation middleware. Validates any of body/params/query/headers.
 * Parsed (and coerced) values are written back so downstream handlers get clean data.
 *
 * @param {{ body?, params?, query?, headers? }} schemas
 */
export const validate = (schemas) => (req, res, next) => {
  try {
    for (const key of ['body', 'params', 'query', 'headers']) {
      if (schemas[key]) {
        const parsed = schemas[key].parse(req[key]);
        // req.query/params are getter-only in some setups — mutate in place.
        if (key === 'query' || key === 'params') {
          Object.keys(req[key]).forEach((k) => delete req[key][k]);
          Object.assign(req[key], parsed);
        } else {
          req[key] = parsed;
        }
      }
    }
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
      return next(ApiError.unprocessable('Validation failed', errors));
    }
    next(err);
  }
};

export default validate;
