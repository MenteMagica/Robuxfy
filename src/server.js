import app from './app.js';

const PORT = process.env.PORT ?? 4000;

app.listen(PORT, () => {
  console.log(`Robuxfy API gateway listening on http://localhost:${PORT}`);
});
