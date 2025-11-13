import HttpError from '../errors/http-error.js';

export function notFoundHandler(req, res, next) {
  next(HttpError.notFound(`No resource found for ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  const status = err instanceof HttpError ? err.status : err.status ?? 500;
  if (status >= 500) {
    console.error(err);
  }
  const payload = {
    error: err.name ?? 'Error',
    message: err.message ?? 'An unexpected error occurred',
  };
  if (err.details) {
    payload.details = err.details;
  }
  res.status(status).json(payload);
}
