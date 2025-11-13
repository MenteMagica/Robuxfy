export function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: 'Not Found',
    message: `No resource found for ${req.originalUrl}`,
  });
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status ?? 500;
  res.status(status).json({
    error: err.name ?? 'Error',
    message: err.message ?? 'An unexpected error occurred',
  });
}
