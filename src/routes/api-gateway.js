import { Router } from 'express';
import HttpError from '../errors/http-error.js';

const backendBaseUrl = (process.env.BACKEND_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

const apiGateway = Router();

async function proxyRequest(targetUrl, req, res, next) {
  try {
    const headers = new Headers();
    for (const [name, value] of Object.entries(req.headers)) {
      const lower = name.toLowerCase();
      if (lower === 'host' || lower === 'connection' || lower === 'content-length') {
        continue;
      }
      if (Array.isArray(value)) {
        headers.set(name, value.join(','));
      } else if (value !== undefined) {
        headers.set(name, value);
      }
    }

    const init = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body && Object.keys(req.body).length > 0) {
        init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        if (!headers.has('content-type')) {
          headers.set('content-type', 'application/json');
        }
      }
    }

    const response = await fetch(targetUrl, init);

    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-length') {
        res.setHeader(key, value);
      }
    });

    const payload = Buffer.from(await response.arrayBuffer());
    res.send(payload);
  } catch (error) {
    next(
      error instanceof HttpError
        ? error
        : new HttpError(502, 'Failed to contact backend service', { details: error.message })
    );
  }
}

apiGateway.get('/file/*', async (req, res, next) => {
  const objectKey = req.params[0];
  const searchIndex = req.originalUrl.indexOf('?');
  const query = searchIndex >= 0 ? req.originalUrl.slice(searchIndex) : '';
  const encodedKey = encodeURIComponent(objectKey);
  const targetUrl = `${backendBaseUrl}/file/${encodedKey}${query}`;

  await proxyRequest(targetUrl, req, res, next);
});

apiGateway.use(async (req, res, next) => {
  const targetPath = req.originalUrl.replace(/^\/api/, '');
  const targetUrl = `${backendBaseUrl}${targetPath}`;
  await proxyRequest(targetUrl, req, res, next);
});

export default apiGateway;
