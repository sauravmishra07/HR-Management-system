import jwt from 'jsonwebtoken';
import config from '../../config/index.js';

/** Sign a short-lived access token. Payload carries id, role, empId. */
export function signAccessToken(payload) {
  return jwt.sign(payload, config.jwt.accessSecret, { expiresIn: config.jwt.accessExpiresIn });
}

/** Sign a long-lived refresh token. */
export function signRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });
}

/** Sign a single-use password reset token. */
export function signResetToken(payload) {
  return jwt.sign(payload, config.jwt.resetSecret, { expiresIn: config.jwt.resetExpiresIn });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret);
}

export function verifyResetToken(token) {
  return jwt.verify(token, config.jwt.resetSecret);
}
