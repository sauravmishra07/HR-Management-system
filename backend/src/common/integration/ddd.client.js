import config from '../../config/index.js';
import logger from '../utils/logger.js';

/**
 * Outbound client for the DDD (ITSYBIZZ Command Center) integration API.
 * All calls are server-to-server, authenticated via the shared x-api-key.
 */

const EVENTS_PATH = '/integrations/hrms/events';
const RETRY_DELAYS_MS = [0, 2000, 5000];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Integration is active only when explicitly enabled AND a key is configured. */
function isActive() {
  return config.integrationEnabled && Boolean(config.integrationApiKey);
}

function buildHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (config.integrationApiKey) headers['x-api-key'] = config.integrationApiKey;
  return headers;
}

/**
 * POST to a DDD integration endpoint. Throws on network failure or non-2xx
 * (with DDD's message passed through) — for callers that need the result.
 * Not retried; retry policy belongs to the caller.
 */
export async function postToDDD(path, body) {
  const res = await fetch(`${config.dddApiUrl}${path}`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(body ?? {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json?.message || `DDD responded with ${res.status}`);
    err.statusCode = res.status;
    throw err;
  }
  return json;
}

/**
 * Fire-and-forget event push to DDD (audit.record-style). NEVER throws and
 * never blocks the business operation: 3 attempts (0s/2s/5s backoff), then a
 * warn log and give up. Call sites must not await-throw on this.
 */
export async function emitToDDD(event, payload) {
  try {
    if (!isActive()) return;
    const body = { event, payload, occurredAt: new Date().toISOString() };
    let lastError;
    for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt += 1) {
      if (RETRY_DELAYS_MS[attempt] > 0) await sleep(RETRY_DELAYS_MS[attempt]);
      try {
        await postToDDD(EVENTS_PATH, body);
        return;
      } catch (err) {
        lastError = err;
      }
    }
    logger.warn(`DDD event '${event}' failed after ${RETRY_DELAYS_MS.length} attempts`, {
      message: lastError?.message,
    });
  } catch (err) {
    // Absolute last line of defence — integration must never break business ops.
    logger.warn(`DDD event '${event}' emit error`, { message: err?.message });
  }
}

export default { emitToDDD, postToDDD };
