import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

// Socket.IO connects to the server ORIGIN (http://localhost:5000), not the REST prefix.
const SOCKET_ORIGIN = /^https?:\/\//i.test(API_BASE) ? new URL(API_BASE).origin : undefined;

let socket = null;

/**
 * Connect the shared realtime socket (singleton) using the JWT access token,
 * or refresh the token on the existing socket so reconnects keep working.
 * Reconnection/backoff is handled by socket.io-client itself.
 */
export function connectSocket(token) {
  if (!token) return null;
  if (socket) {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
    return socket;
  }
  const opts = {
    auth: { token },
    withCredentials: true,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 15000,
  };
  socket = SOCKET_ORIGIN ? io(SOCKET_ORIGIN, opts) : io(opts);
  return socket;
}

/** Tear the socket down completely (called on logout). */
export function disconnectSocket() {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}

export function getSocket() {
  return socket;
}
