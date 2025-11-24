const REQUIRED_DB_ENV_VARS = ['DB_HOST', 'DB_USER', 'DB_NAME'];

let poolPromise = null;

function getMissingDbEnvVars(env = process.env) {
  return REQUIRED_DB_ENV_VARS.filter(
    (variable) => !env[variable] || env[variable].trim() === ''
  );
}

async function createDbPool(env = process.env) {
  const missing = getMissingDbEnvVars(env);
  if (missing.length > 0) {
    const error = new Error(
      `Database not configured. Missing env vars: ${missing.join(', ')}`
    );
    error.code = 'DB_NOT_CONFIGURED';
    error.missingEnvVars = missing;
    throw error;
  }

  const port = env.DB_PORT ? Number.parseInt(env.DB_PORT, 10) : 3306;
  const connectionLimit = env.DB_CONNECTION_LIMIT
    ? Number.parseInt(env.DB_CONNECTION_LIMIT, 10)
    : 10;

  const mysql = await import('mysql2/promise');

  return mysql.createPool({
    host: env.DB_HOST,
    port: Number.isNaN(port) ? 3306 : port,
    user: env.DB_USER,
    password: env.DB_PASSWORD ?? undefined,
    database: env.DB_NAME,
    connectionLimit: Number.isNaN(connectionLimit) ? 10 : connectionLimit,
    waitForConnections: true,
  });
}

function getDbPool(env = process.env) {
  if (!poolPromise) {
    poolPromise = createDbPool(env);
  }
  return poolPromise;
}

async function getDbConnection(env = process.env) {
  const pool = await getDbPool(env);
  return pool.getConnection();
}

async function pingDatabase(env = process.env) {
  const pool = await getDbPool(env);
  const [rows] = await pool.query('SELECT 1 AS result');
  return rows?.[0]?.result === 1;
}

function __resetDbPool() {
  poolPromise = null;
}

export {
  __resetDbPool,
  getDbConnection,
  getDbPool,
  getMissingDbEnvVars,
  pingDatabase,
};
