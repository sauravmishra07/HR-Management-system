import bcrypt from 'bcryptjs';
import config from '../../config/index.js';

/** Hash a plain password with the configured salt rounds. */
export async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(config.security.bcryptSaltRounds);
  return bcrypt.hash(plain, salt);
}

/** Compare a plain password against a stored hash. */
export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
