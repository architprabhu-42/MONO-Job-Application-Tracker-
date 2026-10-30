// An error with an HTTP status code. Thrown from controllers and turned into
// a JSON response by the central error handler.
export default class AppError extends Error {
  constructor(message, statusCode = 400, errors = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
