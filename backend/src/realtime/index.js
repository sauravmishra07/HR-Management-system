import { Server } from 'socket.io';
import config from '../config/index.js';
import logger from '../common/utils/logger.js';
import { verifyAccessToken } from '../common/utils/jwt.js';
import { ROLES } from '../common/constants/index.js';

let io = null;

/** Roles that join the shared HR staff room for org-wide HR signals. */
const HR_STAFF_ROLES = [ROLES.HR_ADMIN, ROLES.HR_REP];

/**
 * Initialize the Socket.IO server on top of the HTTP server. Connections must
 * authenticate with the SAME JWT access token the REST API uses (handshake
 * auth.token or ?token=). Each user joins a private room `user:<empId>` for
 * targeted notifications; HR Admin/Representative also join `hr:staff`.
 */
export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: config.clientUrl.split(',').map((s) => s.trim()),
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const payload = verifyAccessToken(token);
      socket.empId = payload.empId;
      socket.role = payload.role;
      return next();
    } catch {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.empId}`);
    if (HR_STAFF_ROLES.includes(socket.role)) socket.join('hr:staff');
    logger.debug(`Socket connected: ${socket.id} (${socket.empId})`);

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  logger.info('Socket.IO initialized');
  return io;
}

export function getIO() {
  return io;
}

/**
 * Broadcast a `<domain>:changed` refresh signal to every connected client.
 * Safe no-op before initSocket has run (e.g. seeds, tests).
 */
export function broadcastChange(domain, payload) {
  io?.emit(`${domain}:changed`, payload);
}

/** Emit an event to one user's private room (keyed by empId). No-op before init. */
export function notifyUser(empId, event, payload) {
  io?.to(`user:${empId}`).emit(event, payload);
}

/** Emit an event to every connected client. No-op before init. */
export function notifyAll(event, payload) {
  io?.emit(event, payload);
}
