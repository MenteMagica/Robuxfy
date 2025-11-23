const REQUIRED_DB_ENV_VARS = ['DB_HOST', 'DB_USER', 'DB_NAME'];

let poolPromise = null;

function getMissingDbEnvVars(env = process.env) {
  return REQUIRED_DB_ENV_VARS.filter(
    (variable) => !env[variable] || env[variable].trim() === ''
  );
}

async function createDbPool(
  env = process.env,
  mysqlImporter = () => import('mysql2/promise')
) {
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

  const mysql = await mysqlImporter();

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

function getDbPool(env = process.env, mysqlImporter) {
  if (!poolPromise) {
    poolPromise = createDbPool(env, mysqlImporter);
  }
  return poolPromise;
}

function __resetDbPool() {
  poolPromise = null;
}

export { getDbPool, getMissingDbEnvVars, __resetDbPool };
