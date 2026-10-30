import multer from 'multer';
import mongoose from 'mongoose';
import AppError from '../utils/AppError.js';

export function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

// Central error handler: every error ends up here and becomes
// { success: false, message, errors? } with a sensible status code.
export function errorHandler(err, req, res, next) {
  let status = 500;
  let message = 'Something went wrong. Please try again.';
  let errors;

  if (err instanceof AppError) {
    status = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof multer.MulterError) {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'The file is too large. Maximum size is 4 MB.' : err.message;
    errors = { file: message };
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = 'Please fix the highlighted fields.';
    errors = Object.fromEntries(Object.entries(err.errors).map(([key, e]) => [key, e.message]));
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = `Invalid value for ${err.path}.`;
  } else if (err?.code === 11000) {
    status = 409;
    message = 'A record with this value already exists.';
  } else if (err?.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON in request body.';
  }

  if (status >= 500) console.error(err);

  res.status(status).json({ success: false, message, ...(errors && { errors }) });
}
