import { v2 as cloudinary } from 'cloudinary';
import config from '../../config/index.js';
import ApiError from './ApiError.js';
import logger from './logger.js';

/**
 * Thin wrapper around the Cloudinary SDK.
 * Credentials come from the validated config (CLOUDINARY_* env vars).
 * The SDK is configured lazily on first use.
 */
let configured = false;

function ensureConfigured() {
  if (!config.cloudinary.enabled) {
    throw ApiError.badRequest(
      'File storage is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.'
    );
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
      secure: true,
    });
    configured = true;
  }
}

/** Is Cloudinary usable (all three credentials present)? */
export function isCloudinaryEnabled() {
  return config.cloudinary.enabled;
}

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} buffer       raw file bytes (from multer memoryStorage)
 * @param {object} opts
 * @param {string} opts.folder      target folder, e.g. "ramp-hrms/documents"
 * @param {string} [opts.filename]  original filename (used as a public_id hint)
 * @returns {Promise<{ url, publicId, resourceType, bytes, format }>}
 */
export function uploadBuffer(buffer, { folder, filename } = {}) {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder || config.cloudinary.folder,
        resource_type: 'auto',       // images, pdf and raw docs are all handled
        use_filename: Boolean(filename),
        filename_override: filename,
        unique_filename: true,       // append a random suffix -> unguessable public_id
        overwrite: false,
      },
      (err, result) => {
        if (err) return reject(ApiError.badRequest(`File upload failed: ${err.message}`));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          bytes: result.bytes,
          format: result.format,
        });
      }
    );
    stream.end(buffer);
  });
}

/**
 * Best-effort deletion of a Cloudinary asset. Never throws — a storage-cleanup
 * failure must not break the business operation that triggered it.
 * @param {string} publicId
 * @param {string} [resourceType='image']  must match the type used at upload time
 */
export async function destroyAsset(publicId, resourceType = 'image') {
  if (!publicId || !config.cloudinary.enabled) return;
  try {
    ensureConfigured();
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    logger.warn(`Cloudinary destroy failed for ${publicId}: ${err.message}`);
  }
}

export default cloudinary;
