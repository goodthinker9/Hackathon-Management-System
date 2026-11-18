const multer = require('multer');
const { ZodError } = require('zod');

class HttpError extends Error {
  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

function notFoundHandler(req, res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, _next) {
  if (res.headersSent) return;

  let status = err.status || 500;
  let message = status === 500 ? 'Internal server error' : err.message;
  let errors = Array.isArray(err.errors) ? err.errors : [];

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    status = 400;
    message = 'Invalid JSON request body';
  } else if (err instanceof ZodError) {
    status = 400;
    message = 'Validation failed';
    errors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
  } else if (err instanceof multer.MulterError) {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Image must be 2 MB or smaller'
      : 'Invalid upload';
    errors = [{ field: 'avatar', message }];
  } else if (err.code === 'FILE_TYPE_INVALID') {
    status = 400;
    message = err.message;
    errors = [{ field: 'avatar', message }];
  } else if (err.code === 'ER_DUP_ENTRY') {
    status = 409;
    message = 'A record with the provided details already exists';
  }

  if (status >= 500) console.error(err);
  res.status(status).json({ message, errors });
}

module.exports = { HttpError, notFoundHandler, errorHandler };
