import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss';

/** Strip `$` and `.` operators from user input to block Mongo operator injection. */
export const mongoInjectionGuard = mongoSanitize({
  replaceWith: '_',
  onSanitize: () => {},
});

/** Recursively XSS-sanitise string values in the request body. */
export function xssGuard(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = deepClean(req.body);
  }
  next();
}

function deepClean(value) {
  if (typeof value === 'string') return xss(value);
  if (Array.isArray(value)) return value.map(deepClean);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deepClean(v)]));
  }
  return value;
}
