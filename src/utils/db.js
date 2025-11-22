const REQUIRED_ENV_VARS = ['DB_HOST', 'DB_USER', 'DB_NAME'];

function readDbConfig(env = process.env) {
  const missing = REQUIRED_ENV_VARS.filter((key) => !env[key]);
  if (missing.length) {
    const error = new Error(
      `Database is not configured. Missing environment variables: ${missing.join(', ')}`
    );
    error.code = 'DB_NOT_CONFIGURED';
    throw error;
  }

  const port = env.DB_PORT ? Number(env.DB_PORT) : 3306;
  return {
    host: env.DB_HOST,
    port: Number.isNaN(port) ? 3306 : port,
    user: env.DB_USER,
    password: env.DB_PASSWORD ?? undefined,
    database: env.DB_NAME,
    connectionLimit: env.DB_CONNECTION_LIMIT
      ? Number(env.DB_CONNECTION_LIMIT)
      : 10,
  };
}

let cachedPool = null;

async function getDbPool() {
  if (cachedPool) {
    return cachedPool;
  }

  const config = readDbConfig();
  let mysql;
  try {
    mysql = await import('mysql2/promise');
  } catch (error) {
    const wrapped = new Error(
      'Database driver not installed. Please add mysql2 to dependencies.'
    );
    wrapped.code = 'DB_NOT_CONFIGURED';
    throw wrapped;
  }

  cachedPool = mysql.createPool(config);
  return cachedPool;
}

export { getDbPool, readDbConfig };
