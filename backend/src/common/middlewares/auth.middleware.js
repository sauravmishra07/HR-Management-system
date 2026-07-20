import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { can, canView } from '../utils/rbac.js';
import User from '../../modules/user/user.model.js';

/**
 * Authenticate via Bearer access token. Loads the live user so revoked/
 * deactivated accounts are rejected even with a still-valid token.
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.cookies?.accessToken;
  if (!token) throw ApiError.unauthorized('Authentication token missing');

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const user = await User.findById(payload.id).select('+isActive').lean();
  if (!user || user.deletedAt) throw ApiError.unauthorized('User no longer exists');
  if (user.isActive === false) throw ApiError.forbidden('Account is deactivated');

  req.user = {
    id: String(user._id),
    role: user.role,
    empId: user.empId,
    name: user.name,
    email: user.email,
  };
  next();
});

/** Restrict to one or more roles. */
export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
  next();
};

/** Require a named permission (see PERMISSIONS map). */
export const requirePermission = (permission) => (req, res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!can(req.user.role, permission)) return next(ApiError.forbidden());
  next();
};

/** Require access to a named view/module. */
export const requireView = (view) => (req, res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!canView(req.user.role, view)) return next(ApiError.forbidden());
  next();
};
