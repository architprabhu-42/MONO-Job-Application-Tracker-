import path from 'node:path';
import multer from 'multer';
import AppError from '../utils/AppError.js';
import { MAX_RESUME_SIZE } from '../utils/constants.js';

// Files are kept in memory first so we can check their real content
// (the "%PDF-" signature) before writing them to storage.
export const uploadResume = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESUME_SIZE, files: 1 },
  fileFilter(req, file, cb) {
    const isPdfName = path.extname(file.originalname).toLowerCase() === '.pdf';
    const isPdfType = ['application/pdf', 'application/x-pdf'].includes(file.mimetype);
    if (!isPdfName || !isPdfType) {
      return cb(new AppError('Only PDF files are allowed.', 400, { file: 'Only PDF files are allowed' }));
    }
    cb(null, true);
  },
}).single('file');

export function isPdfBuffer(buffer) {
  return buffer?.length > 4 && buffer.subarray(0, 5).toString('latin1') === '%PDF-';
}
