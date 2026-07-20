import User from '../user/user.model.js';
import Employee from '../employee/employee.model.js';
import ApiError from '../../common/utils/ApiError.js';
import logger from '../../common/utils/logger.js';
import {
  signAccessToken,
  signRefreshToken,
  signResetToken,
  verifyRefreshToken,
  verifyResetToken,
} from '../../common/utils/jwt.js';
import { hashPassword } from '../../common/utils/password.js';
import { sendMail } from '../../common/utils/mailer.js';
import config from '../../config/index.js';
import * as audit from '../audit/audit.service.js';
import { AUDIT_ACTIONS } from '../../common/constants/index.js';
import { allowedViews } from '../../common/utils/rbac.js';

function issueTokens(user) {
  const payload = { id: String(user._id), role: user.role, empId: user.empId };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken({ id: String(user._id) }),
  };
}

async function buildProfile(user) {
  const employee = user.employee
    ? await Employee.findById(user.employee).lean()
    : await Employee.findOne({ empId: user.empId, deletedAt: null }).lean();
  return {
    id: String(user._id),
    empId: user.empId,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarSeed: user.avatarSeed,
    mustResetPassword: user.mustResetPassword,
    views: allowedViews(user.role),
    employee,
  };
}

export async function login({ email, password }, ip) {
  const user = await User.findOne({ email: email.toLowerCase(), deletedAt: null }).select(
    '+password +isActive +refreshTokens'
  );
  if (!user) throw ApiError.unauthorized('Invalid email or password');
  if (user.isActive === false) throw ApiError.forbidden('Account is deactivated');

  const match = await user.comparePassword(password);
  if (!match) throw ApiError.unauthorized('Invalid email or password');

  const tokens = issueTokens(user);
  user.refreshTokens = [...(user.refreshTokens || []).slice(-4), tokens.refreshToken];
  user.lastLogin = new Date();
  await user.save();

  logger.info(`Login: ${user.email} (${user.role})`);
  audit.record({ action: AUDIT_ACTIONS.LOGIN, entity: 'User', entityId: user.empId, actor: { id: user._id, name: user.name, role: user.role }, ip });

  return { ...tokens, user: await buildProfile(user) };
}

export async function refresh(oldToken) {
  if (!oldToken) throw ApiError.unauthorized('Refresh token required');
  let decoded;
  try {
    decoded = verifyRefreshToken(oldToken);
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const user = await User.findById(decoded.id).select('+refreshTokens +isActive');
  if (!user || user.deletedAt) throw ApiError.unauthorized('User not found');
  if (!user.refreshTokens.includes(oldToken)) throw ApiError.unauthorized('Refresh token revoked');
  if (user.isActive === false) throw ApiError.forbidden('Account is deactivated');

  const tokens = issueTokens(user);
  // Rotate: drop the used token, keep the new one.
  user.refreshTokens = [...user.refreshTokens.filter((t) => t !== oldToken).slice(-4), tokens.refreshToken];
  await user.save();

  return { ...tokens, user: await buildProfile(user) };
}

export async function logout(userId, refreshToken) {
  const user = await User.findById(userId).select('+refreshTokens');
  if (user) {
    user.refreshTokens = (user.refreshTokens || []).filter((t) => t !== refreshToken);
    await user.save();
    audit.record({ action: AUDIT_ACTIONS.LOGOUT, entity: 'User', entityId: user.empId, actor: { id: user._id, name: user.name, role: user.role } });
  }
}

export async function me(userId) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return buildProfile(user);
}

export async function forgotPassword(email) {
  const user = await User.findOne({ email: email.toLowerCase(), deletedAt: null });
  // Always return success to avoid account enumeration.
  if (!user) return { sent: true };

  const token = signResetToken({ id: String(user._id) });
  const link = `${config.clientUrl}/reset-password?token=${token}`;
  await sendMail({
    to: user.email,
    subject: 'RAMP HRMS — Reset your password',
    html: `<p>Hi ${user.name},</p><p>Reset your password using the link below (valid ${config.jwt.resetExpiresIn}):</p><p><a href="${link}">${link}</a></p><p>If you didn't request this, ignore this email.</p>`,
    text: `Reset your password: ${link}`,
  });
  return { sent: true };
}

export async function resetPassword({ token, password }) {
  let decoded;
  try {
    decoded = verifyResetToken(token);
  } catch {
    throw ApiError.badRequest('Reset link is invalid or expired');
  }
  const user = await User.findById(decoded.id).select('+refreshTokens');
  if (!user) throw ApiError.notFound('User not found');

  user.password = password; // hashed by pre-save hook
  user.mustResetPassword = false;
  user.refreshTokens = []; // force re-login on all devices
  await user.save();
  logger.info(`Password reset for ${user.email}`);
  return { reset: true };
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findById(userId).select('+password +refreshTokens');
  if (!user) throw ApiError.notFound('User not found');
  const ok = await user.comparePassword(currentPassword);
  if (!ok) throw ApiError.badRequest('Current password is incorrect');

  user.password = newPassword;
  user.mustResetPassword = false;
  user.refreshTokens = [];
  await user.save();
  return { changed: true };
}
