import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import ApiError from '../utils/ApiError.js';
import config from '../../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadRoot = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sub = path.join(uploadRoot, req.uploadFolder || 'misc');
    fs.mkdirSync(sub, { recursive: true });
    cb(null, sub);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_').slice(0, 40);
    cb(null, `${base}_${Date.now()}${ext}`);
  },
});

const ALLOWED = /\.(pdf|png|jpe?g|webp|doc|docx|xls|xlsx|csv)$/i;

const fileFilter = (req, file, cb) => {
  if (!ALLOWED.test(file.originalname)) {
    return cb(ApiError.badRequest('Unsupported file type'));
  }
  cb(null, true);
};

/** Configure a Multer instance scoped to a target subfolder. */
export const upload = (folder = 'misc') => {
  const mw = multer({
    storage,
    fileFilter,
    limits: { fileSize: config.upload.maxFileSizeMb * 1024 * 1024 },
  });
  // Inject folder onto req before Multer runs so `destination` can read it.
  return {
    single: (field) => [(req, res, next) => { req.uploadFolder = folder; next(); }, mw.single(field)],
    array: (field, max) => [(req, res, next) => { req.uploadFolder = folder; next(); }, mw.array(field, max)],
  };
};
