import express from 'express';
import morgan from 'morgan';
import usersRouter from './routes/users.js';
import artistsRouter from './routes/artists.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';

const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Welcome to the Robuxfy API',
    resources: {
      users: '/api/users',
      artists: '/api/artists',
    },
  });
});

app.use('/api/users', usersRouter);
app.use('/api/artists', artistsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
