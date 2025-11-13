export default class HttpError extends Error {
  constructor(status, message, options = {}) {
    super(message);
    this.name = options.name ?? 'HttpError';
    this.status = status;
    if (options.details) {
      this.details = options.details;
    }
  }

  static badRequest(message, details) {
    return new HttpError(400, message, { name: 'BadRequestError', details });
  }

  static notFound(message, details) {
    return new HttpError(404, message, { name: 'NotFoundError', details });
  }

  static conflict(message, details) {
    return new HttpError(409, message, { name: 'ConflictError', details });
  }
}
