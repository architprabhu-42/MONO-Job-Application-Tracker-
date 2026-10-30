import mongoose from 'mongoose';
import AppError from '../utils/AppError.js';

// Turns Zod issues into { fieldName: "message" } so the frontend can show
// the error next to the right input.
function toFieldErrors(zodError) {
  const errors = {};
  for (const issue of zodError.issues) {
    const field = issue.path.join('.') || 'form';
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
}

// Validates req.body against a schema and replaces it with the cleaned data.
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    return next(new AppError('Please fix the highlighted fields.', 400, toFieldErrors(result.error)));
  }
  req.body = result.data;
  next();
};

// Rejects malformed MongoDB ids (e.g. /api/applications/abc) before they reach a query.
export const validateObjectId = (param = 'id') => (req, res, next) => {
  if (!mongoose.isObjectIdOrHexString(req.params[param])) {
    return next(new AppError('Invalid id.', 400));
  }
  next();
};
