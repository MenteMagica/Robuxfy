import express from 'express';
import morgan from 'morgan';
import usersRouter from './routes/users.js';
import artistsRouter from './routes/artists.js';
import contentRouter from './routes/content.js';
import adminRouter from './routes/admin.js';
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
      content: '/api/content',
      admin: '/api/admin',
    },
  });
});

app.use('/api/users', usersRouter);
app.use('/api/artists', artistsRouter);
app.use('/api/content', contentRouter);
app.use('/api/admin', adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
