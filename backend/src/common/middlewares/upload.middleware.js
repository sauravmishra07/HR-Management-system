import multer from 'multer';
import ApiError from '../utils/ApiError.js';
import config from '../../config/index.js';

/**
 * Files are held in memory (as a Buffer) and streamed straight to Cloudinary
 * by the service layer — nothing is written to local disk.
 */
const storage = multer.memoryStorage();

const ALLOWED = /\.(pdf|png|jpe?g|webp|doc|docx|xls|xlsx|csv)$/i;

const fileFilter = (req, file, cb) => {
  if (!ALLOWED.test(file.originalname)) {
    return cb(ApiError.badRequest('Unsupported file type'));
  }
  cb(null, true);
};

/**
 * Configure a Multer instance tagged with a logical folder. The folder name is
 * placed on the request so the service can namespace the Cloudinary upload
 * (e.g. "ramp-hrms/documents").
 */
export const upload = (folder = 'misc') => {
  const mw = multer({
    storage,
    fileFilter,
    limits: { fileSize: config.upload.maxFileSizeMb * 1024 * 1024 },
  });
  return {
    single: (field) => [(req, res, next) => { req.uploadFolder = folder; next(); }, mw.single(field)],
    array: (field, max) => [(req, res, next) => { req.uploadFolder = folder; next(); }, mw.array(field, max)],
  };
};
