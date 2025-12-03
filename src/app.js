import express from 'express';
import morgan from 'morgan';
import apiGateway from './routes/api-gateway.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Welcome to the Robuxfy API gateway',
    backend: process.env.BACKEND_BASE_URL ?? 'http://localhost:3000',
    routes: {
      proxy: '/api/* -> BACKEND_BASE_URL/*',
      files: '/api/file/* -> BACKEND_BASE_URL/file/:objectKey (encoded)',
    },
  });
});

app.use('/api', apiGateway);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
